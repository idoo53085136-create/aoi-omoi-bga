"""Whole-song health check (r5, the standing rules): renders every frame at low resolution and flags
  - JUMP:   a frame-to-frame change spike that is NOT at a planned cut / hit / flash (unnatural jump),
  - EMPTY:  a stretch whose content (edge density) drops far below its neighbours, outside planned breaths,
  - STILL:  >= 2 bars with almost no motion (boring),
  - OFFBEAT: per scene, how much of the change lands on the beat (on-beat / off-beat ratio).

  python tools/health.py [--from 0] [--to 252.6] [--step 1] [--w 256] [--out dev/health]

Writes dev/health.json (per-frame metrics) and dev/health.txt (the flags), plus dev/health_jumps.jpg: for every flagged
jump the frames before / at / after, so the jury can judge each one.
Planned discontinuities = STORY boundaries, IMPACTS bars, the 1:06 / 1:07.37 colour cuts, montage cuts and the
radiance / finale / settle white releases (see PLANNED below).
"""
import argparse, json, os, sys
import cv2, numpy as np
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shots import open_page, grab, T0, BAR

BEAT = BAR / 4


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--from', dest='t0', type=float, default=0.0); ap.add_argument('--to', dest='t1', type=float, default=252.6)
    ap.add_argument('--step', type=int, default=1, help='frame step (1 = every 60 fps frame)'); ap.add_argument('--w', type=int, default=256)
    ap.add_argument('--out', default='dev/health'); ap.add_argument('--port', type=int, default=8767)
    ap.add_argument('--reuse', action='store_true', help='skip rendering, analyse the saved OUT.json again')
    ap.add_argument('--page', default='index.html', help='page under build/ (next.html = a work-in-progress build)')
    a = ap.parse_args()
    f0, f1 = int(a.t0 * 60), int(a.t1 * 60)
    frames = list(range(f0, f1, a.step))
    if a.reuse:
        with sync_playwright() as p:
            b, pg, errs = open_page(p, 160, port=a.port, page=a.page)
            story = pg.evaluate('STORY.map(s => [s[0], s[1]])'); impacts = pg.evaluate('IMPACTS.map(x => x[0])'); b.close()
        J = json.load(open(a.out + '.json'))
        rows = [(r['f'], r['t'], r['diff'], r['edge'], r['luma']) for r in J]
    else:
      with sync_playwright() as p:
        b, pg, errs = open_page(p, a.w, port=a.port, page=a.page)
        story = pg.evaluate('STORY.map(s => [s[0], s[1]])')
        impacts = pg.evaluate('IMPACTS.map(x => x[0])')
        prev = None; rows = []
        for n in frames:
            t = n / 60
            im = grab(pg, t, 'image/jpeg', .85)
            gry = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
            edge = float((cv2.Canny(gry.astype(np.uint8), 60, 140) > 0).mean())
            diff = float(np.abs(gry - prev).mean()) if prev is not None else 0.0
            rows.append((n, t, diff, edge, float(gry.mean()) / 255))
            prev = gry
        b.close()
    R = np.array([[r[0], r[1], r[2], r[3], r[4]] for r in rows])
    json.dump([dict(f=int(r[0]), t=round(r[1], 4), diff=round(r[2], 3), edge=round(r[3], 5), luma=round(r[4], 4)) for r in R], open(a.out + '.json', 'w'))
    # planned discontinuities (seconds)
    planned = [T0 + b0 * BAR for _, b0 in story] + [T0 + b0 * BAR for b0 in impacts] + [66.0, 67.37, 68.74]
    planned += [T0 + (78 + k * .5) * BAR for k in range(5)]                     # montage cuts every 2 beats
    planned += [T0 + 153.75 * BAR, T0 + 145.75 * BAR, T0 + 62.75 * BAR]          # releases / hits
    name_at = lambda t: ([nm for nm, b0 in story if T0 + b0 * BAR <= t + 1e-6] or [story[0][0]])[-1]
    d = R[:, 2]; med = np.median(d[d > 0]) if (d > 0).any() else 1
    # a JUMP = an isolated one-frame spike: the change into this frame is >= 8 luma levels and >= 3x the changes of both
    # neighbouring frames (continuous motion, wipes and stepping patterns change over several frames and are not flagged),
    # and it is not within 2 frames of a planned cut / hit
    out = []
    for i in range(2, len(R) - 1):
        t = R[i, 1]; nb = max(d[i - 1], d[i + 1], .5)
        if d[i] >= 8.0 and d[i] >= 3 * nb and min(abs(t - p) for p in planned) > 2.5 / 60:
            out.append(('JUMP', t, f'diff {d[i]:.1f} (neighbours {d[i - 1]:.1f} / {d[i + 1]:.1f}) in {name_at(t)}'))
    # a SNAP = a sustained burst of large changes (>= 8 levels for >= 3 frames) that is not planned: fast but maybe harsh
    i = 2
    while i < len(R):
        if d[i] >= 8.0:
            j = i
            while j < len(R) and d[j] >= 8.0: j += 1
            t = R[i, 1]
            if j - i >= 3 and min(abs(t - p) for p in planned) > 3 * BEAT:
                out.append(('SNAP', t, f'{j - i} frames of change >= 8 (peak {d[i:j].max():.1f}) in {name_at(t)}'))
            i = j
        i += 1
    # EMPTY: 1 s mean edge density < 35 % of the surrounding 8 s, outside solo / hush / tail
    e = R[:, 3]; k1 = max(1, int(60 / a.step)); k8 = max(1, int(480 / a.step))
    e1 = np.convolve(e, np.ones(k1) / k1, 'same'); e8 = np.convolve(e, np.ones(k8) / k8, 'same')
    for i in range(0, len(R), k1):
        nm = name_at(R[i, 1])
        if nm in ('solo', 'hush', 'tail', 'dawn'): continue
        if e8[i] > .004 and e1[i] < .35 * e8[i]: out.append(('EMPTY', R[i, 1], f'edge {e1[i]:.4f} vs {e8[i]:.4f} around, in {nm}'))
    # STILL: 2 bars with mean diff < 0.6 luma levels
    k2 = max(1, int(2 * BAR * 60 / a.step)); dm = np.convolve(d, np.ones(k2) / k2, 'same')
    last = -99
    for i in range(0, len(R), max(1, k2 // 4)):
        if dm[i] < .6 and R[i, 1] - last > 2 * BAR and name_at(R[i, 1]) not in ('tail',):
            out.append(('STILL', R[i, 1], f'mean change {dm[i]:.2f} over 2 bars in {name_at(R[i, 1])}')); last = R[i, 1]
    # OFFBEAT per scene: mean change within 1/8 beat after a beat vs elsewhere
    lines = []
    for j, (nm, b0) in enumerate(story):
        ta, tb = T0 + b0 * BAR, (T0 + story[j + 1][1] * BAR if j + 1 < len(story) else 999)
        m = (R[:, 1] >= ta) & (R[:, 1] < tb)
        if m.sum() < 10: continue
        ph = ((R[m, 1] - T0) / BEAT) % 1
        on = d[m][ph < .125].mean() if (ph < .125).any() else 0; off = d[m][ph >= .125].mean() if (ph >= .125).any() else 1e-3
        lines.append(f'{nm:11s} motion {d[m].mean():5.2f}  on/off-beat {on / max(off, 1e-3):4.2f}  edge {e[m].mean():.4f}  luma {R[m, 4].mean():.3f}')
    out.sort(key=lambda x: x[1])
    with open(a.out + '.txt', 'w', encoding='utf-8') as f:
        f.write('FLAGS (%d)\n' % len(out))
        for k, t, msg in out: f.write(f'{k:7s} {int(t // 60)}:{t % 60:05.2f} (bar {(t - T0) / BAR:6.2f})  {msg}\n')
        f.write('\nPER SCENE\n' + '\n'.join(lines) + '\n')
    print(open(a.out + '.txt', encoding='utf-8').read())
    # evidence for the jury: each flagged JUMP as 4 frames (-2, -1, 0, +1) at 480 px
    jumps = [t for k, t, _ in out if k == 'JUMP'][:24]
    if jumps:
        with sync_playwright() as p:
            b, pg, errs = open_page(p, 480, port=a.port, page=a.page)
            rows_im = []
            for t in jumps:
                ims = []
                for k in (-2, -1, 0, 1):
                    im = grab(pg, t + k / 60, 'image/jpeg', .85)
                    cv2.putText(im, '%d:%05.2f %+d' % (int(t // 60), t % 60, k), (6, 18), 0, .5, (0, 0, 0), 3); cv2.putText(im, '%d:%05.2f %+d' % (int(t // 60), t % 60, k), (6, 18), 0, .5, (255, 255, 255), 1)
                    ims.append(im)
                rows_im.append(np.hstack(ims))
            b.close()
        cv2.imencode('.jpg', np.vstack(rows_im), [cv2.IMWRITE_JPEG_QUALITY, 82])[1].tofile(a.out + '_jumps.jpg')
        print('wrote', a.out + '_jumps.jpg')


if __name__ == '__main__':
    main()
