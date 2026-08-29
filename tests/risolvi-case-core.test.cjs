const assert=require('assert');
const core=require('../src/risolvi-case-core.js');

// A well-documented sector case should be operationally ready, without claiming
// a probability of legal/financial success.
let a=core.assessAnalysis({
  type:'charge',completeness:82,urgency:80,complexity:45,
  source:{name:'AGCOM'},steps:[{title:'Salva prova',text:'Fattura'}]
});
assert(a.readiness>=70);
assert.equal(a.next.title,'Salva prova');
assert(a.evidence.includes('Fattura o prova dell’addebito'));
assert.equal(a.ladder.length,3);
assert(/non la probabilità di successo/.test(a.trust));

// Generic / incomplete / complex cases must fail closed toward human review.
let g=core.assessAnalysis({type:'generic',completeness:20,urgency:40,complexity:80,steps:[]});
assert.equal(g.label,'INCOMPLETA');
assert.equal(g.humanReview,true);
assert.equal(g.next.title,'Completa i dati mancanti');

// Inputs are bounded so corrupt/out-of-range data cannot distort the UI score.
const bounded=core.assessAnalysis({type:'purchase',completeness:999,urgency:-20,complexity:999,source:{name:'Fonte'}});
assert.equal(bounded.completeness,100);
assert.equal(bounded.urgency,0);
assert.equal(bounded.complexity,100);
assert(bounded.readiness>=0&&bounded.readiness<=100);
assert.equal(bounded.humanReview,true);

// Evidence must be copied rather than exposing mutable internal arrays.
const ev1=core.evidenceFor('train');
ev1.push('MUTATED');
const ev2=core.evidenceFor('train');
assert(!ev2.includes('MUTATED'));

// Cases are prioritised from the least-ready upward, and resolved cases do not
// count as open work.
const s=core.summarizeCases([
  {id:'1',title:'A',status:'Sbloccata',type:'charge',amount:50,source:{name:'AGCOM'},draft:'testo',steps:[{title:'x',text:'y',done:false}]},
  {id:'2',title:'B',status:'Risolta',type:'purchase',steps:[{title:'x',done:true}]},
  {id:'3',title:'C',status:'closed',type:'cancel',steps:[]}
]);
assert.equal(s.total,3);
assert.equal(s.open,1);
assert(s.items[0].readiness<=s.items[1].readiness);
assert(s.items[1].readiness<=s.items[2].readiness);

console.log('RISOLVI Case Intelligence regression tests: OK');
