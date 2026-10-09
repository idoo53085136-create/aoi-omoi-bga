# render a list of times and lay them out as labelled contact sheets (mm:ss + scene name)
import sys, base64, json, os, cv2, numpy as np
from playwright.sync_api import sync_playwright
T0 = 0.16848072562358277; BAR = 240 / 175
STORY = json.loads(os.environ['STORY'])
def scene(t):
    b = (t - T0) / BAR; name = STORY[0][0]
    for n, b0 in STORY:
        if b >= b0: name = n
    return name
out, cols, rows = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); ts = [float(x) for x in sys.argv[4:]]
ims = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome'); pg = b.new_page(viewport={"width": 480, "height": 270})
    # (r30) EXTRA="k=v&..." appends query parameters, to render a variant (e.g. EXTRA=hush=S)
    ex = os.environ.get('EXTRA', ''); pg.goto('http://127.0.0.1:8767/index.html?test=1&w=480' + ('&' + ex if ex else '')); pg.wait_for_function('window.READY === true')
    for t in ts:
        url = pg.evaluate(f"(() => {{ renderAt({t}); return document.getElementById('gl').toDataURL('image/jpeg', .85); }})()")
        im = cv2.imdecode(np.frombuffer(base64.b64decode(url.split(',')[1]), np.uint8), 1)
        lab = '%d:%05.2f %s' % (int(t // 60), t % 60, scene(t))
        cv2.rectangle(im, (0, 0), (8 + 11 * len(lab), 26), (40, 30, 10), -1); cv2.putText(im, lab, (5, 19), 0, .55, (255, 255, 255), 1, cv2.LINE_AA)
        ims.append(im)
    b.close()
per = cols * rows
for k in range(0, len(ims), per):
    chunk = ims[k:k + per]
    while len(chunk) % cols: chunk.append(np.zeros_like(ims[0]))
    cv2.imwrite('%s_%02d.jpg' % (out, k // per), np.vstack([np.hstack(chunk[i:i + cols]) for i in range(0, len(chunk), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 82])
print(len(ims), 'frames')
