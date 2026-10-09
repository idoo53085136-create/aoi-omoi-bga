# r16 (review: check the whole song frame by frame, not for dropped frames but for the places where shapes change unnaturally
# from one frame to the next, where the picture is disharmonious; the problems noted many times before): a scan that
# finds LOCAL sudden changes (a shape popping in, vanishing, jumping, a step) for the jury to look at.
#   python tools/framescan.py renders/X.mp4 research/scan_X
# Every frame is decoded (gray, 384x216) and cut into 24x24 blocks (16x9). For each frame the block change (mean |diff|
# to the previous frame) is measured. A block that changes much more on this frame than on the frames around it is a
# POP (something appeared / vanished / jumped in that place within one or two frames). STEP: the same place pops on
# 3+ beats in a row (a thing stepping on the drums). Each flag is labelled CUT (within 2 frames of a storyboard cut),
# PLANNED (a deliberate hit) or ?, and gets a strip of frames i-2..i+2 with the place boxed.
import json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
FPS, Wd, Hd, BS = 60, 384, 216, 24
GX, GY = Wd // BS, Hd // BS
T0, BAR = 0.16848072562358277, 240 / 175
BEAT = BAR / 4
B = lambda b: T0 + b * BAR
story = re.findall(r"\['(\w+)',\s*([\d.]+),\s*([\d.]+)", open(os.path.join(D, 'src', 'k_story.js'), encoding='utf-8').read())
cuts = sorted({round(B(float(a)) * FPS) for _, a, _ in story} | {round(B(float(b)) * FPS) for _, _, b in story})
scene_at = lambda t: next((n for n, a, b in story if B(float(a)) <= t < B(float(b))), '?')
PLANNED = [15.0, 47.0, 47.25, 47.5, 47.75, 47.875, 48.0, 49.0, 50.0, 71.0, 72.0, 73.0]
planned = [round(B(b) * FPS) for b in PLANNED]
def frames():
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={Wd}:{Hd}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    n = Wd * Hd
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n: break
        yield np.frombuffer(buf, np.uint8).astype(np.int16).reshape(Hd, Wd)
# (first try: per-block change spikes flagged 2400 places, mostly meteors / twinkles = continuous motion) a STEP test on
# a 96x54 copy instead: a place is a pop when it changes a lot across frames i-1 -> i+1 (S > 30 of 255) but was steady
# before (i-3 -> i-1) and is steady after (i+1 -> i+3), both < 8: something appeared, vanished or jumped there within
# one or two frames. Continuous motion (changes before / after) and fades over >= 3 frames are not flagged.
SW, SH = 96, 54
sm = np.stack([np.asarray(Image.fromarray(f.astype(np.uint8)).resize((SW, SH), Image.BILINEAR), np.int16) for f in frames()])
N = len(sm)
print('frames', N, 'expected', round(252.65 * FPS))
flags = []
BS = Wd // SW * 1   # one cell of the 96x54 grid = 4 px of the 384 frame
for i in range(3, N - 3):
    S = np.abs(sm[i + 1] - sm[i - 1]); pre = np.abs(sm[i - 1] - sm[i - 3]); post = np.abs(sm[i + 3] - sm[i + 1])
    st = (S > 30) & (pre < 8) & (post < 8)
    cnt = int(st.sum())
    if cnt < 6: continue
    ys, xs = np.nonzero(st); cy, cx = int(np.median(ys)), int(np.median(xs))
    if flags and flags[-1]['frame'] >= i - 3:
        if cnt > flags[-1]['n']: flags[-1].update(frame=i, gx=cx, gy=cy, n=cnt, v=float(S[st].mean()))
        continue
    flags.append({'frame': i, 'gx': cx, 'gy': cy, 'v': float(S[st].mean()), 'ctx': float(pre[st].mean()), 'n': cnt})
