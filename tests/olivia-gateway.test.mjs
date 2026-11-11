import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGateway, COOKIE } from '../src/server/olivia-gateway.ts';

const origin = 'https://business-suites-sg.vercel.app';
const key = 'test-only-signing-key-'.repeat(4);
const visitor = () => {
  const values = new Map();
  return { values, cookies: { get: name => values.has(name) ? { value: values.get(name) } : undefined, set: (name, value) => values.set(name, value) } };
};
const context = (person, path, request) => ({ request: request || new Request(`${origin}/api/olivia/${path}`), cookies: person.cookies, path, address: '127.0.0.1' });
async function session(gateway, person) { return (await gateway(context(person, 'session'))).json(); }
const body = (changes = {}) => ({ message: 'Do you have air conditioning?', language: 'en', consent: true, conversationId: '12345678-1234-1234-1234-123456789abc', ...changes });
const chat = (person, identity, payload = body(), headers = {}) => context(person, 'chat', new Request(`${origin}/api/olivia/chat`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Olivia-Widget-Identity': identity, ...headers }, body: JSON.stringify(payload),
}));
const reply = () => Response.json({ clientCode: 'business-suites-sg', reply: 'There is no air conditioning; portable fans can be requested.' });

test('sessions remain stable, signed and scoped to this hotel', async () => {
  const gateway = createGateway(key);
  const person = visitor();
  const first = await session(gateway, person);
  assert.equal(first.clientCode, 'business-suites-sg');
  assert.equal((await session(gateway, person)).identity, first.identity);
  assert.notEqual((await session(gateway, visitor())).identity, first.identity);
  assert.ok(person.values.get(COOKIE));
});

test('forged sessions, foreign origins and missing consent never reach the engine', async () => {
  let calls = 0;
  const gateway = createGateway(key, async () => { calls++; return reply(); });
  const person = visitor();
  const { identity } = await session(gateway, person);
  assert.equal((await gateway(chat(person, identity, body(), { Origin: 'https://unrelated.example' }))).status, 403);
  assert.equal((await gateway(chat(person, 'forged'))).status, 401);
  assert.equal((await gateway(chat(person, identity, body({ consent: false })))).status, 400);
  assert.equal((await gateway(chat(person, identity, body({ clientCode: 'suitesmine' })))).status, 400);
  assert.equal((await gateway(chat(person, identity, body({ history: [] })))).status, 400);
  person.values.set(COOKIE, 'forged.cookie.signature');
  assert.equal((await gateway(chat(person, identity))).status, 401);
  assert.equal(calls, 0);
});

test('conversation IDs are bound to the signed visitor and credentials stay server-side', async () => {
  const sent = [];
  const gateway = createGateway(key, async (url, options) => {
    assert.equal(url, 'https://olivia.o7digitalgroup.com/business-suites-sg/chat');
    assert.equal(options.headers.Authorization, `Bearer ${key}`);
    sent.push(JSON.parse(options.body));
    return reply();
  });
  for (const person of [visitor(), visitor()]) {
    const { identity } = await session(gateway, person);
    const response = await gateway(chat(person, identity));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.text()).includes(key), false);
  }
  assert.notEqual(sent[0].conversation_id, sent[1].conversation_id);
  assert.equal(sent[0].language, 'en');
  assert.equal(sent[0].consent, true);
  assert.match(sent[0].conversation_id, /^[a-f0-9]{48}$/);
  assert.equal('history' in sent[0], false);
});

test('payload limits, missing configuration and invalid upstream identities fail explicitly', async () => {
  const person = visitor();
  const gateway = createGateway(key, async () => Response.json({ clientCode: 'different-hotel', reply: 'Wrong context' }));
  const { identity } = await session(gateway, person);
  assert.equal((await gateway(chat(person, identity, body({ message: 'x'.repeat(4001) })))).status, 400);
  assert.equal((await gateway(chat(person, identity, body(), { 'content-length': '16001' }))).status, 413);
  assert.equal((await gateway(chat(person, identity))).status, 502);
  assert.equal((await createGateway('')(context(person, 'session'))).status, 503);
});

test('upstream rate limits and failures are reported without exposing private error text', async () => {
  for (const status of [429, 500]) {
    const gateway = createGateway(key, async () => new Response(key, { status }));
    const person = visitor();
    const { identity } = await session(gateway, person);
    const response = await gateway(chat(person, identity));
    assert.equal(response.status, status === 429 ? 429 : 502);
    assert.equal((await response.text()).includes(key), false);
  }
});
