from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]; AS=ROOT/'assets'; AS.mkdir(exist_ok=True)
BG=(5,11,19); CYAN=(82,201,241); BLUE=(65,128,180); GREEN=(67,220,176); INK=(238,244,248)
def icon(size):
    im=Image.new('RGB',(size,size),BG); d=ImageDraw.Draw(im)
    o=max(2,int(size*.012)); pad=int(size*.08)
    d.rounded_rectangle((pad,pad,size-pad,size-pad),radius=int(size*.18),outline=(39,74,101),width=o)
    box=(int(size*.22),int(size*.20),int(size*.78),int(size*.76)); w=max(4,int(size*.038))
    d.arc(box,35,330,fill=CYAN,width=w)
    d.line([(size*.34,size*.53),(size*.47,size*.66),(size*.70,size*.38)],fill=GREEN,width=w,joint='curve')
    d.ellipse((size*.67,size*.34,size*.73,size*.40),fill=INK)
    return im
for s in (180,192,512): icon(s).save(AS/f'risolvi-icon-{s}.png',optimize=True)
(ROOT/'manifest.webmanifest').write_text('''{\n  "name":"RISOLVI",\n  "short_name":"RISOLVI",\n  "start_url":"./",\n  "scope":"./",\n  "display":"standalone",\n  "background_color":"#050b13",\n  "theme_color":"#050b13",\n  "icons":[\n    {"src":"assets/risolvi-icon-192.png","sizes":"192x192","type":"image/png","purpose":"any maskable"},\n    {"src":"assets/risolvi-icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}\n  ]\n}''',encoding='utf-8')
p=ROOT/'index.html'; s=p.read_text(encoding='utf-8')
links='''\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" sizes="192x192" href="assets/risolvi-icon-192.png">\n<link rel="apple-touch-icon" sizes="180x180" href="assets/risolvi-icon-180.png">\n<meta name="apple-mobile-web-app-title" content="RISOLVI">'''
if 'risolvi-icon-180.png' not in s:s=s.replace('</title>','</title>'+links,1)
old='<span class="brandmark">R</span>'; new='<img class="brandmark" src="assets/risolvi-icon-192.png" alt="" width="30" height="30" style="object-fit:cover;padding:0">'
if old in s:s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8'); print('RISOLVI premium branding ready')