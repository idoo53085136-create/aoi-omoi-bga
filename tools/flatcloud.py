"""Photo cloud -> key-visual flat cloud.

Look (from the AOI OMOI key visual): a cream body whose outline is a row of even round bumps with clear notches
between them; pale-blue shadow areas that sit on the UNDERSIDE of the lobes (light from above), their upper edge also
scalloped; the deepest blue only along the very bottom; no outline, no specks.

stylize(alpha, lum, bump_px) -> RGBA float (straight alpha). bump_px = bump radius in sprite pixels.
"""
import cv2
import numpy as np

CREAM = np.array([0xFF, 0xFE, 0xF2], np.float32) / 255
MID = np.array([0xC6, 0xE2, 0xFD], np.float32) / 255
SH = np.array([0xA6, 0xC9, 0xFB], np.float32) / 255
DEEP = np.array([0x8F, 0xB1, 0xF3], np.float32) / 255


def _disk(r):
    r = max(1, int(round(r)))
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))


def clean(mask, min_area, hole_area):
    m = mask.astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, 4] >= min_area
    m = keep[lab].astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(1 - m, 4)
    fill = np.zeros(n, bool); fill[1:] = st[1:, 4] < hole_area
    m[fill[lab]] = 1
    return m


def scallop(mask, r, rng, step=1.55, jitter=0.12, inset=0.55):
    """Even round bumps along the outline with visible notches between them (spacing > radius)."""
    m1 = cv2.erode(mask, _disk(r * inset))
    out = cv2.erode(m1, _disk(r * 0.35))
    cs, _ = cv2.findContours(m1, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    for c in cs:
        pts = c[:, 0, :].astype(np.float32)
        if len(pts) < 8:
            continue
        seg = np.hypot(*np.diff(np.vstack([pts, pts[:1]]), axis=0).T)
        L = np.r_[0, np.cumsum(seg)]
        n = max(4, int(round(L[-1] / (r * step))))
        off = rng.random()
        for k in range(n):
            s = (k + off) * L[-1] / n
            i = min(int(np.searchsorted(L, s)), len(pts) - 1)
            rr = r * (1 + jitter * (rng.random() * 2 - 1))
            cv2.circle(out, (int(pts[i][0]), int(pts[i][1])), max(1, int(rr)), 1, -1, cv2.LINE_8)
    return out & cv2.dilate(mask, _disk(r * 0.9))


def stylize(alpha, lum, bump_px=None, seed=0, ss=2):
    rng = np.random.default_rng(seed)
    h, w = alpha.shape
    a = cv2.resize(alpha, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    L = cv2.resize(lum, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    H, W = a.shape
    size = np.sqrt((a > 0.4).sum()) + 1
    r = (bump_px * ss) if bump_px else max(6.0, size / 26)
    body = (cv2.GaussianBlur(a, (0, 0), r * 0.5) > 0.45).astype(np.uint8)
    body = clean(body, (r * 6) ** 2, (r * 3) ** 2)
    body = cv2.morphologyEx(body, cv2.MORPH_OPEN, _disk(r * 0.9))
    body = scallop(body, r, rng)
    body = clean(body, (r * 6) ** 2, (r * 3) ** 2)
    B = body.astype(bool)
    # shading score: the photo's own darkness + nearness to the cloud's underside
    Ls = cv2.GaussianBlur(L, (0, 0), r * 1.2)
    vals = Ls[B & (a > 0.5)] if (B & (a > 0.5)).sum() > 200 else Ls[B]
    lo, hi = np.percentile(vals, 3), np.percentile(vals, 97)
    dark = 1 - np.clip((Ls - lo) / max(hi - lo, 1e-3), 0, 1)
    under = np.zeros_like(Ls)
    for k, wgt in ((int(r * 2.0), 1.0), (int(r * 4), .5)):
        below = np.zeros_like(body); below[:-k] = body[k:]
        under = np.maximum(under, wgt * (B & ~below.astype(bool)))
    under = cv2.GaussianBlur(under.astype(np.float32), (0, 0), r * 0.8)
    score = 0.9 * dark + 0.3 * under
    d = int(r * 1.3); above = np.zeros_like(body); above[d:] = body[:-d]
    lip = B & ~above.astype(bool)
    # local contrast at the scale of single lobes: the shaded sides of the puffs inside the cloud
    Lm = cv2.GaussianBlur(L, (0, 0), r * 0.35)
    Ld = Lm - cv2.GaussianBlur(L, (0, 0), r * 2.5)
    core = (B & ~lip).astype(np.uint8)
    def shape(m, rr, min_mul):
        m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, _disk(rr * 0.6))
        m = clean(m, (rr * min_mul) ** 2, (rr * 2) ** 2)
        return scallop(m, rr, rng, step=1.5, inset=0.4) & body
    s1 = shape((0.55 * dark + 0.55 * under > 0.55) & core.astype(bool), r * 0.75, 2.6)   # underside / dark masses
    inner = cv2.erode(core, _disk(r * 0.8)).astype(bool)
    q0 = np.percentile(Ld[inner], 22) if inner.sum() > 500 else -0.02
    s0 = shape((Ld < q0) & inner, r * 0.5, 1.8)  # interior islands: the locally darkest ~22 %
    q1 = np.percentile(Ld[s1.astype(bool)], 35) if s1.sum() > 500 else -0.03
    s2 = shape(((Ld < q1) | (dark > 0.8)) & s1.astype(bool), r * 0.5, 1.8)            # darker islands in the shade
    s3 = shape(((dark > 0.85) & (under > 0.6)) & s1.astype(bool), r * 0.45, 1.8).astype(bool)
    s1 = s1 | s0
    col = np.empty((H, W, 3), np.float32); col[:] = CREAM
    col[s1.astype(bool)] = MID
    col[s2.astype(bool)] = SH
    col[s3] = DEEP
    rgba = np.dstack([col, B.astype(np.float32)])
    return cv2.resize(rgba, (w, h), interpolation=cv2.INTER_AREA)


# ---------------------------------------------------------------------------------------------------------- v2 (r3)
# Measured on the key visual (research/keyvisual.png, cloud region, 1:1): cream ~60 % of the cloud area, pale ~9 %,
# mid blue ~24 %, deep periwinkle ~7 %. Shadows sit on the lower-left of each lobe (light from the upper right) and on
# the underside; each shadow island has its own small scalloped top edge. Tones sampled from the key visual:
KV2 = dict(cream=np.array([0xFF, 0xFD, 0xF2]) / 255, pale=np.array([0xC4, 0xE2, 0xFA]) / 255,
           mid=np.array([0x9C, 0xC4, 0xF8]) / 255, deep=np.array([0x6C, 0x92, 0xEA]) / 255)


def shift(m, dx, dy):
    """m shifted by (dx, dy) pixels (positive = right / down), zero fill."""
    out = np.zeros_like(m); h, w = m.shape
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    out[yd, xd] = m[ys, xs]; return out


def stylize2(alpha, lum, seed=0, ss=2, frac=(0.40, 0.31, 0.07), bump_div=34.0):
    """Key-visual cloud v2: crisper, smaller, varied bumps; ~40 % shaded in three blues, placed by
    (photo darkness) + (facing lower-left away from an upper-right light) + (underside)."""
    rng = np.random.default_rng(seed)
    h, w = alpha.shape
    a = cv2.resize(alpha, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    L = cv2.resize(lum, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    size = np.sqrt((a > 0.4).sum()) + 1
    r = max(6.0, size / bump_div)
    body = (cv2.GaussianBlur(a, (0, 0), r * 0.5) > 0.45).astype(np.uint8)
    body = clean(body, (r * 6) ** 2, (r * 3) ** 2)
    body = cv2.morphologyEx(body, cv2.MORPH_OPEN, _disk(r * 0.9))
    body = scallop(body, r, rng, step=1.45, jitter=0.3, inset=0.5)
    body = clean(body, (r * 6) ** 2, (r * 3) ** 2)
    B = body.astype(bool)
    if B.sum() < 100:
        return np.zeros((h, w, 4), np.float32)
    Ls = cv2.GaussianBlur(L, (0, 0), r * 1.0)
    vals = Ls[B]
    lo, hi = np.percentile(vals, 3), np.percentile(vals, 97)
    dark = 1 - np.clip((Ls - lo) / max(hi - lo, 1e-3), 0, 1)
    # facing away from the light (upper right): the pixel's lower-left neighbour at distance d is outside the body
    # (shift(m, dx, dy)[y, x] = m[y - dy, x - dx], so shift(body, k, -k)[y, x] = body[y + k, x - k])
    face = np.zeros_like(Ls)
    for d, wgt in ((r * 1.2, 1.0), (r * 2.6, .7), (r * 4.5, .45)):
        k = int(d)
        face = np.maximum(face, wgt * (B & ~shift(body, k, -k).astype(bool)))
    under = np.zeros_like(Ls)
    for d, wgt in ((r * 1.6, 1.0), (r * 3.5, .6)):
        k = int(d); under = np.maximum(under, wgt * (B & ~shift(body, 0, -k).astype(bool)))
    # pixels near the lower-left of the body are in the "far" shadow side; near the up-right outline the "lit lip"
    lip = B & ~shift(body, -int(r * 1.1), int(r * 1.1)).astype(bool)   # up-right edge band
    face = cv2.GaussianBlur(face.astype(np.float32), (0, 0), r * .7)
    under = cv2.GaussianBlur(under.astype(np.float32), (0, 0), r * .7)
    yy = np.linspace(0, 1, B.shape[0])[:, None] * np.ones((1, B.shape[1]))
    score = 0.55 * dark + 0.30 * face + 0.35 * under + 0.15 * yy
    score[lip] -= 0.6
    # local contrast islands at lobe scale: the shaded sides of single puffs inside the cream
    Lm = cv2.GaussianBlur(L, (0, 0), r * 0.4); Ld = Lm - cv2.GaussianBlur(L, (0, 0), r * 2.2)
    score -= 0.25 * np.clip(Ld / (np.std(Ld[B]) + 1e-4), -2, 2) * 0.5
    core = B & ~lip
    def tier(q, rr, min_mul, mask=core):
        t = np.percentile(score[B], 100 * (1 - q))
        m = (score > t) & mask
        m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, _disk(rr * 0.5))
        m = clean(m, (rr * min_mul) ** 2, (rr * 1.5) ** 2)
        return (scallop(m, rr, rng, step=1.35, jitter=0.3, inset=0.35) & body).astype(bool)
    s_pale = tier(frac[0], r * 0.7, 2.2)
    s_mid = tier(frac[1], r * 0.55, 2.0, s_pale)
    s_deep = tier(frac[2], r * 0.45, 1.8, s_mid)
    col = np.empty(B.shape + (3,), np.float32); col[:] = KV2['cream']
    col[s_pale] = KV2['pale']; col[s_mid] = KV2['mid']; col[s_deep] = KV2['deep']
    rgba = np.dstack([col, B.astype(np.float32)])
    return cv2.resize(rgba, (w, h), interpolation=cv2.INTER_AREA)


def lobes(score, mask, frac_of, target, rad, rng, bias=(0, 0), tries=4000):
    """Shadow as a union of round lumps (the key visual's shadow islands are lumps, not bands that follow the outline).
    Lumps are placed greedily at high-score points of `mask` until they cover `target` of `frac_of`."""
    out = np.zeros(mask.shape, np.uint8)
    ys, xs = np.nonzero(mask)
    if len(xs) == 0: return out.astype(bool)
    sc = score[ys, xs]; p = np.clip(sc - np.percentile(sc, 40), 1e-4, None) ** 2; p /= p.sum()
    need = target * frac_of.sum()
    idx = rng.choice(len(xs), size=min(tries, len(xs)), p=p, replace=True)
    have = 0
    for k, i in enumerate(idx):
        if out[ys[i], xs[i]]: continue
        R = rad * (0.75 + 0.6 * rng.random())
        cv2.circle(out, (int(xs[i] + bias[0] * R), int(ys[i] + bias[1] * R)), int(R), 1, -1, cv2.LINE_8)
        if k % 4 == 0:
            have = (out.astype(bool) & frac_of).sum()
            if have >= need: break
    return out.astype(bool)


def largest(m):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    if n <= 1: return m.astype(np.uint8), 0.0
    k = 1 + int(np.argmax(st[1:, 4])); tot = st[1:, 4].sum()
    return (lab == k).astype(np.uint8), 1 - st[k, 4] / max(tot, 1)


def fill_holes(m):
    m = m.astype(np.uint8); h, w = m.shape
    ff = np.zeros((h + 2, w + 2), np.uint8); inv = (1 - m).copy()
    cv2.floodFill(inv, ff, (0, 0), 2)
    return ((inv != 2) | (m > 0)).astype(np.uint8)


LAST_FRAG = [0.0]   # fragment share of the last stylize3 call (pieces outside the main body), for the index


def stylize3(alpha, lum, seed=0, ss=2, frac=(0.40, 0.30, 0.08), bump_div=34.0):
    """Key-visual cloud v3: v2's light model, but every shade tier is a union of round lumps with scalloped edges,
    nested toward the lower left (pale > mid > deep), like the key visual's shadow islands.
    r4 (visual juror): one clean body per sprite -- holes filled, only the largest piece kept, thin arms cut off with an
    opening of radius 0.12*sqrt(area) (bunny ears / fingers / arms were the ugliest clouds of the song)."""
    rng = np.random.default_rng(seed)
    h, w = alpha.shape
    a = cv2.resize(alpha, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    L = cv2.resize(lum, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    size = np.sqrt((a > 0.4).sum()) + 1
    r = max(6.0, size / bump_div)
    body = (cv2.GaussianBlur(a, (0, 0), r * 0.5) > 0.45).astype(np.uint8)
    body = clean(body, (r * 6) ** 2, (r * 3) ** 2)
    body, frag = largest(fill_holes(body))
    arm = max(r, 0.12 * np.sqrt(body.sum()))
    opened, _ = largest(cv2.morphologyEx(body, cv2.MORPH_OPEN, _disk(arm)))
    body = cv2.dilate(opened, _disk(r * .6)) & body          # keep the edge detail of what survives the opening
    LAST_FRAG[0] = frag
    body = cv2.morphologyEx(body, cv2.MORPH_OPEN, _disk(r * 0.9))
    body = scallop(body, r, rng, step=1.45, jitter=0.3, inset=0.5)
    body = clean(body, (r * 6) ** 2, (r * 3) ** 2)
    body, _ = largest(fill_holes(body))
    B = body.astype(bool)
    if B.sum() < 100:
        return np.zeros((h, w, 4), np.float32)
    Ls = cv2.GaussianBlur(L, (0, 0), r * 1.0)
    lo, hi = np.percentile(Ls[B], 3), np.percentile(Ls[B], 97)
    dark = 1 - np.clip((Ls - lo) / max(hi - lo, 1e-3), 0, 1)
    face = np.zeros_like(Ls)
    for d, wgt in ((r * 1.5, 1.0), (r * 3.5, .7), (r * 6, .45)):
        k = int(d); face = np.maximum(face, wgt * (B & ~shift(body, k, -k).astype(bool)))
    under = np.zeros_like(Ls)
    for d, wgt in ((r * 2, 1.0), (r * 4.5, .6)):
        k = int(d); under = np.maximum(under, wgt * (B & ~shift(body, 0, -k).astype(bool)))
    face = cv2.GaussianBlur(face.astype(np.float32), (0, 0), r * 1.2)
    under = cv2.GaussianBlur(under.astype(np.float32), (0, 0), r * 1.2)
    yy = np.linspace(0, 1, B.shape[0])[:, None] * np.ones((1, B.shape[1]))
    score = 0.6 * dark + 0.3 * face + 0.35 * under + 0.2 * yy
    lip = B & ~shift(body, -int(r * 1.3), int(r * 1.3)).astype(bool)   # up-right edge band stays cream
    core = B & ~lip
    def finish(m, rr):
        m = clean(m.astype(np.uint8) & core.astype(np.uint8), (rr * 2) ** 2, (rr * 1.5) ** 2)
        return (scallop(m, rr, rng, step=1.4, jitter=0.35, inset=0.3) & body).astype(bool)
    s_pale = finish(lobes(score, core, B, frac[0], r * 3.2, rng), r * 0.45)
    # a few pale islands inside the lit upper body too (the shaded side of single puffs), from the photo's local contrast
    Lm = cv2.GaussianBlur(L, (0, 0), r * 0.4); Ld = Lm - cv2.GaussianBlur(L, (0, 0), r * 2.4)
    inner = cv2.erode(core.astype(np.uint8), _disk(r * 1.2)).astype(bool) & ~s_pale
    if inner.sum() > 500:
        isl = (Ld < np.percentile(Ld[inner], 14)) & inner
        isl = cv2.morphologyEx(isl.astype(np.uint8), cv2.MORPH_OPEN, _disk(r * 0.45))
        isl = clean(isl, (r * 1.8) ** 2, (r * 1.5) ** 2)
        s_pale = s_pale | (scallop(isl, r * 0.5, rng, step=1.4, jitter=.35, inset=.3) & body).astype(bool)
    s_mid = finish(lobes(score, s_pale, B, frac[1], r * 2.4, rng, bias=(-.25, .25)), r * 0.38) & s_pale
    s_deep = finish(lobes(score, s_mid, B, frac[2], r * 1.7, rng, bias=(-.3, .3)), r * 0.32) & s_mid
    col = np.empty(B.shape + (3,), np.float32); col[:] = KV2['cream']
    col[s_pale] = KV2['pale']; col[s_mid] = KV2['mid']; col[s_deep] = KV2['deep']
    rgba = np.dstack([col, B.astype(np.float32)])
    return cv2.resize(rgba, (w, h), interpolation=cv2.INTER_AREA)
