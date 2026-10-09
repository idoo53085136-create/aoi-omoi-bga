SC_.assemble = (g, s) => {
  // r14 (review, twice: the white dots in the upper left at 32 s were still there): the corner's white dots are
  // left out of the assembly (the rest of assemble is unchanged)
  const b = s.lbar, a = { tlDots: 0 };
  const keys = ['disc', 'corners', 'stripes', 'arc', 'clouds', 'lines', 'tris'];
  keys.forEach((k, i) => a[k] = eout(span(b, i * .5, i * .5 + .6)));
  // (r28d framescan: at 0:24.9 the cloud tower and bank came in ~300 px in 4 frames, eout over .6 bar peaks at ~30 px a
  // frame: they popped in; the r15 rule: clouds rise slowly from below, never appear in place) the clouds alone come
  // in over 1.4 bars with a sine in-out displacement (homeArrive, <= ~7 px a frame); the other groups keep the snap
  a.clouds = homeArrive(span(b, 1.8, 3.2));
  // r16: the beat pulse fades out over the last 2 bars (kvHold has none), so the cut at 24 doesn't change the shake
  const z = 1.08 - .08 * eio(span(b, 0, 4)) + .015 * pulse(s.beat, 5) * (1 - eio(span(b, 6, 8)));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.rotate(-.04 * (1 - eio(span(b, 0, 4)))); g.translate(-W / 2, -H / 2);
  homeShot(g, s, a);
  g.restore();
  beatEvents(s, 6, 64, (bb, ag) => swooshEvt(g, bb, ag, BEAT * 3, 5 + 5 * hash(bb)), 2);
  // r16 audit (advocate: the white halftone dot pops up-left of the sun at 31-33 s ARE r14's "32 s white dots",
  // a third time; one also vanished on the cut): no halftone pops at all, only the small triangles, and none born after
  // 23.4 (the last ones finish before the cut)
  spawnPops(s.t, .8, (n, ag) => { if (n.i % 3 === 0 || s.t - ag > B(23.4)) return; tri(g, 260 + hash(n.i) * 1400, 160 + hash(n.i + 5) * 760, 34 * eback(ag / .2) * (1 - ein(span(ag, .5, .8))), hash(n.i) * 6 + ag * 2, ag, TRI_COLS[n.i % 6]); });
};
