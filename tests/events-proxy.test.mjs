import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCalendarResponse, validateCalendarFeed } from '../src/server/events-calendar.ts';

const data = JSON.parse(readFileSync(new URL('../src/data/events.json', import.meta.url)));
const fixture = () => ({ monthKey: '2026-11', available: true, events: structuredClone(data.months['2026-11']) });
const request = (method = 'GET') => new Request('https://www.businesssuitessg.com/api/events-calendar?source=https://unrelated.example', { method });

test('agenda requests use only the fixed public Kepler feed and preserve every published translation', async () => {
  const response = await getCalendarResponse(request(), async (url, options) => {
    assert.equal(url, 'https://www.businesssuiteskepler.com/api/events-calendar');
    assert.equal(options.cache, 'no-store');
    assert.equal('Authorization' in options.headers, false);
    return Response.json(fixture());
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const feed = await response.json();
  assert.equal(feed.events.length, 12);
  for (const [index, event] of feed.events.entries()) {
    const original = fixture().events[index];
    for (const field of ['title', 'date', 'venue', 'category', 'description', 'url']) assert.deepEqual(event[field], original[field]);
    assert.equal(event.imageUrl, new URL(original.imageUrl, 'https://www.businesssuiteskepler.com').href);
  }
});

test('unpublished agendas return no event content and unsupported methods never request a feed', async () => {
  const response = await getCalendarResponse(request(), async () => Response.json({ ...fixture(), available: false }));
  assert.deepEqual((await response.json()).events, []);
  const denied = await getCalendarResponse(request('POST'), async () => { throw new Error('must not fetch'); });
  assert.equal(denied.status, 405);
  assert.equal(denied.headers.get('allow'), 'GET');
});

test('invalid dates, missing Chinese copy and unsafe image/link attributes reject the feed', async () => {
  const mutations = [
    feed => { feed.monthKey = '2026-13'; },
    feed => { feed.events[0].sortDate = '2026-12-01'; },
    feed => { delete feed.events[0].description.zh; },
    feed => { feed.events[0].url = 'javascript:alert(1)'; },
    feed => { feed.events[0].imageWidth = '900 onerror=alert(1)'; },
    feed => { feed.events[0].imageUrl = 'data:image/svg+xml,<svg onload=alert(1)>'; },
    feed => { feed.events.push(feed.events[0]); },
  ];
  for (const mutate of mutations) {
    const feed = fixture(); mutate(feed);
    assert.throws(() => validateCalendarFeed(feed));
    assert.equal((await getCalendarResponse(request(), async () => Response.json(feed))).status, 503);
  }
  assert.equal((await getCalendarResponse(request(), async () => new Response('Unavailable', { status: 500 }))).status, 503);
});
