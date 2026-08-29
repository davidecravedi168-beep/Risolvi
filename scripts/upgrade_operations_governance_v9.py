from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
tag='<script src="src/risolvi-operations-governance-v9.js?v=9.0"></script>'
if tag not in s:
    if '</body>' not in s: raise SystemExit('missing </body>')
    s=s.replace('</body>',tag+'\n</body>',1)
p.write_text(s,encoding='utf-8')
