const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const src=fs.readFileSync('src/risolvi-simple-ui-v13.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const worker=fs.readFileSync('worker.js','utf8');

new vm.Script(src);
for(const token of [
  'RISOLVI-SIMPLE-UI-13.1',
  'Che problema hai?',
  'TROVA COSA FARE',
  'NON VUOI SCRIVERE? GUIDAMI',
  'VEDI PERCHÉ / DETTAGLI',
  'Cosa fare adesso',
  'ris-simple-v13',
  'risNavIcon',
  'backdrop-filter:blur(24px)',
  "setNavButton('#nav-home','home','Risolvi')",
  "setNavButton('#nav-protect','protect','Scadenze')"
]) assert(src.includes(token),`missing simple UI token: ${token}`);

assert(index.includes('RISOLVI_SIMPLE_UI_V13_BEGIN'),'V13 block not wired into index');
assert(index.includes('RISOLVI-SIMPLE-UI-13.1'),'V13.1 runtime missing from index');
assert(index.includes('<title>RISOLVI — Il prossimo passo</title>'),'simplified title missing');
assert(!index.includes('<script src='),'external scripts violate current inline CSP contract');
assert(index.includes("script-src 'unsafe-inline'"),'inline CSP contract missing');

const prefix='const INDEX_HTML = ';
const p=worker.indexOf(prefix);assert(p>=0,'worker INDEX_HTML missing');
const tail=worker.slice(p+prefix.length);
const match=tail.match(/^((?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*'))/s);
let workerHtml;
if(match&&match[1][0]==='"')workerHtml=JSON.parse(match[1]);
else{
  const sandbox={};vm.runInNewContext(`x=${tail}`,sandbox);workerHtml=sandbox.x;
}
assert.strictEqual(workerHtml,index,'Worker/index shell parity failed');
console.log('RISOLVI Simple UI V13.1 tests: OK');