def tag(i):
    if any(abs(i - c) <= 2 for c in cuts): return 'CUT'
    if any(abs(i - c) <= 2 for c in planned): return 'PLANNED'
    return '?'
for r in flags:
    i = r['frame']; r.update(t=round(i / FPS, 3), bar=round((i / FPS - T0) / BAR, 2), scene=scene_at(i / FPS), tag=tag(i))
    # how many blocks popped together (n): 1-3 = a small shape; many = a whole-frame change
# STEP: the same block popping on >= 3 consecutive beats (within 3 frames of the beat each time)
by = {}
for r in flags:
    if r['tag'] != '?': continue
    ph = ((r['t'] - T0) / BEAT) % 1; near = min(ph, 1 - ph) * BEAT * FPS <= 3
    if near: by.setdefault((r['gx'] // 8, r['gy'] // 8), []).append(round((r['t'] - T0) / BEAT))
steps = []
for k, bs in by.items():
    bs = sorted(set(bs)); run = 1
    for a, b in zip(bs, bs[1:]):
        run = run + 1 if b - a == 1 else 1
        if run == 3: steps.append({'block': k, 'beat': b, 't': round(T0 + b * BEAT, 2)})
odd = [r for r in flags if r['tag'] == '?']
json.dump({'frames': N, 'flags': flags, 'steps': steps}, open(os.path.join(out, 'scan.json'), 'w'))
with open(os.path.join(out, 'flags.txt'), 'w', encoding='utf-8') as fo:
    for r in flags:
        line = 'POP %-7s %8.3fs bar %7.2f %-9s at (%3d,%3d) px  d %5.1f ctx %4.1f blocks %d' % (r['tag'], r['t'], r['bar'], r['scene'], r['gx'] * 20, r['gy'] * 20, r['v'], r['ctx'], r['n'])
        fo.write(line + '\n')
    for s in steps: fo.write('STEP block %s from beat %d (%.2fs)\n' % (s['block'], s['beat'], s['t']))
print('flags', len(flags), 'odd', len(odd), 'cut', sum(r['tag'] == 'CUT' for r in flags), 'steps', len(steps))
# strips (640x360), the popping place boxed on every frame of the strip
want = {}
for r in odd + [r for r in flags if r['tag'] != '?']:
    for j in range(r['frame'] - 2, r['frame'] + 3): want[j] = None
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'scale=640:360', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
n3 = 640 * 360 * 3; j = 0
while True:
    buf = p.stdout.read(n3)
    if len(buf) < n3: break
    if j in want: want[j] = Image.frombuffer('RGB', (640, 360), buf, 'raw', 'RGB', 0, 1).copy()
    j += 1
sc = 640 / Wd
for name, grp in [('odd', odd), ('cut', [r for r in flags if r['tag'] == 'CUT'])]:
    for s0 in range(0, len(grp), 6):
        part = grp[s0:s0 + 6]; sh = Image.new('RGB', (640 * 5, 380 * len(part)), (12, 12, 12)); dr = ImageDraw.Draw(sh)
        for ri, r in enumerate(part):
            x0, y0, RB = r['gx'] * BS * sc, r['gy'] * BS * sc, 34
            for k in range(5):
                im = want.get(r['frame'] - 2 + k)
                if im is None: continue
                im = im.copy(); ImageDraw.Draw(im).ellipse([x0 - RB, y0 - RB, x0 + RB, y0 + RB], outline=(255, 40, 40), width=3); sh.paste(im, (k * 640, ri * 380 + 20))
            dr.text((6, ri * 380 + 3), '%s %.3fs (bar %.2f, %s)  frames %d..%d, centre = 3rd; change %.0f vs %.0f around, %d blocks' % (r['tag'], r['t'], r['bar'], r['scene'], r['frame'] - 2, r['frame'] + 2, r['v'], r['ctx'], r['n']), fill=(255, 255, 0))
        sh.save(os.path.join(out, '%s_%02d.jpg' % (name, s0 // 6)), quality=82)
