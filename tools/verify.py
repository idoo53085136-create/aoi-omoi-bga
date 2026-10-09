"""Verify an exported BGA video (after rhythm-game-bga scripts/verify.py).

  python tools/verify.py renders/aoi_v12.mp4 [--ref build/audio.mp4] [--start 0]

Checks: h264 video + audio streams; duration vs the clip range; audio level; audio/video sync by cross-correlating the
clip's audio with the reference track (must be <= 20 ms, corr > 0.95); 12 sampled frames flagged WHITE?/BLACK?;
and the luma around the must-hit flashes (68.74 / 156.51 / 178.454 s) so the peak frame can be checked by eye.
Exit code 1 on any failure.
"""
import argparse, json, subprocess, sys
import numpy as np

HITS = [68.7357, 156.5114, 178.4543]


def probe(p):
    return json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', p],
                                     capture_output=True, text=True, check=True).stdout)


def pcm(p, ss=0.0, dur=None, sr=8000):
    # (r31) no -ss at all when decoding from the start: an input seek, even to 0, made ffmpeg ignore the AAC edit list
    # (the 1024-sample priming skip), so both tracks read 21.3 ms late and a wrong -itsoffset "fix" in export.py passed
    # this check while real players (which honour the edit list) heard the audio 21.3 ms EARLY
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', f'{ss:.4f}'] if ss else []) + ['-i', p] + (['-t', f'{dur:.4f}'] if dur else []) + ['-ac', '1', '-ar', str(sr), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)


def frame_luma(p, t, w=192):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', p, '-frames:v', '1', '-vf', f'scale={w}:-2,format=gray',
                          '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
    return float(np.frombuffer(raw, np.uint8).mean()) if raw else -1


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--ref', default='build/audio.mp4')
    ap.add_argument('--start', type=float, default=0.0); a = ap.parse_args()
    ok = True
    info = probe(a.video); st = {s['codec_type']: s for s in info['streams']}
    dur = float(info['format']['duration'])
    print('video', st.get('video', {}).get('codec_name'), st.get('video', {}).get('width'), 'x', st.get('video', {}).get('height'),
          st.get('video', {}).get('r_frame_rate'), '| audio', st.get('audio', {}).get('codec_name'), '| dur %.3f' % dur)
    if st.get('video', {}).get('codec_name') != 'h264' or 'audio' not in st: print('FAIL streams'); ok = False
    x = pcm(a.video, 0, min(dur, 30))
    db = 20 * np.log10(max(1e-9, np.abs(x).max())); print('audio peak %.1f dBFS (first 30 s)' % db)
    if db < -40: print('FAIL silent audio'); ok = False
    # sync: correlate 20 s of the clip with the reference track at the clip's start
    # decode the reference from 0 and slice it: input seeking (-ss) on AAC is itself off by ~15 ms, so never seek here
    seg = min(20.0, dur - 1); pad = min(0.25, a.start)
    Y = pcm(a.ref, 0, a.start + seg + 0.5); y = Y[int((a.start - pad) * 8000):]; x = x[:int(seg * 8000)]
    # FFT cross-correlation over the whole window, both directions (a one-sided search missed a +21 ms offset once)
    yy = y[int(pad * 8000):int(pad * 8000) + len(x)]; n = min(len(x), len(yy)); xa, ya = x[:n], yy[:n]
    c = np.fft.irfft(np.fft.rfft(xa, 2 * n) * np.conj(np.fft.rfft(ya, 2 * n)))
    lag = int(np.argmax(c)); lag = lag if lag < n else lag - 2 * n
    best = float(c.max() / (np.linalg.norm(xa) * np.linalg.norm(ya) + 1e-9))
    delay_ms = lag / 8000 * 1000   # positive = the clip's audio is late
    print('sync delay %.1f ms, corr %.3f' % (delay_ms, best))
    if abs(delay_ms) > 8 or best < 0.95: print('FAIL sync'); ok = False
    for t in np.linspace(1, dur - 1, 12):
        l = frame_luma(a.video, t); flag = ' WHITE?' if l > 235 else ' BLACK?' if l < 10 else ''
        print('  frame %7.2f luma %5.1f%s' % (t + a.start, l, flag))
    for h in HITS:
        tc = h - a.start
        if 0.1 < tc < dur - 0.1:
            row = ['%5.1f' % frame_luma(a.video, tc + k / 60) for k in range(-3, 4)]
            print('  hit %.3f  luma frames -3..+3: %s' % (h, ' '.join(row)))
    print('OK' if ok else 'FAILED'); sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
