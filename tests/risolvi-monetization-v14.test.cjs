const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../src/risolvi-monetization-v14.js');

assert.equal(M.VERSION, 'RISOLVI-MONETIZATION-14.1');
assert.equal(M.PRO_PRICE, 6.99);
assert.ok(M.FREE_ITEMS.length >= 3, 'free tier must remain useful');
assert.ok(M.PRO_ITEMS.length >= 4, 'Pro must describe concrete operational value');
assert.ok(M.FREE_ITEMS.some(x => /Diagnosi/i.test(x)));
assert.ok(M.PRO_ITEMS.some(x => /Bozza/i.test(x)));
assert.ok(M.PRO_ITEMS.some(x => /Dossier/i.test(x)));
assert.ok(M.PRO_ITEMS.some(x => /follow-up/i.test(x)));

const original = {
  cases: [{
    id: 'abc', price: 4.99, method: 'legacy',
    events: [{at: '2026-08-31T20:00:00.000Z', label: 'Diagnosi completata'}]
  }],
  beta: {events: [
    {name: 'diagnosis_complete', meta: {price: 0}},
    {name: 'checkout_open', meta: {price: 4.99}},
    {name: 'practice_unlocked', meta: {price: 4.99}}
  ]}
};
const before = JSON.stringify(original);
const normalized = M.normalizeLatestPurchaseState(original, 'App Store');
assert.equal(JSON.stringify(original), before, 'normalizer must not mutate caller input');
assert.equal(normalized.cases[0].price, 6.99);
assert.equal(normalized.cases[0].method, 'App Store');
assert.ok(normalized.cases[0].events.some(e => /Pratica Pro · €6,99/.test(e.label)));
assert.equal(normalized.beta.events[1].meta.price, 6.99);
assert.equal(normalized.beta.events[2].meta.price, 6.99);

const second = M.normalizeLatestPurchaseState(normalized, 'App Store');
assert.equal(second.cases[0].events.filter(e => /Pratica Pro · €6,99/.test(e.label)).length, 1, 'delivery marker must be idempotent');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'risolvi-monetization-v14.js'), 'utf8');
assert.match(source, /CONTINUA GRATIS/);
assert.match(source, /Nessun abbonamento/i);
assert.doesNotMatch(source, /garantit[oa]|vinci|successo assicurato/i, 'monetization copy must not promise outcomes');

const injector = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'upgrade_monetization_v14.py'), 'utf8');
assert.match(injector, /simple:6\.99,standard:6\.99,complex:6\.99/);
assert.match(injector, /worker\/index shell parity failed/);

console.log('RISOLVI Monetization V14 contract PASS');
