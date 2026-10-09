"""Collect openly licensed sky photos / footage from Wikimedia Commons.

  python tools/fetch_commons.py search  -> writes assets/candidates.json (no downloads)
  python tools/fetch_commons.py thumbs  -> downloads 400px previews of candidates + contact sheets per category
  python tools/fetch_commons.py get IDS -> downloads the chosen candidates (2560 px photos / original videos) into assets/raw/

Only CC0, Public domain and CC BY (not -SA, -NC, -ND) are accepted. Attribution is kept in the manifest.
"""
import json, os, re, sys, time, urllib.parse, urllib.request
import cv2, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets')
UA = 'AOI-BGA-assets/1.0 (music-video project; set your own contact here)'
API = 'https://commons.wikimedia.org/w/api.php'

# category -> list of search strings (CirrusSearch syntax); quality categories first
QUERIES = {
    'blue_cumulus': ['incategory:"Quality images of clouds" cumulus', 'incategory:"Featured pictures of clouds"',
                     'cumulus clouds blue sky filetype:bitmap', 'fair weather cumulus filetype:bitmap',
                     'incategory:"Cumulus humilis clouds"', 'incategory:"Cumulus mediocris clouds"'],
    'towering': ['incategory:"Cumulus congestus clouds"', 'incategory:"Cumulonimbus clouds" filetype:bitmap',
                 'towering cumulus filetype:bitmap'],
    'sea_of_clouds': ['incategory:"Sea of clouds"', 'above the clouds airplane window filetype:bitmap',
                      'incategory:"Clouds seen from above"'],
    'sunset': ['incategory:"Quality images of sunsets" clouds', 'sunset clouds sky filetype:bitmap', 'golden hour clouds filetype:bitmap'],
    'twilight': ['blue hour sky filetype:bitmap', 'incategory:"Twilight" sky clouds', 'afterglow sky filetype:bitmap'],
    'stars': ['incategory:"Featured pictures of the Milky Way"', 'incategory:"Quality images of night sky"',
              'milky way night sky filetype:bitmap', 'starry sky long exposure filetype:bitmap'],
    'sunbeams': ['incategory:"Crepuscular rays"', 'sunbeams through clouds filetype:bitmap'],
    'contrails': ['incategory:"Contrails" blue sky filetype:bitmap'],
    'video_clouds': ['cloud timelapse filetype:video', 'clouds time-lapse filetype:video', 'sky timelapse filetype:video',
                     'flying above clouds filetype:video', 'milky way timelapse filetype:video', 'sunset timelapse filetype:video'],
}
OK_LIC = re.compile(r'^(CC0|Public domain|PD|CC BY \d(\.\d)?( [a-z]{2})?|CC BY-\d|Attribution)', re.I)
BAD_LIC = re.compile(r'SA|NC|ND', re.I)


def get(url, params=None, binary=False, tries=4):
    if params:
        url = url + '?' + urllib.parse.urlencode(params)
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            return data if binary else json.loads(data)
        except Exception as e:  # noqa: BLE001
            if k == tries - 1:
                raise
            time.sleep(2 + 3 * k)


def license_ok(lic):
    return bool(lic) and bool(OK_LIC.match(lic)) and not BAD_LIC.search(lic.replace('CC BY', ''))


def strip(s):
    return re.sub('<[^>]+>', '', s or '').strip()


