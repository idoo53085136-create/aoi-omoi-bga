
// ================================================================== pattern fields (v12 r3, learned from 出前's BGAs)
// The whole frame becomes ONE pattern made of a key-visual element, and the music LIGHTS cells of it instead of adding
// new objects (scualee: a full-screen grid of outlined triangles, only the cells hit by notes light up).
// triGrid: alternating up/down triangles, outlined; notes light cells (pitch -> column, a hash -> row); light decays.
//   o.size cell edge (px), o.reveal 0..1 (grid grows out from (o.cx, o.cy)), o.line outline colour, o.lit fill colour,
//   o.tau light decay (s), o.track note track filter (0 = all), o.alpha overall alpha, o.rot rotation, o.clip fn(g) path
function triGrid(g, s, o = {}){
  const sz = o.size || 128, h = sz * Math.sqrt(3) / 2, rot = o.rot || 0, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2;
  const reveal = o.reveal ?? 1, tau = o.tau || .32, line = o.line || 'rgba(255,255,244,.22)', alpha = o.alpha ?? 1;
  const nc = Math.ceil(W * 1.6 / (sz / 2)) + 2, nr = Math.ceil(H * 1.9 / h) + 2, c0 = -Math.floor(nc / 2), r0 = -Math.floor(nr / 2);
  const Rmax = Math.hypot(W, H) * .62 * reveal;
  g.save(); g.globalAlpha = alpha;
  if (o.clip){ g.beginPath(); o.clip(g); g.clip(); }
  g.translate(cx, cy); g.rotate(rot);
  const tri = (c, r) => { const x = c * sz / 2, y = r * h, up = ((c + r) & 1) === 0;
    return up ? [x, y - h / 2, x + sz / 2, y + h / 2, x - sz / 2, y + h / 2] : [x - sz / 2, y - h / 2, x + sz / 2, y - h / 2, x, y + h / 2]; };
  // outlines (one path)
  if (reveal > 0){
    g.beginPath();
    for (let r = r0; r < r0 + nr; r++) for (let c = c0; c < c0 + nc; c++){ const x = c * sz / 2, y = r * h; if (Math.hypot(x, y) > Rmax) continue;
      const p = tri(c, r), m = .16; // inset so neighbours read as separate cells
      const mx = (p[0] + p[2] + p[4]) / 3, my = (p[1] + p[3] + p[5]) / 3;
      g.moveTo(lerp(p[0], mx, m), lerp(p[1], my, m)); g.lineTo(lerp(p[2], mx, m), lerp(p[3], my, m)); g.lineTo(lerp(p[4], mx, m), lerp(p[5], my, m)); g.closePath(); }
    g.lineWidth = o.lw || 2.2; g.strokeStyle = line; g.stroke();
  }
  // lit cells: each note lights one cell; chords (track 1) light a small cluster
  const cols = Math.min(nc - 4, o.cols || 22), rows = Math.min(nr - 2, o.rows || 8);
  for (const n of notesIn(s.t - tau * 4, s.t + 1e-6)){
    if (o.track && n.tr !== o.track) continue;
    const a = s.t - n.t0, e = Math.exp(-a / tau) * (1 - Math.exp(-a / .012));
    if (e < .02) continue;
    const c = Math.round((n.p - .5) * cols) + ((hash(n.i * 3.7) * 2) | 0), r = Math.floor((hash(n.i * 1.3 + 5) - .5) * rows);
    const x = c * sz / 2, y = r * h; if (Math.hypot(x, y) > Rmax) continue;
    const cells = n.tr === 1 ? [[c, r], [c + 1, r], [c - 1, r]] : [[c, r]];
    for (const [cc, rr] of cells){ const p = tri(cc, rr), mx = (p[0] + p[2] + p[4]) / 3, my = (p[1] + p[3] + p[5]) / 3, m = .16;
      g.globalAlpha = alpha * e * (cc === c ? 1 : .55);
      poly(g, [lerp(p[0], mx, m), lerp(p[1], my, m), lerp(p[2], mx, m), lerp(p[3], my, m), lerp(p[4], mx, m), lerp(p[5], my, m)], n.tr === 1 ? (o.lit2 || K.mint) : (o.lit || K.white)); }
  }
  g.restore();
}
