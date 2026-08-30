const assert=require('assert');
const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const worker=fs.readFileSync('worker.js','utf8');

assert(index.includes("script-src 'unsafe-inline'"));
assert(!index.includes('<script src="src/risolvi-operations-governance-v9.js?v=9.0"></script>'));
assert(index.includes('RISOLVI_OPERATIONS_GOVERNANCE_V9_INLINE_BEGIN'));
assert(index.includes('id="risolvi-operations-governance-v9"'));
assert(index.includes('<title>RISOLVI V11 — Resolution Command</title>'));
assert(index.includes('RISOLVI_RESOLUTION_COMMAND_V11_BEGIN'));
assert(index.includes('RISOLVI-RESOLUTION-COMMAND-11.0'));

const prefix='const INDEX_HTML = ';
const pos=worker.indexOf(prefix);
assert(pos>=0);
const tail=worker.slice(pos+prefix.length);
let end=1,escaped=false;
for(;end<tail.length;end++){
  const c=tail[end];
  if(escaped){escaped=false;continue}
  if(c==='\\'){escaped=true;continue}
  if(c==='"')break;
}
const workerHtml=JSON.parse(tail.slice(0,end+1));
assert.equal(workerHtml,index);

const inline=[...index.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
for(const js of inline) assert.doesNotThrow(()=>new Function(js));
console.log('RISOLVI V12 runtime hardening tests: OK');
