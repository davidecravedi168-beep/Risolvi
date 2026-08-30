(function(){
'use strict';
const VERSION='RISOLVI-SIMPLE-UI-13.0';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const txt=(el,v)=>{if(el&&el.textContent!==v)el.textContent=v};

function injectCss(){
 if(q('#risSimpleV13Css'))return;
 const s=document.createElement('style');
 s.id='risSimpleV13Css';
 s.textContent=`
html.ris-simple-v13 .app{max-width:680px;padding-left:14px;padding-right:14px}
html.ris-simple-v13 .topbar{padding-top:7px}
html.ris-simple-v13 .topactions .iconbtn:nth-child(n+3){display:none!important}
html.ris-simple-v13 .hero{padding:20px 3px 13px}
html.ris-simple-v13 #page-home .hero .eyebrow{font-size:9px;letter-spacing:.08em}
html.ris-simple-v13 #page-home .hero h1{font-size:clamp(32px,9vw,44px);line-height:1;margin:7px 0 9px}
html.ris-simple-v13 #page-home .hero p{font-size:15px;max-width:560px}
html.ris-simple-v13 #page-home .trustrow{margin-top:11px}
html.ris-simple-v13 #page-home .trustrow .badge:nth-child(2){display:none}
html.ris-simple-v13 #page-home .accessbar{margin-top:11px}
html.ris-simple-v13 #page-home .accessbar .accesspill:not(:first-child){display:none}
html.ris-simple-v13 #page-home .hero>.micro{display:none}
html.ris-simple-v13 .composer{border-radius:22px;padding:11px;box-shadow:0 14px 40px rgba(0,0,0,.24)}
html.ris-simple-v13 .composer textarea{min-height:108px;border-radius:15px;padding:14px;font-size:16px}
html.ris-simple-v13 .toolrow{grid-template-columns:46px 46px 1fr;gap:7px;margin-top:8px}
html.ris-simple-v13 .toolbtn{min-width:46px;min-height:48px;border-radius:13px;font-size:18px}
html.ris-simple-v13 .composer .btn.primary{min-height:48px;border-radius:13px;font-size:12px;letter-spacing:.015em}
html.ris-simple-v13 #privacyHint{font-size:10px;margin:8px 2px 0}
html.ris-simple-v13 #page-home .quickrow,
html.ris-simple-v13 #page-home .guidecard,
html.ris-simple-v13 #page-home .howgrid,
html.ris-simple-v13 #page-home .honestproof,
html.ris-simple-v13 #page-home .card.accent{display:none!important}
html.ris-simple-v13 #page-home .risHideTitle{display:none!important}
html.ris-simple-v13 #page-home .sectiontitle{margin:19px 2px 8px;font-size:9px;letter-spacing:.08em}
html.ris-simple-v13 #page-home .grid{gap:8px}
html.ris-simple-v13 #page-home .tile{min-height:86px;padding:12px 13px;border-radius:17px;display:grid;grid-template-columns:32px 1fr;column-gap:8px;align-items:center}
html.ris-simple-v13 #page-home .tile .ico{font-size:22px;grid-row:1/3}
html.ris-simple-v13 #page-home .tile b{font-size:13px;margin:0;align-self:end}
html.ris-simple-v13 #page-home .tile span{display:none}
html.ris-simple-v13 #page-home .tile.hot:after{display:none}
html.ris-simple-v13 .risSimpleHow{margin:11px 0 4px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.02);overflow:hidden}
html.ris-simple-v13 .risSimpleHow summary{list-style:none;padding:12px 13px;font-size:11px;font-weight:900;color:var(--muted);cursor:pointer}
html.ris-simple-v13 .risSimpleHow summary::-webkit-details-marker{display:none}
html.ris-simple-v13 .risSimpleHow[open] summary{border-bottom:1px solid var(--line)}
html.ris-simple-v13 .risSimpleHow div{padding:11px 13px;font-size:11px;line-height:1.55;color:var(--muted)}
html.ris-simple-v13 .risSimpleHow b{color:var(--text)}
html.ris-simple-v13 .bottom .nav button{font-size:10px;line-height:1.35}
html.ris-simple-v13 #page-flow .risSimpleResult .radar,
html.ris-simple-v13 #page-flow .risSimpleResult .explain,
html.ris-simple-v13 #page-flow .risSimpleResult .readrow{display:none!important}
html.ris-simple-v13 #page-flow .risSimpleResult.risSimpleDetails .radar,
html.ris-simple-v13 #page-flow .risSimpleResult.risSimpleDetails .explain,
html.ris-simple-v13 #page-flow .risSimpleResult.risSimpleDetails .readrow{display:grid!important}
html.ris-simple-v13 #page-flow .risSimpleResult.risSimpleDetails .readrow{display:flex!important}
html.ris-simple-v13 #page-flow #ci-current,
html.ris-simple-v13 #page-flow #risV11current{display:none!important}
html.ris-simple-v13.ris-advanced-open #page-flow #ci-current,
html.ris-simple-v13.ris-advanced-open #page-flow #risV11current{display:block!important}
html.ris-simple-v13 .risSimpleMore{width:100%;margin-top:11px;border:1px solid var(--line);background:var(--card2);color:var(--text);border-radius:13px;min-height:43px;font-size:10px;font-weight:900}
html.ris-simple-v13 .risSimpleResult .steps li:first-child{border:1px solid rgba(97,230,168,.23);background:rgba(97,230,168,.045);border-radius:13px;padding:11px;margin:9px 0}
html.ris-simple-v13 .risSimpleResult .sourcebox{font-size:9.5px}
html.ris-simple-v13 .unlock .buyclarity{display:none}
html.ris-simple-v13 .unlock .trustrow{display:none}
html.ris-simple-v13 .unlock .valuebox{margin-top:9px}
html.ris-simple-v13 #risV11current .risV11score,
html.ris-simple-v13 #risV11current .risV11grid,
html.ris-simple-v13 #risV11current .risV11route,
html.ris-simple-v13 #risV11current .risV11note{display:none}
html.ris-simple-v13 #risV11current.risCaseAdvanced .risV11grid,
html.ris-simple-v13 #risV11current.risCaseAdvanced .risV11route,
html.ris-simple-v13 #risV11current.risCaseAdvanced .risV11note{display:grid}
html.ris-simple-v13 #risV11current.risCaseAdvanced .risV11route{display:block}
html.ris-simple-v13 #page-cases .hero,
html.ris-simple-v13 #page-protect .hero{padding-top:18px;padding-bottom:10px}
html.ris-simple-v13 #page-cases .hero h1,
html.ris-simple-v13 #page-protect .hero h1{font-size:34px}
@media(max-width:520px){
 html.ris-simple-v13 #page-home .grid{grid-template-columns:1fr 1fr}
 html.ris-simple-v13 #page-home .tile{min-height:80px;padding:11px}
 html.ris-simple-v13 #page-home .tile b{font-size:12px}
}
`;
 document.head.appendChild(s);
}

function simplifyHome(){
 const home=q('#page-home');if(!home)return;
 txt(q('.hero .eyebrow',home),'RISOLVI');
 const h=q('.hero h1',home);if(h)h.innerHTML='Che problema hai?';
 txt(q('.hero p',home),'Scrivilo come ti viene. Ti diciamo cosa fare adesso, senza parole complicate.');
 const badges=qa('.hero .trustrow .badge',home);if(badges[0])txt(badges[0],'✓ Gratis per capire');if(badges[2])txt(badges[2],'🔒 Privato');
 const guide=q('.accessbar .accesspill',home);if(guide)txt(guide,'NON VUOI SCRIVERE? GUIDAMI');
 const ta=q('#freeText');if(ta)ta.placeholder='Es. Mi hanno addebitato 59 € dopo la disdetta';
 const cta=q('.composer .btn.primary',home);if(cta)txt(cta,'TROVA COSA FARE');
 const hint=q('#privacyHint');if(hint)hint.innerHTML='🛡 Il testo e gli allegati <b>non vengono salvati</b>.';
 const titles=qa('.sectiontitle',home);
 titles.forEach(t=>{
   const v=t.textContent.trim().toLowerCase();
   if(v.includes('come funziona')||v.includes('regola del prodotto'))t.classList.add('risHideTitle');
   if(v.includes('scegli il problema'))txt(t,'Scegli il problema');
 });
 if(!q('#risSimpleHow',home)){
   const grid=q('.grid',home);if(grid){
     const d=document.createElement('details');d.id='risSimpleHow';d.className='risSimpleHow';
     d.innerHTML='<summary>Come funziona?</summary><div><b>1.</b> Racconta il problema. <b>2.</b> Vedi subito cosa fare e cosa manca. <b>3.</b> Decidi tu se fermarti o continuare con la pratica.</div>';
     grid.insertAdjacentElement('afterend',d);
   }
 }
}

function simplifyNavigation(){
 const protect=q('#nav-protect');if(protect)protect.innerHTML='◷<br>Scadenze';
 const info=q('#nav-info');if(info)info.innerHTML='ⓘ<br>Info';
 const cases=q('#nav-cases');if(cases)cases.innerHTML='▣<br>Pratiche';
 const home=q('#nav-home');if(home)home.innerHTML='⌂<br>Risolvi';
}

function simplifyPages(){
 const cases=q('#page-cases');if(cases){txt(q('.hero .eyebrow',cases),'PRATICHE');txt(q('.hero h1',cases),'Le tue pratiche');txt(q('.hero p',cases),'Qui vedi cosa richiede attenzione e qual è il prossimo passo.');}
 const protect=q('#page-protect');if(protect){txt(q('.hero .eyebrow',protect),'SCADENZE');txt(q('.hero h1',protect),'Non dimenticare rinnovi.');txt(q('.hero p',protect),'Salva una data importante e il costo collegato.');}
}

function enhanceResults(){
 qa('#page-flow [data-analysis-result].card.accent').forEach(card=>{
   if(card.dataset.risSimple==='1')return;card.dataset.risSimple='1';card.classList.add('risSimpleResult');
   const label=q('.label',card);if(label)txt(label,'COSA FARE');
   const badge=q('.badge',card);if(badge){const v=badge.textContent.trim();if(v.includes('DIAGNOSI SOLIDA'))txt(badge,'DATI OK');else if(v.includes('DA COMPLETARE'))txt(badge,'MANCA QUALCOSA');else if(v.includes('DATI INSUFFICIENTI'))txt(badge,'SERVONO DATI');}
   const b=document.createElement('button');b.type='button';b.className='risSimpleMore';b.textContent='VEDI PERCHÉ / DETTAGLI';
   b.onclick=()=>{const open=card.classList.toggle('risSimpleDetails');document.documentElement.classList.toggle('ris-advanced-open',open);b.textContent=open?'NASCONDI DETTAGLI':'VEDI PERCHÉ / DETTAGLI';};
   card.appendChild(b);
 });
 qa('#page-flow .unlock').forEach(card=>{const label=q('.label',card);if(label&&/SE VUOI PASSARE ALL.AZIONE/i.test(label.textContent))txt(label,'VUOI CONTINUARE CON RISOLVI?');});
}

function simplifyV11(){
 const root=q('#risV11current');if(!root||root.dataset.risSimple==='1')return;root.dataset.risSimple='1';
 txt(q('.risV11k',root),'PROSSIMO PASSO');txt(q('.risV11title',root),'Cosa fare adesso');
 const actions=q('.risV11actions',root);if(actions){const b=document.createElement('button');b.type='button';b.className='risV11btn';b.textContent='VEDI PERCORSO COMPLETO';b.onclick=()=>{const open=root.classList.toggle('risCaseAdvanced');b.textContent=open?'NASCONDI PERCORSO':'VEDI PERCORSO COMPLETO';};actions.appendChild(b);}
}

function run(){
 try{
   document.documentElement.classList.add('ris-simple-v13');
   document.documentElement.dataset.risolviSimpleUi=VERSION;
   injectCss();simplifyHome();simplifyNavigation();simplifyPages();enhanceResults();simplifyV11();
 }catch(e){console.error('RISOLVI simple UI V13',e)}
}
let timer=null;
function init(){run();if(timer)return;timer=setInterval(()=>{if(!document.hidden)run()},1200);document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();