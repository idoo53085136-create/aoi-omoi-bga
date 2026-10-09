# python tools/piano_midi.py file.mid [start_bar=98] -> src/piano_midi.json = [[song_beat, dur_beats, pitch, vel, voice], ...]
# r8: the composer's MIDI of the piano part (the piano waterfall, tempo 175). Its beat 0 sits on song bar 98 (tools/midi_align.py:
# the rhythm of MIDI bars 0-7 equals the audio's harmonic onsets of bars 98-105, e.g. bar 100 "#...#..#.#.#..#." exactly).
# The file's tempo meta says 178; the song is 175, so only beats are used.
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import midi_read
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mid = sys.argv[1]; b0 = float(sys.argv[2]) if len(sys.argv) > 2 else 98
ppq, tempos, N = midi_read.notes(mid)
out = [[round(b0 * 4 + n[0], 4), round(n[1] - n[0], 4), n[2], n[3], n[4]] for n in N]
json.dump(out, open(os.path.join(D, 'src', 'piano_midi.json'), 'w'))
print(len(out), 'notes, song bars %.2f-%.2f' % (out[0][0] / 4, max(o[0] + o[1] for o in out) / 4))
