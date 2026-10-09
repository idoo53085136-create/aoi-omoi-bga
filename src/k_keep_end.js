// FINALE 146–154 (3:20.40–3:31.37), r4: the densest drums of the song get the song's biggest asset, the key visual
// itself, complete and at full energy (fresh-eyes F2): the payoff of the 0:22 assembly. Pushed in 1.25x so the corners
// only frame the edges; the stripes step on the beat, the dotted arc turns a step per bar, the snare lights the
// triangles, the sun punches on the kick. On the last beat (153.75–154) one white release into the outro.
// ================================================================== r16 FINALE = THE REUNION (146-154)
// r15 review (marked as the most important part): at 197-198, maybe do not jump straight out of the drop's flashy animation;
// this section can be performed differently; at 211 s, entering pure piano had no feeling, a very dull transition.
// The music: the drop runs at full energy to 154, then pure piano (research/refs_r16.md). All four jurors
// (jury_r16_*.md) converged: stay in the night drop, let the day come, and bring the key visual's pieces home one group
// per downbeat, each the way it moved in the story, so the picture is complete exactly when the drums stop.
//  146   radiance carries on (stars at half, the sun half way home); the cloud tower group RISES from below (plunge)
//  147   the right side (stripes wedge, streak clouds) slides in from the right (band's stripes)
//  148   the upper-left group swings down round the sun (arcs); the sun is home, now the plate's own disc
//  149   the two wisps drift in (horizon); the sky is day by 150
//  150   the white lines draw across, a light running at each head (the meteors / the plane's contrails)
//  152   the seven triangles fly in one per eighth (approach's formation)
//  153   the whole plate, dancing on the drums; 153.75 everything freezes for the last beat (PUNCH 0)
//  154   (settle) the piano: no flash; one slow cream ring leaves the sun over 2 bars and the sun glows, the camera eases back
const REU_TRI = i => KVX_TRI(i);   // same order round the sun as their exit in the outro
// ================================================================== r17 FINALE: the reunion as a curtain call (146-154)
// r16f review: from 3:22 to 3:31 there was hardly any animation or change; study other works first, then discuss it.
// research/refs_r17.md; jury_r17_*.md (all four: a 2.5D parallax camera over the plate's layers, always wide, moving in slow
// 2-bar strokes from the downbeats, never with the drums; only light and the plate's own pieces follow the beat; the
// advocate's "curtain call": each bar one visible event that echoes an earlier section). Bar by bar:
//  146-149  as r16: the groups come home their own ways, the lines draw in, the night goes; the camera cranes up
//  148-150  the camera trucks left and rolls 1 deg
//  150      (approach) the triangles fly in on the eighths, with eight small formation triangles that pop into little rings
//  151      a soft diagonal light band sweeps the whole plate along the lines' direction
//  152      (the night drop) meteors fall behind the plate on each downbeat and beat 3
//  153      (rings) a ring leaves the sun on every beat, each a little bigger; in the fill the triangles flash round by 16ths
//  throughout from 150: a light runs along one line a bar; the snare pops and turns two triangles; the kick breathes
//  the groups 6 px (smoothed)
//  153.5-153.75 the camera is home (zoom 1.06 = settle's first frame); 153.75 everything freezes
// The camera looks at C (the offset from the centre) at zoom Z, in 2-bar eio strokes from the downbeats: 146-148 down to
// the lower left as the cloud tower rises, 148-150 across to the upper right where the wisps and triangles land, 150-152
// to the upper left with a half-degree roll, 152-153.5 home. The layers add C x depth (far layers move with the camera,
// near ones against it): sky .4, disc .35, wisps .15, lines and the upper-left group 0, the right group -.1, the
// triangles -.15, the lower-left group -.25 (all inside the zoom's margin, checked at every key)
// (r22, whole-song pass, advocate: at one frame a second the tour hardly read, "this will read as 'no change' again")
// (and fresh eyes: "pan clearly to a different plate corner") stronger keys: zoom to 1.18-1.2 framing the lower left
// (148), the upper right (150) and the upper left (152), offsets 90-120 px (margins re-checked numerically at every 1/100 bar)
const FIN_KF = [[0, 0, 0, 0, 1], [2, -120, 55, 0, 1.2], [4, 115, -55, .008, 1.18], [6, -90, -55, -.008, 1.2], [7.5, 0, 0, 0, 1.06]];
// (r22, fresh eyes: the per-bar events were tiny on the big pale disc) twelve formation triangles, 48 px, on a wider arc
const FIN_RISE = Array.from({ length: 12 }, (_, j) => ({ a: Math.PI * (1.08 + j * .077), y0: 260 + 90 * hash(j * 3 + 7), d: .028 * j, col: j % 2 ? K.mint : '#fffef2' }));
// (one flowing tour, not move-stop-move: a Hermite curve through the keys, at rest only at 146 and 153.5; the inner
// keys keep half the Catmull-Rom speed so each stroke still settles towards its downbeat)
function finCam(L){ const K_ = FIN_KF, n = K_.length; if (L >= K_[n - 1][0]) return K_[n - 1]; if (L <= 0) return K_[0];
  let i = 0; while (L >= K_[i + 1][0]) i++;
  const t0 = K_[i][0], t1 = K_[i + 1][0], h = t1 - t0, u = (L - t0) / h, u2 = u * u, u3 = u2 * u;
  const tan = (m, j) => m <= 0 || m >= n - 1 ? 0 : .5 * (K_[m + 1][j] - K_[m - 1][j]) / (K_[m + 1][0] - K_[m - 1][0]);
  return K_[i].map((v, j) => j === 0 ? L : (2 * u3 - 3 * u2 + 1) * v + (u3 - 2 * u2 + u) * h * tan(i, j) + (-2 * u3 + 3 * u2) * K_[i + 1][j] + (u3 - u2) * h * tan(i + 1, j)); }
// a soft light running along one of the plate's white lines, with a short comet tail behind it
// (r17b framescan: with the tail eased too, the six lights piled up at the line's end) the head eases along the line, the
// tail keeps a fixed distance behind it and each light fades in as it leaves the start; the head reaches the end as a = 0
// (r17c, fresh eyes: six stamps .03 apart read as a string of bubbles) twenty stamps .006 apart make one smooth comet
// tail; the white core only at the head, the halo at .1
function finLineLight(g, P, f, a){ const x0 = P[0][0], x1 = P[P.length - 1][0], hd = eio(clamp(f));
  for (let q = 19; q >= 0; q--){ const vv = hd - q * .006; if (vv <= 0) continue; const x = lerp(x0, x1, vv), y = pathY(P, x); if (y === null) continue; const sz = 1 - q / 20, fa = a * clamp(vv / .03);
    g.globalAlpha = .1 * fa * sz; circle(g, x, y, 34 * sz, '#e7ffff'); g.globalAlpha = .55 * fa * sz; circle(g, x, y, 7 * sz, '#fffef2'); }
  { const vv = hd; if (vv > 0){ const x = lerp(x0, x1, vv), y = pathY(P, x); if (y !== null){ g.globalAlpha = .9 * a * clamp(vv / .03); circle(g, x, y, 12, '#fffef2'); } } }
  g.globalAlpha = 1; }
// r23: preview variants to choose from (index.html?fin=B / fin=C; the release build is A)
//  B: the sun stays mid-size (R ~470, sky round it) until 152 and grows into the plate's disc over 152-153.75
//  C: as A, plus three big key-visual clouds flying past in front of the camera (148, 150, 152)
const FIN_VAR = (typeof Q !== 'undefined' && Q.get('fin')) || 'A';
// ================================================================== r23 FINALE: THE LAST NIGHT (146-154)
// Review (10-09, after r22c): 3:21 need not switch picture, it felt very unnatural; it can simply carry on from
// the previous section and keep changing, with more change, more emotion, a story; the jury to work it out.
// jury_r23_*.md (all four: no switch at 146, no camera tour; the night drop carries on to a dawn; the plate only arrives
// with the piano on 154 through a freeze and a slow ring). The story (advocate's line, with the rhythm juror's beats):
// the key-visual pieces round the sun break into small triangles that fly up into the night and become a constellation;
// the meteor shower writes the plate's white lines across the sky; at the phrase turn (150) the first light comes and the
// constellation gathers into the plate's seven triangles, one a beat (as at 1:04, small triangles fuse into a big
// one), while the clouds rise with the light; the shower peaks on 152, the sky slows and stops; on 154 the night freezes
// for a beat and a slow ring opens the morning: the plate (settle).
//  146.0-147.5  the pieces break up from their tails, ~60 triangles fly up-right (against the meteors), 1.5 bars, eout
//  146-148      meteors one a beat, then one an eighth; the sun stops growing and glides to the plate's disc centre by 152
//  148-150      the triangles hang as a constellation; a soft light wave runs through them on each snare; four long
//               meteors (148.0 / .5 / 149.0 / .5) each draw one of the plate's white lines, right to left, the trail stays
//  150          the first light: a cream ring from the sun; the sky starts to lift (to .8 by 153.5), the stars fade
//  150.0-151.5  the constellation gathers into the seven triangles, one a beat (each group flies in over half a bar)
//  150-152.5    the clouds come with the light: lower left rises (150), right slides in (150.5), upper left swings down
//               (151), the wisps drift in (151.5); then they breathe 6 px on the kick
//  152          the shower's peak (every eighth, two at a time)
//  152-153.875  the camera eases in to 1.06 (settle's first frame); the sky's turn slows to a stop; the fill flashes the
//               triangles by sixteenths; 153.875 everything rests: the frozen beat
const FIN_PSTART = [1.0, 0, .5, .25], FIN_PDUR = 1.25, FIN_NT = 6;   // per radiance piece (SUN_P order): when it breaks up
// r23b (rhythm juror: from 150.375 the kicks are on the off-beats) the seven triangles land 150.0, then on the off-beats
const finLm = ti => 4 + .25 * ti + (ti ? .125 : 0);   // (r24: nine triangles, 150.0 ... 152.125)
let FIN_TRI_IDS = null; const finTriIds = () => FIN_TRI_IDS || (FIN_TRI_IDS = Array.from({ length: 9 }, (_, i) => 'kvl_t' + i).filter(id => KVLY[id]));
const FIN_TRIS = (() => { const out = []; for (let pi = 0; pi < 4; pi++) for (let j = 0; j < FIN_NT; j++){ const n = pi * FIN_NT + j, f = (j + .5) / FIN_NT;
  // (self-check: at 22-40 px, 480-900 px out, they hung near the sun like confetti) 30-52 px, 600-1200 px out, a wider fan
  // (r23b, fresh eyes: 48 still read as confetti, many over the disc) 24, flying out away from the sun (bent upwards)
  out.push({ pi, f, n, Lb: FIN_PSTART[pi] + FIN_PDUR * f, dir: null, bend: (hash(n * 3 + 1) - .5) * .5, dist: 520 + 520 * hash(n * 5 + 2), sz: 34 + 20 * hash(n * 7 + 3), r0: hash(n * 11 + 4) * TAU, spin: (hash(n * 13 + 5) - .5) * 2.4, col: ['#fffef2', K.mint, '#9ee9ff', K.white][n % 4], tgt: n % 9 }); }
  return out; })();
// the sun on the finale's clock: from radiance's last frame it stops growing (+10 % only) and glides to the plate's disc
// centre by 152; a slight swell into the frozen beat
// (r24 review: no plate layers cut out of the original picture; use our own drawn picture) the picture is now
// homeShot's own composition, whose disc sits at the frame centre: the night sun only has to settle onto (960, 540)
function finSun(L){ const h0 = RAD_HOME(B(146)), hp = eio(span(L, 0, 6)), g6 = eio(span(L, 0, 6)), x0 = lerp(960, KV_DISC[0], h0), y0 = lerp(560, KV_DISC[1], h0);
  return [lerp(x0, 960, hp), lerp(y0, 540, hp), lerp(308, KV_DISC[2], h0) * (1 + .1 * g6) * (1 + .12 * eio(span(L, 7.4, 7.875)))]; }
