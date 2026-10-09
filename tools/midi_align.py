# python tools/midi_align.py file.mid [bar_lo bar_hi] -> where in the song the MIDI's beat 0 sits (song tempo 175 BPM):
# harmonic onset strength of WAV3 (drums removed by HPSS) at the MIDI note-ons, for every start bar in 1/4-beat steps
import sys, wave, numpy as np
from scipy.ndimage import median_filter
sys.path.insert(0, __import__('os').path.dirname(__file__)); import midi_read
T0 = 0.16848072562358277; BEAT = 60 / 175; BAR = 4 * BEAT
WAV = os.environ.get('AOI_WAV', 'AOI OMOI.wav')   # path to the song's WAV (not included in this repo)
mid = sys.argv[1]; lo = float(sys.argv[2]) if len(sys.argv) > 2 else 60; hi = float(sys.argv[3]) if len(sys.argv) > 3 else 150
ppq, tempos, N = midi_read.notes(mid); ons = sorted(set(round(n[0], 4) for n in N)); span_b = N[-1][1]
w = wave.open(WAV); sr = w.getframerate(); ch = w.getnchannels()
a0 = int((T0 + lo * BAR - 1) * sr); a1 = int((T0 + (hi * 4 + span_b) / 4 * BAR + 1) * sr)
w.setpos(max(0, a0)); raw = w.readframes(a1 - a0)
b = np.frombuffer(raw, np.uint8).reshape(-1, 3); x = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
x = np.where(x >= 1 << 23, x - (1 << 24), x).astype(np.float32).reshape(-1, ch).mean(1)
hop, nf = 512, 4096
fr = np.lib.stride_tricks.sliding_window_view(x, nf)[::hop] * np.hanning(nf)
S = np.abs(np.fft.rfft(fr, axis=1)); f = np.fft.rfftfreq(nf, 1 / sr)
Hm = median_filter(S, size=(17, 1)); Pm = median_filter(S, size=(1, 17)); Hs = S * (Hm ** 2 / (Hm ** 2 + Pm ** 2 + 1e-9))
m = (f >= 150) & (f < 4000); L = np.log1p(Hs[:, m] * 10); F = np.maximum(0, np.diff(L, axis=0)).sum(1); F = (F - F.mean()) / F.std()
fi = lambda t: int(((t - a0 / sr) * sr - nf / 2) / hop) + 1
res = []
for k in range(int(lo * 16), int(hi * 16) + 1, 1):   # start position in 16ths
    st = k / 16
    v = [F[max(0, fi(T0 + (st * 4 + o) * BEAT) - 1): fi(T0 + (st * 4 + o) * BEAT) + 2].max() for o in ons if 0 < fi(T0 + (st * 4 + o) * BEAT) < len(F) - 2]
    if len(v) > .8 * len(ons): res.append((float(np.mean(v)), st))
res.sort(reverse=True)
print('notes', len(N), 'onsets', len(ons), 'length (beats)', span_b)
print('best start bars:', [(round(s, 4), round(v, 2)) for v, s in res[:8]])
print('median score', round(float(np.median([v for v, s in res])), 2))
print('whole bars:', ' '.join('%g:%.2f' % (s, v) for v, s in sorted(res, key=lambda r: r[1]) if abs(s - round(s)) < 1e-6))
