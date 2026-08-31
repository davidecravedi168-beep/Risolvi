const assert=require('assert');
global.RisolviCaseCore=require('../src/risolvi-case-core.js');
const cmd=require('../src/risolvi-resolution-command-v11.js');

assert.equal(cmd.VERSION,'RISOLVI-RESOLUTION-COMMAND-11.1');
assert(cmd.routeFor('energy').some(x=>/conciliazione/i.test(x)));
assert(cmd.routeFor('telco').some(x=>/ConciliaWeb/i.test(x)));
assert(cmd.evidenceFor({type:'energy'}).some(x=>/fatture/i.test(x)));

const now=Date.parse('2026-08-31T00:00:00Z');
let c={id:'c1',title:'Addebito dopo disdetta',type:'telco',status:'in_progress',amount:59,operator:'Operatore test',description:'Mi sono stati addebitati 59 euro dopo la disdetta.',requested_outcome:'Storno dell’addebito e rimborso se già incassato.',updated_at:'2026-08-10T00:00:00Z',source:{name:'Fonte ufficiale'},steps:[{title:'Invia reclamo',text:'Usa il canale scritto',done:false}]};
let x=cmd.commandFor(c,now);
assert.equal(x.clock.state,'FOLLOW-UP');
assert.equal(x.next.title,'Invia reclamo');
assert(x.route.length>=4);
assert.equal(x.deadline.known,false);
assert(/non inferito/i.test(x.deadline.label));

const draft=cmd.complaintDraft(c);
assert(/Oggetto: Reclamo/i.test(draft));
assert(/Operatore test/.test(draft));
assert(/59\.00/.test(draft));
assert(/Storno dell’addebito/.test(draft));
assert(/ConciliaWeb/i.test(draft));
assert(!/entro\s+\d+\s+giorni/i.test(draft));
assert(/verifica destinatario, fatti, importi, documenti e termini/i.test(draft));

c={...c,deadline:'2026-09-02T00:00:00Z'};
x=cmd.commandFor(c,now);
assert.equal(x.deadline.known,true);
assert.equal(x.deadline.days,2);

const p=cmd.packText(c,now);
assert(/Resolution Pack/.test(p));
assert(/PROSSIMA AZIONE/.test(p));
assert(/SCALA DI ESCALATION/.test(p));
assert(/BOZZA RECLAMO DA VERIFICARE/.test(p));
assert(!/robot lawyer/i.test(p));

const generic={id:'g',type:'generic',status:'draft',steps:[]};
assert.equal(cmd.humanHandoff(generic),true);
assert.equal(cmd.commandFor(generic,now).escalationLocked,true);

console.log('RISOLVI Resolution Command V11.1 tests: OK');