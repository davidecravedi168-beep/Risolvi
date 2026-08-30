const assert=require('assert');
const core=require('../src/risolvi-case-core.js');

let a=core.assessAnalysis({
  type:'charge',completeness:82,urgency:80,complexity:45,
  source:{name:'AGCOM'},steps:[{title:'Salva prova',text:'Fattura'}]
});
assert(a.readiness>=70);
assert(a.priority>=0&&a.priority<=100);
assert(['BASSA','MEDIA','ALTA','IMMEDIATA'].includes(a.priorityLabel));
assert(/0,72/.test(a.readinessFormula));
assert(/0,45/.test(a.priorityFormula));
assert.equal(a.next.title,'Salva prova');
assert(a.evidence.includes('Fattura o prova dell’addebito'));
assert.equal(a.ladder.length,3);
assert(Array.isArray(a.tactics)&&a.tactics.length>=6);
assert(a.tactics.some(x=>/importo esatto/i.test(x)));
assert(/non la probabilità di successo/.test(a.trust));

let g=core.assessAnalysis({type:'generic',completeness:20,urgency:90,complexity:80,steps:[]});
assert.equal(g.label,'INCOMPLETA');
assert.equal(g.humanReview,true);
assert.equal(g.next.title,'Completa i dati mancanti');
assert(g.priority>a.priority);
assert(g.tactics.some(x=>/revisione umana/i.test(x)));

const bounded=core.assessAnalysis({type:'purchase',completeness:999,urgency:-20,complexity:999,source:{name:'Fonte'}});
assert.equal(bounded.completeness,100);
assert.equal(bounded.urgency,0);
assert.equal(bounded.complexity,100);
assert(bounded.readiness>=0&&bounded.readiness<=100);
assert(bounded.priority>=0&&bounded.priority<=100);
assert.equal(bounded.humanReview,true);

const ev1=core.evidenceFor('train');
ev1.push('MUTATED');
const ev2=core.evidenceFor('train');
assert(!ev2.includes('MUTATED'));
const t1=core.tacticsFor('telco');t1.push('MUTATED');
const t2=core.tacticsFor('telco');assert(!t2.includes('MUTATED'));
assert(t2.some(x=>/ConciliaWeb/i.test(x)));
const flight=core.tacticsFor('flight');
assert(flight.some(x=>/compensazione/i.test(x)&&/rimborso/i.test(x)));

const s=core.summarizeCases([
  {id:'1',title:'A',status:'Sbloccata',type:'charge',amount:50,source:{name:'AGCOM'},draft:'testo',steps:[{title:'x',text:'y',done:false}]},
  {id:'2',title:'B',status:'Risolta',type:'purchase',steps:[{title:'x',done:true}]},
  {id:'3',title:'C',status:'closed',type:'cancel',steps:[]}
]);
assert.equal(s.total,3);
assert.equal(s.open,1);
assert(s.items[0].readiness<=s.items[1].readiness);
assert(s.items[1].readiness<=s.items[2].readiness);
assert(s.items.every(x=>Array.isArray(x.tactics)&&x.tactics.length));

console.log('RISOLVI Case Intelligence professional playbook regression tests: OK');