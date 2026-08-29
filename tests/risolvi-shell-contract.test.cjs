const assert=require('assert');
const fs=require('fs');

const intel=fs.readFileSync('src/risolvi-case-intelligence.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const worker=fs.readFileSync('worker.js','utf8');

assert(!intel.includes('setInterval(queueRender,3000)'));
assert(intel.includes("document.visibilityState==='visible'"));
assert(intel.includes("window.addEventListener('focus',queueRender)"));
assert(intel.includes("risolvi:intelligence-refresh"));
assert(intel.includes('V8 PREMIUM'));
assert(intel.includes('PRIORITÀ'));
assert(intel.includes('priorityFormula'));

assert(index.includes('getIntelligenceState'));
assert(worker.includes('const INDEX_HTML ='));

assert.equal((intel.match(/id="ci-current"/g)||[]).length,1);
assert.equal((intel.match(/id="ci-case-command"/g)||[]).length,1);

console.log('RISOLVI V8 shell contract tests: OK');
