# Build the BGA page: python build.py out.html [--local]
#   --local adds <meta charset> for opening/serving locally; the published artifact omits doctype/html/head/body.
#   Graded assets listed in assets/manifest_used.json are copied next to the page (assets/<file>).
import base64, json, os, shutil, sys
D = os.path.dirname(os.path.abspath(__file__)); src = lambda f: os.path.join(D, 'src', f)
FILES = ['k_head.js', 'k_base.js', 'k_prims.js', 'k_assets.js', 'k_clouds.js', 'k_home.js', 'k_cloud2.js', 'k_lib.js', 'k_fields.js', 'k_night.js', 'k_keep_assemble.js',
         'k_keep_end.js', 'k_plane.js', 'k_shots2.js', 'k_r8.js', 'k_story.js', 'k_render.js', 'k_boot.js']
out_path = sys.argv[1]
head = open(src('head.html'), encoding='utf-8').read()
js = '\n'.join(open(src(f), encoding='utf-8').read() for f in FILES)
man_path = os.path.join(D, 'assets', 'manifest_used.json')
assets = json.load(open(man_path, encoding='utf-8')) if os.path.exists(man_path) else {}
cl_path = os.path.join(D, 'assets', 'clouds.json')
slots = json.load(open(cl_path, encoding='utf-8')) if os.path.exists(cl_path) else {}
for sid, (aid, bw, bh, *rest) in slots.items():
    assets.setdefault(aid, {'k': 'cut', 'src': aid + '.webp'})
b64 = lambda f: base64.b64encode(open(src(f), 'rb').read()).decode() if os.path.exists(src(f)) else ''
js = (js.replace('__KICK_B64__', b64('kick_60fps_u8.bin'))
        .replace('__SNARE_B64__', b64('snare_60fps_u8.bin')).replace('__HAT_B64__', b64('hat_60fps_u8.bin'))
        .replace('__LOUD_B64__', b64('loud_60fps_u8.bin')).replace('__SPEC_B64__', b64('spec_u8.bin'))
        .replace('__NOTES__', open(src('notes_flp.json')).read())
        .replace('__HW_ONSETS__', open(src('hw_onsets.json')).read() if os.path.exists(src('hw_onsets.json')) else '[]')
        .replace('__PIANO_HW__', open(src('piano_hw.json')).read() if os.path.exists(src('piano_hw.json')) else '[]')
        .replace('__PIANO__',open(src('piano_midi.json')).read() if os.path.exists(src('piano_midi.json')) else '[]')
        .replace('__KV_CLOUDS__', open(os.path.join(D, 'assets', 'kv_clouds.json')).read() if os.path.exists(os.path.join(D, 'assets', 'kv_clouds.json')) else '[]')
        .replace('__KV_LAYERS__', open(os.path.join(D, 'assets', 'kv_layers.json')).read() if os.path.exists(os.path.join(D, 'assets', 'kv_layers.json')) else '[]')
        .replace('__ASSETS__', json.dumps(assets, ensure_ascii=False))
        .replace('__CLOUD_SLOTS__', json.dumps(slots, ensure_ascii=False)))
out = ('<meta charset="utf-8">\n' if '--local' in sys.argv else '') + head + js + '</script>\n'
os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)   # (a fresh clone has no build/)
open(out_path, 'w', encoding='utf-8').write(out)
adir = os.path.join(os.path.dirname(os.path.abspath(out_path)), 'assets'); os.makedirs(adir, exist_ok=True)
n = 0
for a in assets.values():
    s, d = os.path.join(D, 'assets', 'out', a['src']), os.path.join(adir, a['src'])
    if not os.path.exists(d) or os.path.getmtime(d) < os.path.getmtime(s):
        shutil.copy2(s, d); n += 1
print('page', round(len(out.encode()) / 1e6, 3), 'MB;', len(assets), 'assets,', n, 'copied')