def search():
    cands = {}
    for cat, qs in QUERIES.items():
        for q in qs:
            cont = {}
            for page in range(3):
                p = dict(action='query', format='json', generator='search', gsrnamespace=6, gsrsearch=q, gsrlimit=50,
                         prop='imageinfo', iiprop='url|size|mime|extmetadata', iiurlwidth=400,
                         iiextmetadatafilter='LicenseShortName|Artist|ImageDescription|ObjectName')
                p.update(cont)
                r = get(API, p)
                for pg in (r.get('query', {}).get('pages', {}) or {}).values():
                    ii = (pg.get('imageinfo') or [{}])[0]
                    md = ii.get('extmetadata', {})
                    lic = md.get('LicenseShortName', {}).get('value', '')
                    vid = cat.startswith('video')
                    if not license_ok(lic):
                        continue
                    w, h = ii.get('width', 0), ii.get('height', 0)
                    if vid:
                        if w < 1280 or ii.get('size', 0) > 300e6:
                            continue
                    elif w < 2400 or h < 1300 or w / max(h, 1) < 1.3:
                        continue
                    key = pg['title']
                    if key in cands:
                        continue
                    cands[key] = dict(cat=cat, title=key, page=ii.get('descriptionurl'), url=ii.get('url'), thumb=ii.get('thumburl'),
                                      w=w, h=h, size=ii.get('size'), mime=ii.get('mime'), license=lic,
                                      author=strip(md.get('Artist', {}).get('value', ''))[:120], q=q)
                if 'continue' not in r:
                    break
                cont = r['continue']
                time.sleep(1)
            time.sleep(1)
        print(cat, sum(1 for c in cands.values() if c['cat'] == cat), flush=True)
    lst = list(cands.values())
    for i, c in enumerate(lst):
        c['id'] = f'{c["cat"]}_{i:03d}'
    json.dump(lst, open(os.path.join(A, 'candidates.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('candidates', len(lst))


def thumbs():
    lst = json.load(open(os.path.join(A, 'candidates.json'), encoding='utf-8'))
    td = os.path.join(A, 'thumbs'); os.makedirs(td, exist_ok=True)
    by = {}
    for c in lst:
        fn = os.path.join(td, c['id'] + '.jpg')
        if not os.path.exists(fn) and c.get('thumb'):
            try:
                open(fn, 'wb').write(get(c['thumb'], binary=True)); time.sleep(.3)
            except Exception as e:  # noqa: BLE001
                print('thumb fail', c['id'], e); continue
        im = cv2.imdecode(np.fromfile(fn, np.uint8), 1) if os.path.exists(fn) else None
        if im is None:
            continue
        im = cv2.resize(im, (320, 180), interpolation=cv2.INTER_AREA)
        cv2.rectangle(im, (0, 0), (320, 16), (0, 0, 0), -1)
        cv2.putText(im, c['id'].split('_', 1)[1] if not c['cat'].startswith('video') else c['id'], (3, 12), 0, .4, (255, 255, 255), 1)
        by.setdefault(c['cat'], []).append(im)
    for cat, ims in by.items():
        cols = 8
        for k in range(0, len(ims), 64):
            ch = ims[k:k + 64]
            while len(ch) % cols: ch.append(np.zeros_like(ims[0]))
            cv2.imencode('.jpg', np.vstack([np.hstack(ch[i:i + cols]) for i in range(0, len(ch), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 80])[1].tofile(
                os.path.join(A, f'cand_{cat}_{k // 64}.jpg'))
        print(cat, len(ims))


def fetch(ids):
    lst = {c['id']: c for c in json.load(open(os.path.join(A, 'candidates.json'), encoding='utf-8'))}
    rd = os.path.join(A, 'raw'); os.makedirs(rd, exist_ok=True)
    manp = os.path.join(A, 'manifest.json')
    man = json.load(open(manp, encoding='utf-8')) if os.path.exists(manp) else {}
    for i in ids:
        c = lst[i]
        vid = c['cat'].startswith('video')
        ext = os.path.splitext(c['url'])[1].lower() if vid else '.jpg'
        fn = os.path.join(rd, i + ext)
        if not os.path.exists(fn):
            if vid:
                url = c['url']
            else:
                r = get(API, dict(action='query', format='json', titles=c['title'], prop='imageinfo', iiprop='url', iiurlwidth=2560))
                url = list(r['query']['pages'].values())[0]['imageinfo'][0]['thumburl']
            open(fn, 'wb').write(get(url, binary=True)); time.sleep(1)
        man[i] = dict(c, file=os.path.basename(fn))
        print('got', i, round(os.path.getsize(fn) / 1e6, 1), 'MB', flush=True)
    json.dump(man, open(manp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    with open(os.path.join(A, 'CREDITS.md'), 'w', encoding='utf-8') as f:
        f.write('# 素材出处\n\n全部来自 Wikimedia Commons。\n\n| 文件 | 标题 | 作者 | 授权 | 链接 |\n|---|---|---|---|---|\n')
        for k, m in sorted(man.items()):
            f.write(f"| {m['file']} | {m['title'].replace('File:', '')} | {m['author'] or '—'} | {m['license']} | {m['page']} |\n")


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'search': search()
    elif cmd == 'thumbs': thumbs()
    elif cmd == 'get': fetch(sys.argv[2:])
