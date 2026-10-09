
// ================================================================== the protagonist: a simple paper plane
// Flat, cel-shaded like the clouds: a white near wing, a pale far wing, a periwinkle keel in shadow.
// Local space: nose at (+1, 0), tail around x = -.7; s = half length in px. hd = heading (radians, screen space).
// bank 0..1 squashes the wings as the plane rolls into a turn; flip 1 shows it from below (rolled over).
const PLANES = [
  { far: [1, 0, -.72, -.46, -.42, 0], near: [1, 0, -.42, 0, -.66, .4], keel: [1, 0, -.42, 0, -.34, .17] },
  { far: [1, 0, -.6, -.34, -.36, .04], near: [1, 0, -.36, .04, -.8, .52], keel: [1, 0, -.36, .04, -.3, .22] },
  { far: [1, 0, -.7, -.3, -.4, .02], near: [1, 0, -.4, .02, -.62, .5], keel: [1, 0, -.4, .02, -.44, .14] },
];
let PLANE = PLANES[1];
const SHOW_PLANE = false;              // v12: the paper plane is retired (review: too frequent, forced); its lines stay
function paperPlane(g, x, y, s, hd, bank = 0, tint = 0){
  if (s < 1 || !SHOW_PLANE) return;
  const left = Math.cos(hd) < 0;
  g.save(); g.translate(x, y);
  if (left){ g.scale(-1, 1); g.rotate(Math.PI - hd); } else g.rotate(hd);
  g.scale(s, s * (1 - .55 * clamp(Math.abs(bank))));
  if (bank < 0) g.scale(1, -1);
  const cw = tint ? K.navy : K.white, cf = tint ? '#062a6b' : K.shade0, ck = tint ? '#0a1f4d' : K.shade2;
  poly(g, PLANE.far, cf);
  poly(g, PLANE.near, cw);
  poly(g, PLANE.keel, ck);
  g.restore();
}
// fly along a path P(tau) -> [x, y] (tau in seconds): a white trail over [tau - tl, tau], then the plane at its head.
// The heading and the bank come from the path itself, so the plane leans into its own turns.
function flight(g, P, tau, s, o = {}){
  const tl = o.trail === undefined ? 1.6 : o.trail, from = o.from === undefined ? -1e9 : o.from, w = o.w || 6;
  const t0 = Math.max(from, tau - tl);
  if (tl > 0 && tau - t0 > .02) swoosh(g, u => P(lerp(t0, tau, u)), 0, 1, w, o.col || K.white, 70);
  const p = P(tau), q = P(tau + .03), r = P(tau + .09);
  const h0 = Math.atan2(q[1] - p[1], q[0] - p[0]), h1 = Math.atan2(r[1] - q[1], r[0] - q[0]);
  let dh = h1 - h0; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
  const bank = o.bank === undefined ? clamp(dh * 9, -.7, .7) * (Math.cos(h0) < 0 ? -1 : 1) : o.bank;
  paperPlane(g, p[0], p[1], s, h0 + (o.pitch || 0), bank, o.tint || 0);
  return p;
}
