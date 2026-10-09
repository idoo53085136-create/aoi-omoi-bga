
'use strict';
// AOI OMOI — sky graphic BGA built from the elements of the AOI OMOI key visual. Deterministic: renderAt(t).
const KICK_B64 = "__KICK_B64__";
// v12: snare (1.2-5 kHz), hat (7-16 kHz) and loudness envelopes from WAV3 (tools/drums_aoi.py), 60 fps u8
const SNARE_B64 = "__SNARE_B64__", HAT_B64 = "__HAT_B64__", LOUD_B64 = "__LOUD_B64__";
// r7: 32-band spectrum over the highway (tools/spectrum_aoi.py): [first frame u16, frames u16, frames x 32 u8]
const SPEC_B64 = "__SPEC_B64__";
const NOTES = __NOTES__;
// r8: the highway's blocks from the audio itself (tools/hw_onsets.py): [[t, p 0..1, strength], ...], bars 96-106.6
const HW_ONS = __HW_ONSETS__;
// r8: the composer's piano MIDI (tools/piano_midi.py), aligned to song bar 98: [[song beat, dur beats, pitch, vel, voice], ...]
const PIANO = __PIANO__;
// r15 (10-08: the piano waterfall in the middle uses exactly this MIDI, from 2:14; the file also holds
// the later piano part, of which only the melody in front is used): the composer's melody MIDI, a single melody line at
// 175 BPM whose beat 0 = bar 98 (its rhythm equals the old MIDI's from bar 98); only notes before bar 106.6 (the road)
const PIANO_HW = __PIANO_HW__;
// r8: the key visual's own clouds cut out of the image (tools/kv_clouds.py): [{id, x, y, w, h, area, edge}, ...]
const KV_CLOUDS = __KV_CLOUDS__;
// r11: the key visual plate cut into layers (tools/kv_layers.py): [{id, x, y, w, h, ...}, ...]; drawn in place they give
// the plate back (mean difference ~1/255)
const KV_LAYERS = __KV_LAYERS__;
const Q = new URLSearchParams(location.search);
const TEST = Q.has('test');
let CW = +(Q.get('w') || (Q.get('q') === '540' ? 960 : Q.get('q') === '720' ? 1280 : 1920)), CH = Math.round(CW * 9 / 16);
const W = 1920, H = 1080;
const T0 = 0.16848072562358277, BAR = 240 / 175, BEAT = 60 / 175, DUR = 252.65;
const B = b => T0 + b * BAR;
const DROP1 = B(50), DROP = B(130);
// palette sampled from the key visual
const K = {
  disc0: '#42cefb', disc1: '#12abf4', sky: '#0a9ef7', sky2: '#0771e4', ring: '#0b90f4',
  navy: '#04378b', royal: '#0873f1', azure: '#0780ff', light: '#167cff',
  white: '#fffff4', shade0: '#c5e6fe', shade1: '#a4cfff', shade2: '#7597ee', puff: '#7bdcfa', puff2: '#76d3fc',
  mint: '#3bedcf', cyan: '#9ee9ff',
};
const TRI_COLS = [K.white, K.mint, K.azure, K.navy, K.cyan, K.white];
