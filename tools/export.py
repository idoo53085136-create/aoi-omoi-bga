"""Export the HTML BGA to H.264 by rendering every frame in headless Chrome.

  python tools/export.py --start 0 --end 252.65 --out renders/aoi_full.mp4 [--audio build/audio.mp4] [--jobs 4] [--w 1920]

Frame n is rendered at t = n/60 (the song clock). Each job renders a contiguous chunk in its own Chrome page and
writes its own segment; segments are concatenated without re-encoding. If the page defines window.prepare(t)
(async: waits for video seeks / image decodes), it is awaited before renderAt(t).
Needs the local server: python -m http.server 8767 --directory build
"""
import argparse, base64, os, subprocess, sys, threading, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NFR = 15159


def ffmpeg_path():
    return 'ffmpeg'


def job(idx, f0, f1, a, seg, log):
    cmd = [ffmpeg_path(), '-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
           '-c:v', 'libx264', '-preset', a.preset, '-crf', str(a.crf), '-pix_fmt', 'yuv420p', '-r', '60',
           '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-g', '120', seg]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome', args=['--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync'])
        pg = b.new_page(viewport={'width': a.w, 'height': a.w * 9 // 16})
        pg.set_default_timeout(600000)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        # r8: the r8 export silently lost images under load (4 pages on one local server); reload until every image is in
        for attempt in range(6):
            pg.goto(f'http://127.0.0.1:{a.port}/index.html?test=1&w={a.w}' + (('&' + a.extra) if a.extra else ''))
            pg.wait_for_function('window.READY === true')
            miss = pg.evaluate('window.MISSING || []')
            if not miss: break
            log(f'[job {idx}] missing images {miss[:5]} (attempt {attempt + 1}), reloading'); time.sleep(1 + attempt)
        else:
            raise RuntimeError(f'job {idx}: images never loaded: {miss}')
        t0 = time.time()
        for n in range(f0, f1):
            t = n / 60.0
            url = pg.evaluate(f"""async () => {{ if (window.prepare) await window.prepare({t}); renderAt({t});
                return document.getElementById('gl').toDataURL('image/jpeg', {a.q}); }}""")
            ff.stdin.write(base64.b64decode(url.split(',', 1)[1]))
            if (n - f0) % 300 == 0:
                el = time.time() - t0
                log(f'[job {idx}] frame {n} ({n - f0}/{f1 - f0}) {el:.0f}s, ~{el / max(1, n - f0) * (f1 - n):.0f}s left')
            if errs:
                log(f'[job {idx}] page errors: {errs[:3]}')
                errs.clear()
        b.close()
    ff.stdin.close()
    if ff.wait() != 0:
        raise RuntimeError(f'ffmpeg failed for segment {seg}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--start', type=float, default=0.0)
    ap.add_argument('--end', type=float, default=252.65)
    ap.add_argument('--out', required=True)
    ap.add_argument('--extra', default='', help='extra URL query for variants, e.g. "fin=B" (r23 preview clips)')
    ap.add_argument('--audio', default=None, help='audio file to mux (trimmed to the same range, codec copy if AAC)')
    ap.add_argument('--jobs', type=int, default=4)
    ap.add_argument('--w', type=int, default=1920)
    ap.add_argument('--q', type=float, default=0.95, help='JPEG quality of the captured frames')
    ap.add_argument('--crf', type=int, default=16)
    ap.add_argument('--preset', default='medium')
    ap.add_argument('--port', type=int, default=8767)
    a = ap.parse_args()
    f0, f1 = round(a.start * 60), min(NFR, round(a.end * 60))
    n = f1 - f0
    k = max(1, min(a.jobs, n))
    bounds = [f0 + n * i // k for i in range(k + 1)]
    tmp = os.path.abspath(a.out) + '.parts'
    os.makedirs(tmp, exist_ok=True)
    segs = [os.path.join(tmp, f'seg_{i:02d}.mp4') for i in range(k)]
    lock = threading.Lock()

    def log(m):
        with lock:
            print(m, flush=True)

    errs = []

    def run(i):
        try:
            job(i, bounds[i], bounds[i + 1], a, segs[i], log)
        except Exception as e:  # noqa: BLE001
            errs.append(e)
            log(f'[job {i}] FAILED: {e}')

    ths = [threading.Thread(target=run, args=(i,)) for i in range(k)]
    t0 = time.time()
    for th in ths:
        th.start(); time.sleep(4)   # r8: stagger the page loads (the local server dropped image requests under a burst)
    for th in ths:
        th.join()
    if errs:
        sys.exit(1)
    lst = os.path.join(tmp, 'list.txt')
    with open(lst, 'w', encoding='utf-8') as f:
        f.write(''.join(f"file '{s}'\n" for s in segs))
    # write to .partial first; keep the previous file as _prev (rhythm-game-bga pitfall 13)
    part = a.out.replace('.mp4', '.partial.mp4')
    silent = part if not a.audio else a.out.replace('.mp4', '_silent.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', silent], check=True)
    if a.audio:
        # full export from 0: bit-exact audio copy (build/audio.mp4 already carries the one-time -7.3 dB; never re-apply).
        # test clips starting later: AAC packets can't be cut sample-accurately with copy (~23 ms shift), so the review clip's
        # audio is re-encoded at 256k from the same source (format only; no level / EQ change). Never ship a clip as the final.
        # (r31) the trim starts exactly at f0/60: the "+1024 samples" compensation that used to be here came from the same
        # verify.py -ss mis-measurement (the re-encode's priming IS skipped by real decoders through its edit list).
        ac = ['-c:a', 'copy'] if f0 == 0 else ['-c:a', 'aac', '-b:a', '256k']
        sr = int(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=sample_rate', '-of', 'csv=p=0', a.audio],
                                capture_output=True, text=True).stdout.strip() or 48000)
        # build/audio.mp4 starts with 1024 samples of AAC encoder priming that its own edit list skips. A plain stream copy
        # KEEPS that skip (the first packet comes out at pts -1024 and the muxer writes elst media_time 1024), so no offset.
        # (r31: an -itsoffset -1024/sr here, added after a mis-measurement by verify.py's -ss 0 decode, made the muxer
        # skip 2048 samples: every export up to r29 played its audio 21.3 ms early in real players.)
        prime = []
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', silent, *prime, '-i', a.audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', *ac,
                        *(['-af', f'atrim=start={f0 / 60:.6f},asetpts=PTS-STARTPTS'] if f0 else []),
                        '-t', f'{n / 60:.6f}', '-movflags', '+faststart', part], check=True)
    if os.path.exists(a.out):
        prev = a.out.replace('.mp4', '_prev.mp4')
        if os.path.exists(prev): os.remove(prev)
        os.replace(a.out, prev)
    os.replace(part, a.out)
    print(f'wrote {a.out}: {n} frames, {f0 / 60:.3f}-{f1 / 60:.3f}s, {time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
