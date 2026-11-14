import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { mexicoMonth, monthEvents, renderAgenda } from '../src/lib/events-calendar.ts';

const data = JSON.parse(readFileSync(new URL('../src/data/events.json', import.meta.url)));
const booking = 'https://hotels.cloudbeds.com/es/reservation/Z2jMb3/?currency=mxn';

test('calendar follows Mexico City midnight and the new year', () => {
  assert.equal(mexicoMonth(new Date('2026-12-01T05:59:59Z')), '2026-11');
  assert.equal(mexicoMonth(new Date('2026-12-01T06:00:00Z')), '2026-12');
  assert.equal(mexicoMonth(new Date('2027-01-01T05:59:59Z')), '2026-12');
  assert.equal(mexicoMonth(new Date('2027-01-01T06:00:00Z')), '2027-01');
});

test('all prepared events are chronological, translated and use local WebP images', () => {
  for (const [month, events] of Object.entries(data.months)) {
    const dates = monthEvents(data, month).map(event => `${event.sortDate} ${event.sortTime || ''}`);
    assert.deepEqual(dates, [...dates].sort());
    assert.equal(new Set(events.map(event => event.id)).size, events.length);
    for (const event of events) {
      assert.ok(event.sortDate.startsWith(month));
      assert.match(event.imageUrl, /^\/assets\/events\/.+\.webp$/);
      assert.ok(existsSync(new URL('../public' + event.imageUrl, import.meta.url)));
      assert.ok(event.imageWidth > 0 && event.imageHeight > 0);
      for (const lang of ['es', 'en', 'zh']) {
        for (const field of ['title', 'date', 'description', 'category', 'venue']) assert.ok(event[field][lang]);
      }
    }
  }
});

test('only November appears now, with SG branding and the correct booking engine', () => {
  for (const lang of ['es', 'en', 'zh']) {
    const html = renderAgenda(data, '2026-11', lang, booking);
    assert.equal((html.match(/<article /g) || []).length, 12);
    assert.match(html, /Business Suites SG/);
    assert.match(html, /reservation\/Z2jMb3/);
    assert.match(html, /Karol G/);
    assert.match(html, /Los Auténticos Caligaris/);
    assert.doesNotMatch(html, /Business Suites Kepler|Suites Mine|Polanco|Bruno Mars|The Warning|Maroon 5/);
  }
});

test('no expired events return after the last prepared month', () => {
  assert.deepEqual(monthEvents(data, '2027-03'), []);
  assert.doesNotMatch(renderAgenda(data, '2027-03', 'en', booking), /<article /);
});

test('public event copy is escaped and unsafe links are rejected', () => {
  const malicious = structuredClone(data);
  const event = malicious.months['2026-11'][0];
  event.title.es = '<script>alert(1)</script>';
  event.url = 'javascript:alert(1)';
  const html = renderAgenda(malicious, '2026-11', 'es', booking);
  assert.doesNotMatch(html, /<script>|javascript:/);
  assert.match(html, /&lt;script&gt;/);
});
