import os
# python tools/hw_filter.py [z] -> src/hw_keep.json: the highway's note blocks keep only notes you can HEAR
# (r7 review: the piano blocks still did not line up): for each track-1/2 note in bars 96-106.6 the mid-band (200 Hz-2 kHz)
# spectral-flux onset strength just before its time (-45..-15 ms: the audio grid sits ~30 ms early of T0, see
# tools/note_sync.py) must be above z (default 1.0, in std units). One block per onset (the highest note of a chord).
import json, sys, wave, numpy as np
T0 = 0.16848072562358277; BEAT = 60 / 175; BAR = 4 * BEAT
WAV = os.environ.get('AOI_WAV', 'AOI OMOI.wav')   # path to the song's WAV (not included in this repo)
Z = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
b0, b1 = 96, 106.6
w = wave.open(WAV); sr = w.getframerate(); ch = w.getnchannels(); sw = w.getsampwidth()
a0, a1 = int((T0 + b0 * BAR - 1) * sr), int((T0 + b1 * BAR + 1) * sr)
w.setpos(a0); raw = w.readframes(a1 - a0)
b = np.frombuffer(raw, np.uint8).reshape(-1, 3); x = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
x = np.where(x >= 1 << 23, x - (1 << 24), x).astype(np.float32).reshape(-1, ch).mean(1)
hop, nf = 128, 2048
fr = np.lib.stride_tricks.sliding_window_view(x, nf)[::hop] * np.hanning(nf)
S = np.abs(np.fft.rfft(fr, axis=1)); f = np.fft.rfftfreq(nf, 1 / sr)
m = (f >= 200) & (f < 2000); Lg = np.log1p(S[:, m] * 10); F = np.maximum(0, np.diff(Lg, axis=0)).sum(1); F = (F - F.mean()) / F.std()
tf = lambda t: int(((t - a0 / sr) * sr - nf / 2) / hop)   # frame whose window is centred on t
d = json.load(open('src/notes_flp.json'))
N = [dict(i=i // 4, t=T0 + d[i] * BEAT, p=d[i + 2], tr=d[i + 3]) for i in range(0, len(d), 4)]
N = [n for n in N if T0 + b0 * BAR <= n['t'] < T0 + b1 * BAR and n['tr'] in (1, 2)]
for n in N: n['z'] = float(F[tf(n['t'] - .03) - 2: tf(n['t'] - .03) + 3].max())
on = {}
for n in N:
    k = round(n['t'], 3)
    if k not in on or n['p'] > on[k]['p']: on[k] = n
keep = sorted([n for n in on.values() if n['z'] >= Z], key=lambda n: n['t'])
print(len(on), 'onsets,', len(keep), 'kept at z >=', Z)
print('per bar:', {bb: sum(1 for n in keep if int((n['t'] - T0) / BAR) == bb) for bb in range(96, 107)})
json.dump([n['i'] for n in keep], open('src/hw_keep.json', 'w'))
