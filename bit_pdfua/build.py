#!/usr/bin/env python3
"""Build the BIT PDF/UA-Korrektur custom widget for SAP Analytics Cloud.

    python3 build.py                      # build dist/ from src/
    python3 build.py --html PDF-UA-Korrektur.html
                                          # refresh src/pdfua-engine.js from a new
                                          # version of the stand-alone program, then build

Output (dist/):
    pdfua-widget.js           main web component (UI + engine)
    pdfua-styling-panel.js    styling panel web component
    pdfuaWidget.json          widget manifest with relative URLs and SRI hashes
    BIT_pdfua_1.zip           flat ZIP (JSON + JS files) for upload into SAC

Only the Python standard library is used.
"""
import argparse
import base64
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / 'src'
DIST = HERE / 'dist'

ENGINE_FILE = SRC / 'pdfua-engine.js'
WIDGET_SRC = SRC / 'pdfua-widget.src.js'
STYLING_SRC = SRC / 'pdfua-styling-panel.js'
MANIFEST_SRC = SRC / 'pdfuaWidget.json'

WIDGET_OUT = 'pdfua-widget.js'
STYLING_OUT = 'pdfua-styling-panel.js'
MANIFEST_OUT = 'pdfuaWidget.json'
ZIP_OUT = 'BIT_pdfua_1.zip'

ENGINE_PLACEHOLDER = '/* @@PDFUA_ENGINE@@ */'

# pdf-lib's UMD header. SAC runs on a page with an AMD loader, so a UMD bundle can
# end up registered as an anonymous AMD module instead of creating its global. The
# patched header always assigns PDFLib to the engine scope object.
UMD_HEADER = ('!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):'
              '"function"==typeof define&&define.amd?define(["exports"],e):e((t=t||self).PDFLib={})}'
              '(this,(function(t){"use strict";')
UMD_PATCHED = '!function(t,e){e(t.PDFLib={})}(globalThis,(function(t){"use strict";'

SOURCE_MAP_RE = re.compile(r'^//# sourceMappingURL=.*$\n?', re.M)

# fixed timestamp keeps the ZIP byte-identical across builds of the same sources
ZIP_DATE = (2026, 1, 1, 0, 0, 0)


def read_text(path):
    return path.read_bytes().decode('utf-8')


def write_text(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode('utf-8'))


def extract_engine(html_path):
    """Return the text of <script type="text/plain" id="engine-src"> from the stand-alone program."""
    html = read_text(Path(html_path))
    m = re.search(r'<script type="text/plain" id="engine-src">(.*?)</script>', html, re.S)
    if not m:
        sys.exit('engine-src script not found in ' + str(html_path))
    return m.group(1)


def wrap_engine(engine):
    if engine.count(UMD_HEADER) != 1:
        sys.exit('pdf-lib UMD header not found exactly once in the engine; update UMD_HEADER in build.py')
    engine = engine.replace(UMD_HEADER, UMD_PATCHED)
    engine = SOURCE_MAP_RE.sub('', engine)
    # The engine runs inside this function: in a Worker via PDFUA_ENGINE.toString() with
    # globalThis = self, or on the main thread with globalThis = a private scope object.
    return 'function PDFUA_ENGINE(globalThis) {\n' + engine.strip('\n') + '\n}'


def sri(data):
    return 'sha256-' + base64.b64encode(hashlib.sha256(data).digest()).decode('ascii')


def build():
    engine = read_text(ENGINE_FILE)
    widget_src = read_text(WIDGET_SRC)
    if widget_src.count(ENGINE_PLACEHOLDER) != 1:
        sys.exit('engine placeholder not found exactly once in ' + WIDGET_SRC.name)
    widget = widget_src.replace(ENGINE_PLACEHOLDER, wrap_engine(engine))
    styling = read_text(STYLING_SRC)

    widget_bytes = widget.encode('utf-8')
    styling_bytes = styling.encode('utf-8')

    manifest = json.loads(read_text(MANIFEST_SRC))
    hashes = {WIDGET_OUT: sri(widget_bytes), STYLING_OUT: sri(styling_bytes)}
    for wc in manifest['webcomponents']:
        name = wc['url'].lstrip('/')
        if name not in hashes:
            sys.exit('manifest references unknown file ' + wc['url'])
        wc['integrity'] = hashes[name]
    manifest_bytes = (json.dumps(manifest, indent=2, ensure_ascii=False) + '\n').encode('utf-8')

    DIST.mkdir(exist_ok=True)
    outputs = [(MANIFEST_OUT, manifest_bytes), (WIDGET_OUT, widget_bytes), (STYLING_OUT, styling_bytes)]
    for name, data in outputs:
        (DIST / name).write_bytes(data)

    # SAC accepts no subfolders in the ZIP: all files go to the root
    with zipfile.ZipFile(DIST / ZIP_OUT, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for name, data in outputs:
            info = zipfile.ZipInfo(name, date_time=ZIP_DATE)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            zf.writestr(info, data)

    for name, data in outputs:
        print('%-26s %9d bytes  %s' % (name, len(data), hashes.get(name, '')))
    print('%-26s %9d bytes' % (ZIP_OUT, (DIST / ZIP_OUT).stat().st_size))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--html', help='stand-alone PDF-UA-Korrektur.html to take the engine from')
    args = ap.parse_args()
    if args.html:
        write_text(ENGINE_FILE, extract_engine(args.html))
        print('engine refreshed from ' + args.html)
    build()


if __name__ == '__main__':
    main()
