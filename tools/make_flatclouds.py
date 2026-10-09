"""Photo -> key-visual flat cloud sprites (cream body, scalloped round-bump edges, pale-blue shadow islands).

  python tools/make_flatclouds.py [ids...]   (default: every blue_cumulus_* / towering_* photo in assets/raw)

Each photo is matted at 1600 px width; every sizeable cloud body becomes one sprite:
assets/out/fc_<photo>_<k>.webp (straight alpha). assets/work/flat_index.json lists them;
assets/flat_library.jpg is a labelled sheet for picking.
"""
import glob, json, os, sys, zlib
import cv2, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cloudcut as cc
import flatcloud as fc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'out')
WT = 1600


def save_rgba(path, rgba):
    b = (np.clip(rgba, 0, 1) * 255 + .5).astype(np.uint8)[:, :, [2, 1, 0, 3]]
    cv2.imencode('.webp', b, [cv2.IMWRITE_WEBP_QUALITY, 95])[1].tofile(path)


def bodies(a, min_frac=0.015):
    h, w = a.shape
    body = (cv2.GaussianBlur(a, (0, 0), 4) > 0.35).astype(np.uint8)
    body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(body, 8)
    out = []
    for i in np.argsort(-st[:, 4]):
        if i == 0: continue
        x, y, bw, bh, area = st[i]
        if area < min_frac * h * w or bw < 180 or bh < 110: continue
        out.append((i, lab, (x, y, bw, bh, area)))
        if len(out) >= 3: break
    return out


def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs(os.path.join(ROOT, 'assets', 'work'), exist_ok=True)
    args = sys.argv[1:]; P = 'f3'   # v3 sprites get their own prefix so the fc_ (v2) files stay for the locked assemble slots
    if '--prefix' in args: i = args.index('--prefix'); P = args[i + 1]; del args[i:i + 2]
    FRAC = (0.40, 0.30, 0.08)   # shade shares (pale+, mid+, deep); --frac a,b,c sets them per run (assemble "D" variants)
    if '--frac' in args: i = args.index('--frac'); FRAC = tuple(float(v) for v in args[i + 1].split(',')); del args[i:i + 2]
    ids = args or sorted(os.path.splitext(os.path.basename(f))[0] for f in
                                 glob.glob(os.path.join(ROOT, 'assets', 'raw', 'blue_cumulus_*.jpg')) + glob.glob(os.path.join(ROOT, 'assets', 'raw', 'towering_*.jpg')))
    idx_path = os.path.join(ROOT, 'assets', 'work', 'flat_index.json' if P == 'fc' else f'{P}_index.json')
    raw = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    index = raw if isinstance(raw, dict) else {e['id']: e for e in raw}
    for stem in ids:
        im = cc.imread(os.path.join(ROOT, 'assets', 'raw', stem + '.jpg'))
        s = WT / im.shape[1]
        im = cv2.resize(im, (WT, int(im.shape[0] * s)), interpolation=cv2.INTER_AREA)
        a, sky, cl = cc.matte(im)
        a = cc.clean_alpha(a)
        L = cl @ np.array([.299, .587, .114], np.float32)
        h, w = a.shape
        for k, (i, lab, (x, y, bw, bh, area)) in enumerate(bodies(a)):
            pad = 40
            x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(w, x + bw + pad), min(h, y + bh + pad)
            reg = cv2.GaussianBlur(cv2.dilate((lab[y0:y1, x0:x1] == i).astype(np.uint8), np.ones((45, 45), np.uint8)).astype(np.float32), (0, 0), 8)
            ca = a[y0:y1, x0:x1] * reg
            # clouds cut by the photo frame: fade the alpha toward the frame so the body closes with round bumps
            hh, ww = ca.shape; m = max(12, int(np.sqrt((ca > .4).sum()) / 10))
            yy, xx = np.mgrid[0:hh, 0:ww]
            dist = np.minimum.reduce([xx + x0, yy + y0, (w - 1) - (xx + x0), (h - 1) - (yy + y0)]).astype(np.float32)
            ca = ca * np.clip((dist - m * .3) / m, 0, 1)
            rgba = fc.stylize3(ca, L[y0:y1, x0:x1], seed=zlib.crc32(stem.encode()) % 1000 + k, frac=FRAC)
            ys, xs = np.nonzero(rgba[:, :, 3] > 0.02)
            if len(xs) == 0: continue
            rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            cid = f'{P}_{stem}_{k}'
            save_rgba(os.path.join(OUT, cid + '.webp'), rgba)
            touch = ''.join(c for c, cond in (('L', x <= 3), ('T', y <= 3), ('R', x + bw >= w - 3), ('B', y + bh >= h - 3)) if cond)
            index[cid] = dict(id=cid, src=stem, w=int(rgba.shape[1]), h=int(rgba.shape[0]), touch=touch, area=float(area / (h * w)), frag=float(fc.LAST_FRAG[0]))
        print(stem, flush=True)
    json.dump(index, open(idx_path, 'w'), indent=1)
    tiles = []
    for e in sorted(index.values(), key=lambda e: e['id']):
        im = cv2.imdecode(np.fromfile(os.path.join(OUT, e['id'] + '.webp'), np.uint8), cv2.IMREAD_UNCHANGED).astype(np.float32) / 255
        tw, th = 320, 210
        sc = min(tw / im.shape[1], (th - 18) / im.shape[0]) * .95
        im = cv2.resize(im, (max(1, int(im.shape[1] * sc)), max(1, int(im.shape[0] * sc))), interpolation=cv2.INTER_AREA)
        bg = np.zeros((th, tw, 3), np.float32) + np.array([0.97, 0.62, 0.04], np.float32)
        yy, xx = th - im.shape[0] - 2, (tw - im.shape[1]) // 2
        al = im[:, :, 3:4]
        bg[yy:yy + im.shape[0], xx:xx + im.shape[1]] = bg[yy:yy + im.shape[0], xx:xx + im.shape[1]] * (1 - al) + im[:, :, :3] * al
        t = (bg * 255).astype(np.uint8)
        lab = e['id'][3:].replace('blue_cumulus', 'bc').replace('towering', 'tw') + ' ' + e['touch']
        cv2.putText(t, lab, (4, 14), 0, .45, (0, 0, 0), 3); cv2.putText(t, lab, (4, 14), 0, .45, (255, 255, 255), 1)
        tiles.append(t)
    cols = 8
    while len(tiles) % cols: tiles.append(np.zeros_like(tiles[0]))
    cv2.imencode('.jpg', np.vstack([np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 85])[1].tofile(
        os.path.join(ROOT, 'assets', 'flat_library.jpg' if P == 'fc' else f'{P}_library.jpg'))
    print('sprites', len(index))


if __name__ == '__main__':
    main()


