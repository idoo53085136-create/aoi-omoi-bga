
// ================================================================== r8 (10-08, second review of draft r7)
// 37-55 s redone entirely; as at 91 s, it cannot just wiggle ONE thing. The rule taken from the
// references (research/refs_r8.md): several layers move together, all round one centre or one horizon, with fixed speed
// ratios, and only one accent layer changes at a time. The clouds are the key visual's OWN clouds (tools/kv_clouds.py)
// plus the traced cloud sprites, so the world is the key visual's world.

// ---- kit
// a key-visual cloud cut-out centred at (x, y)
function kvc(g, id, x, y, s = 1, flip = false){ const im = IMG[id]; if (!im || !im.width) return; g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.drawImage(im, -im.width / 2, -im.height / 2); g.restore(); }
function cloudItem(g, it, x, y){ if (it.c.startsWith('kvc_')) kvc(g, it.c, x, y, it.s, it.f); else cloudS(g, it.c, x, y, it.s, 0, !!it.f); }
// a row of clouds scrolled left by `off` px, repeating every `period` px
function cloudRow(g, items, off, period, dy = 0){
  for (const it of items){ let x = ((it.x - off + 700) % period + period) % period - 700; for (; x < W + 700; x += period) cloudItem(g, it, x, it.y + dy); }
}
// the key visual's lower-right stripes band (from homeShot), sliding in by `slide` 0..1, stepping by `step` stripes
function kvStripeBand(g, step, slide, dx = 0, dy = 0){
  if (slide <= 0) return;
  g.save(); g.translate(dx + 560 * (1 - eout(slide)), dy + 420 * (1 - eout(slide)));
  // r10 (visual: in tilt's rolled frame the wedge's flat bottom and right ends showed): the shape runs well past the
  // frame's right and bottom edges, so only its curved edge is ever seen
  g.beginPath(); g.moveTo(1290, 1500); g.quadraticCurveTo(1640, 900, 1940, 470); g.lineTo(2200, -200); g.lineTo(2700, -200); g.lineTo(2700, 1700); g.lineTo(1290, 1700); g.closePath(); g.clip();
  stripes(g, 1750, 850, -.72, 40, step * 80, [K.navy, K.royal, K.navy, K.light]); g.restore();
}
// the key visual's arc, the way the image draws it: a solid navy band and, just outside it, a navy band dotted along its
// whole length (r8: never half-dotted)
function kvArc(g, cx, cy, r0, a0, len, dotOff = 0, outline = null){
  if (len <= .01) return;
  // r8b (fresh eyes: on a dark ground the solid band vanished and the arc read as a white-dot "caterpillar"): optional
  // 3 px light outline round both bands
  if (outline){ g.save(); g.strokeStyle = outline; g.lineWidth = 6; for (const [p, q] of [[r0, r0 + 26], [r0 + 34, r0 + 76]]){ g.beginPath(); g.arc(cx, cy, q, a0, a0 + len); g.arc(cx, cy, p, a0 + len, a0, true); g.closePath(); g.stroke(); } g.restore(); }
  g.beginPath(); g.arc(cx, cy, r0 + 26, a0, a0 + len); g.arc(cx, cy, r0, a0 + len, a0, true); g.closePath(); g.fillStyle = K.navy; g.fill();
  navyArc(g, cx, cy, r0 + 34, r0 + 76, a0, a0 + len, a0, a0 + len, dotOff);
}
// a key-visual double contrail along path P, drawn from u0 to u1
function kvLines(g, P, u0, u1, w = 9){
  if (u1 <= u0) return;
  swoosh(g, P, u0, u1, w);
  swoosh(g, u => { const p = P(u), q = P(Math.min(1, u + .004)), dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * 22, p[1] + dx / l * 22]; }, Math.max(u0, u0 + .03), Math.max(u0 + .03, u1 - .02), w * .5);
}
// the voyage -> approach blinds: 8 vertical slats of the key visual's stripes; cover(e) = 0..1 how far slat e (in closing
// order: from both sides to the middle) has come down
const BLIND_ORDER = [0, 7, 1, 6, 2, 5, 3, 4];
function kvBlinds(g, s, cover){
  const sw = W / 8;
  for (let e = 0; e < 8; e++){ const u = cover(e); if (u <= 0) continue; const x = BLIND_ORDER[e] * sw;
    g.save(); g.beginPath(); g.rect(x, -H + H * u, sw + 1, H); g.clip(); stripes(g, 960, 540, -.72, 46, stepEase(s.beat, .3, eout) * 23, ['#03368b', '#0874ff', '#03368b', '#167cff']); g.restore();
    rect(g, x, H * u - 6, sw + 1, 6, K.white); }
}
let VBUF = null;
// render scene `name` at state s2 into the shared offscreen buffer (for slices / wipes inside a shot)
function sceneToBuf(name, s2){ if (!VBUF) VBUF = makeBuf(); const bg = VBUF.getContext('2d'); bg.setTransform(SC, 0, 0, SC, 0, 0); bg.save(); SC_[name](bg, s2); bg.restore(); return VBUF; }
const shiftState = (s, bars) => Object.assign({}, s, { lbar: s.lbar + bars, lb: s.lb + bars * 4, T: s.T + bars * BAR });

// ================================================================== RINGS 118-122: a flat 3D spectrum (review: at 162 s, where
// the angle changes, try a 3D spectrum bouncing on top). 40 flat-shaded prisms stand on the tilted ring plane round
// the sun (front #42cefb, side #0b8ef4, cap #e7ffff; no gradients, no glow, refs_r8 §4), heights from the music's
// spectrum (tools/spectrum_aoi.py, mirrored so it is symmetric), the band pattern turns one step a beat. The back half
// is drawn before the sun, the front half after it.
function spec3D(g, s, cx, cy, rot, sy, grow, half){
  if (grow <= 0) return;
  // r8b (jury r8: 40 equal bars all round read as a crown / a fence and the frame was the busiest of the song): 24 wider
  // bars on the FRONT half only, heights 10-150 straight from the bands (not mirrored, so uneven), no back half
  if (half === 'back') return;
  const n = 24, Rr = 640, w = 40, dx = 14, dy = -8, cr = Math.cos(rot), sr = Math.sin(rot);
  // r8c (UA, fresh: left-to-right the bars just got shorter, a staircase): mirrored round the front centre, the lows in
  // the middle (tallest) falling off to both ends; heights 30-220, normalised to this frame's loudest band so the whole
  // range is used; the fronts light up on the kick
  const bars = [], vs = [];
  for (let j = 0; j < n; j++){ const d = Math.abs(j - (n - 1) / 2) / (n / 2); vs.push(specAt(s.t, Math.min(31, Math.floor(d * 24)))); }
  const vmax = Math.max(.25, ...vs);
  for (let j = 0; j < n; j++){ const a = (j + .5) * Math.PI / n, lx = Math.cos(a) * Rr, ly = Math.sin(a) * Rr * sy, x = cx + lx * cr - ly * sr, y = cy + lx * sr + ly * cr;
    bars.push([y, x, (30 + 190 * Math.pow(vs[j] / vmax, 1.6)) * grow]); }
  bars.sort((p, q) => p[0] - q[0]);
  const front = lerpCol('#9ee9ff', '#e7ffff', clamp(s.k));
  for (const [y, x, h] of bars){ const x0 = x - w / 2, x1 = x + w / 2, top = y - h;
    // (self-check: #42cefb fronts melted into the blue rings) one ladder step lighter, the side a step darker
    poly(g, [x1, y, x1 + dx, y + dy, x1 + dx, top + dy, x1, top], '#0874ff');
    rect(g, x0, top, w, h, front);
    poly(g, [x0, top, x1, top, x1 + dx, top + dy, x0 + dx, top + dy], '#fffef2'); }
}

// ================================================================== the key visual in LAYERS (r8d, review of draft r8: 211 s was
// clearly poorer and uglier than the picture before it; keep that picture and let its elements leave one by one until
// only the small triangle is left; fill the lower left with clouds and the upper right with fragments)
// The image's own clouds (cut out, tools/kv_clouds.py) sit at their own coordinates, the disc is redrawn at the image's
// disc (998, 364, R 765) with the image's light from the lower left; the arcs, stripes, lines and triangles come from
// homeShot. Same options as homeShot (lines, tris, corners, stripes, arc, tower, clouds, discR, discXY, ringSeg).
// (self-check: kvc_05 / kvc_08 carry pieces of the image's white lines and a triangle, which read as broken stubs once
// the lines have left; the right side keeps the image's streak fragments)
const KVL_HOME = { tower: ['kvc_03'], bank: ['kvc_07', 'kvc_10', 'kvc_11'], right: ['kvc_04', 'kvc_01', 'kvc_00', 'kvc_02'] };
function kvLayered(g, s, a = {}){
  const A = k => a[k] === undefined ? 1 : a[k], C = id => { const d = KV_CLOUDS.find(c => c.id === id); return d ? [d.x + d.w / 2, d.y + d.h / 2] : null; };
  skyBg(g, 998, 364);
  // the disc (with the outro's shrinking / drifting and its collar countdown)
  { const dX = a.discXY ? a.discXY[0] : KV_DISC[0], dY = a.discXY ? a.discXY[1] : KV_DISC[1], dR = a.discR !== undefined ? a.discR : KV_DISC[2];
    if (dR > 0){ const segs = a.ringSeg && a.ringSeg(0) < 1;
      if (segs){ for (let k = 0; k < 8; k++){ const al = a.ringSeg(k); if (al <= 0) continue; const a0 = -Math.PI / 2 + k * TAU / 8, a1 = a0 + TAU / 8;
        g.globalAlpha = al; g.beginPath(); g.arc(dX, dY, dR * 1.085, a0, a1); g.arc(dX, dY, dR, a1, a0, true); g.closePath(); g.fillStyle = '#0b8ef4'; g.fill(); g.globalAlpha = 1; } }
      discLad(g, dX, dY, dR, '#42cefb', '#2cbff8', '#10a9f3', segs ? null : '#0b8ef4', .085); } }
  homeShot(g, s, { noSky: true, noDisc: true, corners: A('corners'), stripes: A('stripes'), lines: A('lines'), arc: 0, tris: 0, clouds: 0, stripeEvery: a.stripeEvery, bob: a.bob });
  // the image's own clouds: the tower leaves to the left, the bank down, the right group and the streaks to the right
  const tw = a.tower !== undefined ? Math.min(a.tower, A('clouds')) : A('clouds'), cl = A('clouds'), bob = a.bob !== undefined ? a.bob : Math.sin(s.T * .5) * 5;
  if (tw > 0) for (const id of KVL_HOME.tower){ const p = C(id); if (p) kvc(g, id, p[0] - 520 * (1 - eout(tw)), p[1] + bob * .6, 1); }
  if (cl > 0){ const e = eout(cl);
    for (const id of KVL_HOME.bank){ const p = C(id); if (p) kvc(g, id, p[0] - 120 * (1 - e), p[1] + 520 * (1 - e) - bob * .4, 1); }
    for (const id of KVL_HOME.right){ const p = C(id); if (p) kvc(g, id, p[0] + 520 * (1 - e), p[1] + bob * .5, 1); } }
  homeShot(g, s, { noSky: true, noDisc: true, corners: 0, stripes: 0, lines: 0, clouds: 0, arc: A('arc'), tris: A('tris'), arcSpin: a.arcSpin, triPulse: a.triPulse });
}

