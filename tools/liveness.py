# r17 (review, 10-09: from 3:22 to 3:31 there was hardly any animation or change): a whole-song liveness audit.
# For every bar it measures, from the rendered video,
#   motion  = mean |frame - previous frame| (192x108 gray), how much moves frame to frame
#   active  = share of 12x12 blocks whose mean frame-to-frame change is > 1.5 (how much of the picture is alive)
#   change  = mean |first frame of the bar - last frame of the bar|, how different the picture is after one bar
# and from the music, loud = mean loudness envelope (src/loud_60fps_u8.bin) and drums = mean kick + snare + hat.
# Bars where the music is full but the picture is quiet are listed first (score = loud rank - liveness rank).
#   python tools/liveness.py renders/X.mp4 research/liveness_X
import os, subprocess, sys, json
import numpy as np
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T0 = 0.16848072562358277; BAR = 240 / 175; FPS = 60; Wd, Hd = 192, 108
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
env = lambda n: np.fromfile(os.path.join(D, 'src', n + '_60fps_u8.bin'), dtype=np.uint8).astype(float)
loud, kick, snare, hat = env('loud'), env('kick'), env('snare'), env('hat')
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={Wd}:{Hd},format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
fr = []
while True:
    b = p.stdout.read(Wd * Hd)
    if len(b) < Wd * Hd: break
    fr.append(np.frombuffer(b, np.uint8))
F = np.array(fr, dtype=np.int16).reshape(-1, Hd, Wd); n = len(F)
dif = np.abs(np.diff(F, axis=0)).astype(np.float32)          # n-1 frames
motion = np.concatenate([[0], dif.mean(axis=(1, 2))])
blk = dif.reshape(n - 1, Hd // 12, 12, Wd // 12, 12).mean(axis=(2, 4))
active = np.concatenate([[0], (blk > 1.5).mean(axis=(1, 2))])
nb = int((n / FPS - T0) / BAR)
rows = []
for b in range(nb):
    i0, i1 = int(round((T0 + b * BAR) * FPS)), min(n - 1, int(round((T0 + (b + 1) * BAR) * FPS)) - 1)
    rows.append(dict(bar=b, t=round(T0 + b * BAR, 2), motion=float(motion[i0:i1].mean()), active=float(active[i0:i1].mean()),
                     change=float(np.abs(F[i1] - F[i0]).mean()), loud=float(loud[i0:i1].mean()),
                     drums=float((kick[i0:i1] + snare[i0:i1] + hat[i0:i1]).mean())))
rk = lambda key: {r['bar']: i / (len(rows) - 1) for i, r in enumerate(sorted(rows, key=lambda r: r[key]))}
rl, rm, ra, rc, rd = rk('loud'), rk('motion'), rk('active'), rk('change'), rk('drums')
for r in rows:
    live = (rm[r['bar']] + ra[r['bar']] + rc[r['bar']]) / 3; music = (rl[r['bar']] + rd[r['bar']]) / 2
    r['live'] = round(live, 3); r['music'] = round(music, 3); r['gap'] = round(music - live, 3)
json.dump(rows, open(os.path.join(out, 'bars.json'), 'w'), indent=0)
with open(os.path.join(out, 'report.txt'), 'w', encoding='utf-8') as f:
    f.write('bar   time   music  live   gap   motion active change\n')
    for r in sorted(rows, key=lambda r: -r['gap'])[:40]:
        f.write('%4d %6.1fs  %.2f  %.2f  %+.2f  %5.2f  %.2f  %5.2f\n' % (r['bar'], r['t'], r['music'], r['live'], r['gap'], r['motion'], r['active'], r['change']))
# a chart: music rank vs liveness rank per bar
try:
    import cv2
    Wc, Hc = 1800, 420; img = np.full((Hc, Wc, 3), 255, np.uint8); x = lambda b: int(40 + b * (Wc - 60) / nb)
    for r in rows:
        y0 = Hc - 40
        cv2.line(img, (x(r['bar']), y0), (x(r['bar']), int(y0 - r['music'] * 300)), (230, 180, 120), 6)
        cv2.circle(img, (x(r['bar']), int(y0 - r['live'] * 300)), 3, (20, 20, 200), -1)
    for b in range(0, nb, 8):
        cv2.putText(img, str(b), (x(b) - 8, Hc - 15), 0, .4, (0, 0, 0), 1)
    cv2.putText(img, 'bars: music rank (blue bars) vs picture liveness rank (red dots)', (40, 25), 0, .6, (0, 0, 0), 1)
    open(os.path.join(out, 'chart.png'), 'wb').write(cv2.imencode('.png', img)[1].tobytes())
except Exception as e:
    print('chart failed', e)
print(open(os.path.join(out, 'report.txt'), encoding='utf-8').read())
