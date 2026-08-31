(function(root,factory){
'use strict';
const api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
root.RisolviMonetizationV14=api;
if(typeof document!=='undefined')api.init();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const VERSION='RISOLVI-MONETIZATION-14.1';
const PRO_PRICE=6.99;
const DBKEY='risolvi_v6_state';
const PRICE_TEXT='€6,99';

const FREE_ITEMS=[
  'Diagnosi e categoria del problema',
  'Urgenza, completezza e cosa manca',
  'Primi passi e fonte ufficiale disponibile'
];
const PRO_ITEMS=[
  'Checklist operativa salvabile',
  'Bozza pronta da copiare e personalizzare',
  'Dossier esportabile con prove e passaggi',
  'Cronologia, follow-up ed escalation guidata'
];

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const eur=v=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(v||0));
const clone=v=>JSON.parse(JSON.stringify(v));

function normalizeLatestPurchaseState(input,method=''){
  const state=input&&typeof input==='object'?clone(input):{};
  if(Array.isArray(state.cases)&&state.cases.length){
    const c=state.cases[0]||{};
    c.price=PRO_PRICE;
    if(method)c.method=String(method).slice(0,40);
    if(Array.isArray(c.events)){
      const exists=c.events.some(e=>String(e&&e.label||'').includes('Pratica Pro · €6,99'));
      if(!exists)c.events.push({at:new Date().toISOString(),label:'Pratica Pro · €6,99'});
      c.events=c.events.slice(-30);
    }
    state.cases[0]=c;
  }
  if(Array.isArray(state.beta?.events)){
    for(let i=state.beta.events.length-1;i>=0;i--){
      const e=state.beta.events[i];
      if(!e||!['checkout_open','practice_unlocked'].includes(e.name))continue;
      e.meta=e.meta&&typeof e.meta==='object'?e.meta:{};
      e.meta.price=PRO_PRICE;
      if(e.name==='checkout_open')break;
    }
  }
  return state;
}

function patchStoredPurchase(method){
  try{
    const raw=localStorage.getItem(DBKEY);
    if(!raw)return null;
    const normalized=normalizeLatestPurchaseState(JSON.parse(raw),method);
    localStorage.setItem(DBKEY,JSON.stringify(normalized));
    return normalized;
  }catch{return null}
}

function normalizedSnapshot(snapshot){
  if(!snapshot||typeof snapshot!=='object')return snapshot;
  const out=clone(snapshot);
  try{
    const persisted=JSON.parse(localStorage.getItem(DBKEY)||'null');
    if(!persisted||!Array.isArray(persisted.cases)||!Array.isArray(out.state?.cases))return out;
    const byId=new Map(persisted.cases.map(c=>[String(c?.id||''),c]));
    out.state.cases=out.state.cases.map(c=>{
      const p=byId.get(String(c?.id||''));
      if(!p)return c;
      return {...c,price:Number(p.price)||c.price,method:p.method||c.method,events:Array.isArray(p.events)?p.events:c.events};
    });
  }catch{}
  return out;
}

function injectCss(){
  if(q('#risMonetizationV14Css'))return;
  const s=document.createElement('style');
  s.id='risMonetizationV14Css';
  s.textContent=`
.risProRule{margin:11px 0 2px;border:1px solid rgba(97,230,168,.22);background:linear-gradient(145deg,rgba(97,230,168,.06),rgba(126,176,255,.035));border-radius:15px;padding:11px 12px;font-size:10.5px;line-height:1.45;color:var(--muted)}
.risProRule b{color:var(--text)}
.risProSplit{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:11px 0}
.risProCol{border:1px solid var(--line);background:var(--card2);border-radius:14px;padding:11px}
.risProCol.pro{border-color:rgba(97,230,168,.26);background:rgba(97,230,168,.045)}
.risProCol b{display:block;font-size:10px;letter-spacing:.04em;margin-bottom:6px}
.risProCol span{display:block;color:var(--muted);font-size:9.5px;line-height:1.4;padding:3px 0}
.risProPriceNote{font-size:10px;color:var(--muted);margin-top:7px;line-height:1.4}
@media(max-width:480px){.risProSplit{grid-template-columns:1fr}}
`;
  document.head.appendChild(s);
}

function addHomeRule(){
  const composer=q('#page-home .composer');
  if(!composer||q('#risProRule'))return;
  const d=document.createElement('div');
  d.id='risProRule';
  d.className='risProRule';
  d.innerHTML='<b>Gratis per capire.</b> Diagnosi, cosa manca, primi passi e fonte restano gratuiti. <b>Pratica Pro €6,99</b> serve solo se vuoi il lavoro operativo già pronto. Nessun abbonamento.';
  composer.insertAdjacentElement('afterend',d);
}

function analysisAmount(){
  try{return Number(App.getIntelligenceState()?.currentAnalysis?.amount||0)||0}catch{return 0}
}

function syncUnlockCards(){
  qa('#page-flow .unlock').forEach(card=>{
    const label=q('.label',card);if(label&&label.textContent!=='PRATICA PRO · UNA TANTUM')label.textContent='PRATICA PRO · UNA TANTUM';
    const price=q('.price',card);if(price&&price.textContent!==PRICE_TEXT)price.textContent=PRICE_TEXT;
    const free=q('.whatsfree',card);
    if(free)free.innerHTML='<b>Gratis:</b> capisci il problema, cosa manca e i prossimi passi. <b>Pro:</b> trasformi tutto in una pratica pronta da gestire.';
    const clarity=q('.buyclarity',card);
    if(clarity)clarity.innerHTML='<div class="buyitem"><b>✓ Reclamo / richiesta pronta</b><span>Bozza modificabile e copiabile.</span></div><div class="buyitem"><b>✓ Checklist prove</b><span>Documenti e passaggi in ordine.</span></div><div class="buyitem"><b>✓ Dossier esportabile</b><span>Pratica pronta da conservare o condividere.</span></div><div class="buyitem"><b>✓ Follow-up guidato</b><span>Stato, cronologia e prossimo passo.</span></div>';
    const amount=analysisAmount();
    const cells=qa('.valuebox .valuecell',card);
    if(cells[1]){
      const strong=q('strong',cells[1]);if(strong&&strong.textContent!==PRICE_TEXT)strong.textContent=PRICE_TEXT;
      const small=q('small',cells[1]);
      if(small){
        const ratio=amount>0?Math.min(999,(PRO_PRICE/amount)*100):0;
        small.textContent=amount>0&&ratio<100?`Circa ${ratio.toFixed(1).replace('.',',')}% del valore indicato.`:'Pagamento una tantum.';
      }
    }
    const buy=qa('button',card).find(b=>/App\.openCheckout/.test(b.getAttribute('onclick')||''));
    if(buy&&buy.textContent!==`SBLOCCA PRATICA PRO · ${PRICE_TEXT}`)buy.textContent=`SBLOCCA PRATICA PRO · ${PRICE_TEXT}`;
    const micro=qa('.micro',card).at(-1);if(micro)micro.textContent='Se ti basta la parte gratuita, puoi fermarti qui. Nessun timer, nessun abbonamento.';
  });
}

function syncCheckout(){
  const modal=q('#checkoutModal');if(!modal)return;
  const label=q('.label',modal);if(label&&label.textContent!=='PRATICA PRO')label.textContent='PRATICA PRO';
  const price=q('#checkoutPrice',modal);if(price&&price.textContent!==PRICE_TEXT)price.textContent=PRICE_TEXT;
  const desc=q('p.muted',modal);
  if(desc)desc.textContent='Una pratica, una volta sola. Hai già visto gratis diagnosi e prossimi passi: qui sblocchi bozza, checklist, dossier e follow-up.';
  let split=q('.risProSplit',modal);
  if(!split){
    split=document.createElement('div');split.className='risProSplit';
    split.innerHTML=`<div class="risProCol"><b>GIÀ GRATIS</b>${FREE_ITEMS.map(x=>`<span>✓ ${x}</span>`).join('')}</div><div class="risProCol pro"><b>SBLOCCA CON PRO</b>${PRO_ITEMS.map(x=>`<span>✓ ${x}</span>`).join('')}</div>`;
    const payrow=q('.payrow',modal);payrow?.insertAdjacentElement('beforebegin',split);
  }
  const decline=qa('button',modal).find(b=>/openBetaFeedback/.test(b.getAttribute('onclick')||''));
  if(decline&&!decline.dataset.risProContinue){
    decline.dataset.risProContinue='1';
    decline.removeAttribute('onclick');
    decline.textContent='CONTINUA GRATIS';
    decline.addEventListener('click',()=>App.closeCheckout());
  }
  const note=qa('.micro',modal).at(-1);
  if(note&&!window.webkit)note.textContent='Beta web: nessun addebito reale. Il prezzo e il contenuto del prodotto sono già fissati per il test.';
}

function wrapApp(){
  if(!window.App||window.__risolviMonetizationV14Wrapped)return false;
  window.__risolviMonetizationV14Wrapped=true;

  const originalOpenCheckout=App.openCheckout?.bind(App);
  const originalPay=App.pay?.bind(App);
  const originalGetState=App.getIntelligenceState?.bind(App);

  if(originalOpenCheckout){
    App.openCheckout=function(sku){
      const out=originalOpenCheckout(sku);
      queueMicrotask(syncCheckout);
      return out;
    };
  }

  if(originalPay){
    App.pay=function(method){
      const out=originalPay(method);
      patchStoredPurchase(method||'Pratica Pro');
      document.dispatchEvent(new CustomEvent('risolvi:intelligence-refresh'));
      return out;
    };
  }

  if(originalGetState){
    App.getIntelligenceState=function(){return normalizedSnapshot(originalGetState())};
  }
  return true;
}

let queued=false;
function run(){
  try{
    document.documentElement.dataset.risolviMonetization=VERSION;
    injectCss();addHomeRule();wrapApp();syncUnlockCards();syncCheckout();
  }catch(e){console.error('RISOLVI monetization V14',e)}
}
function queueRun(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})}
function init(){
  run();
  const obs=new MutationObserver(queueRun);
  if(document.body)obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  else document.addEventListener('DOMContentLoaded',()=>obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']}),{once:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueRun()});
  window.addEventListener('focus',queueRun);
}

return {VERSION,PRO_PRICE,FREE_ITEMS:FREE_ITEMS.slice(),PRO_ITEMS:PRO_ITEMS.slice(),normalizeLatestPurchaseState,normalizedSnapshot,init};
});
