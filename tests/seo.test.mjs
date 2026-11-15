import test from 'node:test';
import assert from 'node:assert/strict';
import { robotsPolicy, pagePaths, languages, absoluteUrl, hotelSchema } from '../src/data/seo.ts';
import { areas } from '../src/data/location.ts';

test('development and preview builds stay out of search, while main production can be indexed', () => {
  assert.equal(robotsPolicy(), 'noindex, follow');
  assert.equal(robotsPolicy('development', 'dev'), 'noindex, follow');
  assert.equal(robotsPolicy('preview', 'main'), 'noindex, follow');
  assert.equal(robotsPolicy('preview', 'dev'), 'noindex, follow');
  assert.equal(robotsPolicy('production', 'dev'), 'noindex, follow');
  assert.equal(robotsPolicy('production', 'main'), 'index, follow');
});

test('each language has 25 distinct local searches and complete content for their target areas', () => {
  assert.equal(new Set(areas.map(area => area.id)).size, areas.length);
  for (const language of languages) {
    const keywords = areas.flatMap(area => area.keywords[language]);
    assert.equal(keywords.length, 25, language);
    assert.equal(new Set(keywords.map(keyword => keyword.toLocaleLowerCase())).size, 25, language);
    assert.doesNotMatch(keywords.join(' '), /Polanco|Kepler|barrio|King|aire acondicionado|air conditioning/i);
    for (const area of areas) {
      assert.ok(area.title[language]);
      assert.ok(area.text[language].length > 60);
      assert.match(area.id, /^[a-z-]+$/);
    }
  }
});

test('canonical URLs and hotel identity use the public SG domain in every language', () => {
  const urls = Object.values(pagePaths).flatMap(paths => languages.map(language => absoluteUrl(paths[language])));
  assert.equal(new Set(urls).size, 9);
  assert.ok(urls.every(url => url.startsWith('https://www.businesssuitessg.com/') && url.endsWith('/')));
  for (const language of languages) {
    const hotel = hotelSchema(language, '/_astro/suite.webp');
    assert.equal(hotel.name, 'Business Suites SG');
    assert.equal(hotel.address.streetAddress, 'Río Nazas 138, Colonia Cuauhtémoc');
    assert.equal(hotel.numberOfRooms, 6);
    assert.equal(hotel.url, absoluteUrl(pagePaths.home[language]));
    assert.equal(hotel.image, 'https://www.businesssuitessg.com/_astro/suite.webp');
    assert.equal(hotel.checkinTime, '13:30:00');
    assert.equal(hotel.checkoutTime, '12:00:00');
    assert.ok(!('starRating' in hotel) && !('aggregateRating' in hotel) && !('priceRange' in hotel));
  }
});
