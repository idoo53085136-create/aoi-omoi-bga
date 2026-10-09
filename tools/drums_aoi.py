"""Snare / hat / loudness envelopes from WAV3 (read-only analysis; the audio itself is never changed).

  python tools/drums_aoi.py "path/to/AOI OMOI.wav"

Method (after he-drowns-mv-v2 tools/drums.py and rhythm-game-bga analyze.py):
  STFT -> median-filter HPSS -> positive spectral flux of the percussive part per band
  (kick 35-130 Hz, snare 1.2-5 kHz (the 150-350 Hz half picked up the offbeat bass), hat 7-16 kHz) -> snapped to the 175 BPM 16th grid (max within +-30 ms)
  -> minus 0.15 s moving mean, / 6 s local RMS -> 97th-percentile compression to 0..1 per 16th.
Writes:
  src/drums16.json            {kick:[..], snare:[..], hat:[..]} strength per 16th from T0 (2 decimals)
  src/snare_60fps_u8.bin, src/hat_60fps_u8.bin   envelope max_j s_j*exp(-(t-t_j)/tau) at 60 fps (tau .11 / .045)
  src/loud_60fps_u8.bin       broadband RMS loudness, 0.25 s smoothing, 2..98 percentile -> 0..255
  dev/drums_check.png         plot of a few sections for eyeballing
"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
from scipy.ndimage import median_filter, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T0 = 0.16848072562358277; BPM = 175; S16 = 60 / BPM / 4; DUR = 252.65; FPS = 60


def load(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float32)
    if x.ndim > 1: x = x.mean(1)
    x /= max(1e-9, np.abs(x).max())
    return sr, x


def stft_mag(x, n=2048, hop=256, kmax=760):
    w = np.hanning(n).astype(np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(np.pad(x, (n // 2, n // 2)), n)[::hop]
    out = np.empty((kmax, len(frames)), np.float32)
    for i in range(0, len(frames), 2000):                                # chunked: the full complex STFT would need ~1 GB
        out[:, i:i + 2000] = np.abs(np.fft.rfft(frames[i:i + 2000] * w, axis=1)[:, :kmax]).T
    return out, hop   # (freq bins up to ~16.4 kHz, time)


def main():
    path = sys.argv[1]
    sr, x = load(path)
    S, hop = stft_mag(x)
    fr = np.fft.rfftfreq(2048, 1 / sr)[:S.shape[0]]
    H = median_filter(S, size=(1, 17)); P = median_filter(S, size=(17, 1))
    Pm = S * (P ** 2 / (P ** 2 + H ** 2 + 1e-9))                     # soft percussive mask
    L = np.log1p(100 * Pm)
    def flux(bands):
        sel = np.zeros(len(fr), bool)
        for lo, hi in bands: sel |= (fr >= lo) & (fr < hi)
        d = np.diff(L[sel], axis=1, prepend=L[sel][:, :1]); return np.maximum(d, 0).sum(0)
    fx = {'kick': flux([(35, 130)]), 'snare': flux([(1200, 5000)]), 'hat': flux([(7000, 16000)])}
    dt = hop / sr; n16 = int((DUR - T0) / S16) + 1; g16 = T0 + np.arange(n16) * S16
    out = {}
    for k, f in fx.items():
        f = f - uniform_filter1d(f, max(1, int(.15 / dt)))
        rms = np.sqrt(uniform_filter1d(f ** 2, max(1, int(6 / dt)))) + 1e-6
        f = np.maximum(f / rms, 0)
        v = np.array([f[max(0, int((g - .03) / dt)):int((g + .03) / dt) + 1].max(initial=0) for g in g16])
        out[k] = np.clip(v / max(np.percentile(v, 97), 1e-6), 0, 1)
    json.dump({k: [round(float(a), 2) for a in v] for k, v in out.items()} | {'t0': T0, 's16': S16},
              open(os.path.join(ROOT, 'src', 'drums16.json'), 'w'))
    nf = int(round(DUR * FPS)); tf = np.arange(nf) / FPS
    def env(s, tau):
        e = np.zeros(nf, np.float32)
        for j, (g, a) in enumerate(zip(g16, s)):
            if a < .15: continue
            i0 = int(np.ceil(g * FPS)); i1 = min(nf, i0 + int(tau * 6 * FPS) + 1)
            e[i0:i1] = np.maximum(e[i0:i1], a * np.exp(-(tf[i0:i1] - g) / tau))
        return e
    for name, tau in (('snare', .11), ('hat', .045)):
        (np.clip(env(out[name], tau), 0, 1) * 255 + .5).astype(np.uint8).tofile(os.path.join(ROOT, 'src', f'{name}_60fps_u8.bin'))
    r = np.sqrt(uniform_filter1d(x ** 2, int(.25 * sr)))[::max(1, sr // FPS)][:nf]
    r = np.pad(r, (0, max(0, nf - len(r))))
    lo, hi = np.percentile(r, 2), np.percentile(r, 98)
    (np.clip((r - lo) / (hi - lo), 0, 1) * 255 + .5).astype(np.uint8).tofile(os.path.join(ROOT, 'src', 'loud_60fps_u8.bin'))
    # eyeball plot: 4 windows of 4 bars
    import cv2
    kick = np.fromfile(os.path.join(ROOT, 'src', 'kick_60fps_u8.bin'), np.uint8) / 255
    sn = np.fromfile(os.path.join(ROOT, 'src', 'snare_60fps_u8.bin'), np.uint8) / 255
    ht = np.fromfile(os.path.join(ROOT, 'src', 'hat_60fps_u8.bin'), np.uint8) / 255
    ld = np.fromfile(os.path.join(ROOT, 'src', 'loud_60fps_u8.bin'), np.uint8) / 255
    rows = []
    for b0 in (16, 50, 84, 130):
        a, b = int((T0 + b0 * 4 * 4 * S16) * FPS), int((T0 + (b0 + 4) * 16 * S16) * FPS)
        W, Hh = 1600, 260; im = np.full((Hh, W, 3), 255, np.uint8)
        for beat in range(17):
            xx = int(beat / 16 * W); cv2.line(im, (xx, 0), (xx, Hh), (200, 200, 200) if beat % 4 else (120, 120, 120), 1)
        for k, (arr, col, y0) in enumerate(((kick, (0, 0, 200), 60), (sn, (0, 150, 0), 125), (ht, (200, 100, 0), 190), (ld, (0, 0, 0), 255))):
            seg = arr[a:b]; xs = np.linspace(0, W - 1, len(seg)).astype(int)
            pts = np.stack([xs, (y0 - seg * 58).astype(int)], 1)
            cv2.polylines(im, [pts.reshape(-1, 1, 2)], False, col, 1)
        cv2.putText(im, f'bars {b0}-{b0 + 4}  red kick / green snare / blue hat / black loud', (6, 14), 0, .45, (0, 0, 0), 1)
        rows.append(im)
    cv2.imencode('.png', np.vstack(rows))[1].tofile(os.path.join(ROOT, 'dev', 'drums_check.png'))
    for k, v in out.items(): print(k, 'hits>.5:', int((v > .5).sum()), 'of', len(v))


if __name__ == '__main__':
    main()

