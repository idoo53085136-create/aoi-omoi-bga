# Contact sheets straight from an exported video (what the viewer sees).
#   python tools/vsheet.py video.mp4 out_prefix grid  t0 t1 step      -> sheets of 6x4 frames every `step` seconds
#   python tools/vsheet.py video.mp4 out_prefix cuts                  -> one row per storyboard cut: frames -8 -4 -2 -1 0 +1 +2 +4 +8
import os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, pre, mode = sys.argv[1], sys.argv[2], sys.argv[3]
FPS, CW, CH = 60, 480, 270
T0, BAR = 0.16848072562358277, 240 / 175
B = lambda b: T0 + b * BAR
story = re.findall(r"\['(\w+)',\s*([\d.]+),\s*([\d.]+)", open(os.path.join(D, 'src', 'k_story.js'), encoding='utf-8').read())
scene_at = lambda t: next((n for n, a, b in story if B(float(a)) <= t < B(float(b))), '?')
def grab(idx):
    idx = sorted(set(i for i in idx if i >= 0)); want = set(idx); got = {}
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={CW}:{CH}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = CW * CH * 3; j = 0; last = max(idx)
    while j <= last:
        buf = p.stdout.read(n)
        if len(buf) < n: break
        if j in want: got[j] = Image.frombuffer('RGB', (CW, CH), buf, 'raw', 'RGB', 0, 1).copy()
        j += 1
    p.kill(); return got
def label(dr, x, y, s): dr.rectangle([x, y, x + 8 + 7 * len(s), y + 16], fill=(10, 20, 30)); dr.text((x + 4, y + 2), s, fill=(255, 255, 255))
if mode == 'grid':
    t0, t1, st = map(float, sys.argv[4:7]); ts = list(np.arange(t0, t1 + 1e-9, st)); idx = [round(t * FPS) for t in ts]; got = grab(idx)
    for s0 in range(0, len(idx), 24):
        part = idx[s0:s0 + 24]; sh = Image.new('RGB', (CW * 6, CH * 4), (0, 0, 0)); dr = ImageDraw.Draw(sh)
        for k, i in enumerate(part):
            x, y = (k % 6) * CW, (k // 6) * CH
            if i in got: sh.paste(got[i], (x, y))
            t = i / FPS; label(dr, x, y, '%d:%05.2f %s' % (int(t // 60), t % 60, scene_at(t)))
        sh.save('%s_%02d.jpg' % (pre, s0 // 24), quality=80)
    print(len(idx), 'frames,', (len(idx) + 23) // 24, 'sheets')
elif mode == 'trans':
    # r16 (review: the problems were mainly where one section hands over to the next): one sheet per
    # cut, 6x5: every quarter beat from 1.25 bars before the cut to half a bar after, plus the exact frames cut-1 and cut
    BEAT = BAR / 4; cw2, ch2 = 480, 270
    for ci, (n, a, b) in enumerate(story[1:]):
        c = B(float(a)); ts = [c + q * BEAT / 4 for q in range(-20, 9)]; idx = sorted(set([round(t * FPS) for t in ts] + [round(c * FPS) - 1, round(c * FPS)]))[:30]
        got = grab(idx); prevn = story[ci][0]
        sh = Image.new('RGB', (cw2 * 6, ch2 * 5 + 24), (0, 0, 0)); dr = ImageDraw.Draw(sh)
        dr.text((6, 5), '%s -> %s   cut at %d:%05.2f (bar %s); every 1/4 beat from -1.25 bar, plus frames cut-1 and cut (yellow)' % (prevn, n, int(c // 60), c % 60, a), fill=(255, 255, 0))
        for k, i in enumerate(idx):
            x, y = (k % 6) * cw2, (k // 6) * ch2 + 24
            if i in got: sh.paste(got[i], (x, y))
            t = i / FPS; d = (t - c) / BEAT; label(dr, x, y, '%d:%05.2f  %+.2f beat' % (int(t // 60), t % 60, d))
            if i in (round(c * FPS) - 1, round(c * FPS)): dr.rectangle([x, y, x + cw2 - 1, y + ch2 - 1], outline=(255, 220, 0), width=4)
        sh.save('%s_%02d_%s.jpg' % (pre, ci + 1, n), quality=80)
    print(len(story) - 1, 'transitions')
else:
    offs = [-8, -4, -2, -1, 0, 1, 2, 4, 8]; rows = []
    for n, a, b in story[1:]: rows.append((n, round(B(float(a)) * FPS)))
    got = grab([c + o for _, c in rows for o in offs]); cw2, ch2 = 320, 180
    for s0 in range(0, len(rows), 6):
        part = rows[s0:s0 + 6]; sh = Image.new('RGB', (cw2 * 9, (ch2 + 18) * len(part)), (12, 12, 12)); dr = ImageDraw.Draw(sh)
        for r, (n, c) in enumerate(part):
            dr.text((4, r * (ch2 + 18) + 2), 'cut into %s at %.3fs (frame %d): frames -8 -4 -2 -1 | 0 +1 +2 +4 +8' % (n, c / FPS, c), fill=(255, 255, 0))
            for k, o in enumerate(offs):
                im = got.get(c + o)
                if im is not None: sh.paste(im.resize((cw2, ch2)), (k * cw2, r * (ch2 + 18) + 18))
        sh.save('%s_%02d.jpg' % (pre, s0 // 6), quality=82)
    print(len(rows), 'cuts')
