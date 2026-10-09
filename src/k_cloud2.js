// ------------------------------------------------------------------ second-generation cloud shapes for the library (row-packed silhouettes)
function lobeShade(g, R, blobs, w, h){
  const order = blobs.slice().sort((a, b) => a[1] - b[1]);
  for (const b of order){
    if (R() < .3) continue;
    const dark = clamp((b[1] / h - .45) * 1.3 + (1 - b[0] / w) * .25);
    const sh = new Path2D(); scallop(sh, b[0] - b[2] * .16, b[1] + b[2] * .12, b[2] * .9, 7, 1.5);
    g.fillStyle = dark > .8 ? '#8fb0f2' : dark > .5 ? K.shade1 : K.shade0; g.fill(sh);
    if (dark > .35){ const sh2 = new Path2D(); scallop(sh2, b[0] - b[2] * .32, b[1] + b[2] * .3, b[2] * .5, 6, 1.3); g.fillStyle = dark > .85 ? K.shade2 : dark > .55 ? '#8fb0f2' : K.shade1; g.fill(sh2); }
    const wl = new Path2D(); const m = 4 + ((R() * 3) | 0);
    for (let k = 0; k < m; k++){ const a = -Math.PI * (.05 + .9 * R()) + .3, d = b[2] * (.25 + .4 * R()), r = b[2] * (.32 + .22 * R()); scallop(wl, b[0] + Math.cos(a) * d + b[2] * .08, b[1] + Math.sin(a) * d - b[2] * .05, r, 6, 1.3); }
    scallop(wl, b[0] + b[2] * .12, b[1] - b[2] * .14, b[2] * .62, 7, 1.4);
    g.fillStyle = K.white; g.fill(wl);
  }
  for (let i = 0; i < blobs.length * .35; i++){ const b = blobs[(R() * blobs.length) | 0]; const q = new Path2D(); scallop(q, b[0] - b[2] * (.2 + .3 * R()), b[1] + b[2] * (.1 + .3 * R()), b[2] * (.08 + .07 * R()), 5, 1); g.fillStyle = K.white; g.fill(q); }
}
// profile(u): half-width (0..1 of w/2) at relative height u (0 = base, 1 = top)
const PROFILES = {
  dome: u => Math.pow(Math.max(0, 1 - u * u), .55),
  tower: u => .42 + .58 * Math.pow(Math.max(0, 1 - u), .9) - .25 * Math.max(0, u - .85) * 4,
  bank: u => Math.pow(Math.max(0, 1 - u), .35),
  anvil: u => u < .7 ? .55 + .2 * Math.sin(u * 4) * .3 : .55 + (u - .7) * 1.4,
};
function makeCloud2(seed, w, h, prof, rBase, rTop){
  const R = mulberry32(seed), c = makeCanvas(w, h), g = c.getContext('2d');
  const P = PROFILES[prof], cx = w * (.48 + (R() - .5) * .06), blobs = [];
  let y = h - rBase * 1.02, row = 0;
  while (y > rTop * 1.1){
    const u = clamp((h - y) / (h * .92)), hw = (w * .5 - rBase * .9) * P(u) * (.92 + .16 * R()), r = lerp(rBase, rTop, Math.pow(u, .8));
    if (hw < r * .45) break;
    const sx = cx + (R() - .5) * hw * .12, n = Math.max(1, Math.round(hw * 2 / (r * 1.25)));
    for (let i = 0; i < n; i++){ const x = n === 1 ? sx : lerp(sx - hw, sx + hw, i / (n - 1)) + (R() - .5) * r * .5 + (row % 2) * r * .3; const rr = r * (.82 + .3 * R()); if (x - rr < 6 || x + rr > w - 6) continue; blobs.push([x, y + (R() - .5) * r * .35, rr]); }
    y -= r * (.78 + .2 * R()); row++;
  }
  const inside = (x, yy, rr) => blobs.some(b => Math.hypot(x - b[0], yy - b[1]) < b[2] - rr * 1.1);
  const puffs = [];
  for (const b of blobs){ const m = Math.round(b[2] * TAU / 55); for (let j = 0; j < m; j++){ const a = -Math.PI * (R() * 1.15 - .075); const r = 12 + R() * 24; const x = b[0] + Math.cos(a) * (b[2] - r * .35), yy = b[1] + Math.sin(a) * (b[2] - r * .35);
    if (x - r > 4 && x + r < w - 4 && yy - r > 4 && yy + r < h - 2 && !inside(x, yy, r)) puffs.push([x, yy, r]); } }
  const body = new Path2D(); for (const b of blobs) scallop(body, b[0], b[1], b[2], 8, 1.6); for (const p of puffs) scallop(body, p[0], p[1], p[2], 6, 1.3);
  // solid core so no sky shows through between the lobes
  const rows = {}; for (const b of blobs){ const k = Math.round(b[1] / 40); const r = rows[k] || (rows[k] = [1e9, -1e9, b[1]]); r[0] = Math.min(r[0], b[0]); r[1] = Math.max(r[1], b[0]); }
  const ks = Object.keys(rows).map(Number).sort((a, b) => b - a);
  if (ks.length > 1){ body.moveTo(rows[ks[0]][0], rows[ks[0]][2]); for (const k of ks) body.lineTo(rows[k][0], rows[k][2]); for (let i = ks.length - 1; i >= 0; i--) body.lineTo(rows[ks[i]][1], rows[ks[i]][2]); body.closePath(); }
  g.fillStyle = K.white; g.fill(body, 'nonzero');
  g.save(); g.clip(body); lobeShade(g, R, blobs, w, h); g.restore();
  return c;
}
function makePuff2(seed, w, h, col){
  const R = mulberry32(seed), c = makeCanvas(w, h), g = c.getContext('2d'), p = new Path2D();
  const n = 4 + ((R() * 3) | 0);
  for (let i = 0; i < n; i++){ const u = i / (n - 1); const r = h * (.22 + .2 * Math.sin(u * Math.PI)) * (.85 + .3 * R()); scallop(p, w * (.18 + .64 * u), h * .66 - r * .45, r, 7, 1.6); }
  for (let i = 0; i < n - 1; i++){ const u = (i + .5) / (n - 1); scallop(p, w * (.18 + .64 * u), h * .7, h * .17, 6, 1.4); }
  g.fillStyle = col; g.fill(p);
  return c;
}
