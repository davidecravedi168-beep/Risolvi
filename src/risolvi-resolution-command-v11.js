(function(root,factory){
'use strict';
const api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
root.RisolviResolutionCommand=api;
if(typeof document!=='undefined')api.init();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION='RISOLVI-RESOLUTION-COMMAND-11.1';
const CLOSED=new Set(['closed','solved','risolta','conclusa']);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const txt=v=>String(v??'').trim();
const num=v=>Number.isFinite(Number(v))?Number(v):null;
function caseType(c={}){return txt(c.type||c.category||'generic').toLowerCase()||'generic'}
function isClosed(c={}){return CLOSED.has(txt(c.status).toLowerCase())}
function routeFor(type='generic'){
 const t=txt(type).toLowerCase();
 const routes={
  train:['Vettore / operatore','Reclamo formale tracciabile','Conciliazione o autorità competente del trasporto','Revisione umana se la pratica resta irrisolta'],
  flight:['Compagnia aerea','Claim / reclamo formale documentato','ADR o autorità competente in base al volo','Revisione umana se la pratica resta irrisolta'],
  'flight-bag':['Compagnia aerea / handling','PIR + reclamo documentato quando applicabile','ADR o autorità competente','Revisione umana se la pratica resta irrisolta'],
  purchase:['Venditore / marketplace','Richiesta o reclamo scritto tracciabile','ADR / associazione consumatori / procedura competente','Revisione umana se serve escalation formale'],
  cancel:['Fornitore / operatore','Disdetta o contestazione tracciabile','Conciliazione / ADR di settore quando applicabile','Revisione umana se la cessazione non viene recepita'],
  charge:['Fornitore / operatore','Contestazione e reclamo scritto','Conciliazione / ADR di settore quando applicabile','Revisione umana se il caso resta irrisolto'],
  energy:['Venditore / gestore','Reclamo scritto','Servizio di conciliazione / ADR energia quando applicabile','Revisione umana se il caso resta irrisolto'],
  telco:['Operatore','Reclamo scritto','ConciliaWeb / CORECOM quando applicabile','Revisione umana se il caso resta irrisolto'],
  generic:['Controparte','Richiesta scritta tracciabile','Procedura ufficiale / ADR competente','Revisione umana prima di escalation incerta']
 };
 return (routes[t]||routes.generic).slice();
}
function evidenceFor(c={}){
 const core=typeof RisolviCaseCore!=='undefined'?RisolviCaseCore:null;
 if(core?.evidenceFor)return core.evidenceFor(caseType(c));
 return ['Controparte identificata','Documento principale','Data del fatto','Importo e risultato richiesto'];
}
function caseReadiness(c={}){
 try{if(typeof RisolviCaseCore!=='undefined')return RisolviCaseCore.assessCase(c).readiness}catch{}
 const steps=Array.isArray(c.steps)?c.steps:[],done=steps.filter(x=>x&&x.done).length;
 return Math.max(0,Math.min(100,Math.round((steps.length?done/steps.length*55:20)+(c.source?.name?20:0)+(num(c.amount)>0?10:0)+(txt(c.draft)?15:0))));
}
function nextAction(c={}){
 try{if(typeof RisolviCaseCore!=='undefined')return RisolviCaseCore.assessCase(c).next}catch{}
 const s=(Array.isArray(c.steps)?c.steps:[]).find(x=>x&&!x.done);
 return s?{title:txt(s.title)||'Prossimo passo',text:txt(s.text)}:{title:'Verifica risposta / esito',text:'Non risultano attività aperte: aggiorna la pratica con la risposta ricevuta o con il nuovo ostacolo.'};
}
function timestampOf(c={}){
 for(const k of ['updated_at','updatedAt','modified_at','modifiedAt','created_at','createdAt']){
  const v=Date.parse(c[k]||'');if(Number.isFinite(v))return v;
 }
 return null;
}
function followUpClock(c={},now=Date.now()){
 if(isClosed(c))return{state:'CHIUSA',ageDays:0,label:'Nessun follow-up operativo richiesto',tone:'ok'};
 const ts=timestampOf(c);if(!Number.isFinite(ts))return{state:'N/D',ageDays:null,label:'Data attività non disponibile',tone:'warn'};
 const d=Math.max(0,(now-ts)/86400000);
 if(d>=14)return{state:'FOLLOW-UP',ageDays:Math.floor(d),label:`${Math.floor(d)} giorni senza aggiornamento registrato`,tone:'alert'};
 if(d>=7)return{state:'RICONTROLLA',ageDays:Math.floor(d),label:`${Math.floor(d)} giorni dall’ultimo aggiornamento`,tone:'warn'};
 return{state:'RECENTE',ageDays:Math.floor(d),label:`Aggiornata ${Math.floor(d)} giorni fa`,tone:'ok'};
}
function recordedDeadline(c={},now=Date.now()){
 for(const k of ['legal_deadline','legalDeadline','deadline','due_at','dueAt']){
  const raw=c[k],ts=Date.parse(raw||'');if(!Number.isFinite(ts))continue;
  const days=Math.ceil((ts-now)/86400000);
  return{known:true,days,raw,label:days<0?`Scadenza registrata superata da ${Math.abs(days)} gg`:days===0?'Scadenza registrata oggi':`Scadenza registrata tra ${days} gg`};
 }
 return{known:false,days:null,raw:null,label:'Termine legale non inferito: va verificato sulla fonte applicabile'};
}
function humanHandoff(c={}){
 const r=caseReadiness(c),t=caseType(c),steps=Array.isArray(c.steps)?c.steps:[];
 return t==='generic'||r<45||steps.some(s=>/avvoc|legale|autorità|giudic/i.test(`${s?.title||''} ${s?.text||''}`));
}
function commandFor(c={},now=Date.now()){
 const readiness=caseReadiness(c),clock=followUpClock(c,now),deadline=recordedDeadline(c,now),route=routeFor(caseType(c)),next=nextAction(c);
 const escalationLocked=readiness<60;
 return {id:c.id,title:txt(c.title)||'Pratica',type:caseType(c),status:txt(c.status)||'draft',readiness,next,clock,deadline,route,evidence:evidenceFor(c),humanHandoff:humanHandoff(c),escalationLocked};
}
function firstValue(c={},keys=[]){
 for(const k of keys){const v=txt(c?.[k]);if(v)return v}
 return '';
}
function complaintDraft(c={}){
 const x=commandFor(c),amount=num(c.amount);
 const recipient=txt(c.counterparty||c.company||c.operator||c.merchant||c.provider)||x.route[0]||'Controparte';
 const facts=firstValue(c,['facts','description','summary','problem','details','draft'])||x.title;
 const request=firstValue(c,['requested_outcome','requestedOutcome','desired_outcome','desiredOutcome','request','goal'])||
  (amount!=null?'la gestione della contestazione e, se dovuto, il rimborso o riaccredito dell’importo indicato':'la gestione della contestazione e una risposta scritta sul risultato richiesto');
 const eventDate=firstValue(c,['event_date','eventDate','incident_date','incidentDate','service_date','serviceDate']);
 const reference=firstValue(c,['reference','case_number','caseNumber','customer_code','customerCode','contract_code','contractCode']);
 const evidence=evidenceFor(c);
 const lines=[
  `Oggetto: Reclamo – ${x.title}`,
  '',
  `Spett.le ${recipient},`,
  '',
  'con la presente segnalo formalmente la seguente problematica:',
  facts,
  eventDate?`Data del fatto registrata: ${eventDate}`:'',
  reference?`Riferimento/codice registrato: ${reference}`:'',
  amount!=null?`Importo contestato o richiesto: €${amount.toFixed(2)}`:'',
  '',
  'Richiesta:',
  request,
  '',
  'Chiedo un riscontro scritto e la gestione della richiesta sopra indicata.',
  '',
  'Prima dell’invio verifica di avere disponibili, se applicabili:',
  ...evidence.map((v,i)=>`${i+1}. ${v}`),
  '',
  `Percorso successivo da verificare se il reclamo resta irrisolto: ${x.route.slice(2).join(' → ')}`,
  '',
  'Nota operativa: verifica destinatario, fatti, importi, documenti e termini sulla fonte ufficiale applicabile prima dell’invio.'
 ].filter(v=>v!=='');
 return lines.join('\n');
}
function packText(c={},now=Date.now()){
 const x=commandFor(c,now),amount=num(c.amount),source=txt(c.source?.name);
 const steps=Array.isArray(c.steps)?c.steps:[];
 const lines=[
  'RISOLVI · Resolution Pack',
  `Generato: ${new Date(now).toISOString()}`,
  '',`Pratica: ${x.title}`,`Categoria: ${x.type}`,`Stato: ${x.status}`,`Readiness: ${x.readiness}%`,
  amount!=null?`Importo registrato: €${amount.toFixed(2)}`:'Importo registrato: N/D',
  source?`Fonte indicata: ${source}`:'Fonte indicata: N/D','',
  `PROSSIMA AZIONE: ${x.next.title}`,x.next.text||'','',
  'PROVE / DOCUMENTI DA VERIFICARE:',...x.evidence.map((v,i)=>`${i+1}. ${v}`),'',
  'SCALA DI ESCALATION:',...x.route.map((v,i)=>`${i+1}. ${v}`),'',
  `FOLLOW-UP OPERATIVO: ${x.clock.label}`,
  `SCADENZA: ${x.deadline.label}`,
  `REVISIONE UMANA: ${x.humanHandoff?'CONSIGLIATA':'non richiesta dai gate attuali'}`,'',
  'ATTIVITÀ REGISTRATE:',...(steps.length?steps.map((s,i)=>`${i+1}. [${s.done?'x':' '}] ${txt(s.title)||'Attività'}${txt(s.text)?` — ${txt(s.text)}`:''}`):['Nessuna attività registrata.']),'',
  'BOZZA RECLAMO DA VERIFICARE:',complaintDraft(c),'',
  'Nota: questo pack organizza fatti e procedura. Non sostituisce consulenza legale e non stima la probabilità di successo.'
 ];
 return lines.join('\n');
}
function safeCases(){try{return App.getIntelligenceState()?.state?.cases||[]}catch{return[]}}
function css(){if(document.getElementById('risV11css'))return;const s=document.createElement('style');s.id='risV11css';s.textContent=`
.risV11{margin-top:12px}.risV11hero{border:1px solid rgba(97,230,168,.25);background:radial-gradient(circle at 95% 0,rgba(97,230,168,.08),transparent 16rem),linear-gradient(155deg,var(--card),var(--card2));border-radius:22px;padding:16px}.risV11head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.risV11k{font-size:8px;font-weight:950;letter-spacing:.14em;color:var(--green)}.risV11title{font-size:18px;font-weight:950;margin-top:4px}.risV11score{font-size:26px;font-weight:1000}.risV11grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:11px}.risV11box{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:13px;padding:10px}.risV11box span{display:block;font-size:7px;color:var(--muted)}.risV11box b{display:block;font-size:12px;margin-top:4px}.risV11next{margin-top:10px;border-left:3px solid var(--green);background:rgba(97,230,168,.045);padding:10px 11px;border-radius:0 12px 12px 0;font-size:10px;line-height:1.45}.risV11actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.risV11btn{border:1px solid var(--line2);background:var(--card2);color:var(--text);border-radius:12px;min-height:42px;font-size:9px;font-weight:900}.risV11route{margin-top:10px}.risV11step{display:flex;gap:8px;padding:8px 0;border-top:1px solid var(--line);font-size:9px;line-height:1.35}.risV11step:first-child{border-top:0}.risV11n{width:22px;height:22px;border-radius:50%;background:var(--card3);display:grid;place-items:center;flex:none;font-size:8px;font-weight:900}.risV11lock{color:var(--amber);font-size:8px;margin-top:8px}.risV11note{font-size:8px;color:var(--muted);line-height:1.45;margin-top:9px}@media(max-width:700px){.risV11actions{grid-template-columns:1fr}.risV11grid{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s)}
function downloadPack(c){const body=packText(c);const blob=new Blob([body],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`risolvi-pack-${String(c.id||'pratica').replace(/[^a-z0-9_-]/gi,'-')}.txt`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
async function copyText(body){
 if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){await navigator.clipboard.writeText(body);return true}
 if(typeof document==='undefined')return false;
 const ta=document.createElement('textarea');ta.value=body;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
 let ok=false;try{ok=document.execCommand('copy')}catch{}ta.remove();return ok;
}
function detailHtml(c){const x=commandFor(c),deadline=x.deadline.known?x.deadline.label:'Termine legale: da verificare';return `<section id="risV11current" class="risV11"><div class="risV11hero"><div class="risV11head"><div><div class="risV11k">RESOLUTION COMMAND · V11.1</div><div class="risV11title">Dal problema al reclamo pronto</div></div><div class="risV11score">${x.readiness}%</div></div><div class="risV11grid"><div class="risV11box"><span>FOLLOW-UP</span><b>${esc(x.clock.state)}</b></div><div class="risV11box"><span>SCADENZA</span><b>${esc(x.deadline.known?(x.deadline.days<=0?'URGENTE':`${x.deadline.days} GG`):'DA VERIFICARE')}</b></div><div class="risV11box"><span>HUMAN HANDOFF</span><b>${x.humanHandoff?'CONSIGLIATO':'NO'}</b></div></div><div class="risV11next"><b>Prossima azione:</b> ${esc(x.next.title)}<br>${esc(x.next.text||'')}</div><div class="risV11route">${x.route.map((v,i)=>`<div class="risV11step"><i class="risV11n">${i+1}</i><span>${esc(v)}</span></div>`).join('')}</div>${x.escalationLocked?'<div class="risV11lock">⚠ Escalation avanzata bloccata: completa prima la pratica fino ad almeno 60% di readiness.</div>':''}<div class="risV11actions"><button class="risV11btn" data-ris-complaint="${esc(c.id)}">COPIA RECLAMO PRONTO</button><button class="risV11btn" data-ris-pack="${esc(c.id)}">ESPORTA RESOLUTION PACK</button><button class="risV11btn" type="button" onclick="App.showPage('protect')">AGGIUNGI SCADENZA</button></div><div class="risV11note">${esc(x.clock.label)} · ${esc(deadline)}. Il reclamo è una bozza operativa: fatti, destinatario e termini vanno verificati prima dell’invio.</div></div></section>`}
function renderCurrent(){const host=document.getElementById('flowContent');if(!host||host.closest('.hidden'))return;let c=null;try{c=App.getIntelligenceState()?.currentCase||null}catch{};if(!c){const cases=safeCases();c=cases.find(x=>!isClosed(x))||cases[0]||null}if(!c){document.getElementById('risV11current')?.remove();return}const html=detailHtml(c),old=document.getElementById('risV11current');if(old)old.outerHTML=html;else host.insertAdjacentHTML('beforeend',html)}
function renderCases(){const page=document.getElementById('page-cases');if(!page||page.classList.contains('hidden'))return;const cases=safeCases().filter(c=>!isClosed(c));let host=document.getElementById('risV11cases');if(!host){host=document.createElement('section');host.id='risV11cases';host.className='risV11';const hero=page.querySelector('.hero');hero?hero.insertAdjacentElement('afterend',host):page.prepend(host)}if(!cases.length){host.innerHTML='<div class="risV11hero"><div class="risV11k">RESOLUTION COMMAND · V11.1</div><div class="risV11title">Nessuna pratica aperta</div><div class="risV11note">Quando apri una pratica, qui compaiono reclamo pronto, follow-up, escalation e pack esportabile.</div></div>';return}const ranked=cases.map(c=>({c,x:commandFor(c)})).sort((a,b)=>(b.x.clock.state==='FOLLOW-UP')-(a.x.clock.state==='FOLLOW-UP')||a.x.readiness-b.x.readiness);const top=ranked[0];host.innerHTML=`<div class="risV11hero"><div class="risV11head"><div><div class="risV11k">RESOLUTION COMMAND · V11.1</div><div class="risV11title">Pratica da muovere adesso</div></div><div class="risV11score">${top.x.readiness}%</div></div><div class="risV11next"><b>${esc(top.x.title)}</b><br>${esc(top.x.next.title)} · ${esc(top.x.clock.label)}</div><div class="risV11actions"><button class="risV11btn" data-ris-complaint="${esc(top.c.id)}">COPIA RECLAMO</button><button class="risV11btn" data-ris-pack="${esc(top.c.id)}">ESPORTA PACK</button><button class="risV11btn" data-ris-open="${esc(top.c.id)}">APRI PRATICA</button></div><div class="risV11note">I casi vengono ordinati privilegiando follow-up scaduti e bassa readiness, non una presunta probabilità di vittoria.</div></div>`}
function bind(){document.addEventListener('click',async e=>{const d=e.target.closest?.('[data-ris-complaint]');if(d){const id=d.getAttribute('data-ris-complaint'),c=safeCases().find(x=>String(x.id)===String(id));if(c){const old=d.textContent;const ok=await copyText(complaintDraft(c));d.textContent=ok?'COPIATO ✓':'COPIA NON RIUSCITA';setTimeout(()=>{d.textContent=old},1600)}return}const p=e.target.closest?.('[data-ris-pack]');if(p){const id=p.getAttribute('data-ris-pack'),c=safeCases().find(x=>String(x.id)===String(id));if(c)downloadPack(c);return}const o=e.target.closest?.('[data-ris-open]');if(o){const id=o.getAttribute('data-ris-open');try{if(typeof App.openCase==='function')App.openCase(id)}catch{}}})}
let timer=null;
function render(){try{css();renderCurrent();renderCases();document.documentElement.dataset.risolviResolutionCommand=VERSION}catch(e){console.error('RISOLVI V11',e)}}
function init(){if(timer)return;bind();const go=()=>requestAnimationFrame(render);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();document.addEventListener('risolvi:intelligence-refresh',go);document.addEventListener('visibilitychange',()=>{if(!document.hidden)go()});window.addEventListener('focus',go);timer=setInterval(()=>{if(!document.hidden)render()},30000)}
return{VERSION,caseType,routeFor,evidenceFor,caseReadiness,nextAction,followUpClock,recordedDeadline,humanHandoff,commandFor,complaintDraft,packText,init};
});