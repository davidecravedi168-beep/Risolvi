(function(){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let lastAnalysisSig='',lastCasesSig='',renderQueued=false;
function intel(){try{return App.getIntelligenceState()}catch(e){return null}}
function row(n,title,text){return `<div class="ci-row"><i class="ci-dot">${esc(n)}</i><div class="ci-copy"><b>${esc(title)}</b><span>${esc(text||'')}</span></div></div>`}
function renderAnalysis(){
 const host=document.getElementById('flowContent');
 if(!host||host.closest('.hidden')){lastAnalysisSig='';return}
 const x=intel(),a=x&&x.currentAnalysis;
 if(!a||typeof RisolviCaseCore==='undefined'){
   document.getElementById('ci-current')?.remove();lastAnalysisSig='';return;
 }
 const r=RisolviCaseCore.assessAnalysis(a),e=r.evidence||[],lad=r.ladder||[];
 const sig=JSON.stringify({type:a.type,title:a.title,amount:a.amount,readiness:r.readiness,label:r.label,priority:r.priority,priorityLabel:r.priorityLabel,completeness:r.completeness,urgency:r.urgency,complexity:r.complexity,humanReview:r.humanReview,next:r.next,evidence:e,ladder:lad,source:r.source});
 if(sig===lastAnalysisSig&&document.getElementById('ci-current'))return;
 lastAnalysisSig=sig;
 const html=`<section id="ci-current" class="ci-wrap"><div class="ci-hero"><div class="ci-head"><div><div class="ci-kicker">CASE INTELLIGENCE · V8 PREMIUM</div><div class="ci-title">Decision cockpit della pratica</div><div class="ci-badges"><span class="ci-badge ${esc(r.label)}">READINESS · ${esc(r.label)}</span><span class="ci-priority p-${esc(r.priorityLabel)}">PRIORITÀ · ${esc(r.priorityLabel)}</span></div></div><div class="ci-score"><b>${esc(r.readiness)}%</b><span>readiness</span></div></div><div class="ci-bar"><i style="width:${esc(r.readiness)}%"></i></div><div class="ci-grid"><div class="ci-metric"><span>Completezza</span><b>${esc(r.completeness)}%</b></div><div class="ci-metric"><span>Urgenza</span><b>${esc(r.urgency)}%</b></div><div class="ci-metric"><span>Complessità</span><b>${esc(r.complexity)}%</b></div><div class="ci-metric ci-priorityMetric"><span>Priority score</span><b>${esc(r.priority)}%</b></div></div><div class="ci-trust">${esc(r.trust)}</div><details class="ci-formula"><summary>Come vengono calcolati i punteggi</summary><div><b>Readiness</b><code>${esc(r.readinessFormula)}</code><b>Priorità</b><code>${esc(r.priorityFormula)}</code><p>La priorità indica quanto velocemente conviene occuparsi della pratica in base a urgenza, informazioni mancanti e complessità. Non stima la probabilità di vincere.</p></div></details></div>
 <div class="ci-card ci-next"><div class="ci-kicker">NEXT BEST ACTION</div><h3>${esc(r.next.title)}</h3><p>${esc(r.next.text)}</p></div>
 <div class="ci-card"><h3>Prove da avere</h3><div class="ci-list">${e.map((v,i)=>row(i+1,v,'Da verificare/raccogliere se rilevante per il caso concreto.')).join('')}</div></div>
 <div class="ci-card"><h3>Scala di escalation</h3><div class="ci-list">${lad.map((v,i)=>row(i+1,v,i===0?'Parti dal livello meno oneroso e più tracciabile.':i===lad.length-1?'Solo se i passaggi precedenti non bastano.':'Usa il canale ufficiale appropriato.')).join('')}</div>${r.humanReview?'<div class="ci-alert"><b>REVISIONE UMANA CONSIGLIATA</b><br>Il caso è complesso o incompleto: RISOLVI non deve trasformare l’automazione in una falsa certezza.</div>':''}<div class="ci-trust">Fonti/regole prodotto controllate: ${esc(r.rulesUpdated)}. La fonte specifica del caso resta quella mostrata nella diagnosi.</div></div></section>`;
 const old=document.getElementById('ci-current');if(old)old.outerHTML=html;else host.insertAdjacentHTML('beforeend',html);
}
function renderCases(){
 const page=document.getElementById('page-cases');
 if(!page||page.classList.contains('hidden')||typeof RisolviCaseCore==='undefined'){lastCasesSig='';return}
 const x=intel();if(!x||!x.state)return;
 const s=RisolviCaseCore.summarizeCases(x.state.cases||[]),top=s.items.slice(0,3);
 const sig=JSON.stringify({total:s.total,open:s.open,ready:s.ready,lowReadiness:s.lowReadiness,top:top.map(c=>({id:c.id,title:c.title,readiness:c.readiness,next:c.next,status:c.status}))});
 if(sig===lastCasesSig&&document.getElementById('ci-case-command'))return;
 lastCasesSig=sig;
 const html=`<section id="ci-case-command" class="ci-wrap"><div class="ci-card ci-command"><div class="ci-kicker">CASE CONTROL CENTER · V8</div><div class="ci-title">Le pratiche che richiedono attenzione</div><div class="ci-casegrid"><div class="ci-mini"><span>Aperte</span><b>${esc(s.open)}</b></div><div class="ci-mini"><span>Pronte</span><b>${esc(s.ready)}</b></div><div class="ci-mini"><span>Da completare</span><b>${esc(s.lowReadiness)}</b></div><div class="ci-mini"><span>Totali</span><b>${esc(s.total)}</b></div></div>${top.length?`<div class="ci-list">${top.map((c,i)=>row(i+1,`${c.title} · ${c.readiness}%`,`Prossimo: ${c.next.title}`)).join('')}</div>`:'<p>Nessuna pratica ancora da ordinare.</p>'}<div class="ci-trust">Le pratiche meno pronte vengono mostrate prima per non perdere passaggi essenziali. La classifica non predice l’esito della controversia.</div></div></section>`;
 const old=document.getElementById('ci-case-command');if(old)old.outerHTML=html;else{const hero=page.querySelector('.hero');if(hero)hero.insertAdjacentHTML('afterend',html);else page.insertAdjacentHTML('afterbegin',html)}
}
function render(){renderQueued=false;renderAnalysis();renderCases()}
function queueRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(render)}
const obs=new MutationObserver(muts=>{
 if(muts.every(m=>m.target.closest&&m.target.closest('#ci-current,#ci-case-command')))return;
 queueRender();
});
document.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});render()});
window.addEventListener('storage',queueRender);
window.addEventListener('focus',queueRender);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')queueRender()});
document.addEventListener('risolvi:intelligence-refresh',queueRender);
setInterval(()=>{if(document.visibilityState==='visible')queueRender()},30000);
})();
