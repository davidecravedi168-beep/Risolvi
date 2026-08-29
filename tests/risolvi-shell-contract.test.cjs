const assert=require('assert');
const fs=require('fs');

const intel=fs.readFileSync('src/risolvi-case-intelligence.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const worker=fs.readFileSync('worker.js','utf8');

// Battery/performance regression: never return to unconditional 3-second polling.
assert(!intel.includes('setInterval(queueRender,3000)'));
assert(intel.includes("document.visibilityState==='visible'"));
assert(intel.includes("window.addEventListener('focus',queueRender)"));
assert(intel.includes("risolvi:intelligence-refresh"));

// Product shell and Worker must both contain the V7 intelligence contract.
assert(index.includes('RISOLVI V7 — Case Intelligence'));
assert(index.includes('getIntelligenceState'));
assert(worker.includes('RISOLVI_CASE_UI_V7'));

// Avoid accidental duplication of the injected command centers.
assert.equal((intel.match(/id="ci-current"/g)||[]).length,1);
assert.equal((intel.match(/id="ci-case-command"/g)||[]).length,1);

console.log('RISOLVI shell contract tests: OK');