// ================================================================== night cloud silhouettes (r8: "before 112 s too boring")
// a flat silhouette of a cloud in one night colour with a thin light rim on its upper edges (made once, cached)
const NIGHTC = {};
function nightImg(c, body, rim, rw = 5){
  const key = c + body + rim + rw; if (NIGHTC[key]) return NIGHTC[key];
  const src = c.startsWith('kvc_') ? IMG[c] : CLOUD[c]; if (!src || !src.width) return null;
  const w = src.width, h = src.height, m = makeCanvas(w, h + rw + 1), x = m.getContext('2d');
  const sil = col => { const t = makeCanvas(w, h), tx = t.getContext('2d'); tx.drawImage(src, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = col; tx.fillRect(0, 0, w, h); return t; };
  x.drawImage(sil(rim), 0, 0); x.drawImage(sil(body), 0, rw);
  return (NIGHTC[key] = m);
}
function nightCloud(g, c, x, y, s, body, rim, flip = false, rw = 5){ const im = nightImg(c, body, rim, rw); if (!im) return; g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.drawImage(im, -im.width / 2, -im.height / 2); g.restore(); }
const NC_FAR = [{ c: 'HB_b4', x: 200, y: 930, s: .6 }, { c: 'HB_r1', x: 760, y: 925, s: .45, f: true }, { c: 'HA_b2', x: 1250, y: 940, s: .62 }, { c: 'HB_r1', x: 1850, y: 925, s: .5 }];
const NC_NEAR = [{ c: 'HB_low', x: 250, y: 1250, s: 1.0 }, { c: 'HA_b0', x: 1150, y: 1270, s: .95, f: true }, { c: 'HA_low', x: 2050, y: 1250, s: 1.0 }];
// the two night layers: far (body #0550b8, rim #42cefb) and near (body #03368b, rim #9ee9ff), drifting slowly left
// split > 0 (r16 audit: they sank out at the end of trance): the clouds left of centre drift out left, the rest right
function nightClouds(g, T, dy = 0, split = 0){
  const row = (items, off, per, body, rim, rw) => { for (const it of items){ let x = ((it.x - off + 700) % per + per) % per - 700; for (; x < W + 700; x += per) nightCloud(g, it.c, x + (split ? (x < 960 ? -split : split) : 0), it.y + dy, it.s, body, rim, !!it.f, rw); } };
  row(NC_FAR, 9 * T, 2500, '#0550b8', '#42cefb', 5);
  row(NC_NEAR, 22 * T, 2900, '#03368b', '#9ee9ff', 8);   // r8b (fresh eyes: the near rim did not read): 8 px
}

// ================================================================== INHALE 111-114 (2:32.4-2:36.5), r8 redo
// Review: at 153 s the transition was not good, too empty, too thin. The music: 111 a snare roll, 112-113 almost silent but
// for the piano's rising run (the composer's MIDI: 7 eighths up from bar 112.5) and two last notes; 114 the drop.
// 111      the key visual's stripes close in from both sides like blinds, one slat per eighth, leaving the sun's column
// 112      the ground is navy; the sun draws in to a point over the whole bar (eio, no jump); the key visual's dotted
//          arcs sit in the four corners; every piano note pulls one thin ring in from the edge to the point (the
//          inhale), brighter for higher notes
// 113      the two last notes pull two wide rings; the point flickers on the last eighth; 114 = the flash into rings
let PIANO_IN = null;
SC_.inhale = (g, s) => {
  const L = s.lbar, lb = s.lb;
  if (!PIANO_IN){ PIANO_IN = []; for (const [bt, du, p] of PIANO){ const t = T0 + bt * BEAT; if (t >= B(111) && t < B(114)){ const l = PIANO_IN[PIANO_IN.length - 1]; if (l && Math.abs(l.t - t) < .01) l.p = Math.max(l.p, p); else PIANO_IN.push({ t, p }); } } }
  // r8b (jury r8: the blinds read as a glitch / a broken bar chart, and the navy was still empty): no blinds. On the
  // snare roll (111) the sky darkens one ladder step per eighth down to #0771e4 (not navy)
  { const LAD = ['#0a9ef7', '#0a95f5', '#098cf2', '#0884ef', '#087cec', '#0877e9', '#0773e6', '#0771e4'], k = clamp(Math.floor(lb * 2), 0, 7), u = eio(clamp((lb * 2 - k) / .5));
    skyBg(g, 960, 540);
    // (r16 audit, visual: on the cut the sky jumped from bloom's deep gradient to a pale one) bloom's last sky, handed over in the first half beat
    { const bf = 1 - eio(span(lb, 0, .5)); if (bf > 0){ g.globalAlpha = bf; vgrad(g, K.sky2, K.disc1); g.globalAlpha = 1; } }
    g.globalAlpha = k === 0 ? u * .0 : 1; bgFill(g, LAD[Math.max(0, k - 1)]); g.globalAlpha = u; bgFill(g, LAD[k]); g.globalAlpha = 1; }
  // (health: 111.4 EMPTY, the very moment the review called "too empty") on each eighth of the snare roll a white ring is
  // pulled in from outside the frame to the sun, as if the light of bloom were being breathed in
  // (r26 advocate: thin white rings closing on a small disc = a bullseye, the thing just removed from bloom) each is a soft
  // band of light (softBand), not a drawn line
  // (self-check: three soft bands at once still stacked into a target) each lives a beat, so at most two at a time
  for (let e = 0; e < 8; e++){ const u = span(lb, e * .5, e * .5 + 1); if (u <= 0 || u >= 1) continue; const r = lerp(1150, 160, eio(u));
    softBand(g, 960, 540, r, lerp(110, 40, u), .4 * Math.min(1, u * 6) * (1 - ein(span(u, .8, 1)))); }
  // a field of the key visual's halftone dots (#42cefb at .4) in a ring, drawn in towards the point from 112
  // (final check, visual: at 113.5-113.85 the frame read as just a small target; these dots hardly showed) paler dots, .85
  { const a = eio(span(L, 1, 1.75)) * .85;   /* r8c (fresh: .4 was all but invisible) */ if (a > 0){ const z = lerp(1.6, .5, eio(span(L, 1, 3))); g.save(); g.globalAlpha = a; g.translate(960, 540); g.rotate(.15 * eio(span(L, 1, 3))); g.scale(z, z);
    g.beginPath(); g.arc(0, 0, 900, 0, TAU); g.arc(0, 0, 260, 0, TAU, true); g.clip('evenodd'); dots(g, -1000, -1000, 1000, 1000, 30, 3.6, '#7bdcfa'); g.restore(); } }
  // two whole key-visual arcs (solid band + dotted band, outlined so they read on the dark ground) fly in from opposite
  // corners on beats 1 and 3 of 111, then are inhaled: they turn and close in on the point over 112-114
  // r8d (review: at 153 s the two half arcs did not reach the frame edge, there was a gap; let them be fully attached to the
  // edges and then close round the circle together, the idea is good): each arc is a long arc round a centre outside
  // its corner, so BOTH its ends are always beyond the frame edges (no floating ends); over 112-114 the centres move in
  // to the sun, the radius closes to 120 and each arc becomes exactly half a circle: at the drop the two halves meet
  // as one whole ring round the point
  // r11 (review: 156 s needed an effect after the join, it was too plain): the halves now meet on the piano's last note
  // (113.25) instead of creeping shut until the drop; on the join the seams flash, the ring flashes and sends out two
  // shock rings, then the closed ring spins up (ein) and in the last fifth of a bar snaps in on the point for the drop
  // (whole-song pass, fresh eyes: mid-close the arcs' ends hung inside the frame for ~0.6 s, r8d's "half arcs
  // don't reach the edge") they stay on the edges longer and close in over the last 3/4 bar before the join
  const spin = 2.4 * ein(span(L, 2.25, 3)), shut = eio(span(L, 2.8, 3)), jf = L >= 2.25 ? 1 - eout(span(L, 2.25, 2.7)) : 0;
  const rJ = lerp(120, 46, shut);
  // (r20 framescan: with eout the arc came over the edge at ~86 px a frame, a pop) eio over 2 beats from just outside
  // (r25c whole-song review, advocate: after the cut ~0.4 s held only the small sun) each arc sets off half a beat
  // earlier (at the cut the first is still 3 % in, just outside the frame)
  // (r29 rules audit: closing, the two arcs' ends hung in the frame over 2:34.87-2:35.3 and wound into an S; r8d's
  // rule was "fully attached to the edges, then close round the circle together") as in arcs' wrap: over
  // 1.5-1.95 the arcs swing on out past their corners, ends always off the frame, while the ring, already closed, comes in
  // from beyond the corners (1.6-2.25, esin) and lands on the sun on the piano's last note (2.25); from 2.25 it is the
  // same ring as before (flash, shock rings, seams, spin, snap)
  const aOut = esin(span(L, 1.5, 1.95)), rIn = esin(span(L, 1.6, 2.25));
  if (rIn > 0) for (let q = 0; q < 2; q++){ const mid = (q ? Math.PI * .75 : -Math.PI * .25) + 2.4 + spin;
    kvArc(g, 960, 540, lerp(1350, rJ, rIn), mid - Math.PI / 2, Math.PI - (rIn >= 1 ? .01 : .002), s.T * 12, jf > 0 ? lerpCol('#42cefb', '#fffef2', jf) : '#42cefb'); }
  if (aOut < 1) for (let q = 0; q < 2; q++){ const c = eio(span(lb, q * 2 - .5, q * 2 + 2)); if (c <= 0) continue;
    // r20 (r16g fresh eyes, open: at 2:32.6 and 2:33.2 a flying-in arc swept across the sun's face and the second crossed
    // the first in an X; shrinking the radius from 2500 to 980 swept each arc right across the frame): the arc keeps its
    // radius (980) and its centre slides in along its corner's diagonal from 800 px out, so it starts just outside the
    // frame, comes to rest ~340 px short of the sun and never crosses the sun or the other arc
    // (r28c cut audit: setting off half a beat early, the first arc's corner showed on inhale's first frame, which bloom
    // does not draw: a pop at the bottom-left) it starts 1000 px out, so on the cut it is still wholly outside the frame
    const ox = q ? W + 160 : -160, oy = q ? -160 : H + 160, D = (1000 * (1 - c) + 1100 * aOut) * .7071, r = 980, cx = ox + (q ? D : -D), cy = oy + (q ? -D : D);
    const len = Math.PI * .75, mid = q ? Math.PI * .75 : -Math.PI * .25, a0 = mid - len / 2 + (1 - c) * .25 * (q ? 1 : -1);
    kvArc(g, cx, cy, r, a0, len - .01, s.T * 12, '#42cefb'); }
  if (L >= 2.25){
    // the joined ring flashes cream for a moment
    // (r16 audit, visual: a wide cream band at .75 read as a grey band) an opaque thin cream ring that widens out and thins
    { const f = 1 - eout(span(L, 2.25, 2.45)); if (f > 0){ const r = rJ + 30 + 60 * (1 - f); ring(g, 960, 540, r, r + 10 * f, '#fffef2'); } }
    // two shock rings run out to the frame edges
    for (const [l0, r1, col, w0] of [[2.25, 1500, '#fffef2', 22], [2.375, 1150, '#9ee9ff', 14]]){ const u = span(L, l0, l0 + .375); if (u <= 0 || u >= 1) continue;
      const r = lerp(rJ + 90, r1, eout(u)); g.globalAlpha = 1 - ein(u); ring(g, 960, 540, r, r + lerp(w0, 2, u), col); g.globalAlpha = 1; }
    // a glint on each seam, turning with the ring
    // (r16 audit, visual: two big four-point stars read as stickers) a cream key-visual triangle springs off each seam, pointing out
    { const gs = span(L, 2.25, 2.62); if (gs > 0 && gs < 1) for (const o of [0, Math.PI]){ const a = 2.4 - Math.PI * .75 + spin + o, d = rJ + 40 + 120 * eout(gs); triK(g, 960 + Math.cos(a) * d, 540 + Math.sin(a) * d, 40 * eback(clamp(gs * 3)) * (1 - ein(gs)), a + Math.PI / 2, 0, '#fffef2', 3); } }
  }
  // eight key-visual triangles spiral in from the edges to the point over 112-114 (they arrive with the drop)
  for (let j = 0; j < 8; j++){ const u = span(L, 1 + j * .12, 3), e = eio(u); if (u <= 0 || u >= 1) continue; const a = j * TAU / 8 + .4 + e * 2.2, d = lerp(1150, 20, e);
    tri(g, 960 + Math.cos(a) * d, 540 + Math.sin(a) * d * .9, lerp(44, 8, e) * pop(u * 12), a + Math.PI / 2, 0, TRI_COLS[j % 6]); }
  // the sun: R 150 at the cut (bloom's last frame), R 70 with its collar from 112.5 (rhythm juror), a little hop on
  // every piano note (fresh eyes), and only in the last beat drawn in to a point
  let hop = 0; for (const n of PIANO_IN){ const a = (s.t - n.t) / (BEAT * .5); if (a >= 0 && a < 1) hop = Math.max(hop, 1 - eout(a)); }
  const R = lerp(lerp(150, 70, eio(span(L, .5, 1.5))), 8, eio(span(L, 2.75, 3))) * (1 + .18 * hop) + 6 * s.k * (1 - span(L, 1, 2));
  disc(g, 960, 540, R, R > 20 ? 1 : 0);
  // the piano pulls rings in to the point (one per note; the run's higher notes are lighter)
  for (const n of PIANO_IN){ const u = (s.t - n.t) / (BEAT * (n.t > B(113) ? 1.6 : 1.1)); if (u <= 0 || u >= 1) continue;
    // (r26 advocate) soft bands too; the higher the note the lighter (and the wider for the two last notes)
    const r = lerp(n.t > B(113) ? 1300 : 1000, R + 30, eio(u)), lt = clamp((n.p - 44) / 30), rgb = `${Math.round(lerp(8, 231, lt))},${Math.round(lerp(116, 255, lt))},255`;
    softBand(g, 960, 540, r, lerp(n.t > B(113) ? 140 : 90, 24, u), lerp(.5, .65, lt) * Math.min(1, u * 5) * (1 - ein(span(u, .85, 1))), rgb); }
};

// ================================================================== HORIZON 66-70 (1:30.7-1:36.2), r8 redo
// Review: at 91 s, not just the clouds moving, and no ugly squirming. The loudest chorus so far (loud .91): the sun jumps
// out of a three-layer cloud sea, and everything moves round it ON the music (research refs_r8 §2):
//  kick   the three cloud layers step 6 / 12 / 24 px (far / mid / near), the two key-visual arcs behind the sun turn
//         1/24 of a turn in opposite directions, the sun's collar swells
//  snare  (beats 2, 4) a light ring leaves the sun
//  bar    a key-visual contrail pair is drawn across the sky above the sun
//  68     (the camera change) the arcs swap directions and the key visual's stripes band slides in lower right
//  69.5   the sun glides to band's window (1260, 500), and in the last beat band's stripes wipe in diagonally from the
//         lower right, so the cut at 70 is the same picture
const HZ_FAR = [{ c: 'HA_r5', x: 120, y: 800, s: .42 }, { c: 'HA_tr', x: 700, y: 800, s: .4 }, { c: 'HB_r1', x: 1320, y: 805, s: .36, f: true }, { c: 'HB_r1', x: 1900, y: 800, s: .38 }];
const HZ_MID = [{ c: 'HB_b4', x: 200, y: 960, s: .6 }, { c: 'HA_b2', x: 900, y: 975, s: .62 }, { c: 'HB_b0', x: 1600, y: 960, s: .58 }, { c: 'HA_r5', x: 2250, y: 965, s: .75 }];
const HZ_NEAR = [{ c: 'HB_low', x: 100, y: 1230, s: 1.0 }, { c: 'HA_low', x: 900, y: 1250, s: 1.05 }, { c: 'HB_b0', x: 1700, y: 1210, s: 1.0 }, { c: 'HA_b4', x: 2500, y: 1230, s: .95 }];
const HZB_FAR = [{ c: 'HB_b4', x: 0, y: 830, s: .8 }, { c: 'HA_b2', x: 600, y: 840, s: .85 }, { c: 'HB_b0', x: 1200, y: 825, s: .75 }, { c: 'HA_b4', x: 1800, y: 835, s: .8 }];
const HZB_MID = [{ c: 'HA_b0', x: 200, y: 960, s: .95 }, { c: 'HB_b4', x: 850, y: 975, s: 1.0, f: true }, { c: 'HA_b2', x: 1500, y: 965, s: 1.0 }, { c: 'HB_b0', x: 2150, y: 970, s: .95, f: true }];
// r8c (visual, UA, fresh: the near band only showed a few lumps at the bottom): two big cumulus, the left one
// dominant, their tops up near 0.75 H, cream with the lavender shading taking the bottom ~20 %
const HZB_NEAR = [{ c: 'HB_low', x: 420, y: 1010, s: 1.6 }, { c: 'HB_low', x: 1700, y: 1070, s: 1.3, f: true }];   // r8f: HA_low had a see-through hole
// r15: a ring of flat spectrum bars standing on the sun's rim (56 bars, the lows at the top where the sky is clear,
// mirrored left / right), normalised to this frame's loudest band; cream and pale cyan alternating; amt grows / shrinks it
// r15b (advocate, visual, fresh eyes: 56 near-equal bars read as a gauge / dial / rising-sun crown): 32 thicker
// bars; each band is stretched between this frame's quietest and loudest band (so the outline clearly rises and falls,
// 12-130 px), averaged over 4 frames so it moves without flicker; the lows at the top stand tallest
// r15c (the data: this passage's mid bands sit within ~15 % of each other, so any per-frame scaling still looked even):
// each bar = its band's contrast against the other VISIBLE bands (the lower ones are behind the clouds) plus how far the
// band is above its own last half second (the movement in the music), 3-frame smoothed
function sunSpectrum(g, s, x, y, R, amt){
  if (amt <= 0) return;
  // (r15c self-check: the lows are twice as loud as the highs, so against each other the side bars were always the
  // shortest) each band is measured against its own last 1.5 s instead
  const n = 32, bw = TAU * R / n * .42;
  for (let j = 0; j < n; j++){ const d = Math.abs((j + .5) / n - .5) * 2, b = Math.min(31, Math.floor((1 - d) * 28)); let cur = 0, slow = 0, mean = 0;
    for (let k = 0; k < 3; k++) cur += specAt(s.t - k / 60, b) / 3;
    for (let k = 1; k <= 6; k++) slow += specAt(s.t - k * .09, b) / 6;
    for (let k = 0; k < 12; k++) mean += specAt(s.t - k * .125, b) / 12;
    const rel = cur / Math.max(.05, mean), a = -Math.PI / 2 + (j + .5) / n * TAU, h = (30 + 62 * clamp((rel - .8) / .5) + 45 * clamp((cur - slow) * 5)) * amt;
    g.save(); g.translate(x + Math.cos(a) * (R + 16), y + Math.sin(a) * (R + 16)); g.rotate(a + Math.PI / 2);
    g.beginPath(); g.roundRect(-bw / 2, -h, bw, h, bw / 2); g.fillStyle = j % 2 ? '#9ee9ff' : '#e7ffff'; g.fill(); g.restore(); }
}
// r16 (review: at 92 s the spectrum looked bad; replace it with small triangles all around, flashing along): 22
// small triangles scattered in a loose halo round the sun (never a ring: random radius 90-560 px past the rim, upper sky
// only), each tied to one band of the song's spectrum; a triangle lights up (alpha .3 -> 1, 1.4x) when its band rises
// above its own last half second, and dims over ~0.3 s; they drift and turn slowly, so nothing steps
// r16b (visual: scattered and mixed colours read as confetti; fresh eyes / UA: too small, like dust): a loose ring at
// R + 90..170 over the open upper sky, near-even spacing, white and mint only, 26-36 px, each pointing outward
// r16 audit (rhythm juror: 22 in a ring read as a crown again): 10 bigger ones at clearly staggered radii
// (whole-song pass, advocate: scattered they read as confetti; r16 asked for "small triangles all round, flashing")
// 12 fixed places on one ring R + 120 over the open sky, evenly spaced, 30-38 px, pointing out; only their light changes
const SUN_TRI = Array.from({ length: 12 }, (_, i) => ({ a: -Math.PI * (-.08 + 1.16 * ((i + .5) / 12)), d: 120, sz: 30 + 8 * hash(i * 5 + 2), b: 2 + Math.floor(hash(i * 11 + 3) * 22), c: i % 2 ? K.mint : '#fffef2', r0: hash(i * 13) * .3, w: 0, out: true }));
function sunTris(g, s, x, y, R, amt){
  if (amt <= 0) return;
  for (const T of SUN_TRI){ let cur = 0, slow = 0;
    for (let k = 0; k < 3; k++) cur += specAt(s.t - k / 60, T.b) / 3;
    for (let k = 1; k <= 6; k++) slow += specAt(s.t - k * .09, T.b) / 6;
    // dims over ~0.3 s: the envelope is the max of the recent rises, each fading with its age
    let env = clamp((cur - slow) * 6); for (let k = 1; k <= 6; k++){ let c2 = 0, s2 = 0; for (let j = 0; j < 3; j++) c2 += specAt(s.t - k * .05 - j / 60, T.b) / 3; for (let j = 1; j <= 6; j++) s2 += specAt(s.t - k * .05 - j * .09, T.b) / 6; env = Math.max(env, clamp((c2 - s2) * 6) * (1 - k / 7)); }
    const a = T.a, d = R + T.d, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;   // (no drift: fixed places on the ring)
    g.globalAlpha = amt * (.3 + .7 * env); triK(g, px, py, T.sz * amt * (1 + .4 * env), a + Math.PI / 2 + T.r0 - .3, 0, T.c, 0); }
  g.globalAlpha = 1;
}
// r16 audit (rhythm juror: at the hover -> horizon cut the big cloud was flung out and the sun stood alone in an empty
// sky): horizon's far and mid cloud bands rise on the global beat clock from 65.6 (beat 262.5) to 66.4, so they already
// come up behind the sun in hover's last beat (hover draws them too) and carry straight across the cut
const hzSeaRise = beat => 950 * (1 - eout(span(beat, 262, 265)));   // (re-audit: still half a beat of lone sun) from 65.5
function hzFarSea(g, kb){
  const cr = hzSeaRise(kb); if (cr >= 949) return;
  const band = (items, off, per, body, rim, dy) => { for (const it of items){ let x = ((it.x - off + 800) % per + per) % per - 800; for (; x < W + 800; x += per) nightCloud(g, it.c, x, it.y + dy, it.s, body, rim, !!it.f); } };
  band(HZB_FAR, 6 * kb, 2400, '#7bdcfa', '#c5e6fe', cr * .6);   // r8c (UA: the far bands read grey, the sun sat in fog): a clearer blue
  band(HZB_MID, 16 * kb, 2600, '#c5e6fe', '#fffff4', cr * .8);
}
SC_.horizon = (g, s) => {
  // r15 (review: at 91 s let the cloud layers scroll smoothly, not jump with the drums; turn the groove into a
  // sound display in the circle or a spectrum vibrating round it): everything here moves continuously (kb is the plain
  // beat clock now, the arc turns smoothly, the sun no longer swells on the kick, no snare rings); the music shows in a
  // ring of spectrum bars round the sun
  const L = s.lbar, lb = s.lb, kb = s.beat, flip = L >= 2 ? -1 : 1;
  skyBg(g, 960, 600);
  // (r16 audit, rhythm juror: the sun jumped into band's window in ~5 frames under the wipe) it slides there over 69-69.75
  // (r20 audit, rhythm juror: with eback the sun shot up ~40 px a frame on the cut, a jump on the drum; r15 at 91 s:
  // "don't jump with the drums") it rises out of the cloud sea with eio over 2 beats, from hover's resting sun
  const rise = eio(span(lb, 0, 2)), go = eio(span(L, 3, 3.75));
  // r11: hover now ends on this sun uncovered at (960, 890, R 420) (no more tilt-up), so it jumps up from there
  const sx = lerp(960, 1260, go), sy = lerp(lerp(890, 640, rise), 500, go), R = lerp(lerp(420, 400, clamp(rise)), 390, go);
  // contrails: one pair a bar, high over the sun (drawn in 1 beat, reeled in from the tail over the bar)
  { const ph = fract(L), k = Math.floor(L) % 2, P = k ? v => [lerp(-100, 2020, v), 300 - v * 180 + Math.sin(v * 3) * 60] : v => [lerp(2020, -100, v), 140 + v * 260 - Math.sin(v * 2.6) * 50];
    kvLines(g, P, ein(clamp(ph * 1.3 - .3)), eout(clamp(ph * 4)), 8); }
  // r8b (jury: arcs hugging the sun read as a gauge): no concentric arcs; the key visual's own corner arc (its centre
  // outside the frame, lower left) turns a step per beat (direction swaps on 68) and the stripes band holds the lower right
  const cornerArc = () => { const ang = (lb < 8 ? lb : 16 - lb) * .035 - .25 * (1 - eout(span(lb, 0, 2)));   /* local beats; turns back from 68 */ g.save(); g.translate(-60, 1120); g.rotate(ang);
    // r8d (review: at 92 s the arc on the left was broken off): as it turns, its top end came into the frame as a cut-off stub
    // and the dotted band stopped half way; both bands now run past the frame edges at both ends
    g.beginPath(); g.arc(0, 0, 580, -Math.PI * .7, Math.PI * .1); g.arc(0, 0, 520, Math.PI * .1, -Math.PI * .7, true); g.closePath(); g.fillStyle = K.navy; g.fill();
    g.beginPath(); g.arc(0, 0, 620, -Math.PI * .7, Math.PI * .1); g.arc(0, 0, 580, Math.PI * .1, -Math.PI * .7, true); g.closePath(); g.save(); g.clip(); rect(g, -800, -800, 1600, 1000, K.navy); dots(g, -800, -800, 800, 200, 21, 4.4, K.white); g.restore(); g.restore(); };
  // a ring of light on the snare (beats 2 and 4)
  disc(g, sx, sy, R);
  sunTris(g, s, sx, sy, R, eout(span(lb, .6, 2.2)) * (1 - eio(span(L, 3.5, 3.85))));
  // the cloud sea, stepping on the beat at 6 : 12 : 24 px; it rises into frame with the sun on the first beat
  // r8f (cut audit: hover ends on empty sky and the cloud bands and arc popped in on the cut): everything below the sun
  // rises in from under the frame over 1.5 beats, continuing hover's tilt up
  const cr = 950 * (1 - eout(span(lb, 0, 1.5)));   // r11b (rhythm juror: the far band's tops showed on the cut frame): from further down
  // r8b (jury: "a row of separate small cotton balls"): three continuous bands that overlap with no gaps: the far two are
  // flat silhouettes (pale blue, paler blue, each with a light rim, like the night clouds the jury liked), the near one
  // is big cumulus; they step 6 / 16 / 40 px a beat
  hzFarSea(g, kb);
  // triangles fly out of the distance on the beat (kept from r6: they read as the speed of the chorus)
  beatEvents(s, 4, 264, (b, a) => { const u = a / (BEAT * 3); if (u > 1) return; const k = 1 / Math.max(.12, 1 - u); triK(g, sx + (hash(b) - .5) * 700 * k, sy - 120 - 160 * k * .7, 20 * k, b + u * 3, u, TRI_COLS[b % 6], b); });   // r11b: from horizon's own first beat (264 = bar 66), nothing pops in on the cut
  cloudRow(g, HZB_NEAR, 40 * kb, 3000, cr);
  g.save(); g.translate(0, cr); cornerArc(); g.restore();   // in front of the cloud sea, as in the key visual
  // 68: the key visual's stripes band slides in lower right and steps on the beat
  kvStripeBand(g, kb / 2, eout(span(L, 2, 2.25)));
  // the last beat: band's own first frame wipes in from the lower right along the stripes (match cut on the window)
  { const u = eio(span(L, 3.75, 4)); if (u > 0){ const buf = sceneToBuf('band', shiftState(s, -4)), d = lerp(W + H + 200, -200, u);
    g.save(); g.beginPath(); g.moveTo(d + 100, -100); g.lineTo(W + 400, -100); g.lineTo(W + 400, H + 400); g.lineTo(d - H - 400, H + 400); g.closePath(); g.clip(); g.drawImage(buf, 0, 0, W, H); g.restore();
    g.save(); g.beginPath(); g.moveTo(d + 100, -100); g.lineTo(d - H - 400, H + 400); g.strokeStyle = K.white; g.lineWidth = 10; g.stroke(); g.restore(); } }
};

// ================================================================== VOYAGE C (r8d): the triangle factory
// Review (draft r8): 42 s was exactly the previous section, standing still. Make it a conveyor that scrolls and flows
// (it may move with the rhythm, but no jerking), put all sorts of elements on it but not our triangle; one by one, left to
// right along the belt, like a factory, they turn into triangles and fly up into the sky. Natural and harmonious.
//  belt    the key visual's stripes on a long band rising gently left to right, white double rails along its edges; it
//          flows all the time and gets a push on every beat (fast at the beat, easing after it: never stops)
//  items   a little cloud, a halftone disc, a stripe tile, a small sun, a four-point star, a dotted arc piece, coming out
//          from behind the cloud bank on the left, spaced so that each reaches the gate exactly on its beat
//  gate    an arch made of the key visual's arc stands on the belt; an item passing under it turns into a triangle (the
//          arch flashes) and the triangle flies off with a contrail into the sky on the right, where the flock gathers
//  timing  28-31 one a beat; the breakdown 31-37 one every 2 beats (the belt slower); 37-39 one a beat; 39 one an eighth
//  27      kvHold's pieces leave one group per beat, the belt rises in, the disc glides to the upper left
//  39.5    the belt sinks away and the whole flock streams into the sun, which gathers into approach's disc (match cut)
const FAC = { xg: 1240, yc: x => 930 - .13 * x, half: 52, x0: -160, x1: 2080 };
const FAC_GATE = (() => { const b = []; for (let x = 4; x < 16; x++) b.push(x); for (let x = 16; x < 36; x += 2) b.push(x); for (let x = 36; x < 48; x++) b.push(x); for (let x = 48; x < 50; x += .5) b.push(x); return b; })();
const facV = lb => lb < 16 ? 220 : lb < 17 ? lerp(220, 120, lb - 16) : lb < 35 ? 120 : lb < 36 ? lerp(120, 240, lb - 35) : lb < 48 ? 240 : 290;
const FAC_S = (() => { const n = 56 * 16, a = new Float64Array(n + 1); for (let i = 1; i <= n; i++){ const x = (i - .5) / 16; a[i] = a[i - 1] + facV(x) / 16; } return a; })();
function facS(lb){ const x = clamp(lb, 0, 56) * 16, i = Math.min(Math.floor(x), 56 * 16 - 1), base = FAC_S[i] + (FAC_S[i + 1] - FAC_S[i]) * (x - i);
  const amp = .32 * facV(Math.floor(lb)), f = fract(lb); return base + amp * (eout(f) - f) * (lb >= 0 ? 1 : 0); }
// r8f (jury r8e: the items were small, and the star / pale cloudlet are not key-visual shapes; the sun vanished on the
// sky): four key-visual items, bigger: a cream cumulus, a halftone disc, a stripe tile, a small sun with a white rim
const FAC_ITEMS = ['cloud', 'arc', 'stripe', 'dtri', 'sun'];
// r16 (review: the parts on the conveyor did not look good, did not blend in, a bit abrupt; all jurors F): only pieces
// cut from the key visual itself, one size, standing on the belt on a soft #0771e4 shadow: a cream cloudlet, a quarter
// of the key visual's arc (navy band + dotted navy band), a stripe parallelogram at the key visual's stripe angle, a
// halftone triangle, and the key visual's sun with its collar. (The halftone ball and the pale circle are gone.)
function facItem(g, kind, x, y, sc, rot){
  if (sc <= .01) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc * 1.6, sc * 1.6);
  g.globalAlpha *= .45; g.beginPath(); g.ellipse(0, 33, 27, 5, 0, 0, TAU); g.fillStyle = '#0771e4'; g.fill(); g.globalAlpha /= .45;
  switch (kind){
    case 'cloud': cloudS(g, 'HB_r1', 0, 2, .085); break;
    case 'arc': { const ax = 20, ay = 26, band = (r0, r1) => { g.beginPath(); g.arc(ax, ay, r1, -Math.PI, -Math.PI / 2); g.arc(ax, ay, r0, -Math.PI / 2, -Math.PI, true); g.closePath(); };
      band(22, 34); g.fillStyle = K.navy; g.fill(); g.save(); band(37, 52); g.fillStyle = K.navy; g.fill(); g.clip(); dots(g, -40, -40, 40, 40, 7.5, 1.9, K.white); g.restore(); break; }
    case 'stripe': g.save(); g.beginPath(); g.moveTo(-31, 27); g.lineTo(-9, -27); g.lineTo(31, -27); g.lineTo(9, 27); g.closePath(); g.clip(); stripes(g, 0, 0, -.72, 9, 0, [K.navy, K.royal]); g.restore(); break;
    case 'dtri': dotShape(g, 1, 0, 4, 31, 0, 1, 9, 0); break;
    case 'sun': disc(g, 0, 0, 23); break;
  }
  g.restore();
}
// r8f (all four jurors: the sky flock read as scattered confetti): every triangle flies to its own slot in a garland
// along the sun's rim, two rows of 9 (the inner row fills first, then the outer: you can count them), pointing along
// the rim, white and mint; once all 18 are taken, a newcomer takes the oldest slot and the old one flies off outwards.
// It also announces approach's garland of triangles round the disc.
// (UA: curve it more along the rim) as wide as the frame allows: the top end at the frame's top, the bottom just above the belt
const facSlot = (k, dX, dY, dR) => { const sl = k % 18, row = sl < 9 ? 0 : 1, i = sl % 9, a = row ? -.36 + i * .98 / 8 : -.32 + i * 1.04 / 8, r = dR + (row ? 175 : 80); return [dX + Math.cos(a) * r, dY + Math.sin(a) * r, a]; };
// camera: 27-31 wide; 31 eases in on the gate (the change up close, in the breakdown); 34 tilts up to the garland;
// 37 pulls back wide as the belt speeds up (each move an eio over a whole bar)
const FAC_CAM = [[960, 540, 1], [1140, 590, 1.24], [900, 400, 1.14], [960, 540, 1]];
SC_.voyageC = (g, s) => {   // (r10 factory with the gate; replaced by the r11 voyage below)
  const L = s.lbar, lb = s.lb, S = facS(lb), sink = eio(span(L, 12.6, 13.05)), rise = 1 - eout(span(lb, 1, 3.2));
  const by = 420 * rise + 560 * sink;   // the belt (and everything on it) rises in during 27 and sinks away at the end
  const yT = x => FAC.yc(x) - FAC.half + by, yB = x => FAC.yc(x) + FAC.half + by;
  skyBg(g, 700, 300);
  // (health: SNAP during the 1-bar moves) each move now takes 1.5 bars
  { const ci = L < 4 ? 0 : L < 7 ? 1 : L < 10 ? 2 : 3, cu = ci === 0 ? 1 : eio(clamp((L - [0, 4, 7, 10][ci]) / 1.5)), c1 = FAC_CAM[ci], c0 = FAC_CAM[Math.max(0, ci - 1)];
    const fx = lerp(c0[0], c1[0], cu), fy = lerp(c0[1], c1[1], cu), z = lerp(c0[2], c1[2], cu); g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-fx, -fy); }
  // the disc: kvHold's at 27.0 -> upper left -> approach's disc at 40 (one sun throughout); (fresh eyes: the gathering
  // read as "a different disc"): it now glides and shrinks over 1.25 bars
  const da = eio(span(L, 0, 1)), dbb = eio(span(L, 11.75, 13));
  const dX = lerp(lerp(960, 330, da), 960, dbb), dY = lerp(lerp(540, 250, da), 540, dbb), dR = lerp(lerp(740, 600, da), 260, dbb) * (1 + .01 * s.k);
  disc(g, dX, dY, dR);
  // a few wisps high on the right (drift slowly)
  cloudS(g, 'HA_tr', 1760 - 3 * lb, 70, .45, 0, true); cloudS(g, 'HA_r5', 1180 - 2 * lb, 40, .35);
  // the flock: every triangle made at the gate flies up into the sky and stays, drifting, glinting on the snare
  const sn = snareAt(s.t), conv = eio(span(L, 12.55, 13));
  FAC_GATE.forEach((b, k) => { const a = lb - b - .3; if (a < 0) return;
    const [tx, ty, ta] = facSlot(k, dX, dY, dR), sx = FAC.xg, sy = yT(FAC.xg) - 56;
    const u = clamp(a / 1.4), e = eio(u), cx = (sx + tx) / 2 + 120, cyy = Math.min(sy, ty) - 160;
    let x = bez(sx, cx, tx, e), y = bez(sy, cyy, ty, e), rot = lerp(k * 1.3, ta + Math.PI / 2, e);
    // replaced (rhythm juror: one in, one out): as triangle k + 18 lands in this slot, this one is drawn into the sun
    // (eout over a beat), so the garland keeps moving on the beat after it is full
    const nb = FAC_GATE[k + 18], off = nb === undefined ? 0 : eout(clamp((lb - nb - .3 - 1.4) / 1));
    if (off >= 1) return;
    if (u >= 1){ x += bob(s.T, k, 4); y += bob(s.T, k + 2, 4); }
    x = lerp(x, dX + Math.cos(ta) * dR * .6, off); y = lerp(y, dY + Math.sin(ta) * dR * .6, off);
    x = lerp(x, dX, conv); y = lerp(y, dY, conv);
    if (u < 1) swoosh(g, v => { const ev = eio(v); return [bez(sx, cx, tx, ev), bez(sy, cyy, ty, ev)]; }, Math.max(0, u - .3), u, 4);
    const sz = 44 * (1 + .25 * sn * (k % 2)) * (1 - .6 * conv) * (1 - off);
    tri(g, x, y, sz, rot, 0, k % 2 ? K.mint : K.white); });
  // the belt: front face, striped top flowing with S, white rails
  { const pts = (f, d) => { const p = []; for (let x = FAC.x0; x <= FAC.x1; x += 160) p.push([x, f(x) + d]); return p; };
    const top = pts(yT, 0), bot = pts(yB, 0), face = pts(yB, 30);
    g.beginPath(); bot.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); face.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fillStyle = K.navy; g.fill();
    g.save(); g.beginPath(); top.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); bot.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.clip();
    stripes(g, 960, FAC.yc(960) + by, -.13 + .62, 30, S * Math.cos(.62), [K.navy, K.royal, K.navy, K.light]); g.restore();
    for (const [f, w, d] of [[yT, 7, -2], [yT, 3, -16], [yB, 4, 6]]) swoosh(g, v => { const x = lerp(FAC.x0, FAC.x1, v); return [x, f(x) + d]; }, 0, 1, w); }
  // the items riding the belt, each reaching the gate on its beat, turning into a triangle under the arch
  FAC_GATE.forEach((b, k) => { const kind = FAC_ITEMS[k % FAC_ITEMS.length];
    if (lb < b){ const x = FAC.xg - (facS(b) - S); if (x < FAC.x0 - 60) return; facItem(g, kind, x, yT(x) - 56, 1, 0); return; }
    const m = (lb - b) / .3; if (m >= 1) return;
    facItem(g, kind, FAC.xg, yT(FAC.xg) - 56, 1 - eio(m), m * 2);
    tri(g, FAC.xg, yT(FAC.xg) - 56, 48 * pop(m * 1.2), m * 2, 0, TRI_COLS[k % 6]); });
  // the gate: an arch of the key visual's arc (solid + dotted band) standing on the belt; as an item turns, a light
  // band runs over the arch (upper half only)
  { const gp = eback(span(lb, 2.5, 3.5)) * (1 - eio(span(L, 12.6, 13))); if (gp > 0){ const gx = FAC.xg, gy = yT(gx) + 6;
      let fl = 0; for (const b of FAC_GATE){ const d = lb - b; if (d >= 0 && d < .5) fl = Math.max(fl, 1 - d / .5); }
      g.save(); g.translate(gx, gy); g.scale(gp, gp); kvArc(g, 0, 0, 140, Math.PI * 1.02, Math.PI * .96, s.T * 14);
      if (fl > 0){ g.globalAlpha = fl; g.beginPath(); g.arc(0, 0, 230 + 18 * (1 - fl), Math.PI, TAU); g.strokeStyle = '#e7ffff'; g.lineWidth = 4 + 8 * fl; g.lineCap = 'round'; g.stroke(); g.globalAlpha = 1; } g.restore(); } }
  // the cloud bank the items come out of (left) and one in front on the right
  cloudS(g, 'HB_low', 90, 1010 + by * .6, 1.1); cloudS(g, 'HA_b0', 1820, 1160 + by * .6, .95, 0, true);
  g.restore();   // the camera
  // 27: kvHold's pieces leave the way they came in, one group per beat, and its own extras shrink away
  if (L < 1){ const e = k => eio(span(lb, k, k + .9));
    homeShot(g, s, { noSky: true, noDisc: true, arcSlide: true, arc: 1 - e(1.5), stripes: 1 - e(1.5), lines: 1 - e(0), corners: 1 - e(1), tris: 1 - e(2), clouds: 1 - e(2.5) });
    dotShape(g, 1, 1240, 170, 90 * (1 - e(0)), .18, 1, 18, s.T * 10); triK(g, 1080, 300, 44 * (1 - e(.5)), .6 + s.T * .1, 0, K.navy, 1); }
};
// ================================================================== VOYAGE r11 (27-40, 0:37.2-0:55.0)
// Review (draft r10): the conversion gate was not good: let the items go straight to this place and turn straight into
// triangles, but make the turning a good move; more thought for the belt-to-triangle part; from 43 s, when the
// piano comes in, the conveyor shouldn't go on, change the scene: the triangles can circle round the sun; the small
// triangles can turn into a spectrum like 163 s; 36-37 s did not join up: things suddenly appeared and others vanished;
// the generated triangles went well past the places given to them.
//  27       kvHold's key visual leaves piece by piece over the bar, each the way it came in, from kvHold's own zoom and
//           disc (nothing is cut on the frame), while the belt rises in and the sun glides to the upper left
//  28-30    one item a beat (two a beat in 30) rides the belt to the turning point; there it hops off and flips over
//           like a card: its back is a triangle (a light ring and four glints on the flip); the triangle flies up to its
//           place in a two-row garland on the sun's rim, well inside the frame
//  30.5-31  the belt is pulled out to the right, the sun glides to the centre (R 300) and the garland swings round it
//           into an orbit on a tilted ring (31 is the music's break, 32 the piano and the steady kick)
//  32-33    on every half beat one triangle on the ring unfolds into a flat 3D spectrum bar (the 163 s look), lows at the
//           front; the ring keeps turning, the back half passes behind the sun
//  34-37    the ring spectrum turns and plays; a light ring runs out over the orbit plane on every downbeat
//  38-39    (the build) the ring turns faster, the bars grow, the camera leans in
//  39.5-40  the bars fold back into triangles and are drawn into the sun, which gathers to approach's disc (R 260)
const VG = { xg: 1180, yc: x => 930 - .13 * x, half: 52, x0: -160, x1: 2080 };
const VG_T = (() => { const b = []; for (let x = 4; x < 11.5; x++) b.push(x); for (let x = 11.5; x <= 14.51; x += .5) b.push(x); return b; })();   // 8 + 7 items
const VG_N = VG_T.length;
const vgV = lb => lb < 11 ? 230 : lb < 11.5 ? lerp(230, 330, (lb - 11) * 2) : 330;
const VG_S = (() => { const n = 20 * 16, a = new Float64Array(n + 1); for (let i = 1; i <= n; i++) a[i] = a[i - 1] + vgV((i - .5) / 16) / 16; return a; })();
function vgS(lb){ const x = clamp(lb, 0, 20) * 16, i = Math.min(Math.floor(x), 20 * 16 - 1), base = VG_S[i] + (VG_S[i + 1] - VG_S[i]) * (x - i), f = fract(lb);
  return base + .2 * vgV(Math.floor(lb)) * (eout(f) - f) * (lb >= 0 ? 1 : 0); }
