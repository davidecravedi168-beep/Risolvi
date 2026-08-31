from pathlib import Path
import json

INDEX=Path('index.html')
WORKER=Path('worker.js')
SRC=Path('src/risolvi-monetization-v14.js')
BEGIN='<!-- RISOLVI_MONETIZATION_V14_BEGIN -->'
END='<!-- RISOLVI_MONETIZATION_V14_END -->'
LEGACY_PRICE="const PRICE={simple:2.99,standard:4.99,complex:5.99};"
PRO_PRICE="const PRICE={simple:6.99,standard:6.99,complex:6.99};"

html=INDEX.read_text(encoding='utf-8')
js=SRC.read_text(encoding='utf-8').strip()
block=f'{BEGIN}\n<script id="risolvi-monetization-v14">\n{js}\n</script>\n{END}'

# One product, one price. This fixes not only the CTA but stored case price,
# beta funnel metadata, export/backup and browser demo delivery.
if LEGACY_PRICE in html:
    html=html.replace(LEGACY_PRICE,PRO_PRICE,1)
elif PRO_PRICE not in html:
    raise SystemExit('PRICE contract not found: refusing to guess')

if BEGIN in html:
    start=html.index(BEGIN)
    stop=html.index(END,start)+len(END)
    html=html[:start]+block+html[stop:]
else:
    if '</body>' not in html:
        raise SystemExit('index.html missing </body>')
    html=html.replace('</body>',block+'\n</body>',1)

if "script-src 'unsafe-inline'" not in html:
    raise SystemExit('unexpected CSP: inline runtime contract changed')
if '<script src=' in html:
    raise SystemExit('external script tag detected: privacy-first shell requires inline scripts')
if html.count(PRO_PRICE) != 1:
    raise SystemExit('Practice Pro price contract must appear exactly once')
if 'SBLOCCA PRATICA PRO' not in html and 'risolvi-monetization-v14' not in html:
    raise SystemExit('V14 monetization runtime missing')

INDEX.write_text(html,encoding='utf-8')

worker=WORKER.read_text(encoding='utf-8')
prefix='const INDEX_HTML = '
pos=worker.find(prefix)
if pos<0:
    raise SystemExit('worker INDEX_HTML constant missing')
value_start=pos+len(prefix)
value,consumed=json.JSONDecoder().raw_decode(worker[value_start:])
if not isinstance(value,str):
    raise SystemExit('worker INDEX_HTML is not a JSON string literal')
encoded=json.dumps(html,ensure_ascii=False)
worker=worker[:value_start]+encoded+worker[value_start+consumed:]
WORKER.write_text(worker,encoding='utf-8')

check=WORKER.read_text(encoding='utf-8')
value2,_=json.JSONDecoder().raw_decode(check[check.index(prefix)+len(prefix):])
if value2!=html:
    raise SystemExit('worker/index shell parity failed')
print('RISOLVI Monetization V14 shell + Worker parity PASS')