// the time base homeShot runs on from 146 through the outro (one clock across 154, so bobs and wobbles never jump)
const homeS = s => Object.assign({}, s, { T: s.t - B(146) });
// homeShot moves a group by (1 - eout(a)); this returns the a whose displacement follows a sine in-out (slow, flowing)
const homeArrive = u => 1 - Math.cbrt(1 - esin(u));
SC_.finale = (g, s) => {
  if (FIN_VAR !== 'N') return SC_.finaleNight(g, s);
  return SC_.finaleR22(g, s);
};
SC_.finaleNight = (g, s) => {
  const L = s.lbar, R16 = L + 16, amt = 1 - eio(span(L, 7.875, 8)), k = smoothEnv(kickAt, s.t) * amt, sn = smoothEnv(snareAt, s.t) * amt, bt = Math.floor(s.beat);
  const Zb = lerp(1, 1.06, eio(span(L, 6, 7.875)));
  g.save(); g.translate(W / 2, H / 2); g.scale(Zb, Zb); g.translate(-W / 2, -H / 2);
  // the sky: radiance's half dawn (.55), lifting a little from the first light (150) to .65 by 153.5
  // (r23b, visual + rhythm: at .8 with the stars gone the frozen "night" was already day, so the 154 reveal changed
  // little) it stays night: .65 at most, the stars keep 60 %, the real dawn is the reveal
  nightSky(g, lerp(.18 + .82 * RAD_DAWN(16), .65, eio(span(L, 4, 7.5))));
  // the stars and trails turn on (faster to 152, then to a stop) and dim a little with the first light
  const nf = .5 * (1 - .4 * eio(span(L, 4, 7.5)));
  if (nf > 0){ const tr = RAD_STAR_ROT(s.lb + 64); g.save(); g.translate(1600, -300); g.rotate(tr); g.translate(-1600, 300); drawStars(g, s, 1, nf); g.restore();
    // (the trails keep radiance's growth at the cut and then follow the sky's turn, so they slow and stop with it)
    const len = RAD_TRAIL(16) + 43.6 * (RAD_STAR_ROT(s.lb + 64) - RAD_STAR_ROT(64)); starTrails(g, 1600, -300, 30, Math.min(TAU, len * .6), len * .3, .4 * nf); }
  // the meteor shower: one a beat (146), one an eighth (147), one a beat (148-150, under the line writers), one an eighth
  // (150-152), two an eighth (152), one a beat (153.0-153.5); all from above the frame
  { const e1 = Math.floor(L * 8); for (let e = e1 - 4; e <= e1; e++){ if (e < 0 || e >= 63) continue; const Le = e / 8;
      // (r23b rhythm: 153.5-154 is the loudest moment, yet the shower had stopped, so nothing was frozen on 154) bar 153 one an
      // eighth to 153.875: two or three hang mid-air in the frozen frame
      const n = Le < 1 ? (e % 2 ? 0 : 1) : Le < 2 ? 1 : Le < 4 ? (e % 2 ? 0 : 1) : Le < 6 ? 1 : Le < 7 ? 2 : 1; if (Le >= 7.875) continue;
      for (let j = 0; j < n; j++){ const R = mulberry32(e * 13 + j * 7 + 777), u = (L * 8 - e - j * .5) / 4.5; if (u <= 0 || u >= 1) continue;
        meteor(g, 600 + R() * 1700, -200 - R() * 90, MET_ANG + (R() - .5) * .07, 2400, 620 + 120 * R(), u, 6 + 3 * R()); } } }
  // the sun (radiance's night sun: halo, ladder, beat pulse), gliding to the plate's disc centre
  const [sx, sy, sR0] = finSun(L), sR = sR0 * (1 + .018 * s.k * amt);
  circle(g, sx, sy, sR * 1.3, lerpCol('#0550b8', '#2cbff8', lerp(RAD_DAWN(16), .6, eio(span(L, 4, 7.5)))));
  discLad(g, sx, sy, sR, '#e7ffff', '#9ee9ff', '#42cefb', '#0b8ef4', .075 * (1 + .6 * Math.exp(-fract(s.beat) * BEAT / .12) * amt));
  // radiance's ring every 2 bars carries on (146, 148, 150, 152); 150 adds the first light, a wide cream ring
  // (r23b, all four: the 2-bar ring under the first light made a bullseye) the 2-bar ring only on 146 and 148; the first
  // light is one 16 px ring at .7
  { const age = fract(R16 / 2), r = lerp(sR * 1.1, 1500, eout(age)); if (L < 4){ g.globalAlpha = .5 * (1 - eout(age)) * clamp(age / .02); ring(g, sx, sy, r, r + lerp(10, 3, age), '#9ee9ff'); g.globalAlpha = 1; } }
  { const u = span(L, 4, 5); if (u > 0 && u < 1){ const r = lerp(sR * 1.08, sR + 1200, eout(u)); g.globalAlpha = .7 * (1 - u) * clamp(u / .03); ring(g, sx, sy, r, r + lerp(16, 3, u), '#fffef2'); g.globalAlpha = 1; } }
  // the pieces round the sun break away from their tails
  // (r23b, fresh eyes: the last stubs hung alone) the pieces' last fifth fades as it breaks
  { const cuts = FIN_PSTART.map(p0 => span(L, p0, p0 + FIN_PDUR)); sunPieces(g, Object.assign({}, s, { lbar: R16 }), sx, sy, sR, 0, cuts, cuts.map(c => 1 - eio(span(c, .75, 1)))); }
  // the white lines, written by four long meteors right to left (148.0 / 148.5 / 149.0 / 149.5); paths 0 and 1 together
  // (r23b, all four: the clouds were still fast, the cubic eio peaks at 3x the mean like eout) a sine in-out over 2.5 bars
  // each: lower left 150-152.5, right 150.5-153, upper left 151-153.5, wisps 151.25-153.75 (peaks ~5 / 8 / 6 / 10 px a frame)
  // (r24 review: no layers cut from the original picture; use our own drawn picture) the picture's pieces are now
  // homeShot's own drawn groups: the cloud tower, bank and right clouds with the bottom-left dotted arc rise / slide in from
  // 150 (sine in-out, 2.5 bars), the lower-right stripes band from 150.5, the upper-left corner from 151; the five white lines
  // are written by the meteors (148-150.5) along homeShot's own paths; the nine triangles grow in where the constellation lands
  const HOME = { ll: [4, 2.5], right: [4.5, 2.5], tl: [5, 2.5] }, prog = key => span(L, HOME[key][0], HOME[key][0] + HOME[key][1]), kb = 6 * k;
  const homeAt = key => HOME[key][0] + HOME[key][1], sH = homeS(s), HL = HOME_LINES(sH.T);
  // the lines: written right to left by a meteor each (148.0 lines 0 + 1, 148.5, 149.0, 149.5), drawn over a bar; the first
  // and last stretches the clouds hide later stay at .3 (a fading tail) until their cover is home
  const lst = [2, 2, 2.5, 3, 3.5], lu = lst.map(t0 => eio(span(L, t0, t0 + 1)));
  const tail = [[0, 0], [.14, 0], [.12, .1], [0, 0], [.1, 0]], cov = lerp(.3, 1, eio(span(L, homeAt('ll'), homeAt('ll') + .25))), covR = lerp(.3, 1, eio(span(L, homeAt('right'), homeAt('right') + .25)));
  HL.forEach((f, i) => { const u = lu[i]; if (u <= 0) return; const a0 = 1 - u, [t0, t1] = tail[i], lo = Math.max(a0, t0), hi = 1 - t1;
    if (hi > lo) swoosh(g, f, lo, hi, HOME_LW[i]);
    if (t0 > a0){ g.globalAlpha = cov; swoosh(g, f, a0, t0, HOME_LW[i]); g.globalAlpha = 1; }
    if (t1 > 0 && 1 - t1 < 1){ g.globalAlpha = covR; swoosh(g, f, Math.max(a0, 1 - t1), 1, HOME_LW[i]); g.globalAlpha = 1; }
    if (u < 1 && i !== 0){ const h = Math.sin(Math.PI * Math.min(1, u * 1.15)), [xh, yh] = f(a0);
      for (let q = 12; q >= 1; q--){ const [xq, yq] = f(clamp(a0 + q * .009)); g.globalAlpha = .5 * h * (1 - q / 13); circle(g, xq, yq, 9 * (1 - q / 14), '#fffef2'); }
      g.globalAlpha = 1; softGlow(g, xh, yh, 56, .95 * h); } });
  // the groups (homeShot draws them in its own layer order); the triangles grow in as their constellation lands, with a soft
  // light no wider than themselves; the snare pops one, the fill flashes them by sixteenths
  const fillQ = (L - 7.5) * 16, fillF = L >= 7.5 && L < 7.9375 ? Math.floor(fillQ) : -1, fillA = .45 * Math.exp(-6 * fract(fillQ)) * amt;
  const triS = i => { const Lm = finLm(i); if (L < Lm) return 0; const pick = (i % 3 === bt % 3) ? sn : 0, fl = fillF >= 0 && fillF % 9 === i ? fillA : 0; return eio(span(L, Lm, Lm + .25)) * (1 + .15 * pick + fl); };
  HOME_TRIS.forEach(([x, y, sz], i) => { const Lm = finLm(i); if (L < Lm) return; const fl = fillF >= 0 && fillF % 9 === i ? fillA : 0, gl = .4 * (1 - eio(span(L, Lm, Lm + .6))) + fl; if (gl > .01) softGlow(g, x, y, sz * 1.1, Math.min(1, gl)); });
  homeShot(g, sH, { noSky: true, noDisc: true, tlDots: 0, breath: kb, arcSlide: true,
    clouds: homeArrive(prog('ll')), tower: homeArrive(prog('ll')), arc: homeArrive(prog('ll')), stripes: homeArrive(prog('right')), corners: homeArrive(prog('tl')),
    lines: 0, tris: 1, triScale: triS });
  // the constellation: born on the pieces as they break, flying out (away from the sun, bent upwards), hanging and
  // twinkling, then gathering into the triangles
  for (const T of FIN_TRIS){ const age = L - T.Lb; if (age < 0) continue; const Lm = finLm(T.tgt); if (L >= Lm) continue; const tgt = HOME_TRIS[T.tgt];
    const [bsx, bsy, bsR] = finSun(T.Lb), [bx, by] = sunPieceAt(T.pi, s.beat - (L - T.Lb) * 4, bsx, bsy, bsR, T.f), fe = eout(Math.min(1, age / 1.5)), dr = Math.max(0, age - 1.5) * 26;
    // (self-check: straight out they mostly left the frame) the vertical part is squashed to .45, so the constellation spreads
    // into the night left and right of the sun and stays in view
    const rad = Math.atan2(by - bsy, bx - bsx), up = -Math.PI / 2, dif = Math.atan2(Math.sin(up - rad), Math.cos(up - rad)), dir = rad + dif * .2 + T.bend, D = T.dist * .6 * fe + dr;
    let x = bx + Math.cos(dir) * D, y = by + Math.sin(dir) * D * .45;
    const m = eio(span(L, Lm - .5, Lm)); x = lerp(x, tgt[0], m); y = lerp(y, tgt[1], m);
    const born = eback(clamp(age * 5)), sz = T.sz * born * (1 - .6 * m);
    // a soft light wave runs left to right through them on each snare of 148-149 (r23b: no wider than the triangle, .3)
    let tw = 0; for (const Lw of [2.25, 2.75, 3.25, 3.75]){ const v = (L - Lw) / .19; if (v < 0 || v > 1) continue; const wx = lerp(-300, 2220, v); tw = Math.max(tw, Math.exp(-Math.pow((x - wx) / 230, 2))); }
    // (r25c whole-song review, advocate + fresh eyes: ~24 white / mint triangles at random angles all over the sky
    // read as confetti) as in the outro's scatter: one in four is born a triangle pointing the way it flies and turns into
    // a soft round star within ~.35 bar; the rest are born as soft stars; the stars then gather into the nine triangles
    const shard = T.n % 4 === 1, trA = shard ? 1 - eio(span(age, .25, .6)) : 0, glA = shard ? eio(span(age, .2, .45)) : eio(clamp(age / .15));
    const tws = 1 + .25 * Math.sin(s.T * 5 + T.n * 1.7);   // a slow twinkle
    if (glA > 0) softGlow(g, x, y, 20 * born * tws, Math.min(1, glA * (.85 + .5 * tw)));
    if (trA > 0) triK(g, x, y, sz * trA, Math.atan2(Math.sin(dir) * .45, Math.cos(dir)) + Math.PI / 2, 0, T.col, 3); }   // pointing along its (squashed) flight
  g.restore();
};
SC_.finaleR22 = (g, s) => {
  const L = s.lbar, R16 = L + 16, bt = Math.floor(s.beat);
  // (r17b rhythm: the fill drums to 154, so the plate keeps playing to 153.875 and settles into the still plate by 154)
  const amt = 1 - eio(span(L, 7.875, 8)), k = smoothEnv(kickAt, s.t) * amt, sn = smoothEnv(snareAt, s.t) * amt;
  let [, Px, Py, roll, Zb] = finCam(L);
  if (FIN_VAR === 'B'){ const m = 1 - eio(span(L, 6, 7.5)); Px *= 1 - .5 * m; Py *= 1 - .5 * m; Zb = 1 + (Zb - 1) * (1 - .6 * m); }   // B: a gentler tour, so the whole mid-size sun and its sky stay in view
  const O = f => [Px * f, Py * f];
  g.save(); g.translate(W / 2, H / 2); g.rotate(roll); g.scale(Zb, Zb); g.translate(-W / 2 - Px, -H / 2 - Py);
  nightSky(g, lerp(.18 + .82 * RAD_DAWN(16), 1, eio(span(L, 0, 3))));
  const oS = O(.4);
  { const ks = eio(span(L, 1.5, 4)); if (ks > 0){ g.globalAlpha = ks; kvLayer(g, 'kvl_sky', oS[0], oS[1]); g.globalAlpha = 1; } }
  g.save(); g.translate(oS[0], oS[1]);
  const nf = .5 * (1 - eio(span(L, 1.5, 3.5)));
  if (nf > 0){ const tr = RAD_STAR_ROT(s.lb + 64); g.save(); g.translate(1600, -300); g.rotate(tr); g.translate(-1600, 300); drawStars(g, s, 1, nf); g.restore();   // r18: radiance's time-lapse clock
    const len = RAD_TRAIL(R16); starTrails(g, 1600, -300, 30, Math.min(TAU, len * .6), len * .3, .4 * nf); }
  g.restore();
  // the sun (radiance's clock; the night sun hands over to the plate's disc)
  const home = FIN_VAR === 'B' ? lerp(Math.min(RAD_HOME(s.t), .35), 1, eio(span(L, 6, 7.75))) : RAD_HOME(s.t), oD = O(.35), sx = lerp(960, KV_DISC[0], home) + oD[0], sy = lerp(560, KV_DISC[1], home) + oD[1], sR = lerp(308, KV_DISC[2], home) * (1 + .018 * s.k * (1 - home));
  const kd = eio(span(L, .5, 2.25)), d = KVLY.kvl_disc;
  { const ha = 1 - eio(span(L, 0, 2)); if (ha > 0){ g.globalAlpha = ha; circle(g, sx, sy, sR * 1.3, lerpCol('#0550b8', '#2cbff8', RAD_DAWN(16))); g.globalAlpha = 1; } }
  // (r17b framescan: radiance's per-beat night-sun pulse stepped the disc's outer edge on 147.5, 147.75 and 148.0, where the
  // plate's disc no longer covers it) the pulse fades out over 146-147.5
  if (kd < 1) discLad(g, sx, sy, sR, '#e7ffff', '#9ee9ff', '#42cefb', '#0b8ef4', .075 * (1 + .6 * (1 - eio(span(L, 0, 1.5))) * Math.exp(-fract(s.beat) * BEAT / .12)));
  if (d && kd > 0){ g.globalAlpha = kd; kvLayer(g, 'kvl_disc', sx - d.cx, sy - d.cy, 0, sR / d.R * (1 + .012 * k * kd), d.cx, d.cy); g.globalAlpha = 1; }
  { const fl = eio(span(L, 0, .75)); if (fl < 1) sunPieces(g, Object.assign({}, s, { lbar: R16 }), sx, sy, sR, fl); }
  // (r22b, advocate: "every frame is a flat blue disc filling the screen; at one frame a second it does not change")
  // the disc is most of the picture, so the disc itself changes: a broad soft sheen circles inside it, one turn every 2
  // bars from 147 (fading in over 147, out over 153.25-153.75 so settle's first frame is the plain plate)
  { const sa = eio(span(L, 1, 2)) * (1 - eio(span(L, 7.25, 7.75))); if (sa > 0 && kd > 0){ const an = TAU * (L - 1) / 2 - Math.PI * .75, hx = sx + Math.cos(an) * sR * .42, hy = sy + Math.sin(an) * sR * .42;
    g.save(); g.beginPath(); g.arc(sx, sy, sR * .98, 0, TAU); g.clip(); const gr = g.createRadialGradient(hx, hy, 0, hx, hy, sR * .75);
    gr.addColorStop(0, `rgba(255,254,242,${.34 * sa})`); gr.addColorStop(.55, `rgba(231,255,255,${.12 * sa})`); gr.addColorStop(1, 'rgba(231,255,255,0)'); g.fillStyle = gr; g.fillRect(sx - sR, sy - sR, sR * 2, sR * 2); g.restore(); } }
  // rings: one a downbeat off the rim (146-149, bigger on 146); from 150 a pulse crosses the disc's face from its middle
  // on every downbeat; 153: one every beat, each bigger; the fill: one every eighth
  { const u = fract(L), big = Math.floor(L) === 0, r = lerp(sR + 66, sR + (big ? 900 : 520), eout(u)); if (u < .6 && L < 2){ g.globalAlpha = .8 * (1 - u / .6) * clamp(u / .036); ring(g, sx, sy, r, r + lerp(big ? 20 : 14, 3, u / .6), '#fffef2'); g.globalAlpha = 1; } }
  // (r22, advocate: on the pale disc the pulses were hairlines) wider and stronger cream bands
  { const pulse = (t0, dur, r1, w0, a0) => { const u = (L - t0) / dur; if (u < 0 || u >= 1) return; const r = lerp(sR * .3, r1, eout(u)); g.globalAlpha = a0 * (1 - u) * clamp(u / .08) * amt; ring(g, sx, sy, r, r + lerp(w0, 5, u), '#fffef2'); g.globalAlpha = 1; };
    for (let q = 2; q < 7; q++) pulse(q, .75, sR + 260, 30, .8);   // (r17b, fresh eyes: 148-149 still an empty middle) from 148
    for (let q = 0; q < 3; q++) pulse(7 + q * .25, .5, sR + 120 + 90 * q, 26, .8);
    pulse(7.625, .35, sR + 340, 20, .7); }
  // 152 (the night drop's echo): meteors across the sun's face on the downbeat (three) and beat 3 (two)
  // (r22, fresh eyes: tiny) four on the downbeat and three on beat 3, wider (10 px), spread over the whole width
  for (const [bb, n] of [[24, 4], [26, 3]]) for (let j = 0; j < n; j++){ const R = mulberry32(bb * 17 + j * 5), u = (L * 4 - bb - j * .12) / 2.2; meteor(g, 1000 + j * 330 + R() * 300 + oD[0], -240 + R() * 140 + oD[1], MET_ANG + (R() - .5) * .08, 2600, 760, u, 10, true, '#9ee9ff'); }   // r20 audit: pale glow, starts above the frame
  // the last meteors across the sun's face (146-149)
  for (let bb = Math.max(0, Math.floor(L * 4) - 3); bb <= Math.floor(L * 4) && bb < 12; bb++){ const R = mulberry32(bb * 31 + 9), u = (L * 4 - bb) / 2; if (bb % 4 === 3) continue;
    // (r20 audit, fresh eyes: one started inside the frame top; on the pale disc the dark glow read as a scratch)
    g.globalAlpha = 1 - eio(span(L, 2.25, 3)); meteor(g, 900 + R() * 1100 + oD[0], -240 + R() * 140 + oD[1], MET_ANG + (R() - .5) * .06, 2400, 640, u, bb % 4 ? 6 : 9, true, '#9ee9ff'); g.globalAlpha = 1; }
  // the groups come home, each its own way, then breathe 6 px on the kick (smoothed), each at its own depth
  // (r22, advocate: 6 px did not read) the breath is 10 px, still 5-frame smoothed
  const arr = (a0, dur) => eout(span(L, a0, a0 + dur)), oT = O(0), oL = O(-.25), oR = O(-.1), oW = O(.15), oTr = O(-.15), kb = 10 / 6 * k;
  { const e = arr(2, 1); if (e > 0) kvLayer(g, 'kvl_tl', oT[0] - 6 * kb * e, oT[1] - 4 * kb * e, .6 * (1 - e), 1, KV_DISC[0], KV_DISC[1]); }
  { const e = arr(0, 1.25); if (e > 0) kvLayer(g, 'kvl_ll', oL[0] - 6 * kb * e, oL[1] + 760 * (1 - e) + 3 * kb * e); }
  { const e = arr(1, 1); if (e > 0) kvLayer(g, 'kvl_right', oR[0] + 1100 * (1 - e) + 6 * kb * e, oR[1] - 2 * kb * e); }
  { const e = arr(3, 1); if (e > 0) for (const id of ['kvl_w0', 'kvl_w1']) kvLayer(g, id, oW[0] + 1300 * (1 - e), oW[1] - 100 * (1 - e)); }
  // 150 (approach's echo): the triangles fly in on the eighths; the snare pops and turns two of them; in the fill they
  // flash round by sixteenths
  // (r17b rhythm: the flashes ran on 64ths, 2.3 laps a beat, and snapped back at 153.75) one triangle a sixteenth,
  // exactly one lap of the seven (153.5-153.9375), each flash decaying
  const fillQ = (L - 7.5) * 16, fillF = L >= 7.5 && L < 7.9375 ? Math.floor(fillQ) : -1, fillA = .3 * Math.exp(-6 * fract(fillQ)) * amt;
  for (let i = 0, j = 0; i < 9; i++){ const id = 'kvl_t' + i, dd = KVLY[id]; if (!dd) continue; const o = REU_TRI(i), a0 = 4 + o * .125, e = eout(span(L, a0, a0 + .5)); j++; if (e <= 0) continue;
    const ax = dd.cx - KV_DISC[0], ay = dd.cy - KV_DISC[1], al = Math.hypot(ax, ay) || 1, fly = 1150 * (1 - e), land = Math.sin(Math.PI * clamp((L - a0 - .5) / .25));
    const pick = (j % 3 === bt % 3) ? sn : 0, fl = fillF >= 0 && fillF % 7 === o ? fillA : 0;
    kvLayer(g, id, oTr[0] + ax / al * fly, oTr[1] + ay / al * fly, (i % 2 ? 1 : -1) * 3.5 * (1 - e) + .26 * pick * e, (1 + .25 * land + .15 * pick * e + fl)); }
  // and eight small formation triangles sweep in from the left over the sun's face and pop into little rings in an arc
  // over its upper half by 150.9
  for (const F of FIN_RISE){ const u = span(L, 4 + F.d, 4.6 + F.d); if (u <= 0) continue; const tx = sx + Math.cos(F.a) * 400, ty = sy + 130 + Math.sin(F.a) * 400;
    if (u < 1){ const e = eio(u), x = bez(-140, sx - 520, tx, e), y = bez(F.y0 + 300, sy + 300, ty, e), dx = (1 - e) * (sx - 520 + 140) + e * (tx - sx + 520), dy = (1 - e) * (sy - F.y0) + e * (ty - sy - 300);
      triK(g, x, y, 48, Math.atan2(dy, dx) + Math.PI / 2, 0, F.col, 3); }
    // (r17b, fresh eyes: the rings lived .3 s each at 16-52 px, the arc never whole, "paper bits"; visual: the triangle
    // swapped to its ring in one frame) the triangle shrinks and fades into its ring over .15 bar; one size, 28 px; the
    // whole arc holds to 151.0, then fades over a quarter bar
    else { const v = span(L, 4.6 + F.d, 4.75 + F.d), a = 1 - eio(span(L, 5, 5.25)), e2 = eout(v);
      if (v < 1){ g.globalAlpha = 1 - eio(v); triK(g, tx, ty, 48 * (1 - .6 * e2), Math.atan2(ty - (sy + 300), tx - (sx - 520)) + Math.PI / 2, 0, F.col, 3); }
      if (a > 0){ const r = lerp(12, 36, e2); g.globalAlpha = a * eio(v); ring(g, tx, ty, r, r + lerp(11, 7, e2), F.col); }
      g.globalAlpha = 1; } }
  // the white lines (lines' plane: no parallax): drawn in 146-149.5 as before; from 150 a light runs along one a bar
  { const dl = KVLY.kvl_lines; if (dl){ const N = dl.paths.length, st = p => p <= 1 ? 0 : (p - 1) * .5;
    if (L >= st(N - 1) + 1) kvLayer(g, 'kvl_lines');
    else dl.paths.forEach((P, p) => { const u = eio(span(L, st(p), st(p) + 1)); if (u <= 0) return; const x0 = P[0][0], x1 = P[P.length - 1][0], rev = p <= 1, xw = rev ? lerp(x1 + 40, x0 - 40, u) : lerp(x0 - 40, x1 + 40, u);
      g.save(); g.beginPath(); if (rev) g.rect(xw, -300, W + 600, H + 600); else g.rect(-300, -300, xw + 300, H + 600); g.clip(); lineBand(g, P, 90); g.clip(); kvLayer(g, 'kvl_lines'); g.restore();
      if (u < 1){ const y = pathY(P, clamp(xw, x0, x1)); if (y !== null){ const h = Math.sin(Math.PI * u); g.globalAlpha = .35 * h; circle(g, clamp(xw, x0, x1), y, 30, '#e7ffff'); g.globalAlpha = h; circle(g, clamp(xw, x0, x1), y, 10, '#fffef2'); g.globalAlpha = 1; } } });
    // (r17b rhythm: 153's light was cut at full brightness at 153.5) 153's runs in half a bar
    if (L >= 2 && L < 7.5){ const f = fract(L) * (L >= 7 ? 2 : 1); finLineLight(g, dl.paths[1 + Math.floor(L) % (N - 1)], f, Math.sin(Math.PI * f)); } } }
  // 151: a soft diagonal light band sweeps the whole plate along the lines' direction
  // (r17b rhythm: the band's ends were still in frame at 151.0 and 152.0) it fades in and out with sin
  // (r22b, advocate: still one picture at one frame a second) the band sweeps on 148, 149, 151 and the first
  // three beats of 153 too, alternating its direction (150 has the formation, 152 the meteors)
  for (const [b0, b1, dir] of [[2, 3, 1], [3, 4, -1], [5, 6, 1], [7, 7.75, -1]]){ const u = span(L, b0, b1); if (u > 0 && u < 1){ const c = dir > 0 ? lerp(-900, 2900, eio(u)) : lerp(2900, -900, eio(u)); g.save(); g.globalAlpha = Math.sin(Math.PI * u) * amt; g.translate(c, 540); g.rotate(-.35 - Math.PI / 2); const gr = g.createLinearGradient(-280, 0, 280, 0); gr.addColorStop(0, 'rgba(255,254,242,0)'); gr.addColorStop(.5, 'rgba(255,254,242,.42)'); gr.addColorStop(1, 'rgba(255,254,242,0)'); g.fillStyle = gr; g.fillRect(-280, -3000, 560, 6000);   /* r22: wider, .42 */ g.restore(); } }   // (r17b framescan: at 3200 long its end crossed the top-right corner at 151.4)
  // r23 variant C: big key-visual clouds fly past in front of the camera on 148, 150 and 152 (horizontally, never down),
  // each crossing in 1.6 bars and gone before 153.75
  if (FIN_VAR === 'C') for (const [b0, dir, y, sc, c] of [[2, 1, 960, 2.3, 'HA_low'], [4, -1, 1000, 2.5, 'HB_b0'], [6, 1, 970, 2.3, 'HA_b2']]){
    const u = span(L, b0, b0 + 1.6); if (u <= 0 || u >= 1) continue; const x = dir > 0 ? lerp(-1500, 3400, u) : lerp(3400, -1500, u); cloudS(g, c, x, y, sc, 0, dir < 0); }
  g.restore();
};
SC_.finaleR16 = (g, s) => {   // (the r16 reunion, kept for reference)
  const L = s.lbar, R16 = L + 16, b = 146 + L, sn = smoothEnv(snareAt, s.t), bt = Math.floor(s.beat);
  const amt = 1 - eio(span(L, 7.75, 7.9)), k = smoothEnv(kickAt, s.t) * amt;
  // r16b (fresh eyes, visual FAIL; rhythm, UA: 147.5-150 the fullest drums over an empty flat disc in the middle):
  //  - the white lines come first and cross the disc: one every 2 beats from 146.5 (each drawn in a bar, a soft light at
  //    its head), all there by 149.5;
  //  - radiance's arc pieces round the sun do not vanish at 145 any more: they fly outward and fade as the groups land;
  //  - the last meteors cross in front of the sun until 149; half the stars stay to 148, gone by 149.5;
  //  - the camera leans 40 px towards each group as it lands; the downbeat rings are 14 px at .8;
  //  - the triangles come on the eighths of 150, so 151-153.75 is the whole plate grooving before the still beat.
  const nudge = (lt, dx, dy) => { const v = Math.sin(Math.PI * clamp((L - lt + .5) / 1.5)); return [dx * v, dy * v]; };
  const nd = [nudge(1.25, -40, 24), nudge(2, 40, 0), nudge(3, -40, -24), nudge(4.9, 0, 30)].reduce((p, q) => [p[0] + q[0], p[1] + q[1]], [0, 0]);
  const zz = 1 + .06 * eio(span(L, 0, 8));
  g.save(); g.translate(W / 2 + nd[0], H / 2 + nd[1]); g.scale(zz, zz); g.translate(-W / 2, -H / 2);
  // the sky: radiance's half dawn (.55) to day, then the plate's own sky
  nightSky(g, lerp(.18 + .82 * RAD_DAWN(16), 1, eio(span(L, 0, 3))));
  { const ks = eio(span(L, 1.5, 4)); if (ks > 0){ g.globalAlpha = ks; kvLayer(g, 'kvl_sky'); g.globalAlpha = 1; } }
  // radiance's stars and trails, carried on (same turn, same alpha at the cut): half to 147.5, gone by 149.5
  const nf = .5 * (1 - eio(span(L, 1.5, 3.5)));
  if (nf > 0){ const tr = .0045 * (s.lb + 64); g.save(); g.translate(1600, -300); g.rotate(tr); g.translate(-1600, 300); drawStars(g, s, 1, nf); g.restore();
    const bt2 = (R16 - 10) * 4, len = TAU / 90 * (bt2 * 2 + Math.max(0, bt2 - 8) * 4 + Math.max(0, bt2 - 16) * 4); starTrails(g, 1600, -300, 30, Math.min(TAU, len * .6), len * .3, .4 * nf); }
  // the sun: on radiance's clock it reaches the plate's disc on 148; the cream night sun hands over to the plate's disc
  const home = RAD_HOME(s.t), sx = lerp(960, KV_DISC[0], home), sy = lerp(560, KV_DISC[1], home), sR = lerp(308, KV_DISC[2], home) * (1 + .018 * s.k * (1 - home));
  const kd = eio(span(L, .5, 2.25)), d = KVLY.kvl_disc;
  { const ha = 1 - eio(span(L, 0, 2)); if (ha > 0){ g.globalAlpha = ha; circle(g, sx, sy, sR * 1.3, lerpCol('#0550b8', '#2cbff8', RAD_DAWN(16))); g.globalAlpha = 1; } }
  if (kd < 1) discLad(g, sx, sy, sR, '#e7ffff', '#9ee9ff', '#42cefb', '#0b8ef4', .075 * (1 + .6 * Math.exp(-fract(s.beat) * BEAT / .12)));
  if (d && kd > 0){ g.globalAlpha = kd; kvLayer(g, 'kvl_disc', sx - d.cx, sy - d.cy, 0, sR / d.R * (1 + .015 * k * kd), d.cx, d.cy); g.globalAlpha = 1; }
  // radiance's arc pieces fly outward off the sun and fade while the groups land (146.25-148)
  // (r16 audit, fresh eyes: they still lay over the KV's own lower-left arc at 146.6) gone by 146.75
  { const fl = eio(span(L, 0, .75)); if (fl < 1) sunPieces(g, Object.assign({}, s, { lbar: R16 }), sx, sy, sR, fl); }
  // a light ring leaves the sun on every downbeat (bigger on 146 and 150)
  // (r16 audit, fresh eyes: on 146.0 a full ring popped in round the disc) each ring fades in over its first 3 frames
  { const u = fract(L), big = Math.floor(L) % 4 === 0, r = lerp(sR + 66, sR + (big ? 900 : 520), eout(u)); if (u < .6){ g.globalAlpha = .8 * (1 - u / .6) * clamp(u / .036); ring(g, sx, sy, r, r + lerp(big ? 20 : 14, 3, u / .6), '#fffef2'); g.globalAlpha = 1; } }
  // the last meteors fall across the sun's face (146-149), the drop's flash going out with the night
  for (let bb = Math.max(0, Math.floor(L * 4) - 3); bb <= Math.floor(L * 4) && bb < 12; bb++){ const R = mulberry32(bb * 31 + 9), u = (L * 4 - bb) / 2; if (bb % 4 === 3) continue;
    g.globalAlpha = 1 - eio(span(L, 2.25, 3)); meteor(g, 900 + R() * 1100, -160 + R() * 200, MET_ANG + (R() - .5) * .06, 2400, 640, u, bb % 4 ? 6 : 9); g.globalAlpha = 1; }
  // the groups come home, each the way it moved in the story; once home they push out on the kick like the plate dance
  const arr = (a0, dur) => eout(span(L, a0, a0 + dur));
  // (drawn in the plate's own layer order: upper left, lower left, right)
  { const e = arr(2, 1); if (e > 0) kvLayer(g, 'kvl_tl', -12 * k * e, -9 * k * e, .6 * (1 - e), 1, KV_DISC[0], KV_DISC[1]); }   // swings down round the sun
  { const e = arr(0, 1.25); if (e > 0) kvLayer(g, 'kvl_ll', -13 * k * e, 760 * (1 - e) + 5 * k * e); }   // rises from below
  { const e = arr(1, 1); if (e > 0) kvLayer(g, 'kvl_right', 1100 * (1 - e) + 14 * k * e, -4 * k * e); }   // slides in from the right
  { const e = arr(3, 1); if (e > 0) for (const id of ['kvl_w0', 'kvl_w1']) kvLayer(g, id, 1300 * (1 - e), -100 * (1 - e)); }   // the wisps drift in
  // the triangles fly in one per eighth of 150 from outside, turning, and pop on the snare once home
  for (let i = 0, j = 0; i < 9; i++){ const id = 'kvl_t' + i, dd = KVLY[id]; if (!dd) continue; const o = REU_TRI(i), a0 = 4 + o * .125, e = eout(span(L, a0, a0 + .5)); j++; if (e <= 0) continue;
    const ax = dd.cx - KV_DISC[0], ay = dd.cy - KV_DISC[1], al = Math.hypot(ax, ay) || 1, fly = 1150 * (1 - e), land = Math.sin(Math.PI * clamp((L - a0 - .5) / .25));
    kvLayer(g, id, ax / al * fly, ay / al * fly, (i % 2 ? 1 : -1) * 3.5 * (1 - e), (1 + .25 * land) * (1 + sn * amt * e * (j % 3 === bt % 3 ? .22 : .07))); }
  // the white lines: one every 2 beats from 146.5, each drawn in a bar along its own path with a soft light at its head;
  // once all are home (149.5) the whole layer is drawn (with its little bits round the lines)
  // (r16 audit, fresh eyes + earlier r16c note: 3:19.7-3:21.1 still a lone disc) the first line from 146.0
  // (re-audit, fresh eyes: the short top-left line alone drew a "tick" where it meets line 1) lines 0 and 1 (same start) together
  { const dl = KVLY.kvl_lines; if (dl){ const N = dl.paths.length, st = p => p <= 1 ? 0 : (p - 1) * .5;
    if (L >= st(N - 1) + 1) kvLayer(g, 'kvl_lines');
    // (final check, fresh eyes: lines 0 and 1 start at the same point on the left edge, so their first short pieces read
    // as a "∠" tick) those two are drawn from their far ends back towards the edge, so the meeting point comes last
    else dl.paths.forEach((P, p) => { const u = eio(span(L, st(p), st(p) + 1)); if (u <= 0) return; const x0 = P[0][0], x1 = P[P.length - 1][0], rev = p <= 1, xw = rev ? lerp(x1 + 40, x0 - 40, u) : lerp(x0 - 40, x1 + 40, u);
      g.save(); g.beginPath(); if (rev) g.rect(xw, -300, W + 600, H + 600); else g.rect(-300, -300, xw + 300, H + 600); g.clip(); lineBand(g, P, 90); g.clip(); kvLayer(g, 'kvl_lines'); g.restore();
      if (u < 1){ const y = pathY(P, clamp(xw, x0, x1)); if (y !== null){ const h = Math.sin(Math.PI * u); g.globalAlpha = .35 * h; circle(g, clamp(xw, x0, x1), y, 30, '#e7ffff'); g.globalAlpha = h; circle(g, clamp(xw, x0, x1), y, 10, '#fffef2'); g.globalAlpha = 1; } } }); } }
  g.restore();
};
SC_.finaleB = (g, s) => {
  const L = s.lbar, sn = snareAt(s.t), bt = Math.floor(s.beat);
  // r6: the arc continues radiance's rotation (.4 at the cut); the HB clouds, triangles and corners arrive on the hit
  // r8 (review: at 200 s go back to the most basic picture): the pieces are already home (radiance built the key
  // visual in bar 145), so nothing re-enters; the white lines draw on the hit; the whole key visual at 1.0, a slow 3 % push
  const a = { lines: eio(span(L, 0, 1.5)), arcSpin: (stepEase(L, .2, eback) + 8) * .05,
    triPulse: i => (i % 3 === bt % 3 ? .45 : .12) * sn };
  // a new framing every 2 bars (soft camera changes, eback on the downbeat): centre, the cloud tower, the stripes corner,
  // then pulled right back so the whole key visual is seen before the white release. [zoom, focus x, focus y]
  // r6 (gate r5b): close to wide (fresh eyes: the first bars were 70 % flat disc): 146 the cloud tower, 148 the stripes
  // corner, 150 mid, 152 the whole key visual; each move is an eio over 2 beats from the downbeat (fastest on beat 2,
  // landed on beat 3), no overshoot (the .4 s eback swung ~500 px in 6 frames and bounced)
  const zz = 1 + .06 * eio(span(L, 0, 8)), fx = 960, fy = 540;   // r8b (fresh eyes: a still picture under the densest drums): 6 %
  // r8 (review: go back to the most basic picture, i.e. the key visual): the finale is the key visual IMAGE
  // itself; on top only what the music adds: a light ring leaves its disc on each downbeat (bigger on 146 and 150),
  // a contrail is drawn across on every bar, and the snare glints a sparkle at one of the image's triangles
  g.save(); g.translate(W / 2, H / 2); g.scale(zz, zz); g.translate(-fx, -fy);
  // r13 (whole-song pass: finale + settle were ~40 s of one still picture): still exactly the plate, but drawn from its
  // layers so the pieces dance on the densest drums (the corner groups push out a few px on the kick, the sun swells,
  // the triangles pop on the snare); it settles to the still plate over the last half bar, so settle starts identical
  kvPlateDance(g, s, 1 - eio(span(L, 7.3, 7.85)));
  { const u = fract(L), big = Math.floor(L) % 4 === 0, r = lerp(KV_DISC[2] + 66, KV_DISC[2] + (big ? 900 : 520), eout(u)); if (u < .6){ g.globalAlpha = 1 - u / .6; ring(g, KV_DISC[0], KV_DISC[1], r, r + lerp(big ? 22 : 12, 2, u / .6), '#e7ffff'); g.globalAlpha = 1; } }
  { const ph = fract(L), k = Math.floor(L) % 3, P = [v => [lerp(-80, 2000, v), 900 - v * 520 + Math.sin(v * 3) * 40], v => [lerp(-80, 2000, v), 260 + v * 380 - Math.sin(v * 2.6) * 60], v => [lerp(300, 2000, v), 1040 - v * 300]][k];
    swoosh(g, P, ein(clamp(ph * 1.5 - .5)), eout(clamp(ph * 1.6)), 6); }
  { const SP = [[1752, 92], [1858, 182], [180, 230], [310, 425], [1880, 730], [1815, 975]], sp = SP[bt % SP.length]; if (sn > .05) star4(g, sp[0], sp[1], 46 * sn, s.T, K.white); }
  g.restore();
  // r11 (review: at 211-213 s the change between two different pictures still did not work): the outro is now the same
  // picture, so the release is only a soft half-white breath that lets it show through
  const wf = .45 * ein(span(L, 7.75, 8)); if (wf > 0){ g.globalAlpha = wf; rect(g, 0, 0, W, H, '#fffef2'); g.globalAlpha = 1; }
};
// OUTRO 154–176 (3:31.37–4:01.54), r4: the same key visual cools down with the music. The white release recedes, the
// camera eases back from the finale's push, the kick returns for 158–161 (the stripes still step), then the pieces leave
// one at a time in the reverse order of the assembly, every 2 bars, each moving out the way it came in. Set B clouds.
// r5 (visual juror): the sun shrinks to NOTHING across settle and tail without a pause (bars 173 to 179.5) while it drifts
// to (640, 560), and at 179.5 (246.34 s) it turns into the small white triangle there
// r6 (gate r5b): the shrink starts at 172, while the clouds are still leaving, and moves from its first bar (ein barely
// moved for 2 bars: STILL at 174), so no frame is a lone full-screen disc
// r6b (fresh eyes: still ~5 s of a full-screen disc at 3:57-4:01): an ease-out, so the sun is R ~370 at 174 and ~160 at
// 176, then a small sun shrinking slowly into the triangle
// r6c: the shrink now starts at 164 with the departures (the R 720 sun dominated an emptying frame): R ~460 at 168,
// ~260 at 172, ~85 at 176, 0 at 179.5
// r9 (advocate whole-song pass: "only one circle shrinking for ~17 s, too empty"): the shrink starts at 170 (the
// clouds are still there until 174) and the night comes back with its stars (see tail): fewer lone-sun seconds
// r11: from 174 (the right side leaves then; the plate's sun keeps the frame whole until there)
// r16b (fresh eyes: with the lower left gone at 174.9, 3:53-4:00 was ~7 s of a full-screen empty disc): from 172.5
const outroU = t => { const u = span(t, B(172.5), B(179.5)); return (u + 1 - (1 - u) * (1 - u)) / 2; };
const OUTRO_R = t => KV_DISC[2] * (1 - outroU(t));   // r8d: from the key visual image's own disc (R 765)
// r6d (research calm_sections_r6 #2, jury approved): the shrinking sun's collar counts down: one of 8 segments goes out
// on each downbeat 172-178 (eout over 1/4 beat), the last on 179.5 with the white triangle
const OUTRO_SEG = t => k => 1 - eout(clamp((t - (k < 7 ? B(172 + k) : B(179.5))) / (BEAT / 4)));
// r12 (jury whole-song pass: 3:19-4:00 read as one unchanging picture): the sun also sinks 150 px over the piano part
// (162.94-174, behind the clouds), so the outro is a day ending; it still lands exactly on (640, 560) at 179.5
const OUTRO_XY = t => { const u = outroU(t), b = (t - T0) / BAR, sk = 150 * eio(span(b, 162.94, 174)); return [lerp(KV_DISC[0], 640, u), lerp(KV_DISC[1] + sk, 560, u)]; };
// (r11: the r8d-r10 layered-redraw outro, kept for reference; replaced by the plate layers below)
SC_.settleB = (g, s) => {
  const L = s.lbar, gone = (a, b) => 1 - eio(span(L, a, b)), kickBars = L >= 4 && L < 8;
  // r5: the white lines leave first, right after the release (a breath with no kick); no halftone balls
  // r6 (rhythm juror): 154-156 hold; from 156 the arc turns one step a bar and the triangles glint on the snare; 158-161
  // (the outro's only four-on-the-floor) the stripes step on every beat and the sun pulses on the kick; from 162, when
  // the kick stops, one piece leaves every 2 bars on the downbeat: triangles, corners, stripes, arc, then the clouds
  // r6c (fresh eyes: 162-172 had only two events in 14 s): one piece leaves on each downbeat 162-166, the tower at 167,
  // the bank from 169 while the sun begins to shrink
  const a = { lines: gone(0, 1.5), tris: gone(10, 11), corners: gone(11, 12), stripes: gone(12, 13), arc: gone(13, 14), tower: gone(15, 16.5), clouds: gone(17, 20), bob: L >= 8 ? 6 * Math.sin(Math.PI * fract(L)) : undefined,   // r9: one piece a bar from 164, the clouds stay to 174
    arcSpin: L < 2 ? 0 : stepEase(L - 2, .25, eout) * .025, triPulse: i => .1 * snareAt(s.t), stripeEvery: kickBars ? 1 : 2,
    discR: OUTRO_R(s.t) * (1 + (kickBars ? .015 * s.k : 0)), discXY: OUTRO_XY(s.t), ringSeg: OUTRO_SEG(s.t) };
  // r6b (health r6: STILL 162-174, motion .09-.31, while the snare keeps playing): the camera slowly pulls back across
  // the whole cool-down (the picture empties as we leave it), with a slight sway; the sun's collar flicks on the snare
  // (push in to 1.07 through the kick bars, then a slow pull-back to 1.03; never below 1.03 so the ±.012 rad sway
  // never shows a frame edge)
  const z = (1 + .07 * eio(span(L, 0, 6)) - .04 * eio(span(L, 6, 22))) * (1 + .006 * snareAt(s.t) * (L >= 8 ? 1 : 0));
  // r8d (review: 211 s was much poorer than the picture before; keep that picture and let its elements leave one by one):
  // the key visual in layers (its own clouds at their own places); the image itself stays on top through the white
  // release and dissolves into the layered copy over the first bar
  g.save(); g.translate(W / 2, H / 2); g.rotate(.012 * Math.sin(s.T * .3) * clamp(L - 6)); g.scale(z, z); g.translate(-W / 2, -H / 2); kvLayered(g, s, a);
  { const pa = 1 - eio(span(L, .3, 1.2)); if (pa > 0) plate(g, 'kv', { s: 1, alpha: pa }); }
  g.restore();

  const w0 = 1 - eout(span(L, 0, .5)); if (w0 > 0){ g.globalAlpha = w0; rect(g, 0, 0, W, H, '#fffef2'); g.globalAlpha = 1; }
};
// TAIL 176–184: only the sun is left; it shrinks steadily (Chronomia's ending); one small white triangle appears,
// glints once more at bar 179.5 (246.34 s), then the sky deepens to navy (not black: the song's breaths are navy), so
// the very last image is the 1:06 image: one white triangle on navy.
SC_.tailB = (g, s) => {
  const L = s.lbar;
  const a = { lines: 0, clouds: 0, arc: 0, corners: 0, stripes: 0, tris: 0, discR: OUTRO_R(s.t), discXY: OUTRO_XY(s.t), ringSeg: OUTRO_SEG(s.t) };
  kvLayered(g, s, a);   // the sky deepens to navy through TONE.tail (bars 181–183), not an overlay (r8d: layered key visual)
  // r9: as the light goes the stars come back, from the zenith down (the song opened with the last stars going out)
  { const rv = eio(span(L, 2, 7)); if (rv > 0) drawStars(g, s, rv * .8, rv); }
  const one = pop((s.t - B(179.5)) / BEAT * 1.5), glint = Math.exp(-Math.max(0, s.t - B(179.5)) * 3) * (s.t >= B(179.5) ? 1 : 0);
  const last = 1 - eio(span(s.t, 251.5, 252.5));
  const hb = L >= 4 && L < 5 ? .1 * s.k : 0;   // r6 (rhythm juror): bar 180's last kicks = the song's last heartbeat
  if (one > 0 && last > 0){ g.globalAlpha = last; triK(g, 640, 560, 62 * clamp(one, 0, 1.2) * (1 + .25 * glint + hb), .18 + .4 * glint, 0, K.white, 3); g.globalAlpha = 1; }
};

