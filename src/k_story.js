
// ================================================================== storyboard (bars from T0, 175 BPM)
const STORY = [
  ['dawn', 0, 8, null],
  ['tower1', 8, 16, { type: 'cut' }],
  ['assemble', 16, 24, { type: 'iris', beats: 1 }],
  ['kvHold', 24, 27, { type: 'cut' }],
  ['voyage', 27, 40, { type: 'cut' }],      // r8 (review: 37-55 s redone): replaces stripeRide + airy
  ['approach', 40, 48, { type: 'cut' }],
  ['solo', 48, 50, { type: 'cut' }],
  ['burst', 50, 54, { type: 'cut' }],
  ['tilt', 54, 58, { type: 'cut' }],   // r16 audit (rhythm juror: the wipe came half a beat after the 54 flash, a mess mid-wipe): the flash carries the cut
  ['plunge', 58, 63, { type: 'cut' }],
  ['hover', 63, 66, { type: 'cut' }],
  ['horizon', 66, 70, { type: 'cut' }],      // r3: hover tilts up, the sun jumps out of the horizon
  ['band', 70, 74, { type: 'cut' }],   // r16 audit: horizon's last beat already wipes band's first frame in; a second stripe wipe ran over it
  ['arcs', 74, 80, { type: 'cut' }],         // r3: anchored on the disc; r7: runs to 80 and sets into night (no montage)
  ['trance', 80, 96, { type: 'cut' }],       // r7: the same night on both sides of the cut
  ['bloom', 96, 111, { type: 'cut' }],      // r8 (review: two big circles in different places): a match cut on the moon/sun
  ['inhale', 111, 114, { type: 'cut' }],     // r3: the sun contracts into inhale's disc
  ['rings', 114, 122, { type: 'flash', beats: 1 }],
  ['sunburst', 122, 126, { type: 'cut' }],   // r16 audit: rings now grows its disc into sunburst's sun (the iris met an ellipse)
  ['hush', 126, 130, { type: 'cut' }],
  ['radiance', 130, 146, { type: 'cut' }],
  ['finale', 146, 154, { type: 'cut' }],     // r4: the key visual at full energy (was the "atom" orbit)
  ['settle', 154, 176, { type: 'cut' }],     // r4: the finale's white release carries the cut
  ['tail', 176, 190, { type: 'cut' }],
];
