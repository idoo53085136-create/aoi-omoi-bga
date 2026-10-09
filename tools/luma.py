"""Brightness / colour arc of the BGA: mean luma (0..1), mean saturation and the share of "cream" pixels per sampled frame.

  python tools/luma.py [--step 1] [--from 0] [--to 252.6] [--out dev/luma.png] [--pre JS]

Writes a plot (luma black, saturation blue, cream share orange; scene boundaries as grey lines with names) and prints
per-scene averages plus the largest luma jumps between neighbouring scenes (the colour script at a glance).
"""
import argparse, os, sys
import cv2, numpy as np
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shots import open_page, grab, T0, BAR


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--step', type=float, default=1); ap.add_argument('--from', dest='t0', type=float, default=.5)
    ap.add_argument('--to', dest='t1', type=float, default=252.4); ap.add_argument('--out', default='dev/luma.png'); ap.add_argument('--pre')
    a = ap.parse_args()
    ts = np.arange(a.t0, a.t1, a.step)
    with sync_playwright() as p:
        b, pg, errs = open_page(p, 320, pre=a.pre)
        story = pg.evaluate('STORY.map(s => [s[0], s[1]])')
        rows = []
        for t in ts:
            im = grab(pg, float(t), 'image/jpeg', .8).astype(np.float32) / 255
            hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
            L = (im @ np.array([.114, .587, .299], np.float32))
            cream = ((im[..., 2] > .93) & (im[..., 1] > .93) & (im[..., 0] > .85)).mean()
            rows.append((t, float(L.mean()), float(hsv[..., 1].mean()), float(cream)))
        b.close()
    R = np.array(rows)
    W, Hh = 1600, 360; img = np.full((Hh, W, 3), 255, np.uint8)
    X = lambda t: int((t - a.t0) / (a.t1 - a.t0) * (W - 1))
    for name, b0 in story:
        tb = T0 + b0 * BAR
        if a.t0 <= tb <= a.t1:
            cv2.line(img, (X(tb), 0), (X(tb), Hh), (200, 200, 200), 1); cv2.putText(img, name, (X(tb) + 2, 12), 0, .32, (90, 90, 90), 1)
    for col, k in (((0, 0, 0), 1), ((200, 90, 0), 2), ((0, 140, 255), 3)):
        pts = np.stack([[X(t) for t in R[:, 0]], (Hh - 20 - R[:, k] * (Hh - 40)).astype(int)], 1)
        cv2.polylines(img, [pts.reshape(-1, 1, 2)], False, col, 2 if k == 1 else 1)
    cv2.imencode('.png', img)[1].tofile(a.out)
    names = [n for n, _ in story]; bounds = [T0 + b0 * BAR for _, b0 in story] + [1e9]
    avg = {}
    for i, n in enumerate(names):
        m = (R[:, 0] >= bounds[i]) & (R[:, 0] < bounds[i + 1])
        if m.any(): avg[n] = R[m, 1:].mean(0)
    print('scene        luma   sat  cream')
    for n, v in avg.items(): print(f'{n:12s} {v[0]:.3f} {v[1]:.3f} {v[2]:.3f}')
    ks = list(avg); print('neighbour luma jumps:', ', '.join(f'{ks[i]}->{ks[i + 1]} {avg[ks[i + 1]][0] - avg[ks[i]][0]:+.3f}' for i in range(len(ks) - 1)))
    print('wrote', a.out)


if __name__ == '__main__':
    main()