// ================================================================== r11 OUTRO: the plate itself, then its pieces leave
// Review (draft r10): at 211-213 s replace the second picture with the first, then do effects / transformations / added
// elements on top of it; from 223 s (pure piano) take one element away on each block chord, every four bars, one at a
// time, slowly; nothing may vanish in mid-air, every exit needs a whole animation. The plate is cut into layers
// (tools/kv_layers.py); drawn in place they ARE the plate, so the cut at 154 changes nothing.
//  154-162  the plate breathes: the camera eases back from the finale's 6 % push, the three corner groups float a few
//           px outward and back, a light ring leaves the sun every 2 bars, a glint runs along one white line each bar,
//           the snare glints on the plate's own triangles
//  162.5    (pure piano) the white lines are reeled out to the right, a glint riding each line's end; the two small
//           wisps go with them
//  165.9    (chord) the nine triangles fly off outward from the sun one after another, turning
//  169.8    (chord) the upper-left corner (dots, stripes, navy, small cloud) slides out to the upper left
//  174.0    (chord) the right side (streak clouds, dot patches, stripes wedge, clouds) slides out to the right; the sun
//           starts to shrink and drift to (640, 560)
//  178.0    (chord) the left side (cloud tower, dotted arc, cloud bank) slides out to the left; dusk comes
//  179.5    (the loudest chord) the sun has become the small white triangle; the stars come back; at the very end they
//           go out again, so the last frame is the first frame: the triangle alone on navy
const KVLY = {}; for (const d of KV_LAYERS) KVLY[d.id] = d;
const KVX = { lines: 162.94, tris: 165.9, tl: 169.8, right: 174.0, ll: 178.0 };   // r11b (rhythm juror, from the WAV: the first chord is at 162.94, not 162.5)
// r16 (review: the lower-left cloud left far too late: it was still there at 4:08, after the sun had
// shrunk): it leaves on the chord at 171.92 (tools: scratchpad chords.py, strength .78), between the upper left and the
// right, so it is out of frame by ~174.9 as the sun starts to shrink
KVX.ll = 171.92;
const KVX_CH = [162.94, 165.9, 169.8, 171.92, 174.0, 178.0];
// layer id moved by (dx, dy), turned by rot and scaled by sc about (px, py) (default: its own centre)
function kvLayer(g, id, dx = 0, dy = 0, rot = 0, sc = 1, px, py){
  const d = KVLY[id], im = IMG[id]; if (!d || !im || !im.width || sc <= 0) return;
  if (px === undefined){ px = d.gx !== undefined ? d.gx : d.cx !== undefined ? d.cx : d.x + d.w / 2; py = d.gy !== undefined ? d.gy : d.cy !== undefined ? d.cy : d.y + d.h / 2; }
  g.save(); g.translate(px + dx, py + dy); if (rot) g.rotate(rot); if (sc !== 1) g.scale(sc, sc); g.drawImage(im, d.x - px, d.y - py, d.w, d.h); g.restore();
}
// the key visual plate from its layers, dancing: amt 0 = the still plate (identical to plate(g, 'kv'))
// (r13 health: a 10 px push on the kick's instant attack read as a twitch) the envelopes are averaged over 5 frames
// so every push swells in, and the pushes are small
const smoothEnv = (f, t) => (f(t) + f(t - 1 / 60) + f(t - 2 / 60) + f(t - 3 / 60) + f(t - 4 / 60)) / 5;
function kvPlateDance(g, s, amt){
  const k = smoothEnv(kickAt, s.t) * amt, sn = smoothEnv(snareAt, s.t) * amt, bt = Math.floor(s.beat), d = KVLY.kvl_disc;
  kvLayer(g, 'kvl_sky');
  // (r13 advocate: 6-7 px did not read at full screen) 12-14 px, still swelling in over the smoothed envelope
  if (d) kvLayer(g, 'kvl_disc', 0, 0, 0, 1 + .015 * k, d.cx, d.cy);
  kvLayer(g, 'kvl_tl', -12 * k, -9 * k); kvLayer(g, 'kvl_ll', -13 * k, 5 * k); kvLayer(g, 'kvl_right', 14 * k, -4 * k);
  kvLayer(g, 'kvl_w0'); kvLayer(g, 'kvl_w1');
  for (let i = 0, j = 0; i < 9; i++){ if (!KVLY['kvl_t' + i]) continue; kvLayer(g, 'kvl_t' + i, 0, 0, 0, 1 + sn * (j % 3 === bt % 3 ? .22 : .07)); j++; }
  kvLayer(g, 'kvl_lines');
}
function pathY(P, x){ for (let i = 0; i + 1 < P.length; i++){ const a = P[i], b = P[i + 1]; if (x >= a[0] && x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / Math.max(1e-6, b[0] - a[0])); } return null; }
// the triangles leave in order round the sun (clockwise from the upper left)
let KVX_TRI_ = null;
const KVX_TRI = i => (KVX_TRI_ || (KVX_TRI_ = (() => { const o = []; for (let i = 0; i < 9; i++){ const d = KVLY['kvl_t' + i]; if (d) o.push([i, Math.atan2(d.cy - KV_DISC[1], d.cx - KV_DISC[0])]); }
  o.sort((p, q) => ((p[1] + 2.4) % TAU + TAU) % TAU - ((q[1] + 2.4) % TAU + TAU) % TAU); const r = {}; o.forEach(([j], k) => r[j] = k); return r; })()))[i] || 0;   /* lazy: KV_DISC is defined in a later file */