// the garland on the sun's rim: 9 on the inner row, 6 on the outer, angles chosen so every place is inside the frame and
// clear of the belt
const vgSlot = (k, dX, dY, dR) => { const row = k < 9 ? 0 : 1, i = row ? k - 9 : k, a = row ? -.15 + i * .7 / 5 : -.2 + i * .9 / 8, r = dR + (row ? 200 : 90); return [dX + Math.cos(a) * r, dY + Math.sin(a) * r, a]; };
// the orbit: a tilted ring round the sun; its turning speed (rad / beat) integrated so speed changes never jump
const VO = { cx: 960, cy: 560, rx: 620, ry: 170, tilt: -.06 };
const voW = lb => lb < 20 ? .13 : lb < 44 ? .09 : lb < 50 ? lerp(.09, .3, (lb - 44) / 6) : .3;
const VO_P = (() => { const n = 56 * 16, a = new Float64Array(n + 1); for (let i = 1; i <= n; i++) a[i] = a[i - 1] + voW((i - .5) / 16) / 16; return a; })();
const voPh = lb => { const x = clamp(lb, 0, 56) * 16, i = Math.min(Math.floor(x), 56 * 16 - 1); return VO_P[i] + (VO_P[i + 1] - VO_P[i]) * (x - i); };
// r11b (all jurors: one cloud band across the whole width): a cluster lower left and a smaller one lower right, the
// middle left open (they drift ~370 px left over the scene, so the right one starts further out)
const VO_CL = [['HB_low', 300, 1120, 1.0, false], ['HB_b0', 720, 1190, .7, true], ['HA_b0', 1980, 1170, .85, true], ['HB_b4', 2380, 1140, .8, false]];
const voPos = th => { const lx = Math.cos(th) * VO.rx, ly = Math.sin(th) * VO.ry, c = Math.cos(VO.tilt), s = Math.sin(VO.tilt); return [VO.cx + lx * c - ly * s, VO.cy + lx * s + ly * c]; };
const voTan = th => { const lx = -Math.sin(th) * VO.rx, ly = Math.cos(th) * VO.ry, c = Math.cos(VO.tilt), s = Math.sin(VO.tilt); return Math.atan2(lx * s + ly * c, lx * c - ly * s); };
// one piece of the ring: m = 0 a triangle of size sz turned by rot (centre half a size above the plane), 1 a 3D bar of
// width w and height h standing on (x, y); the triangle's points glide to the bar's corners
function voPiece(g, x, y, sz, rot, m, w, h, col, front){
  const T3 = TRIS[3], c = Math.cos(rot), s = Math.sin(rot), P = (px, py) => [x + (px * c - py * s) * sz, y - sz * .55 + (px * s + py * c) * sz];
  const A = P(T3[0], T3[1]), Bp = P(T3[2], T3[3]), C = P(T3[4], T3[5]);
  const q = [[C, [x - w / 2, y]], [A, [x - w / 2, y - h]], [A, [x + w / 2, y - h]], [Bp, [x + w / 2, y]]].map(([a, b]) => [lerp(a[0], b[0], m), lerp(a[1], b[1], m)]);
  const dx = 14 * w / 46, dy = -8 * w / 46;
  if (m > .02){ g.globalAlpha = m; const x1 = q[3][0], top = q[2][1];
    poly(g, [x1, q[3][1], x1 + dx, q[3][1] + dy, x1 + dx, top + dy, x1, top], '#0771e4');
    poly(g, [q[1][0], q[1][1], q[2][0], q[2][1], q[2][0] + dx, q[2][1] + dy, q[1][0] + dx, q[1][1] + dy], '#fffef2'); g.globalAlpha = 1; }
  poly(g, [q[0][0], q[0][1], q[1][0], q[1][1], q[2][0], q[2][1], q[3][0], q[3][1]], m > 0 ? lerpCol(col, front, m) : col);
}
SC_.voyage = (g, s) => {
  const L = s.lbar, lb = s.lb, S = vgS(lb), sn = snareAt(s.t);
  // (r29 rules audit: leaving, the belt was drawn in from its left end, whose square cut crossed the whole frame over
  // 0:42.3-0:42.8) it stays whole and slides out of the bottom along its normal (esin, <= ~21 px a frame)
  const rise = 1 - eout(span(lb, 1.4, 3.4)), by = 420 * rise + 760 * esin(span(L, 3.4, 4.1)),   /* re-audit: the belt rises once kvHold's wedge has gone */ x0e = VG.x0;
  const yT = x => VG.yc(x) - VG.half + by, yB = x => VG.yc(x) + VG.half + by;
  // the sun: kvHold's disc at the cut (its 2.6 % breath included) -> the upper left -> the centre -> approach's disc
  // (r26 advocate: 0:42.3-0:43.1 the sun shrank R 600 -> 300 while sliding to the centre in ~0.7 s, "like a balloon
  // going down", the old pull-back complaint) it glides over 2 bars (esin, ~7 px a frame at most)
  const g1 = eio(span(L, .25, 1.25)), g2 = esin(span(L, 3.5, 5.5)), g3 = eio(span(L, 12.6, 13));
  const dX = lerp(lerp(967.5, 330, g1), 960, g2), dY = lerp(lerp(540, 250, g1), 540, g2), dR = lerp(lerp(lerp(739, 600, g1), 300, g2), 260, g3) * (1 + .01 * s.k);
  skyBg(g, lerp(700, 960, g2), lerp(300, 540, g2));
  const zc = 1 + .05 * eio(span(L, 11, 12.5)) * (1 - eio(span(L, 12.5, 13)));
  // (whole-song pass, advocate: 0:43-0:54 eleven seconds from one camera) the camera leans slowly into the orbit
  // (32-38, ~3 deg) and rights itself before the gather at 39
  const lean = -.055 * eio(span(L, 5, 11)) * (1 - eio(span(L, 11.6, 12.5)));
  g.save(); g.translate(960, 540); g.rotate(lean); g.scale(zc, zc); g.translate(-960, -540);
  // far wisps slide in from the right during 27 and drift
  // (r16 audit: they vanished on the cut into approach) they drift out to the left over the last bar, with the low row
  // (r28e cloud audit: ein over .87 bar flung them 2700 px left at up to ~110 px a frame at 0:54.7) they rise out of the
  // top instead (they sit near it): 320 px over the last bar (esin)
  { const wi = 700 * (1 - eout(span(lb, 1, 4))), up = 320 * esin(span(L, 11.9, 12.97)); cloudS(g, 'HA_tr', 1760 - 3 * lb + wi, 70 - up, .45, 0, true); cloudS(g, 'HA_r5', 1180 - 2 * lb + wi, 40 - up, .35); }
  // ---- the pieces: where each triangle is and what it is
  const ph = voPh(lb), items = [];
  for (let k = 0; k < VG_N; k++){ const b = VG_T[k], a = lb - b - .5; if (a < 0) continue;   // .5 beat of flip first
    const orb = eio(span(L, 3.7 + k * .03, 4.5 + k * .03)), th = ph + k * TAU / VG_N, [ox, oy] = voPos(th), ps = lerp(.62, 1.12, (Math.sin(th) + 1) / 2);
    const [tx, ty, ta] = vgSlot(k, dX, dY, dR), sx = VG.xg, sy = yT(VG.xg) - 56 - 60;
    // r11b (all jurors: a triangle rising straight up on a thin trail read as a flag on a pole / the paper plane): no
    // trail, and the flight is a thrown arc (out to the right and over) rather than a vertical climb
    const u = clamp(a / 1.4), e = eio(u), cx = sx + 280, cyy = (sy + ty) / 2 - 120;
    let x = bez(sx, cx, tx, e), y = bez(sy, cyy, ty, e), rot = lerp(k * 1.3, ta + Math.PI / 2, e) + 2 * Math.PI * eio(u) * (k % 2 ? 1 : -1);
    if (u >= 1){ x += bob(s.T, k, 4) * (1 - orb); y += bob(s.T, k + 2, 4) * (1 - orb); }
    const pin = ein(span(L, 12.55 + k * .012, 13));
    // (voPiece hangs the triangle half a size above its base point: on the path the triangle's centre is the point, on
    // the ring the base is on the ring)
    x = lerp(lerp(x, ox, orb), dX, pin); y = lerp(lerp(y + 44 * .55, oy, orb), dY, pin); rot = lerp(rot, voTan(th), orb);
    const unf = eback(span(lb, 20 + k * .5, 20.6 + k * .5)) * (1 - eio(span(L, 12.35, 12.7)));
    const d = Math.abs(((th - Math.PI / 2) % TAU + TAU + Math.PI) % TAU - Math.PI) / Math.PI;   // 0 at the front, 1 at the back
    items.push({ k, x, y, rot: lerp(rot, 0, clamp(unf)), sz: lerp(44, 44 * ps, orb) * (1 - .7 * pin), m: clamp(unf, 0, 1.08), back: Math.sin(th) < 0 && orb > .6, ps, band: Math.min(31, Math.floor(d * 22)), col: k % 2 ? K.mint : K.white }); }
  // (front stays a hex colour: voPiece mixes the triangle's colour into it)
  // r11b (visual juror: the front bars were the sun's own colour and filled the key visual's open centre): darker
  // fronts (#7bdcfa, #9ee9ff on the kick) with #0771e4 sides, at most ~140 px tall
  const vmax = Math.max(.25, ...items.map(it => specAt(s.t, it.band))), grow = 1 + .2 * eio(span(L, 11, 12.25)), front = s.k > .45 ? '#9ee9ff' : '#7bdcfa';
  const drawItem = it => { const h = (30 + 95 * Math.pow(specAt(s.t, it.band) / vmax, 1.5)) * it.ps * grow, w = 54 * it.ps;
    voPiece(g, it.x, it.y, it.sz, it.rot, Math.min(1, it.m), w, h * Math.min(1, it.m) + it.sz * (1 - Math.min(1, it.m)), it.col, front); };
  // the orbit plane: a faint track and, on each downbeat from 32, a light ring running out over it (back halves first)
  const orbA = eio(span(L, 4, 4.75)) * (1 - eio(span(L, 12.5, 12.9)));
  const plane = (half) => { if (orbA <= 0) return; const a0 = half ? 0 : Math.PI, a1 = half ? Math.PI : TAU;
    g.save(); g.translate(VO.cx, VO.cy); g.rotate(VO.tilt); g.globalAlpha = .35 * orbA; g.strokeStyle = '#e7ffff'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, VO.rx, VO.ry, 0, a0, a1); g.stroke();
    if (L >= 5 && L < 12.5){ const u = fract(L), r = lerp(330, 1250, eout(u)); g.globalAlpha = .75 * (1 - u) * orbA; g.lineWidth = lerp(8, 2, u); g.beginPath(); g.ellipse(0, 0, r, r * VO.ry / VO.rx, 0, a0, a1); g.stroke(); }
    g.restore(); g.globalAlpha = 1; };
  // the ring scene's frame (as in the key visual): a corner arc upper left and lower right, centres outside the frame and
  // both ends always past the edges, swaying slowly; they come in from their corners with the ring and leave at 39.5
  // (r16 audit: leaving, they stopped 520 px out, still in frame, and vanished) they slide all the way out
  { const inA = eout(span(L, 4, 5.2)) * (1 - eio(span(L, 12.2, 12.9))); if (inA > 0){ const o = 1500 * (1 - inA), sw = .07 * Math.sin(s.T * .45);
    kvArc(g, -260 - o, -200 - o, 760, -.5 + sw, 2.2, s.T * 12); kvArc(g, 2180 + o, 1300 + o, 700, 3.0 - sw, 1.6, -s.T * 12); } }
  plane(0);
  for (const it of items) if (it.back) drawItem(it);
  disc(g, dX, dY, dR);
  plane(1);
  // ---- the factory (27-31): belt, items, the flip
  if (L < 4.1){
    const pts = (f, d) => { const p = []; for (let x = x0e; x <= VG.x1; x += 80) p.push([x, f(x) + d]); p.push([VG.x1, f(VG.x1) + d]); return p; };
    const top = pts(yT, 0), bot = pts(yB, 0), face = pts(yB, 30);
    g.beginPath(); bot.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); face.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fillStyle = K.navy; g.fill();
    g.save(); g.beginPath(); top.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); bot.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.clip();
    stripes(g, 960, VG.yc(960) + by, -.13 + .62, 30, S * Math.cos(.62), [K.navy, K.royal, K.navy, K.light]); g.restore();
    for (const [f, w, d] of [[yT, 7, -2], [yT, 3, -16], [yB, 4, 6]]) swoosh(g, v => { const x = lerp(x0e, VG.x1, v); return [x, f(x) + d]; }, 0, 1, w);
    // r11b (review, again: the conversion gate was badly designed, drop it; when the shape reaches that place it simply
    // turns and jumps over, or springs over like a spring and flies, with little stars welling up where it took off):
    // no gate and no mark on the belt. An item arriving at the take-off point squashes down like a spring (the last
    // 0.2 beat), springs up off the belt stretched, turns over in the air into its triangle (a card flip) and flies on to
    // its place; little stars well up and drift from the take-off point
    VG_T.forEach((b, k) => { const kind = FAC_ITEMS[k % FAC_ITEMS.length], base = yT(VG.xg);
      if (lb < b){ const x = VG.xg - (vgS(b) - S); if (x < x0e - 60 || x < VG.x0 - 60) return;
        const sq = eio(span(lb, b - .2, b)), sy = 1 - .38 * sq, sx = 1 + .22 * sq, y = yT(x) - 56 * sy;
        g.save(); g.translate(x, y); g.scale(sx, sy); facItem(g, kind, 0, 0, 1, 0); g.restore(); return; }
      const a = lb - b;
      // the stars that well up from the take-off point (one beat)
      if (a < 1){ for (let j = 0; j < 5; j++){ const q = clamp((a - j * .06) / .8); if (q <= 0 || q >= 1) continue; const sx0 = VG.xg + (j - 2) * 22 + Math.sin(j * 2.1 + k) * 8;
        softGlow(g, sx0 + (j - 2) * 14 * eout(q), base - 8 - 110 * eout(q), (12 + 4 * (j % 2)) * (.6 + .4 * Math.sin(Math.PI * q)), Math.sin(Math.PI * q), j % 2 ? '#e7ffff' : '#fffef2'); } }   // r18: round motes
      const m = a / .5; if (m >= 1) return;
      // the spring: stretched as it leaves the belt; at the top of the hop the item shrinks away into a point and the
      // triangle pops out of it (r11b, visual juror: a card flip showed a thin white silhouette, read as a little bunny)
      const fx = VG.xg, fy = base - 56 - 60 * eout(m), st = 1 + .3 * (1 - eout(clamp(m * 2.5))), shr = 1 - eio(span(m, .22, .42));
      if (shr > 0){ g.save(); g.translate(fx, fy); g.rotate(.6 * span(m, .22, .42)); g.scale(shr / Math.sqrt(st), shr * st); facItem(g, kind, 0, 0, 1, 0); g.restore(); }
      const tp = eback(span(m, .36, .8)); if (tp > 0) triK(g, fx, fy, 44 * tp, k * 1.3, 0, k % 2 ? K.mint : K.white, 3);   // (the same key-visual triangle voPiece then flies)
      if (m > .36){ const q = span(m, .36, 1); g.globalAlpha = 1 - q; ring(g, fx, fy, lerp(16, 90, eout(q)), lerp(16, 90, eout(q)) + lerp(8, 2, q), '#fffef2'); g.globalAlpha = 1; } });
  }
  // the cloud banks rise with the belt and leave to the sides when the scene turns
  // (r26 advocate: they left at up to ~40 px a frame) over 1.2 bars (esin, <= ~15 px a frame)
  { const go = esin(span(L, 3.5, 4.7)); cloudS(g, 'HB_low', 90 - 900 * go, 1010 + by * .6, 1.1); cloudS(g, 'HA_b0', 1820 + 900 * go, 1160 + by * .6, .95, 0, true); }
  // ---- the triangles / bars in front of the sun
  items.filter(it => !it.back).sort((p, q) => p.y - q.y).forEach(drawItem);
  // a low row of clouds under the ring: rises in on 31, drifts left, speeds away left at the end (never slides down)
  // (r28e cloud audit: ein over .67 bar sent the row 3600 px left at up to ~190 px a frame, gone in ~.25 s at 0:54.8) the
  // row parts: the clouds left of the centre slide out left, the others right, 1000 px over the last bar (esin, <= ~18 px
  // a frame), as trance's night clouds do
  { const up = 1 - eout(span(L, 4, 5.2)); if (L > 4 && L < 13){ const xo = -30 * (s.T - 4 * BAR), ex = 1000 * esin(span(L, 11.9, 12.97));
    for (const [c, x, y, sc, f] of VO_CL){ const bx = x + xo; cloudS(g, c, bx + (bx < 960 ? -ex : ex), y + 520 * up, sc, 0, f); } } }
  // the build: a flash on each bar's cap as it unfolds
  for (const it of items){ const a = lb - (20 + it.k * .5); if (a > 0 && a < .6 && L < 12){ const hh = (30 + 95 * Math.pow(specAt(s.t, it.band) / vmax, 1.5)) * it.ps * grow * Math.min(1, it.m); softGlow(g, it.x, it.y - hh, lerp(22, 40, eout(a / .6)), 1 - a / .6); } }   // r18: a round cap light
  // a key-visual line pair crosses the sky once a bar on the ring (32-39)
  if (L >= 5 && L < 12){ const ph2 = fract(L), P = Math.floor(L) % 2 ?   /* re-audit: no pair in bar 39 (it was cut off half way at 39.5) */ v => [lerp(-100, 2020, v), 300 - v * 200 + Math.sin(v * 3) * 50] : v => [lerp(2020, -100, v), 180 + v * 180 - Math.sin(v * 2.6) * 40];
    kvLines(g, P, ein(clamp(ph2 * 1.4 - .4)), eout(clamp(ph2 * 3.5)), 7); }
  g.restore();   // the lean-in
  // ---- 27: kvHold's key visual leaves (drawn at kvHold's own 2.6 % breath and its own clock, so the cut frame is kvHold's)
  if (L < 1.6){ const e = (a, d) => eio(span(lb, a, a + d)), z0 = lerp(1.02625, 1, e(0, 4)), sK = Object.assign({}, s, { T: s.T + 3 * BAR });
    g.save(); g.translate(W / 2, H / 2); g.scale(z0, z0); g.translate(-W / 2, -H / 2);
    // (re-audit, advocate: the leaving stripes wedge and the rising belt met in a hard "Y") the wedge leaves first (beats 0-1.2)
    // (r20 audit, advocate: the stripes wedge and the upper-left corner stood still for half a beat, then vanished in a
    // frame: homeShot moves a group by 1 - eout(a), so feeding it 1 - eio(t) gave a displacement of eio(t)^3) lv() feeds it
    // the value whose displacement is t^1.6: it starts moving on the cut and speeds up out of the frame
    const lv = (a, d) => 1 - Math.cbrt(Math.pow(span(lb, a, a + d), 1.6));
    homeShot(g, sK, { noSky: true, noDisc: true, arcSlide: true, lines: 1 - e(0, 2.4), tris: 1 - e(.25, 1.5), corners: lv(.5, 2), stripes: lv(0, 1.2), arc: 1 - e(1.5, 2), clouds: lv(2, 3), tlDots: 0 });
    // kvHold's own extras finish their moves: the long flight trail runs out to the right, the two marks shrink away
    { const t0 = BAR * .9, t1 = BAR * 3.1; flight(g, τ => { const u = (τ - t0) / (t1 - t0); return [lerp(-220, 2160, u), 940 - 600 * u + Math.sin(u * 4.5) * 46]; }, sK.T, 60, { trail: 1.1, from: t0, w: 5 }); }
    dotShape(g, 1, 1240, 170, 90 * (1 - e(0, 1.2)), .18, 1, 18, sK.T * 10); triK(g, 1080 + bob(sK.T, 1), 300, 44 * (1 - e(.5, 1.2)), .6 + sK.T * .1, 0, K.navy, 1);
    g.restore(); }
};
// ================================================================== VOYAGE B (r8b, replaced by the factory above): the key visual's world, staged by a camera
// 27      kvHold's disc (960, 540, R 740) IS this disc: it glides to its place (1150, 330, R 720) over the bar while
//         kvHold is pulled off in 4 diagonal slices (one per beat), so there is only ever one sun
// 27-39   a new framing every 3 bars (30, 33, 36: eio over 2 beats from the downbeat); the layers sit at different
//         depths (wisps .5, lines .7, corner arc .85, stripes .9, triangles 1.0, cloud cluster 1.25), so every camera
//         change is a parallax move of the whole picture; all steps land on downbeats (no per-beat jitter)
// lines   the key visual's 5 long white lines: one pair drawn per bar in 28-31; two breathe (drawn in and out over
//         2 bars) in the breakdown; in the build one more each bar until all five are there on 39, as in the image
// 39      the disc gathers itself to approach's disc (960, 540, R 260) over the bar and the corner pieces slide out to
//         their edges, so 40 cuts on the same circle into the rebuild
const KVL = [
  u => [lerp(-40, 1960, u), 225 + Math.sin(u * 3.1 + .3) * -170 + u * 330], u => [lerp(300, 1960, u), 800 - u * 420 + Math.sin(u * 3) * 30],
  u => [lerp(320, 1780, u), 790 - u * 330 + Math.sin(u * 2.4) * 40], u => [lerp(780, 1960, u), 1080 - u * 340 + Math.sin(u * 2) * 20],
  u => [lerp(640, 1960, u), 1035 - u * 135 - Math.sin(u * 2.5) * 15]];
