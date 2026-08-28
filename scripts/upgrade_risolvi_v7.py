from pathlib import Path
import json,re
idx=Path('index.html')
s=idx.read_text(encoding='utf-8')
orig=s
s=s.replace('<title>RISOLVI V6 — Semplice per tutti</title>','<title>RISOLVI V7 — Case Intelligence</title>')
s=s.replace("const VERSION='6.0.0-universal-beta';","const VERSION='7.0.0-case-intelligence';")
s=s.replace('V6 Universal Beta','V7 Case Intelligence Beta')
if 'function getIntelligenceState()' not in s:
    anchor='  function init(){'
    if anchor not in s: raise SystemExit('missing init anchor')
    fn="""  function getIntelligenceState(){
    return {state:JSON.parse(JSON.stringify(state)),currentAnalysis:currentAnalysis?JSON.parse(JSON.stringify(currentAnalysis)):null,rulesUpdated:RULES_UPDATED};
  }

"""
    s=s.replace(anchor,fn+anchor,1)
if 'return {VERSION,getIntelligenceState,' not in s:
    anchor='  return {VERSION,'
    if anchor not in s: raise SystemExit('missing return API anchor')
    s=s.replace(anchor,'  return {VERSION,getIntelligenceState,',1)
css=Path('src/risolvi-case-ui.css').read_text(encoding='utf-8')
if 'RISOLVI_CASE_UI_V7' not in s:
    marker='\n/* RISOLVI_CASE_UI_V7 */\n'+css+'\n'
    pos=s.find('</style>')
    if pos<0: raise SystemExit('missing </style>')
    s=s[:pos]+marker+s[pos:]
core=Path('src/risolvi-case-core.js').read_text(encoding='utf-8')
layer=Path('src/risolvi-case-intelligence.js').read_text(encoding='utf-8')
if 'risolvi-case-core-v7' not in s:
    block='\n<script id="risolvi-case-core-v7">\n'+core+'\n</script>\n<script id="risolvi-case-intelligence-v7">\n'+layer+'\n</script>\n'
    pos=s.rfind('</body>')
    if pos<0: raise SystemExit('missing </body>')
    s=s[:pos]+block+s[pos:]
idx.write_text(s,encoding='utf-8')
for marker in ['7.0.0-case-intelligence','getIntelligenceState','RISOLVI_CASE_UI_V7','risolvi-case-core-v7','risolvi-case-intelligence-v7']:
    if marker not in s: raise SystemExit(f'missing index marker: {marker}')
wp=Path('worker.js')
w=wp.read_text(encoding='utf-8')
w=re.sub(r"const API_VERSION = '[^']+';","const API_VERSION = '2026-08-28.1';",w,count=1)
replacement='const INDEX_HTML = '+json.dumps(s,ensure_ascii=False)+';\n'
w2,n=re.subn(r'const INDEX_HTML = .*?;\n',lambda m:replacement,w,count=1,flags=re.S)
if n!=1: raise SystemExit('could not sync INDEX_HTML into worker')
wp.write_text(w2,encoding='utf-8')
if 'RISOLVI_CASE_UI_V7' not in w2 or '7.0.0-case-intelligence' not in w2: raise SystemExit('worker sync contract failed')
print('RISOLVI V7 Case Intelligence migration applied' if s!=orig else 'RISOLVI V7 already applied; worker resynced')