function kvOutro(g, s){
  const b = (s.t - T0) / BAR, go = (k, dur, off = 0) => clamp((b - KVX[k] - off) / dur);
  kvLayer(g, 'kvl_sky');
  // dusk: the sky goes to the bookend navy (the sun, drawn after, keeps its light)
  // r12: and the sky deepens one step on each chord (behind everything, the plate itself unchanged), to navy by 182
  let dusk = 0; const DL = [.11, .22, .33, .44, .56]; for (let i = 0; i < 5; i++) dusk = Math.max(dusk, lerp(i ? DL[i - 1] : 0, DL[i], eio(span(b, KVX_CH[i], KVX_CH[i] + 1.5))));
  dusk = Math.max(dusk, lerp(.56, 1, eio(span(b, 178, 182)))); if (dusk > 0){ g.globalAlpha = dusk; bgFill(g, BOOK_NAVY); g.globalAlpha = 1; }
  { const d = KVLY.kvl_disc, R = OUTRO_R(s.t), [x, y] = OUTRO_XY(s.t), kick = b >= 158 && b < 162 ? .012 * s.k : 0;
    // r11b (visual, fresh eyes: as the plate's disc shrank its uneven collar left two broken arcs, a crescent): from 174 the
    // plate's disc hands over over one bar to a drawn disc with a whole collar
    const pd = 1 - eio(span(b, 172.5, 173.5)); if (R > .5 && pd < 1) discLad(g, x, y, R * (1 + kick), '#42cefb', '#2cbff8', '#10a9f3', '#0b8ef4', .07);
    if (d && R > .5 && pd > 0){ g.globalAlpha = pd; kvLayer(g, 'kvl_disc', x - d.cx, y - d.cy, 0, R / d.R * (1 + kick), d.cx, d.cy); g.globalAlpha = 1; }
    // r12b (visual, fresh eyes: the sun stayed as bright as noon on the dusk sky): it dims with the sky, 40 % as much
    if (R > .5 && dusk > 0){ g.globalAlpha = .2 * dusk;   /* r12c (advocate: 40 % looked dull) 20 % */ circle(g, x, y, R * 1.075 * (1 + kick), BOOK_NAVY); g.globalAlpha = 1; } }
  // r16 (review: at 211 s, entering pure piano had no feeling): 154 is the settling: no flash; one slow, wide cream ring
  // leaves the sun over 2 bars while the sun's face glows and fades (the drums have just frozen for a beat)
  // (r16b fresh eyes: the ring read too thin) 64 px narrowing to 14, opaque at first; the glow .42
  // (r16 audit, fresh eyes: born on the rim, which is at the frame edge, it showed as an edge flash) it is born at .75 R,
  // on the sun's face, so the whole spread stays in view
  // (re-audit, fresh eyes: a 30-60 px opaque white ring popping in at a large radius read as a target, the hardest moment
  // of the film) a soft one: 14 px narrowing to 3, fading in over ~6 frames to .55, then out
  if (b >= 154 && b < 156.5){ const R = OUTRO_R(s.t), [x, y] = OUTRO_XY(s.t), u = (b - 154) / 2.5, r = lerp(R * .75, R + 1500, eout(u));
    if (FIN_VAR === 'N'){ g.globalAlpha = .55 * clamp(u / .04) * (1 - eio(u)); ring(g, x, y, r, r + lerp(14, 3, u), '#fffef2'); }   // r23: the reveal ring in settle replaces it
    const gl = .42 * eout(span(b, 154, 154.25)) * (1 - eio(span(b, 154.25, 156))); if (gl > 0){ g.globalAlpha = gl; const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, '#fffef2'); gr.addColorStop(1, 'rgba(255,254,242,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill(); }
    g.globalAlpha = 1; }
  // 154-162: a light ring leaves the sun every 2 bars (the finale gave one a bar); from 162.5 a softer one on each chord
  if (b >= 156 && b < 162){ const u = b < 158 ? fract((b - 154) / 2) : fract(b - 158);   /* r11b (rhythm juror): one a bar in the kick bars 158-161 */ if (u < .6){ const r = lerp(KV_DISC[2] + 70, KV_DISC[2] + 700, eout(u / .6)); g.globalAlpha = 1 - u / .6; ring(g, KV_DISC[0], KV_DISC[1], r, r + lerp(16, 2, u / .6), '#e7ffff'); g.globalAlpha = 1; } }
  for (const c of KVX_CH){ const u = (b - c) / 1.2; if (u <= 0 || u >= 1) continue; const R = OUTRO_R(s.t), [x, y] = OUTRO_XY(s.t), r = lerp(R + 60, R + 640, eout(u));
    g.globalAlpha = .55 * (1 - u); ring(g, x, y, r, r + lerp(10, 2, u), '#e7ffff'); g.globalAlpha = 1; }
  // the corner groups float outward (never inward: no frame edge may open) and then leave; r11b (health: STILL between
  // the chords) the float goes on through the piano part
  // r11b (fresh eyes: near-still between the chords): each chord also breathes the groups 8 px outward and back
  let brth = 0; for (const c of KVX_CH) brth = Math.max(brth, Math.sin(Math.PI * clamp((b - c) / 2.5)));
  // r14 (rhythm juror: 158-161, the outro's only four-on-the-floor, was not drawn): the groups breathe out on that kick,
  // half the finale's push, faded in at 157.75 and out by 162 (before the first chord's exit)
  const gk = smoothEnv(kickAt, s.t) * eio(span(b, 157.75, 158)) * (1 - eio(span(b, 161.5, 162)));
  // (whole-song pass, fresh eyes: 166-173 read as ~10 s of an unchanging picture) the chord breath is 20 px, so each chord moves the groups visibly
  const fa = 8 * clamp(span(b, 154, 155.5)), fl = ph => fa * (.5 - .5 * Math.cos(s.T * .9 + ph)) + 20 * brth + 7 * gk;
  { const e = eio(go('tl', 3.6)); if (e < 1) kvLayer(g, 'kvl_tl', -.8 * fl(0) - 820 * e, -.6 * fl(0) - 540 * e, -.1 * e); }
  { const e = eio(go('ll', 3.0)); if (e < 1) kvLayer(g, 'kvl_ll', -.9 * fl(2) - 1050 * e, .3 * fl(2) + 60 * e, .05 * e); }
  { const e = eio(go('right', 3.6)); if (e < 1) kvLayer(g, 'kvl_right', fl(4) + 1000 * e, -.2 * fl(4) - 320 * e, -.06 * e); }   // r16 audit: more up-right (its last small cloud read as sinking with the camera's pull-back)
  // the two wisps ride out with the lines
  { const e = ein(go('lines', 2.5)); for (const id of ['kvl_w0', 'kvl_w1']) if (e < 1) kvLayer(g, id, 1500 * e, -60 * e); }
  // the triangles: a small lift, then off outward from the sun, turning
  const sn = snareAt(s.t), bt = Math.floor(s.beat);
  for (let i = 0; i < 9; i++){ const id = 'kvl_t' + i, d = KVLY[id]; if (!d) continue;
    const u = go('tris', 1.3, KVX_TRI(i) * .3), e = ein(u); if (e >= 1) continue;
    const ax = d.cx - KV_DISC[0], ay = d.cy - KV_DISC[1], al = Math.hypot(ax, ay) || 1, fly = 1150 * e;
    // r16 (review: the four-point star glints read stiff): the snare now pops the triangle itself (no star drawn on it)
    const pk = b < KVX.tris && bt % 9 === i ? .16 * sn : 0;
    kvLayer(g, id, ax / al * fly, ay / al * fly, (i % 2 ? 1 : -1) * 3.5 * e, (1 + .25 * Math.sin(Math.PI * clamp(u * 2.5)) + pk) * (1 - .3 * e)); }
  // the lines
  // r16 (review: the star transitions before the exits were stiff and boring; jurors G: no four-point stars, let the lines
  // go like real contrails): from the first chord one line a beat lets go: it is taken back from its tail (left) to its
  // head (right) over 1.5 bars, drifting a little up-right with the wind, and where it is taken away a short wide pale
  // band is left that fades (the contrail spreading out). 154-162 a soft light (not a star) runs along one line a bar.
  { const d = KVLY.kvl_lines; if (d){ const N = d.paths.length;
    if (b < KVX.lines) kvLayer(g, 'kvl_lines');
    else for (let p = 0; p < N; p++){ const P = d.paths[p], st = KVX.lines + p * .25, u = eio(span(b, st, st + 1.5)); if (u >= 1) continue;
      const x0 = P[0][0], x1 = P[P.length - 1][0], xc = lerp(x0 - 40, x1 + 40, u), wx = 70 * u, wy = -18 * u;
      g.save(); g.translate(wx, wy); g.beginPath(); g.rect(xc, -300, W + 400, H + 600); g.clip(); lineBand(g, P, 70); g.clip(); kvLayer(g, 'kvl_lines'); g.restore();
      if (u > 0){ const sp = Math.sin(Math.PI * u); g.save(); g.translate(wx, wy); g.lineCap = 'round'; g.beginPath(); let st0 = false;
        for (let x = Math.max(x0, xc - 170); x <= Math.min(x1, xc); x += 10){ const y = pathY(P, x); if (y === null) continue; st0 ? g.lineTo(x, y) : g.moveTo(x, y); st0 = true; }
        g.strokeStyle = '#e7ffff'; g.globalAlpha = .22 * sp; g.lineWidth = 34; g.stroke(); g.globalAlpha = .3 * sp; g.lineWidth = 12; g.stroke(); g.globalAlpha = 1; g.restore(); } }
    if (b >= 154.25 && b < 162){ const P = d.paths[1 + Math.floor(b) % (N - 1)], v = fract(b), x = lerp(P[0][0], P[P.length - 1][0], eio(v)), y = pathY(P, x), h = Math.sin(Math.PI * v);
      if (y !== null){ g.globalAlpha = .3 * h; circle(g, x, y, 28, '#e7ffff'); g.globalAlpha = .9 * h; circle(g, x, y, 9, '#fffef2'); g.globalAlpha = 1; } } } }
}
// a closed band of half-width hw round the polyline P (for clipping one line of the plate's line layer)
function lineBand(g, P, hw){
  const L = [], Rr = []; for (let i = 0; i < P.length; i++){ const a = P[Math.max(0, i - 1)], c = P[Math.min(P.length - 1, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * hw, ny = dx / l * hw;
    L.push([P[i][0] + nx, P[i][1] + ny]); Rr.push([P[i][0] - nx, P[i][1] - ny]); }
  const e0 = P[0], e1 = P[P.length - 1]; g.beginPath(); g.moveTo(e0[0] - hw, e0[1]); L.forEach(q => g.lineTo(q[0], q[1])); g.lineTo(e1[0] + hw, e1[1]); for (let i = Rr.length - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]); g.closePath();
}
// the outro camera: the finale's 6 % push eased back to 2.5 % by 163, then a slow sway (±9 px, ±.0025 rad) inside that
// margin, so the picture never stands still between the chords; it settles to 1.0 over 176-180 as the frame empties
function outroCam(g, s){
  const b = (s.t - T0) / BAR, m = 1 - eio(span(b, 176, 180)), z = 1 + (.025 + .035 * (1 - eio(span(b, 154, 163))) + .02 * eio(span(b, 163, 176))) * m, sw = clamp(span(b, 154.5, 157)) * m;
  g.translate(W / 2 + 9 * Math.sin(s.t * .21) * sw, H / 2); g.rotate(.0025 * Math.sin(s.t * .17) * sw); g.scale(z, z); g.translate(-W / 2, -H / 2);
}
// ================================================================== r24 OUTRO: "the nine gather the day" (154-184)
// Review (10-09, after r23): after 210 s nothing changed, no story, no interaction; leaving is right but too boring: it
// should be an exit with a story, not pieces leaving slowly one by one; and use our own drawn picture, not the
// original picture. jury_r24_*.md (all four: the picture's own triangles become its gatherers and carry it
// into the night; the flock fuses into a big triangle, scatters into the stars, and the 0:00 triangle is left alone).
// Music (rhythm juror, measured): 154 piano; 157.6 fill; 158-161.63 the groove (161.63 = the song's LAST kick); chords
// 162.94 / 165.9 / 169.8 / 171.92 / 174 / 178; 176.8-179.4 the great pause (.03, two taps 178.0 / 178.75); 179.5 back;
// 181.0 / .25 / .5 / .75 four even hits = the last heartbeat; 182.0 the last hit; then silence.
//  154-157.6  the morning: our own picture; its nine triangles flash in turn on the beats
//  157.6      the nine wake and line up behind the white one at the top line's head
//  158-161.63 the white triangle runs the five white lines (on the beats), reeling each line in behind the flock; on 160 the
//             stripes band is pressed into triangles that join
//  162.94 ... each chord the flock flies to one group, which answers: the upper-left corner folds into triangles and slides
//  171.92     away; the dotted arc slides off whole as its dots peel off and join; the cloud tower rises away; the bank rises
//             and thins while the right clouds leave sideways; the sky darkens a step a chord
//  174-176.8  the flock circles the sun and takes its light: the sun shrinks to nothing, night comes
//  176.8-179.4 the pause: the flock hovers in a slow ring, trembles on the two taps, then fuses into one big triangle
//  179.5      it scatters into the stars (each piece flies to a star and becomes a soft round light)
//  181        four heartbeats: the white triangle that stays steps back to the 0:00 triangle; 182.0 still, to the end
// (r24b rhythm: 159.875 is an empty off-beat; and with a non-integer number of beats the run overshot its line) runs start on
// beats and are normalised to end exactly at the line's end
const OUT_RUN = [[158, 159, 0, 1], [159, 160, 1, -1], [160, 160.5, 2, 1], [160.5, 161.0, 3, -1], [161.0, 161.63, 4, 1]];
const outRunP = (b, b0, b1) => { const nb = (b1 - b0) * 4; return b <= b0 ? 0 : stepEase(clamp((b - b0) / (b1 - b0)) * nb, .75, eio) / stepEase(nb, .75, eio); };
// (r24b rhythm: the last key sat 48 px off the spiral's start) the spiral starts at (1500, 348); the first key is the run's end
// (r24d advocate: the groups left on their chords before the flock had reached them, so nobody saw the flock take them)
// the flock now arrives AT each group ON its chord: the upper-left corner (162.94), the dotted arc's band (165.9), the
// tower (169.8), the bank (171.92), then sweeps the right clouds and climbs towards the setting sun; between them it loops
// over the picture at a steady ~550 px a bar (the old glides crawled at ~220 px a bar and the flock bunched up)
// (r24e self-check / framescan: hairpin turns at the corner and the tower folded the flock back onto itself into a knot)
// every turn is a wide one: the legs in and out stay >= ~250 px apart
const OUT_KEYS = [[161.63, 1900, 900], [162.3, 1000, 560], [162.94, 260, 170], [163.4, 470, 130], [164.2, 1050, 210], [165.0, 1300, 560], [165.9, 360, 700],
  [166.6, 500, 950], [167.5, 1250, 850], [168.3, 1450, 450], [169.0, 900, 220], [169.8, 250, 420], [170.6, 330, 760], [171.3, 650, 980], [171.92, 950, 960],
  [172.8, 1660, 880], [173.4, 1720, 620], [174, 1500, 348]];   /* (r24e advocate) it reaches the right clouds on 172.8, and only then do they leave */
// the sun sets a step a chord (and the spiral at 174 follows it down)
const outSteps = b => esin(span(b, 162.94, 163.94)) + esin(span(b, 165.9, 166.9)) + esin(span(b, 169.8, 170.8)) + esin(span(b, 171.92, 172.92));
// (r24e advocate: from 3:58.4 the disc stood still, only the flock moved) it goes on sinking slowly into the night
// (r24g advocate: by 3:59 the edge had moved only 6 px) 60 px over 173.0-174.6, a step as clear as the chords'
const outSink = b => 40 * outSteps(b) + 60 * esin(span(b, 173.0, 174.6));
// (r24b advocate: a 250 px white "zipper", not nine triangles) they wake at 155.5 and fly a while as nine before taking
// the lines; bigger (the white one 90 px, the others 40-56), spaced wider, and fewer join (19, was 33)
const OUT_WAKE = 155.5;
const OUT_M = (() => { const m = [];
  // (r24d) p = place in the flock: a group that joins takes the places right behind the leader (the rest fall back)
  [1, 0, 2, 3, 4, 5, 6, 7, 8].forEach((i, k) => m.push({ J: OUT_WAKE + k * .06, sx: HOME_TRIS[i][0], sy: HOME_TRIS[i][1], sz: HOME_TRIS[i][2], fz: 40 + 16 * hash(k * 5 + 9), col: HOME_TRIS[i][4], home: i, p: 100 - k }));
  let gi = 0; const add = (J0, n, src, cols) => { gi++; for (let j = 0; j < n; j++){ const a = hash(m.length * 7 + 1), b = hash(m.length * 11 + 2), [sx, sy] = src(j, a, b); m.push({ J: J0 + j * .07, sx, sy, sz: 40 + 16 * hash(m.length * 13 + 3), col: cols[j % cols.length], p: 1000 * gi + 100 - j }); } };
  // (r24d advocate: each group the flock reaches breaks into 4-6 triangles of its own colour that join)
  add(160.5, 3, (j, a, b) => [1700 + 200 * a, 700 + 300 * b], [K.navy, K.royal, '#167cff']);   // the stripes band (the run on line 3 starts in it)
  add(162.94, 4, (j, a, b) => [30 + 280 * a, 30 + 190 * b * (1 - a)], [K.navy, K.royal, '#167cff']);   // the upper-left corner
  // (r24e advocate: the arc shrank away in 0.6 s and only ~3 navy triangles showed) 5, and the arc leaves over 1.9 bars
  add(165.9, 5, (j) => { const an = -Math.PI * (.4 - .3 * j / 4); return [-60 + Math.cos(an) * 600, 1120 + Math.sin(an) * 600]; }, [K.navy, K.white]);   // the dotted arc's band
  add(169.8, 4, (j, a, b) => [60 + 260 * a, 300 + 320 * b], [K.white, '#fffef2']);   // the cloud tower
  add(171.92, 3, (j, a, b) => [620 + 700 * a, 990 + 50 * b], [K.white, '#fffef2']);   // the bank
  add(172.8, 3, (j, a, b) => [1720 + 120 * a, 560 + 480 * b], [K.white, K.mint]);   // the right clouds (r24e advocate: they left before the flock was near)
  // the order in which they are drawn into the leader at the pause: front first
  m.forEach((q, k) => { q.rank = m.filter((o, i) => i > 0 && o.p > q.p).length; });
  return m; })();
const outLines = b => HOME_LINES(B(b) - B(146));
function outRunPos(b){   // the leader on the lines (158-161.63), each run eased beat by beat, with a short blend between runs
  for (let k = 0; k < OUT_RUN.length; k++){ const [b0, b1, li, dir] = OUT_RUN[k]; if (b > b1 && k < OUT_RUN.length - 1) continue;
    const p = outRunP(b, b0, b1), u = dir > 0 ? lerp(.04, .96, p) : lerp(.96, .04, p), pos = outLines(b)[li](u);
    if (k > 0 && b < b0 + .125){ const prev = outRunPos(b0 - 1e-4), w = eio((b - b0) / .125); return [lerp(prev[0], pos[0], w), lerp(prev[1], pos[1], w)]; }
    return pos; }
  return outLines(b)[4](.96); }
// (self-check: a full ring of the flock round the shrinking sun read as a target) it spirals in, taking the sun's light
// (174-176.8); through the pause it drifts in a slow S to the centre (179.4)
// (self-check: three quarters of a ring round the last dot of the sun still read as a target) the spiral ends IN the sun:
// the flock dives into its centre as the sun goes out
// (r24b visual: the tail still curled into a C round the small sun) a third of a turn: it swoops down into the sun
// (r24b rhythm: it turned back on itself at 174) it turns on the way it came (upwards, anticlockwise)
// (r24d) the sun has set by 174: the spiral ends in its sunk centre
// (r24f framescan) it starts at speed and slows into the centre (a sine ease-out), so the leader never stops on 174
function outSpiral(b){ const cy = 540 + outSink(174), a1 = Math.atan2((348 - cy) / .8, 1500 - 960), r1 = Math.hypot(1500 - 960, (348 - cy) / .8);
  // (r24g self-check: a third of a turn at speed curled the flock into a "?" over the small sun) a fifth of a turn
  const f = Math.sin(Math.PI / 2 * span(b, 174, 176.8)), a = a1 - TAU * .2 * f, r = r1 * (1 - f); return [960 + Math.cos(a) * r, 540 + outSink(b) + Math.sin(a) * r * .8]; }
let OUT_V0 = null;
function outV0(){ if (!OUT_V0){ const p = outSpiral(174), q = outSpiral(174.001); OUT_V0 = [(q[0] - p[0]) / .001, (q[1] - p[1]) / .001]; } return OUT_V0; }   // px a bar
function outLead(b){   // the leader's path through the whole outro
  if (b < OUT_WAKE) return [HOME_TRIS[1][0], HOME_TRIS[1][1]];
  // (r24b) 155.5-158: the nine fly a loop over the morning picture, then take the top line's head on 158
  if (b < 158){ const s0 = outLines(158)[0](.04), P = [[OUT_WAKE, HOME_TRIS[1][0], HOME_TRIS[1][1]], [156.4, 820, 300], [157.2, 1260, 560], [157.7, 700, 360], [158, s0[0], s0[1]]];
    let i = 0; while (i + 2 < P.length && b >= P[i + 1][0]) i++; const n = P.length, h = P[i + 1][0] - P[i][0], u = clamp((b - P[i][0]) / h), u2 = u * u, u3 = u2 * u;
    const tan = (m, j) => m <= 0 || m >= n - 1 ? 0 : .5 * (P[m + 1][j] - P[m - 1][j]) / (P[m + 1][0] - P[m - 1][0]);
    return [1, 2].map(j => (2 * u3 - 3 * u2 + 1) * P[i][j] + (u3 - 2 * u2 + u) * h * tan(i, j) + (-2 * u3 + 3 * u2) * P[i + 1][j] + (u3 - u2) * h * tan(i + 1, j)); }
  if (b < 161.63) return outRunPos(b);
  if (b < 174){ let i = 0; while (i + 2 < OUT_KEYS.length && b >= OUT_KEYS[i + 1][0]) i++; const re = outLines(161.63)[4](.96), P = [[161.63, re[0], re[1]], ...OUT_KEYS.slice(1)], n = P.length, h = P[i + 1][0] - P[i][0], u = clamp((b - P[i][0]) / h), u2 = u * u, u3 = u2 * u;
    // (r24f framescan: the leader all but stopped on 174 and the flock piled up behind it) the last key carries the spiral's
    // own starting speed, so it flies straight on into it
    const tan = (m, j) => m <= 0 ? 0 : m >= n - 1 ? outV0()[j - 1] : .5 * (P[m + 1][j] - P[m - 1][j]) / (P[m + 1][0] - P[m - 1][0]);
    return [1, 2].map(j => (2 * u3 - 3 * u2 + 1) * P[i][j] + (u3 - 2 * u2 + u) * h * tan(i, j) + (-2 * u3 + 3 * u2) * P[i + 1][j] + (u3 - u2) * h * tan(i + 1, j)); }
  if (b < 176.8) return outSpiral(b);
  const P = [[176.8, 960, 540 + outSink(176.8)], [177.8, 700, 400], [178.6, 1220, 640], [179.4, 960, 540]];
  let i = 0; while (i + 2 < P.length && b >= P[i + 1][0]) i++; const u = clamp((b - P[i][0]) / (P[i + 1][0] - P[i][0])), e = esin(u);
  return [lerp(P[i][1], P[i + 1][1], e) + Math.sin(Math.PI * u) * (i % 2 ? -60 : 60), lerp(P[i][2], P[i + 1][2], e)]; }
// (r24d advocate: on the slow glides the flock bunched into a ~150 px rope) the members keep their distance ALONG the
// leader's path (OUT_GAP px a place), two abreast in a zig-zag (OUT_LAT px either side), not a delay in time. On the line
// runs (158-161.63) the old delay rules (the leader steps on the beats; by distance the whole flock would stop with it),
// and into the spiral it eases back to the delay, so the flock closes up as it dives into the sun
const OUT_GAP = 44, OUT_LAT = 36, OUT_DMIN = .04, OUT_DT = 1 / 480;
let OUT_ARC = null;
function outArc(){ if (OUT_ARC) return OUT_ARC; const n = Math.ceil((182 - OUT_WAKE) / OUT_DT) + 1, S = new Float64Array(n); let p = outLead(OUT_WAKE);
  for (let i = 1; i < n; i++){ const q = outLead(OUT_WAKE + i * OUT_DT); S[i] = S[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return (OUT_ARC = S); }
const outArcAt = b => { const S = outArc(), f = clamp((b - OUT_WAKE) / OUT_DT, 0, S.length - 1), i = Math.min(S.length - 2, Math.floor(f)); return S[i] + (S[i + 1] - S[i]) * (f - i); };
function outTimeAt(d){   // when the leader had flown d px (before its start, as if at 900 px a bar)
  const S = outArc(); if (d <= 0) return OUT_WAKE + d / 900; if (d >= S[S.length - 1]) return 182;
  let lo = 0, hi = S.length - 1; while (hi - lo > 1){ const m = (lo + hi) >> 1; if (S[m] <= d) lo = m; else hi = m; }
  return OUT_WAKE + (lo + (S[hi] > S[lo] ? (d - S[lo]) / (S[hi] - S[lo]) : 0)) * OUT_DT; }
function outSlot(b, slot){   // where the member `slot` places behind the leader is at bar b
  // (self-check: still spaced by distance at 176, the tail curled a C round the shrinking sun) in the spiral the spacing
  // shrinks, and from 175.4 it eases to a delay (the pause's leader stops at each turn: by distance the flock would too)
  // (r24g advocate: at 4:02-4:03 the flock shrank to half its area for a whole second) the spacing keeps 60 %, and the
  // pause's delay is .07 a place (the leader slows to a stop in the sun; .04 piled them up)
  const pz = esin(span(b, 175.4, 176.4)), dp = lerp(OUT_DMIN, .07, pz);
  const run = eio(span(b, 157.7, 158)) * (1 - eio(span(b, 161.63, 162.1))), dmax = lerp(.3, dp, pz), gap = OUT_GAP * (1 - .4 * esin(span(b, 174, 175.8)));
  const ba = clamp(outTimeAt(outArcAt(b) - slot * gap), b - slot * dmax, b - slot * dp), bk = lerp(ba, b - slot * OUT_DMIN, run);
  const [x, y] = outLead(bk), sk = outArcAt(bk), p0 = outLead(outTimeAt(sk - 14)), p1 = outLead(outTimeAt(sk + 14)), dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy);
  const lat = OUT_LAT * Math.cos(Math.PI * slot) * clamp(slot) * clamp(sk / 80);
  return l > .5 ? [x - dy / l * lat, y + dx / l * lat] : [x, y]; }
// the big triangle's lattice (where the members gather on 178.75-179.4)
const outLattice = (k, n) => { const rows = 7, row = Math.floor(Math.sqrt(2 * k)), col = k - row * (row + 1) / 2, sp = 46; return [960 + (col - row / 2) * sp, 540 - 120 + row * sp * .87]; };
const homeLeave = u => 1 - Math.cbrt(esin(u));   // homeShot's (1 - eout(a)) displacement = a sine in-out on the way out
// ================================================================== r28 OUTRO: "the picture stacks into one triangle"
// Review (10-09, after r26b): from 3:34 to the end it was only small triangles chasing, too long, awkward; the story does not
// have to be a chase. Replace the gathering with what 1:04 does, first a big triangle, then one triangle, but this time
// not a ring of triangles: triangles stacked on one another into a triangle. Decided: no chase at all;
// then (refined): not so regular: on B (up and down triangles filling it), the gaps free and moving, just not too
// big, like 1:04's picture, but smaller triangles and some inside too. So: a 7-row triangular grid (edge 80) of 49
// up / down triangles, each a little smaller than its cell, a little off and turned, drifting, cream and mint; after the
// fuse keep the burst into stars. Every piece flies ONCE, straight (a slight bow), about a bar, to its place; the whole
// picture is taken apart into it, a row a music event:
//  158-161.5  (the last drums) eight of the nine leave home one a beat, and the stripes band gives five: row 1 (13)
//  162.94     the corner gives row 2 (11); 165.9 the dotted arc row 3 (9); 169.8 the rising tower row 4 (7); 171.92 the
//             bank row 5 (5); 172.6 the right clouds row 6 (3); the sun sets (as before)
//  173 -> 174 the white one flies up and crowns it on the 174 chord; night falls
//  178.0      the first tap: a tremble, the gaps start to close; 178.75 the second tap: one shake, fused into one triangle
//  179.625    the music comes back: it bursts into the stars; the white crown stays and, on the four heartbeats, steps
//             back to the 0:00 triangle (still from 182)
// (?out=F keeps r24-r26's flock version)
const OUT_VAR = (typeof Q !== 'undefined' && Q.get('out')) || 'S';
// (jury_r28_advocate proposed edge 68 and the centre at x 820; the review kept r28's size and place)
const OUT_SP = 80, OUT_SH = OUT_SP * Math.sqrt(3) / 2, OUT_ROWS = 7, OUT_CX = 960;   // the grid: edge 80, 7 rows
// slots [row, up 1 / down 0, index]: per row the up triangles and, between them, the down ones (49 in all)
const OUT_SLOTS = (() => { const r = []; for (let row = 0; row < OUT_ROWS; row++){ const nu = OUT_ROWS - row; for (let c = 0; c < nu; c++){ r.push([row, 1, c]); if (c < nu - 1) r.push([row, 0, c]); } } return r; })();
// the grid is 10 % wider while the gaps are open (gp 1) and exact once closed (gp 0); centred on (OUT_CX, 560)
// (jury_r28_advocate: some pieces touch / overlap; a numeric check found none at grid +18 %, sizes .7-.84, +-3 px,
// +-.2 rad, but that is a stiffer look than the r28 that was approved as it is, so r28's looseness stays)
const outGrid = gp => { const sp = OUT_SP * (1 + .1 * gp), rh = OUT_SH * (1 + .1 * gp); return [sp, rh, 560 + OUT_ROWS * rh / 2]; };
function outSlotXY(k, gp){ const [row, up, c] = OUT_SLOTS[k], nu = OUT_ROWS - row, [sp, rh, base] = outGrid(gp), yb = base - row * rh;
  return [OUT_CX + (up ? c - (nu - 1) / 2 : c + .5 - (nu - 1) / 2) * sp, yb - (up ? rh / 3 : 2 * rh / 3)]; }
const EQ_T = [[0, -2 / 3 * OUT_SH], [OUT_SP / 2, OUT_SH / 3], [-OUT_SP / 2, OUT_SH / 3]];   // (absolute px, centroid at 0)
// (jury_r28_advocate: 3:49.7-3:53.4 only the gaps moved) the tower starts to lift from 167 (120 px by 169.8, esin) and
// then rises away on its chord as before
const outTowerY = b => -(120 * esin(span(b, 167, 169.8)) + 1130 * esin(span(b, 169.8, 172.0)));
// where each group sits now (the pieces come out of the group as it leaves): homeShot's own displacements
const OUT_SRC = {
  stripes: b => [560 * esin(span(b, 160.5, 161.7)), 420 * esin(span(b, 160.5, 161.7))],
  corner: b => [-420 * esin(span(b, 162.94, 164.3)), -320 * esin(span(b, 162.94, 164.3))],
  arc: b => [-800 * esin(span(b, 165.9, 167.8)), 620 * esin(span(b, 165.9, 167.8))],
  tower: b => [0, outTowerY(b)],
  bank: b => [-2300 * esin(span(b, 171.92, 174.92)), 0],
  right: b => [950 * esin(span(b, 172.8, 174.2)), 0] };
const OUT_P = (() => { const P = [], bySlotRow = row => OUT_SLOTS.map((q, k) => k).filter(k => OUT_SLOTS[k][0] === row).sort((p, q) => outSlotXY(p, 0)[0] - outSlotXY(q, 0)[0]);
  const group = (row, list) => { const slots = bySlotRow(row), L2 = list.slice().sort((p, q) => p.rx - q.rx); L2.forEach((it, i) => { it.slot = slots[i]; P.push(it); }); };
  const pick = (n, J0, dJ, src, at, cols) => Array.from({ length: n }, (_, j) => { const a = hash(P.length * 7 + j * 3 + 1), bb = hash(P.length * 11 + j * 5 + 2), [rx, ry] = at(j, a, bb); return { J: J0 + j * dJ, rx, ry, src, col: cols[j % cols.length] }; });
  // row 1: eight of the nine, one a beat on the last drums, and five from the stripes band
  // (jury_r28_rhythm) the stripes' five land on the 161.5-161.75 fill (dJ .0625; at .1 two landed after the drums stopped);
  // the arc's nine are spread to land through the phrase's three heaviest piano notes (168.25 / .75 / 169.25: dJ .2); the
  // right clouds' chord is 172.8125 (not 172.6), their three roll in on sixteenths into the crown on 174.0
  group(0, [...[3, 8, 2, 7, 0, 6, 5, 4].map((h, i) => ({ home: h, J: 158 + i * .25, rx: HOME_TRIS[h][0] })), ...pick(5, 160.5, .0625, 'stripes', (j, a, bb) => [1680 + 220 * a, 720 + 320 * bb], [K.navy, K.royal, '#167cff'])]);
  group(1, pick(11, 162.94, .09, 'corner', (j, a, bb) => [30 + 280 * a, 30 + 190 * bb * (1 - a)], [K.navy, K.royal, '#167cff']));
  group(2, pick(9, 165.9, .2, 'arc', j => { const an = -Math.PI * (.4 - .3 * j / 8); return [-60 + Math.cos(an) * 600, 1120 + Math.sin(an) * 600]; }, [K.navy, K.white]));
  group(3, pick(7, 169.8, .12, 'tower', (j, a, bb) => [60 + 260 * a, 300 + 320 * bb], [K.white, '#fffef2']));
  group(4, pick(5, 171.92, .12, 'bank', (j, a, bb) => [620 + 700 * a, 990 + 50 * bb], [K.white, '#fffef2']));
  group(5, pick(3, 172.8125, .0625, 'right', (j, a, bb) => [1720 + 120 * a, 560 + 480 * bb], [K.white, K.mint]));
  group(6, [{ home: 1, J: 173, rx: 960, lead: true }]);   // the white one, the crown on 174
  // each piece's own looseness: a smaller size, an offset and a turn (the gaps free, not a lattice)
  // (self-check: at +-5 px and +-.2 rad it still read as a lattice) looser, like 1:04's picture: +-11 px, +-.5 rad, .68-.9
  P.forEach((q, n) => { q.sz = .68 + .22 * hash(n * 5 + 7); q.jx = (hash(n * 13 + 1) - .5) * 22; q.jy = (hash(n * 17 + 2) - .5) * 18; q.jr = (hash(n * 19 + 3) - .5) * 1.0;
    q.colL = OUT_SLOTS[q.slot][1] ? (hash(n * 23) < .35 ? K.mint : '#fffef2') : (hash(n * 29) < .35 ? '#fffef2' : K.mint); });
  return P; })();
// a triangle given as three absolute vertices, morphing from A to B (w 0..1), turned by rot, at (x, y)
function polyAt(g, x, y, A, B, w, rot, sc, col){ const c = Math.cos(rot), sn = Math.sin(rot); g.beginPath();
  for (let i = 0; i < 3; i++){ const vx = lerp(A[i][0], B[i][0], w) * sc, vy = lerp(A[i][1], B[i][1], w) * sc, px = x + vx * c - vy * sn, py = y + vx * sn + vy * c; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.fillStyle = col; g.fill(); }
// a key-visual triangle shape (TRI or TRIS[k]) as absolute vertices of size s (x squashed by fx, as tri()'s flip does)
const shapeOf = (P, s, fx = 1) => [[P[0] * s * fx, P[1] * s], [P[2] * s * fx, P[3] * s], [P[4] * s * fx, P[5] * s]];
function outroStack(g, s, b, sH, hp){
  // (jury_r28_advocate: closing, pieces overlapped: they grew while still turned) the close is two moves: first the turns
  // and offsets go (178.0-178.4, jg), then the grid shrinks as the pieces grow into their cells (178.3-178.75, gp)
  const jg = 1 - eio(span(b, 178, 178.4)), gp = 1 - eio(span(b, 178.3, 178.75)), sway = 6 * Math.sin(sH.T * .6), fuse = eout(span(b, 178.75, 178.83)), burst = b >= 179.625;
  const shake = b >= 178.75 && b < 179 ? 12 * Math.sin((b - 178.75) * 900) * (1 - eout(span(b, 178.75, 178.9))) : 0;
  const trem = b >= 178 && b < 178.75 ? 5 * Math.sin((b - 178) * 900) * Math.exp(-(b - 178) * 14) : 0;
  const scat = span(b, 179.625, 180.875), HB = [181, 181.3125, 181.5, 181.75], HB5 = [...HB, 182];
  const hs = HB.reduce((a, h) => a + eio(span(b, h, h + .15)), 0) / 4, pls = HB5.reduce((a, h) => a + (b >= h ? .15 * Math.exp(-(b - h) * 20) : 0), 0);
  // (jury_r28_rhythm: the third tap, 179.5 (snare .91), had no answer; 178.84-179.62 stood still for 1.07 s) on 179.5 the
  // one triangle cracks: it is the 49 cream tiles again, each drawing in to .96 (~3 px cracks), and on 179.625 they burst
  const crack = b >= 179.5 ? eout(span(b, 179.5, 179.56)) : 0;
  // the one big triangle (178.75-179.5): exactly the closed grid's outline
  if (fuse > 0 && b < 179.5){ const [sp, rh, base] = outGrid(0), br = 1 + .015 * Math.sin((b - 178.75) * 9), V = [[0, -OUT_ROWS * rh * 2 / 3], [OUT_ROWS * sp / 2, OUT_ROWS * rh / 3], [-OUT_ROWS * sp / 2, OUT_ROWS * rh / 3]];
    polyAt(g, OUT_CX + shake, base - OUT_ROWS * rh / 3 + sway, V, V, 0, 0, fuse * br, '#fffef2'); }
  // (a down cell is the up shape turned half a turn, so in flight a piece turns into it instead of folding through a line)
  for (let n = OUT_P.length - 1; n >= 0; n--){ const P = OUT_P[n]; if (b < P.J) continue; const k = P.slot, up = OUT_SLOTS[k][1], land = P.J + 1, colL = P.colL, T = EQ_T, flipR = up ? 0 : Math.PI;
    // its place: the cell's centre, loosened while the gaps are open (an offset, a turn, a smaller size, a slow drift)
    let [tx, ty] = outSlotXY(k, gp); tx += jg * (P.jx + 7 * Math.sin(sH.T * .7 + n)) + shake + trem * (n % 2 ? 1 : -1); ty += jg * (P.jy + 6 * Math.cos(sH.T * .6 + 1.3 * n)) + sway;
    const jr = jg * (P.jr + .2 * Math.sin(sH.T * .5 + .7 * n)), szL = lerp(1, P.sz, gp);
    // where it comes from, and its shape there
    let sx, sy, A, r0 = 0, col0 = P.col, g0 = 1;
    if (P.home !== undefined){ const [hx, hy, hr] = hp(P.home), H = HOME_TRIS[P.home]; sx = hx; sy = hy; r0 = hr; col0 = H[4]; A = shapeOf(TRI, H[2], Math.cos(Math.sin(sH.T * .5 + P.home) * .08 * TAU) || .02); }
    else { const [ox, oy] = OUT_SRC[P.src](Math.min(b, land)); sx = P.rx + ox; sy = P.ry + oy;   // (out of the group where it is now)
      A = shapeOf(TRIS[3], 36); r0 = hash(n * 3) * TAU; g0 = eback(clamp((b - P.J) * 4)); }   // (grows out of its group over a quarter bar)
    const e = esin(span(b, P.J, land)), bow = .12 * Math.sin(Math.PI * e);
    let x = lerp(sx, tx, e) - (ty - sy) * bow, y = lerp(sy, ty, e) + (tx - sx) * bow;
    const settle = 1 + .1 * Math.sin(Math.PI * clamp((b - land) / .3)) * (b >= land ? 1 : 0), col = lerpCol(col0, colL, clamp((b - P.J - .6) / .6));
    const sc = g0 * settle * (1 - fuse * (burst ? 0 : 1)), rot = lerp(r0, jr + flipR, e), B2 = T.map(([vx, vy]) => [vx * szL, vy * szL]);
    if (b >= 179.5 && !burst){ const [cx0, cy0] = outSlotXY(k, 0); polyAt(g, cx0 + shake, cy0 + sway, T, T, 0, flipR, 1 - .04 * crack, '#fffef2'); continue; }   // the crack
    if (burst){ const [cx0, cy0] = outSlotXY(k, 0);
      if (P.lead){ // the crown stays, and steps back to the 0:00 triangle on the four heartbeats (its shape turns into TRIS[3])
        const Bk = shapeOf(TRIS[3], BOOK_TRI[2]); polyAt(g, lerp(cx0, BOOK_TRI[0], hs), lerp(cy0 + sway, BOOK_TRI[1], hs), EQ_T, Bk, hs, lerp(0, BOOK_TRI[3], hs), (1 + pls) * lerp(.96, 1, hs), '#fffef2'); continue; }
      // the rest burst into the stars (as before: one in four as a triangle that turns into a light, the rest as soft lights)
      const st = OUTRO_ST[n % OUTRO_ST.length], ee = eout(scat); x = lerp(cx0, st.x, ee); y = lerp(cy0 + sway, st.y, ee);
      // (r28 framescan: 3/4 of the pieces turned into lights on the burst frame, the big cream triangle gone in one frame, 267
      // blocks) every piece starts as itself, full size and cream like the fused triangle (the 49 tile it exactly), and
      // shrinks into its light as it flies (one in four keeps its triangle a little longer)
      const out = 1 - eio(span(s.t, 250.9, 252.3)), shard = n % 4 === 1, tr = 1 - eio(span(scat, shard ? .1 : 0, shard ? .35 : .2)), gl = eio(span(scat, shard ? .2 : .05, shard ? .4 : .25));
      if (gl > 0) softGlow(g, x, y, (st.r + .8) * 2.6 * lerp(1.4, 1, ee), (.9 - .3 * st.o) * out * gl);
      if (tr > 0) polyAt(g, x, y, T, T, 0, flipR + (hash(n * 31) - .5) * 2 * eio(span(scat, 0, .35)), .96 * tr, lerpCol('#fffef2', colL, eio(span(scat, 0, .2))));
      continue; }
    if (sc > .01) polyAt(g, x, y, A, B2, e, rot, sc, col); }
}
function outroNew(g, s){
  const b = (s.t - T0) / BAR, sH = homeS(s), bt = Math.floor(s.beat);
  // the sky: day, darkening a step a chord, night from 174 to 177.8
  skyBg(g, 960, 540);
  const steps = outSteps(b), nt = .14 * steps + .1 * esin(span(b, 173.0, 174.6)) + .12 * esin(span(b, 174.6, 176.8)) + .22 * esin(span(b, 176.8, 177.8));
  if (nt > 0){ g.globalAlpha = nt; nightSky(g); g.globalAlpha = 1; }
  { const rv = eout(span(b, 174, 178)), out = 1 - eio(span(s.t, 250.9, 252.3)); if (rv > 0 && out > 0) drawStars(g, s, rv, rv * .8 * out); }
  // our own picture, its groups answering the flock
  const discR = 720 * (1 - esin(span(b, 174, 176.8)));
  // (r28: the stack takes each home triangle at its own J; before 158 they flash in turn on the beats)
  const triS = OUT_VAR === 'F' ? i => { const m = OUT_M.find(q => q.home === i); if (m && b >= m.J) return 0; return 1 + (b < OUT_WAKE && bt % 9 === i ? .15 * Math.exp(-fract(s.beat) * 4) : 0); }
    : i => { const m = OUT_P.find(q => q.home === i); if (m && b >= m.J) return 0; return 1 + (b < 158 && bt % 9 === i ? .15 * Math.exp(-fract(s.beat) * 4) : 0); };
  // (r24b advocate: the disc, 80 % of the frame, stayed one colour for 27 s while only the sky's edge darkened) the disc
  // darkens with the sky, a step a chord
  // (r24d advocate: the disc, ~70 % of the frame, was still RGB(51,197,248) at 3:43.5 and only 22 % darker by 3:59.5)
  // the sun sets: a step down a chord (160 px, 15 % of the frame, by 172.92) and darker each time, to ~RGB(12,110,205)
  // (the sky darkens a step too, so the sun never turns darker than it)
  const dd = .21 * steps + .15 * esin(span(b, 173.0, 174.6));
  // (r24d advocate: "only the flock moves") the clouds that stay float gently, each on its own one-bar swell
  const sw = i => 12 * Math.sin(TAU * (b - 154) + i * 2.1);
  homeShot(g, sH, { noSky: true, noDisc: discR < 1, discDim: dd, discXY: [960 + Math.sin(sH.T * .2) * 10, 540 + outSink(b)], discR: discR > 1 ? discR * (1 + .012 * pulse(s.beat, 5) * (b >= 158 && b < 161.7 ? 1 : 0)) : 0, tlDots: 0, lines: 0, tris: 1, triScale: triS,
    stripes: homeLeave(span(b, 160.5, 161.7)), corners: homeLeave(span(b, 162.94, 164.3)), arc: homeLeave(span(b, 165.9, 167.8)), arcSlide: true, stripeEvery: 2,   /* (r24 framescan: stepping every beat in the groove flagged a notch a beat; every 2 beats glides) */
    // (r24b visual: thinning, the bank became a translucent ghost over the flock, a "blurry overlap") it stays opaque
    // and leaves to the left as the right clouds leave to the right
    cloudFx: { tower: [0, outTowerY(b) + sw(0), 1],   /* (r24 framescan: rising out at ~15 px a frame) over 2.2 bars, ~11 */ bank: [-2300 * esin(span(b, 171.92, 174.92)), -30 * esin(span(b, 171.92, 174.92)) + sw(1) * .7, 1] /* (r24c framescan: ~19 px a frame) over 3 bars, ~15 */, right: [950 * esin(span(b, 172.8, 174.2)), sw(2), 1] } });
  // the white lines, reeled in behind the flock as it runs them (158-161.63)
  { const HL = outLines(b); HL.forEach((f, i) => { const run = OUT_RUN.find(r => r[2] === i), [b0, b1, , dir] = run; if (b >= b1) return;
      const p = outRunP(b, b0, b1), u = dir > 0 ? lerp(.04, .96, p) : lerp(.96, .04, p);
      const lo = dir > 0 ? (b < b0 ? 0 : u) : 0, hi = dir > 0 ? 1 : (b < b0 ? 1 : u); if (hi - lo > .005) swoosh(g, f, lo, hi, HOME_LW[i]); }); }
  // r28 (review: no chase): the picture is taken apart into one stacked triangle (outroStack); ?out=F keeps the flock
  if (OUT_VAR !== 'F'){ const hpS = i => { const t = sH.T, P = HOME_TRIS[i]; return [P[0] + Math.sin(t * .9 + i) * 6, P[1] + Math.cos(t * .8 + i) * 6, P[3] + Math.sin(t * .6 + i) * .1]; };
    outroStack(g, s, b, sH, hpS); meteor(g, 1700, 60, Math.PI - .32, 2300, 520, span(b, 179.6, 180.9), 6, true, '#9ee9ff'); return; }
  // the flock: each member follows the leader's path a little behind the one before; joiners fly from their piece to their
  // place in the line; at the pause they gather into the big triangle, at 179.5 they scatter into the stars
  // (self-check: a lattice under the big triangle did not line up with it) the members are drawn into the leader one after
  // another (178.6-179.4) and it grows with each; at 179.5 they burst back out of it to the stars
  const N = OUT_M.length, scat = span(b, 179.625, 180.875), absorbAt = k => 178.6 + .6 * OUT_M[k].rank / (N - 2);
  const [ldx, ldy] = outLead(b);
  const hp = i => { const t = sH.T, P = HOME_TRIS[i]; return [P[0] + Math.sin(t * .9 + i) * 6, P[1] + Math.cos(t * .8 + i) * 6, P[3] + Math.sin(t * .6 + i) * .1]; };   // a home triangle as homeShot draws it
  // each member's place: 1 + the members in front of it that have joined and are not yet drawn into the leader
  const inF = OUT_M.map((M, k) => k ? eio(span(b, M.J, M.J + .5)) * (1 - eio(span(b, absorbAt(k), absorbAt(k) + .2))) : 0);
  for (let k = N - 1; k >= 1; k--){ const M = OUT_M[k]; if (b < M.J) continue;
    let slot = 1; for (let i = 1; i < N; i++) if (OUT_M[i].p > M.p) slot += inF[i];
    let [x, y] = outSlot(b, slot); const j = eio(span(b, M.J, M.J + .5)), src = M.home !== undefined ? hp(M.home) : [M.sx, M.sy]; x = lerp(src[0], x, j); y = lerp(src[1], y, j);
    const ab = eio(span(b, absorbAt(k), absorbAt(k) + .2)); x = lerp(x, ldx, ab); y = lerp(y, ldy, ab);
    if (scat <= 0 && ab >= 1) continue;
    // (r24b, fresh eyes: ~50 white shards sprayed round the centre read as confetti) only one in four leaves as a triangle,
    // and it turns into a round light within a third of the burst; the rest leave as soft lights; all settle as stars
    if (scat > 0){ const st = OUTRO_ST[k % OUTRO_ST.length], e = eout(scat); x = lerp(960, st.x, e); y = lerp(540, st.y, e);
      const out = 1 - eio(span(s.t, 250.9, 252.3)), shard = k % 4 === 1, tr = shard ? 1 - eio(span(scat, .1, .35)) : 0, gl = shard ? eio(span(scat, .2, .4)) : eio(span(scat, 0, .15));
      if (gl > 0) softGlow(g, x, y, (st.r + .8) * 2.6 * lerp(1.4, 1, e), (.9 - .3 * st.o) * out * gl);
      if (tr > 0) triK(g, x, y, M.sz * .7 * tr, s.T * 2 + k, 0, '#fffef2', 3); continue; }
    const tremble = b >= 178 && b < 179 ? 1 + .15 * (Math.exp(-Math.max(0, b - 178) * 30) + Math.exp(-Math.max(0, b - 178.75) * 30) * (b >= 178.75 ? 1 : 0)) : 1;
    // (r24b visual: an all-white flock vanished over the white clouds) each keeps a colour of its own (navy ones lighten to
    // azure, so they still read in the night)
    const OC = ['#fffef2', K.mint, '#9ee9ff', K.azure], tc = OC[k % 4], col = lerpCol(M.col.length === 7 ? M.col : tc, M.col === K.navy || M.col === K.royal ? K.azure : (M.home !== undefined ? M.col : tc), clamp((b - M.J - .5) / 1.5));
    if (M.home !== undefined){ const rot = lerp(hp(M.home)[2], s.T * .8 + k, j), sz = lerp(M.sz, M.fz, j) * (1 - ab) * tremble; tri(g, x, y, sz, rot, Math.sin(sH.T * .5 + M.home) * .08 * (1 - j), col); }
    else triK(g, x, y, M.sz * .85 * (1 - ab) * tremble * eback(clamp((b - M.J) * 3)), s.T * .8 + k + (1 - j) * 2, 0, col, 3); }   /* (r24e framescan) grows out of its group over a third of a bar */
  // the leader: the white triangle; through the fuse it becomes the big triangle; after the scatter it steps back, one
  // heartbeat at a time (181.0 / .25 / .5 / .75), to the 0:00 triangle, still from 182.0
  // (r24b rhythm, re-measured: the heartbeat hits are 181.0, 181.3125, 181.5, 181.75 and the last on 182.0) one step on
  // each of the four, a last small pulse on 182.0, then still; the burst is on 179.625 (179.5 is only a light pickup)
  const HB = [181, 181.3125, 181.5, 181.75], HB5 = [...HB, 182];
  { const hs = HB.reduce((a, h) => a + eio(span(b, h, h + .15)), 0) / 4, pls = HB5.reduce((a, h) => a + (b >= h ? .15 * Math.exp(-(b - h) * 20) : 0), 0), w0 = eio(span(b, OUT_WAKE, OUT_WAKE + .5));
    let [x0, y0] = outLead(b); const h1 = hp(1); x0 = lerp(h1[0], x0, w0); y0 = lerp(h1[1], y0, w0);
    const x = lerp(x0, BOOK_TRI[0], hs), y = lerp(y0, BOOK_TRI[1], hs), lead = lerp(HOME_TRIS[1][2], 90, w0);
    let absorbed = 0; for (let k = 1; k < N; k++) absorbed += eio(span(b, absorbAt(k), absorbAt(k) + .2));
    const big = (absorbed / (N - 1)) * (1 - eio(span(b, 179.625, 180.375))), base = lerp(lerp(lead, 300, big), 120, b >= 179.625 ? eio(span(b, 179.625, 180.375)) : 0);
    const sz = (b >= 179.5 ? lerp(base, BOOK_TRI[2], hs) : base) * (1 + pls), rot = lerp(lerp(h1[2], s.T * .4, w0), BOOK_TRI[3], b >= 179.4 ? eio(span(b, 179.4, 182)) : 0);
    // (it keeps the picture's own triangle shape until the fuse, where it turns into the 0:00 triangle's shape)
    // (r24b, fresh eyes: changing shape at 179.0 showed a ghost and a notched edge) it changes in the burst itself
    const sh = eio(span(b, 179.625, 179.745));
    // (self-check: cross-faded, the two shapes showed as a pale double) one shrinks as the other grows, both opaque
    if (b >= OUT_WAKE){ if (sh < 1) tri(g, x, y, sz * (1 - sh), rot, 0, K.white); if (sh > 0) triK(g, x, y, sz * sh, rot, 0, K.white, 3); } }
  // one mint meteor as the stars come out (as at 0:02)
  meteor(g, 1700, 60, Math.PI - .32, 2300, 520, span(b, 179.6, 180.9), 6, true, '#9ee9ff');
}
// r23: the last night's frozen frame (finale at 154 - half a frame), rendered once per canvas size with settle's base transform
let FIN_FROZ = null;
function finFrozen(g){ const cw = g.canvas.width, ch = g.canvas.height; if (FIN_FROZ && FIN_FROZ.width === cw && FIN_FROZ.height === ch) return FIN_FROZ;
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; const x = c.getContext('2d'); x.setTransform(g.getTransform());
  const iF = STORY.findIndex(q => q[0] === 'finale'); SC_.finale(x, stateFor(iF, B(154) - .5 / 60)); return (FIN_FROZ = c); }
SC_.settle = (g, s) => {
  const L = s.lbar;
  if (FIN_VAR !== 'N'){   // r24: the outro is our own picture and the nine's story; 154 opens it from the frozen night
    g.save(); outroCam(g, s); outroNew(g, s); g.restore();
    if (L < 2.5){ const b = (s.t - T0) / BAR, x = 960, y = 540, u = span(b, 154.25, 156.25), rs = finSun(8)[2] * .98, r = lerp(rs, 720 + 1500, eio(u)), fa = 1 - eio(span(b, 154, 154.4));
      if (u < 1){ const off = finFrozen(g);
        g.save(); outroCam(g, s); g.beginPath(); g.rect(-4000, -4000, 8000, 8000); g.arc(x, y, r, 0, TAU, true); g.clip('evenodd'); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(off, 0, 0); g.restore();
        if (fa > 0){ g.save(); outroCam(g, s); g.beginPath(); g.arc(x, y, rs, 0, TAU); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = fa; g.drawImage(off, 0, 0); g.restore(); g.globalAlpha = 1; }
        // (r24b, fresh eyes: a ~16 px solid white outline round the disc read as a scope) a soft, thin edge that fades early
        { g.save(); outroCam(g, s); g.globalAlpha = .35 * (1 - eio(span(u, .1, .5))) * clamp(u / .03); ring(g, x, y, r, r + lerp(6, 2, u), '#fffef2'); g.restore(); g.globalAlpha = 1; } } }
    return; }
  g.save(); outroCam(g, s); kvOutro(g, s); g.restore();
  // r23 (the last night ends on 154 with the piano; the brief: a freeze beat plus a slow glow ring): 154.0-154.25 the
  // night stands frozen (finale's last frame, drawn over the plate); then a slow cream ring opens from the sun's centre: the
  // plate's morning inside it, the frozen night outside, gone from the corners by ~155.3
  // (self-check: opened from the very centre it read as a target dot on the sun) it opens from the frozen sun's rim; during
  // the frozen beat the sun's own face eases into the plate's disc face (same centre, close colours)
  if (FIN_VAR !== 'N' && L < 2.5){ const b = (s.t - T0) / BAR, R = OUTRO_R(s.t), [x, y] = OUTRO_XY(s.t), u = span(b, 154.25, 156.25), rs = finSun(8)[2] * .98, r = lerp(rs, R + 1500, eio(u)), fa = 1 - eio(span(b, 154, 154.4));
    if (u < 1){ const off = finFrozen(g);   // the frozen night is one still picture: rendered once, then composited (alpha-correct)
      g.save(); outroCam(g, s); g.beginPath(); g.rect(-4000, -4000, 8000, 8000); g.arc(x, y, r, 0, TAU, true); g.clip('evenodd'); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(off, 0, 0); g.restore();
      if (fa > 0){ g.save(); outroCam(g, s); g.beginPath(); g.arc(x, y, rs, 0, TAU); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = fa; g.drawImage(off, 0, 0); g.restore(); g.globalAlpha = 1; }
      { g.save(); outroCam(g, s); g.globalAlpha = .9 * (1 - eio(span(u, .7, 1))) * clamp(u / .03); ring(g, x, y, r, r + lerp(26, 8, u), '#fffef2'); g.restore(); g.globalAlpha = 1; } } }
  // r16 audit (fresh eyes: 4:00.7-4:06 ~5 s of a lone shrinking disc): the stars come back from 175.5, while the right side leaves
  { const b = (s.t - T0) / BAR, rv = eout(span(b, 175, 180)); if (rv > 0) offSun(g, s, () => { drawStars(g, s, rv, rv); outroStars(g, rv); }); }   // (re-audit: hardly visible) sooner, easing out
  // (r16: the half-white release that used to be here had been swallowed by a mid-line comment since r12; the settling
  // on 154 is now the slow cream ring and glow in kvOutro)
};
// (final check, fresh eyes: the returning stars were too small and faint to read) 40 round stars, 2.5-4.5 px, coming on
// one after another with the dusk (the brightest first); plain dots, no four-point glints
const OUTRO_ST = Array.from({ length: 40 }, (_, i) => ({ x: 60 + hash(i * 3 + 900) * 1800, y: 40 + hash(i * 5 + 901) * 640, r: 2.5 + 2 * hash(i * 7 + 902), o: i / 40 }));
// (self-check: from 175 the stars showed on the big sun's face) draw fn everywhere except over the sun (and its collar),
// in screen space with outroCam's zoom approximated by its current value
function offSun(g, s, fn){
  const R = OUTRO_R(s.t), [x, y] = OUTRO_XY(s.t); if (R < 2){ fn(); return; }
  const b = (s.t - T0) / BAR, m = 1 - eio(span(b, 176, 180)), z = 1 + (.025 + .035 * (1 - eio(span(b, 154, 163))) + .02 * eio(span(b, 163, 176))) * m;
  const sx = W / 2 + (x - W / 2) * z, sy = H / 2 + (y - H / 2) * z, sr = R * 1.09 * z + 6;
  g.save(); g.beginPath(); g.rect(-W, -H, 3 * W, 3 * H); g.arc(sx, sy, sr, 0, TAU, true); g.clip('evenodd'); fn(); g.restore();
}
function outroStars(g, rv){
  // (r20 audit, fresh eyes: at 4:00.8-4:02 the stars were hardly visible) a little bigger, a soft light each (core
  // 3.2-5 px in a faint halo), like the night's near stars since r18
  for (const st of OUTRO_ST){ const a = clamp((rv * 1.2 - st.o) / .2); if (a <= 0) continue; softGlow(g, st.x, st.y, (st.r + .8) * 2.6, a * (.9 - .3 * st.o)); }
  g.globalAlpha = 1;
}
SC_.tail = (g, s) => {
  const L = s.lbar, b = (s.t - T0) / BAR;
  if (FIN_VAR !== 'N'){ g.save(); outroCam(g, s); outroNew(g, s); g.restore(); return; }   // r24
  g.save(); outroCam(g, s); kvOutro(g, s); g.restore();
  // the stars come back with the dusk (from the zenith down) and go out again in the last 1.4 s (the bookend)
  { const rv = eout(span(b, 175, 180)), out = 1 - eio(span(s.t, 250.9, 252.3)); if (rv > 0 && out > 0) offSun(g, s, () => { drawStars(g, s, rv, rv * out); outroStars(g, rv * out); }); }   // r16 audit: from 175.5 (settle starts them)
  const one = pop((s.t - B(179.5)) / BEAT * 1.5), glint = Math.exp(-Math.max(0, s.t - B(179.5)) * 3) * (s.t >= B(179.5) ? 1 : 0);
  const hb = L >= 4 && L < 5 ? .1 * s.k : 0;   // r6 (rhythm juror): bar 180's last kicks = the song's last heartbeat
  if (one > 0) triK(g, BOOK_TRI[0], BOOK_TRI[1], BOOK_TRI[2] * clamp(one, 0, 1.2) * (1 + .25 * glint + hb), BOOK_TRI[3] + .4 * glint, 0, K.white, 3);
};