const KVL_W = [11, 7, 5, 12, 8];
const VOYB_FR = [[0, 0, 1], [-240, 150, 1.16], [40, -60, 1.08], [0, 0, 1.0]];   // (self-check: 33's framing lost the cloud cluster)   // camera [x, y, zoom] for 27 / 30 / 33 / 36
const VOYB_TRI = [[1755, 90, 40, 2.6, K.white], [1850, 180, 70, .3, K.navy], [1800, 265, 46, 2.9, K.mint], [310, 425, 36, 1.1, K.white]];
SC_.voyageB = (g, s) => {
  const L = s.lbar, lb = s.lb, bar = Math.floor(L), dn = stepEase(L, .3, eout);   // dn: steps once per bar, on the downbeat
  // camera
  const fi = clamp(Math.floor(L / 3), 0, 3), fu = fi === 0 ? 1 : eio(clamp((L - fi * 3) * 2)), f1 = VOYB_FR[fi], f0 = VOYB_FR[Math.max(0, fi - 1)];
  // (health: STILL in the breakdown) under the framings a slow continuous push (+4 % over the scene) and drift
  const cam = [lerp(f0[0], f1[0], fu) + 3 * clamp(lb - 16, 0, 24), lerp(f0[1], f1[1], fu), lerp(f0[2], f1[2], fu) * (1 + .004 * L)];
  const layer = (p, fn) => { const z = 1 + (cam[2] - 1) * p; g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-960 - cam[0] * p, -540 - cam[1] * p); fn(); g.restore(); };
  const out = eio(span(L, 12.5, 13));   // the corner pieces leave in the last 2 beats (self-check: a whole empty bar before)
  skyBg(g, 1150, 330);
  // the disc: background, no camera; 27 glides from kvHold's disc, 39 gathers into approach's
  { const a = eio(span(L, 0, 1)), b = eio(span(L, 12.25, 13));
    const x = lerp(lerp(960, 1150, a), 960, b), y = lerp(lerp(540, 330, a), 540, b), R = lerp(lerp(740, 720, a), 260, b) * (1 + .01 * s.k);
    disc(g, x, y, R); }
  // far wisps, top right (depth .5), one step left a bar
  layer(.5, () => { cloudS(g, 'HA_tr', 1700 - 8 * dn - 2 * lb, 120, .5, 0, true); cloudS(g, 'HA_r5', 1450 - 8 * dn - 2 * lb, 70, .4); });
  // the long white lines (depth .7)
  layer(.7, () => {
    const draw = (i, u0, u1) => { if (u1 > u0) swoosh(g, KVL[i], u0, u1, KVL_W[i]); };
    if (L < 4){ if (L >= 1){ const ph = fract(L), i = [0, 3, 1][bar - 1] ?? 0; draw(i, ein(clamp(ph * 1.3 - .3)), eout(clamp(ph * 4))); draw((i + 2) % 5, ein(clamp(ph * 1.3 - .3)), eout(clamp(ph * 4 - .2))); } }
    else if (L < 10){ const k = Math.floor((L - 4) / 2), ph = (L - 4) / 2 - k, i0 = [0, 3, 1][k % 3]; draw(i0, ein(span(ph, .6, 1)), eio(span(ph, 0, .45))); draw((i0 + 2) % 5, ein(span(ph, .65, 1)), eio(span(ph, .05, .5))); }
    else { const have = [[0], [0, 3], [0, 3, 1], [0, 3, 1, 2, 4]][clamp(bar - 9, 0, 3)];
      for (const i of [0, 3, 1, 2, 4]){ if (!have.includes(i)) continue; const born = i === 0 ? 9 : i === 3 ? 10 : i === 1 ? 11 : 12 + (i === 4 ? .25 : 0); draw(i, 0, eout(span(L, born, born + .5))); } }   // they stay to the cut; approach reels them in
  });
  // the key visual's corner arc (centre outside the frame, lower left; depth .85): a step a bar; leaves in 39
  layer(.85, () => { const ang = dn * .06;   /* r8c: continues kvHold's own arc (same shape, same place) */ g.save(); g.translate(-60 - 400 * out, 1120 + 300 * out); g.rotate(ang);
    g.beginPath(); g.arc(0, 0, 580, -Math.PI * .5, -Math.PI * .02); g.arc(0, 0, 520, -Math.PI * .02, -Math.PI * .5, true); g.closePath(); g.fillStyle = K.navy; g.fill();
    g.beginPath(); g.arc(0, 0, 620, -Math.PI * .34, -Math.PI * .04); g.arc(0, 0, 580, -Math.PI * .04, -Math.PI * .34, true); g.closePath(); g.save(); g.clip(); rect(g, -100, -800, 900, 900, K.navy); dots(g, -100, -800, 800, 100, 21, 4.4, K.white); g.restore();
    g.restore();
    // the top-left corner: stripes wedge and a dot patch (from the key visual)
    g.save(); g.translate(-420 * out, -320 * out); g.beginPath(); g.moveTo(0, 0); g.lineTo(330, 0); g.quadraticCurveTo(120, 90, 0, 230); g.closePath(); g.clip(); stripes(g, 0, 0, .78, 18, dn * 18, [K.royal, K.navy]); g.restore(); });
  // the stripes band lower right (depth .9): a step a bar in 28-36, every beat / eighth in the build; leaves in 39
  // r8c (rhythm juror: the kick is on every beat in 28-31 and 37-40 but only the downbeat moved): there the band steps
  // every beat (40 px), in the build's last 2 bars every eighth; in the breakdown once a bar
  layer(.9, () => kvStripeBand(g, (L >= 4 && L < 10 ? dn : stepEase(s.beat * (L < 11 ? 1 : 2), .3, eout) / 2), 1 - out));   // kvHold's band stays
  // triangles in the corners (depth 1.0): pop in 28, glint on the snare, leave in 39
  layer(1, () => { for (let i = 0; i < VOYB_TRI.length; i++){ const [x, y, sz, r, c] = VOYB_TRI[i], p = pop(L * 4 - 4 - i * .5) * (1 - out); if (p <= 0) continue;
    tri(g, x + bob(s.T, i, 8), y + bob(s.T, i + 3, 6), sz * p * (1 + .4 * snareAt(s.t) * (i % 2)), r + s.T * .08 * (i % 2 ? 1 : -1), 0, c); } });
  // the cloud cluster, lower left (depth 1.25): the tower and its bank, one step left a bar; it sinks out in 39
  layer(1.25, () => { const d = 6 * dn + 4 * clamp(lb - 16, 0, 24), sy = 520 * out + 600 * (1 - eout(span(L, .8, 1.4)));   /* r8c: rises in as kvHold's clouds leave */ cloudS(g, 'HB_tower', 60 - d, 470 + sy, .95); cloudS(g, 'HB_low', 120 - d, 900 + sy, 1.25); cloudS(g, 'HB_b0', 620 - d, 1170 + sy, 1.0); });
  // 27 (r8c, visual + UA: the diagonal slices cut a cloud into a straight-edged parallelogram): no slices. kvHold's
  // pieces leave the way they came in, one group per beat, each whole: the lines are reeled in (beat 1), the corners
  // (beat 2), the triangles (beat 3), the clouds slide out to their edges (beat 3.5). Its arc and stripes band are the
  // very same shapes as voyage's, so they simply stay; its disc is voyage's disc
  if (L < 1){ const e = k => eio(span(lb, k, k + .9));
    homeShot(g, s, { noSky: true, noDisc: true, arc: 0, stripes: 0, lines: 1 - e(0), corners: 1 - e(1), tris: 1 - e(2), clouds: 1 - e(2.5) }); }
};
// ================================================================== VOYAGE A (r8 first version, replaced by B above)
// One world, five layers round one sun: sky / far clouds / the sun with the key visual's arcs / mid clouds / near clouds,
// plus the key visual's cloud tower framing the right edge. Speeds 8 : 16 : 32 px a beat (far : mid : near).
// 27      the drop's tail: the key visual is cut into 4 diagonal slices along the stripes' angle, one slides away per
//         beat and shows this world behind it
// 28-31   still drums: the layers move ON the beat (a step each), the arcs turn a step a beat, a contrail pair per bar,
//         the key visual's stripes band steps in the lower right, the snare glints the triangles
// 31-37   the soft four-on-the-floor breakdown: everything glides; the sun breathes on the kick; the arcs turn a step a
//         bar; one accent layer at a time: triangles (31-33), halftone sparkle on the hats (33-35), a long contrail (35-37)
// 37-40   the build: the layers step again, triangles count up round the sun 1 -> 3 -> 9 -> 18 (one level a bar), the
//         stripes step twice as often each bar, the camera closes in on the sun; on 39 the stripes close like blinds,
//         one slat per eighth from both sides, and 40 cuts to the rebuild
// r8b (jury r8, all four: "a mid disc in the middle, arcs hugging it like a gauge, small clouds sprinkled like
// stickers"): voyageB below follows the key visual's own rules instead: a HUGE disc as the background, off-centre; the
// dotted arc is a corner arc round a centre outside the frame (not round the disc); the clouds are one big cluster in
// a corner; long white lines cross the whole frame. This first version is kept for reference only.
const VOY = { sx: 760, sy: 390, R: 290 };
// r8 (self-check: the first layout piled the clouds into one messy carpet): fewer, smaller clouds per layer, each layer
// on its own height band (far 700-760, mid 860-920, near only its tops above 960)
// (self-check: the image's small pale cloudlet and its line-streaked streak read as smudges behind the sun; far = clean sprites)
const VOY_FAR = [{ c: 'HA_r5', x: 160, y: 735, s: .45 }, { c: 'HA_tr', x: 1040, y: 720, s: .42 }, { c: 'HB_r1', x: 1900, y: 740, s: .36, f: true }];
const VOY_MID = [{ c: 'HB_b4', x: 380, y: 900, s: .55 }, { c: 'HB_r1', x: 1500, y: 900, s: .55 }];
const VOY_NEAR = [{ c: 'HB_low', x: 300, y: 1230, s: 1.0 }, { c: 'HA_b0', x: 1300, y: 1250, s: .9 }, { c: 'HA_low', x: 2300, y: 1240, s: .95 }];
const VOY_TRI = [[1490, 260, 46, 2.4, K.white], [1600, 160, 64, .3, K.navy], [1540, 360, 40, 2.9, K.mint], [380, 210, 44, 1.1, K.azure], [260, 470, 34, -.6, K.white]];
SC_.voyageA = (g, s) => {
  const L = s.lbar, lb = s.lb, hit = L < 4 || L >= 10;   // the layers step on the beat while the drums are on
  const mv = hit ? stepEase(lb, .4, eout) : lb;
  const push = eio(span(L, 10, 12.5)), z = 1 + .08 * push;
  g.save(); g.translate(VOY.sx, VOY.sy); g.scale(z, z); g.translate(-VOY.sx, -VOY.sy);
  skyBg(g, VOY.sx, VOY.sy);
  cloudRow(g, VOY_FAR, 8 * mv, 2600);
  // contrails behind the sun: one pair per bar in 28-31 (drawn in 1 beat, reeled in over the bar), one long pair 35-37
  const LP = v => [lerp(-120, 2040, v), 900 - v * 760 + Math.sin(v * 3.1) * 70];
  if (L >= 1 && L < 4){ const ph = fract(L); kvLines(g, LP, ein(clamp(ph * 1.3 - .3)), eout(clamp(ph * 4)), 8); }
  if (L >= 8 && L < 10.5){ kvLines(g, LP, ein(span(L, 9.5, 10.5)), eio(span(L, 8, 9.5)), 9); }
  // the sun, its collar breathing on the kick, and the key visual's two arcs turning round it (opposite ways)
  const R = VOY.R + 12 * s.k;
  const rot = L < 4 ? stepEase(lb, .3, eback) * .08 : L < 10 ? 1.28 + stepEase(L - 4, .3, eback) * .25 : 2.78 + stepEase((L - 10) * 2, .3, eback) * .18;
  stripeArc(g, VOY.sx, VOY.sy, R + 150, R + 190, 1.0 - rot * .7, 2.5 - rot * .7, s.T * 30);
  disc(g, VOY.sx, VOY.sy, R);
  kvArc(g, VOY.sx, VOY.sy, R + 50, -2.7 + rot, 2.3, s.T * 16);
  cloudRow(g, VOY_MID, 16 * mv, 2800);
  // triangles by the tower: on the snare in 28-31, drifting in 31-33, glinting in the build
  for (let i = 0; i < VOY_TRI.length; i++){ const [x, y, sz, r, c] = VOY_TRI[i], on = L < 1 ? 0 : L < 4 ? 1 : L < 6 ? 1 : L < 9 ? 1 - eio(span(L, 6, 6.5)) : 1;
    if (on <= 0) continue; const sn = L < 4 || L >= 10 ? snareAt(s.t) * (i % 2 ? .5 : .3) : 0;
    tri(g, x + bob(s.T, i, 10), y + bob(s.T, i + 3, 8) - (L >= 4 && L < 6 ? 30 * (L - 4) : 0), sz * pop(L * 4 - 4 - i * .5) * on * (1 + sn), r + s.T * .1 * (i % 2 ? 1 : -1), 0, c); }
  // 33-35: halftone sparkle on the hats (one patch of the key visual's dots, top right of the sun)
  // (r8 self-check: a dotted disc over the arcs was a mess) two of the key visual's halftone triangles, top left and
  // top right, away from the arcs; their dots swell on the hats
  { const a = eio(span(L, 6, 6.5)) * (1 - eio(span(L, 8, 8.5))); if (a > 0){ const h = hatAt(s.t);
    dotShape(g, 1, 1380, 150, 120 * a * (1 + .08 * h), .18 + s.T * .03, 1, 18, s.T * 10); dotShape(g, 1, 230, 230, 90 * a * (1 + .08 * h), 3.4 - s.T * .03, 1, 18, -s.T * 10); } }
  // the build: triangles count up round the sun, one level a bar, each on an eighth: 1, 3, 9, 18
  if (L >= 9){ const lv = [1, 3, 9, 18], n = lv[clamp(Math.floor(L - 9), 0, 3)], prev = L < 10 ? 0 : lv[clamp(Math.floor(L - 9) - 1, 0, 3)];
    for (let j = 0; j < n; j++){ const born = j < prev ? -9 : Math.floor(L - 9) + (j - prev) / Math.max(1, n - prev) * .5, p = pop((L - 9 - born) * 8); if (p <= 0) continue;
      const a = j * TAU / 18 - 1.2 + rot * .5, d = R + 190; tri(g, VOY.sx + Math.cos(a) * d, VOY.sy + Math.sin(a) * d, 36 * p * (1 + .25 * s.k), a + Math.PI / 2, 0, TRI_COLS[j % 6]); } }
  cloudRow(g, VOY_NEAR, 32 * mv, 3000);
  // the key visual's cloud tower framing the right edge (its cut side on the frame edge), in front of everything
  kvc(g, 'kvc_03', W - 150 + 6 * Math.sin(s.T * .4), 770 + 5 * Math.sin(s.T * .3), 1.25, true);   // its arc-cut foot below the frame
  // the key visual's stripes band, lower right: 28-31 (a step a beat) and the build (a step a beat, an eighth, a 16th)
  { const on = eout(span(L, 1, 1.25)) * (1 - eio(span(L, 3.5, 4))) + (L >= 10 ? eout(span(L, 10, 10.25)) : 0), k = L < 11 ? 1 : L < 12 ? 2 : 4;
    kvStripeBand(g, stepEase(s.beat * k, .3, eout) / 2, on); }
  g.restore();
  // 27: the key visual (kvHold's last frame, still moving) in 4 diagonal slices; one slides off per beat
  if (L < 1){
    if (!VBUF) VBUF = makeBuf();
    const bg = VBUF.getContext('2d'); bg.setTransform(SC, 0, 0, SC, 0, 0);
    SC_.kvHold(bg, Object.assign({}, s, { lbar: s.lbar + 3, lb: s.lb + 12, T: s.T + 3 * BAR }));
    const th = -.95;
    for (let k = 0; k < 4; k++){ const u = eio(span(lb, k, k + .75)); if (u >= 1) continue; const dx = (k % 2 ? 1 : -1) * 2700 * u;
      g.save(); g.translate(960, 540); g.rotate(th); g.beginPath(); g.rect(-2600 + dx, -1120 + k * 560, 5200, 561); g.clip();
      g.translate(dx, 0); g.rotate(-th); g.translate(-960, -540); g.drawImage(VBUF, 0, 0, W, H); g.restore();
      if (u > 0){ g.save(); g.translate(960, 540); g.rotate(th); rect(g, -2600 + dx, -1120 + k * 560 - 4, 5200, 8, K.white); rect(g, -2600 + dx, -1120 + (k + 1) * 560 - 4, 5200, 8, K.white); g.restore(); } }
  }
  // 39: blinds of the key visual's stripes close from both sides, one slat per eighth; 40 cuts to the rebuild
  // (health: 3 JUMPs) each slat eases over a whole eighth and the stripes inside step once a beat; approach opens them again
  if (L >= 12) kvBlinds(g, s, e => eio(span(L, 12 + e / 8, 12 + (e + 1) / 8)));
};
