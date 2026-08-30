(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.RisolviCaseCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
const txt=v=>String(v??'').trim();
const EVIDENCE={
 train:['Biglietto / PNR','Orario previsto e orario effettivo','Prezzo pagato','Eventuali comunicazioni del vettore'],
 flight:['Prenotazione e numero volo','Carta d’imbarco se disponibile','Orario effettivo / cancellazione','Ricevute di spese collegate se rilevanti'],
 'flight-bag':['Tag bagaglio / PIR se disponibile','Prenotazione e carta d’imbarco','Ricevute spese essenziali','Comunicazioni della compagnia'],
 purchase:['Ordine / scontrino / fattura','Identità del venditore','Tracking o foto/video del problema','Messaggi già scambiati con il venditore'],
 charge:['Fattura o prova dell’addebito','Contratto / condizioni applicabili','Disdetta o comunicazione precedente se rilevante','Reclamo e risposta ricevuta'],
 cancel:['Contratto / condizioni','Data di rinnovo o preavviso','Prova dell’invio della disdetta','Fattura successiva / conferma cessazione'],
 energy:['Fatture contestate e periodo di consumo','Contratto / offerta e codice cliente o POD/PDR se rilevante','Letture / autoletture o dati del contatore se rilevanti','Reclamo scritto e risposta del venditore o gestore'],
 telco:['Fattura o addebito contestato','Contratto / offerta e codice cliente','Prova di disdetta, migrazione o segnalazione guasto se rilevante','Reclamo scritto e risposta dell’operatore'],
 generic:['Controparte identificata','Documento principale','Data del fatto','Importo e risultato richiesto']
};
function evidenceFor(type){return (EVIDENCE[type]||EVIDENCE.generic).slice();}
function ladderFor(type,source){
 const src=source&&source.name?`Canale ufficiale: ${source.name}`:'Individua il canale ufficiale competente';
 if(type==='charge')return ['Reclamo scritto alla controparte',src,'Valuta conciliazione/ADR o assistenza umana se la controversia resta irrisolta'];
 if(type==='telco')return ['Reclamo scritto all’operatore','Conciliazione tramite il canale ufficiale competente (es. ConciliaWeb/CORECOM quando applicabile)','Revisione umana se il caso resta irrisolto o complesso'];
 if(type==='energy')return ['Reclamo scritto al venditore o gestore','Servizio di conciliazione/ADR del settore energia quando applicabile','Revisione umana se il caso resta irrisolto o complesso'];
 if(type==='flight'||type==='flight-bag')return ['Richiesta documentata al vettore',src,'Escalation/ADR o assistenza qualificata se necessaria'];
 if(type==='train')return ['Richiesta al vettore tramite procedura ufficiale',src,'Follow-up, conciliazione o assistenza consumatori se non si risolve'];
 if(type==='purchase')return ['Richiesta scritta al venditore',src,'ADR/assistenza consumatori o professionale se necessario'];
 if(type==='cancel')return ['Disdetta tracciabile secondo contratto','Verifica conferma e fattura successiva','Escalation di settore o assistenza se la cessazione non viene recepita'];
 return ['Raccogli i fatti minimi','Individua procedura e fonte ufficiale','Passa a revisione umana se il caso resta ambiguo'];
}
function priorityLabel(n){return n>=75?'IMMEDIATA':n>=55?'ALTA':n>=35?'MEDIA':'BASSA';}
function assessAnalysis(a={}){
 const completeness=clamp(a.completeness),urgency=clamp(a.urgency),complexity=clamp(a.complexity);
 const sourceBonus=a.source&&a.source.name?8:0;
 const readiness=clamp(completeness*.72+(100-complexity)*.20+sourceBonus);
 const priority=clamp(urgency*.45+(100-readiness)*.35+complexity*.20);
 const label=readiness>=75?'PRONTA':readiness>=50?'PARZIALE':'INCOMPLETA';
 const humanReview=complexity>=70||completeness<35||txt(a.type)==='generic';
 const evidence=evidenceFor(a.type);
 const next=(Array.isArray(a.steps)&&a.steps[0])?{title:txt(a.steps[0].title),text:txt(a.steps[0].text)}:{title:'Completa i dati mancanti',text:'Prima di procedere raccogli documento, data, controparte e obiettivo.'};
 return {readiness,label,priority,priorityLabel:priorityLabel(priority),completeness,urgency,complexity,humanReview,evidence,next,ladder:ladderFor(a.type,a.source),source:a.source||null,rulesUpdated:'2026-08-31',readinessFormula:'0,72×completezza + 0,20×(100−complessità) + 8 se esiste una fonte identificata',priorityFormula:'0,45×urgenza + 0,35×gap di readiness + 0,20×complessità',trust:'La readiness misura la preparazione procedurale della pratica, non la probabilità di successo.'};
}
function assessCase(c={}){
 const steps=Array.isArray(c.steps)?c.steps:[],done=steps.filter(s=>s.done).length;
 const taskCompletion=steps.length?Math.round(done/steps.length*100):35;
 const hasSource=!!(c.source&&c.source.name),hasDraft=!!txt(c.draft),hasAmount=Number(c.amount)>0;
 const readiness=clamp(taskCompletion*.55+(hasSource?18:0)+(hasDraft?17:0)+(hasAmount?10:0));
 const next=steps.find(s=>!s.done);
 return {id:c.id,title:txt(c.title)||'Pratica',readiness,label:readiness>=75?'PRONTA':readiness>=50?'PARZIALE':'INCOMPLETA',next:next?{title:txt(next.title),text:txt(next.text)}:{title:'Follow-up',text:'Tutte le attività registrate risultano completate: verifica risposta/esito e aggiorna lo stato.'},status:txt(c.status),humanReview:txt(c.type)==='generic'};
}
function summarizeCases(cases=[]){const items=cases.map(assessCase);return {total:items.length,open:items.filter(x=>!['Risolta','closed','solved'].includes(x.status)).length,lowReadiness:items.filter(x=>x.readiness<50).length,ready:items.filter(x=>x.readiness>=75).length,items:items.sort((a,b)=>a.readiness-b.readiness)};}
return {assessAnalysis,assessCase,summarizeCases,evidenceFor,ladderFor};
});