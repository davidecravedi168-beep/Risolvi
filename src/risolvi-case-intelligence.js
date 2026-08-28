(function(){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function intel(){try{return App.getIntelligenceState()}catch(e){return null}}
function row(n,title,text){return `<div class="ci-row"><i class="ci-dot">${esc(n)}</i><div class="ci-copy"><b>${esc(title)}</b><span>${esc(text||'')}</span></div></div>`}
function renderAnalysis(){
 const host=document.getElementById('flowContent');if(!host||host.closest('.hidden'))return;
 const x=intel(),a=x&&x.currentAnalysis;if(!a||typeof RisolviCaseCore==='undefined'){document.getElementById('ci-current')?.remove();return}
 const r=RisolviCaseCore.assessAnalysis(a),e=r.evidence||[],lad=r.ladder||[];
 const html=`<section id="ci-current" class="ci-wrap"><div class="ci-hero"><div class="ci-head"><div><div class="ci-kicker">CASE INTELLIGENCE · V7</div><div class="ci-title">Quanto è pronta questa pratica?</div><span class="ci-badge ${esc(r.label)}">${esc(r.label)}</span></div><div class="ci-score"><b>${esc(r.readiness)}%</b><span>readiness</span></div></div><div class="ci-bar"><i style="width:${esc(r.readiness)}%"></i></div><div class="ci-grid"><div class="ci-metric"><span>Completezza</span><b>${esc(r.completeness)}%</b></div><div class="ci-metric"><span>Urgenza</span><b>${esc(r.urgency)}%</b></div><div class="ci-metric"><span>Complessità</span><b>${esc(r.complexity)}%</b></div></div><div class="ci-trust">${esc(r.trust)}</div></div>
 <div class="ci-card"><h3>Prossima azione</h3><p><b>${esc(r.next.title)}</b><br>${esc(r.next.text)}</p></div>
 <div class="ci-card"><h3>Prove da avere</h3><div class="ci-list">${e.map((v,i)=>row(i+1,v,'Da verificare/raccogliere se rilevante per il caso concreto.')).join('')}</div></div>
 <div class="ci-card"><h3>Scala di escalation</h3><div class="ci-list">${lad.map((v,i)=>row(i+1,v,i===0?'Parti dal livello meno oneroso e più tracciabile.':i===lad.length-1?'Solo se i passaggi precedenti non bastano.':'Usa il canale ufficiale appropriato.')).join('')}</div>${r.humanReview?'<div class="ci-alert"><b>REVISIONE UMANA CONSIGLIATA</b><br>Il caso è complesso o incompleto: RISOLVI non deve trasformare l’automazione in una falsa certezza.</div>':''}<div class="ci-trust">Fonti/regole prodotto controllate: ${esc(r.rulesUpdated)}. La fonte specifica del caso resta quella mostrata nella diagnosi.</div></div></section>`;
 const old=document.getElementById('ci-current');if(old)old.outerHTML=html;else host.insertAdjacentHTML('beforeend',html);
}
function renderCases(){
 const page=document.getElementById('page-cases');if(!page||page.classList.contains('hidden')||typeof RisolviCaseCore==='undefined')return;
 const x=intel();if(!x||!x.state)return;
 const s=RisolviCaseCore.summarizeCases(x.state.cases||[]),top=s.items.slice(0,3);
 const html=`<section id="ci-case-command" class="ci-wrap"><div class="ci-card"><div class="ci-kicker">CASE CONTROL CENTER</div><div class="ci-title">Le pratiche che richiedono attenzione</div><div class="ci-casegrid"><div class="ci-mini"><span>Aperte</span><b>${esc(s.open)}</b></div><div class="ci-mini"><span>Pronte</span><b>${esc(s.ready)}</b></div><div class="ci-mini"><span>Da completare</span><b>${esc(s.lowReadiness)}</b></div><div class="ci-mini"><span>Totali</span><b>${esc(s.total)}</b></div></div>${top.length?`<div class="ci-list">${top.map((c,i)=>row(i+1,`${c.title} · ${c.readiness}%`,`Prossimo: ${c.next.title}`)).join('')}</div>`:'<p>Nessuna pratica ancora da ordinare.</p>'}<div class="ci-trust">Priorità basata sulla preparazione della pratica e sulle attività mancanti, non sulla probabilità di ottenere un rimborso.</div></div></section>`;
 const old=document.getElementById('ci-case-command');if(old)old.outerHTML=html;else{const hero=page.querySelector('.hero');if(hero)hero.insertAdjacentHTML('afterend',html);else page.insertAdjacentHTML('afterbegin',html)}
}
function render(){renderAnalysis();renderCases()}
const obs=new MutationObserver(()=>setTimeout(render,0));
document.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});render()});
window.addEventListener('storage',render);
setInterval(render,3000);
})();
