import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { rooms } from '../src/data/rooms.ts';

const property = JSON.parse(readFileSync(new URL('../src/data/hotel-source.json', import.meta.url), 'utf8'));
const site = 'https://business-suites-sg.vercel.app';
const document = (title, source, content) => ({ title, source, content, metadata: { site: 'business-suites-sg', revision: 'hotel-source-2026-11-11', scope: 'public-hotel-information' } });
const docs = [
  document('Business Suites SG — property and policies', `${site}/#esencia`, `${property.name}\nAddress: Río Nazas 138, Col. Cuauhtémoc, 06500 Ciudad de México, México.\nPhone: ${property.telephone}\nEmail: ${property.email}\n${property.description[0]['@value']}\nFor weekly and monthly stays contact the hotel; do not claim any percentage discount.`),
  ...rooms.map((room, i) => document(`Suite ${room.name}`, `${site}/#suite-${i}`, `${room.name}: ${room.category.join(' / ')}. ${room.size || 'No confirmed published floor area.'}\nES: ${room.description[0]}\nEN: ${room.description[1]}\nFeatures: ${room.features.map(feature => feature.join(' / ')).join('; ')}.\nMaximum 2 adults. Queen bed. Accommodation type ID: ${[672970, 672971, 672972, 672974, 672975, 672976][i]}.`)),
  document('Reservations and direct hotel contact', `${site}/#reservar`, 'Use the official booking engine https://hotels.cloudbeds.com/es/reservation/Z2jMb3/?currency=mxn (English /en/). All rates and availability must be checked there. Olivia cannot create bookings, take payments or see live availability. Direct contact: +52 55 3666 8535, hermannsgg@gmail.com. Business Suites SG is at Río Nazas 138, NOT Suites Mine at Río Ebro. The Reforma panorama shows the destination, not a view from the hotel.'),
];
const output = new URL('../services/olivia-v36/knowledge/', import.meta.url);
mkdirSync(output, { recursive: true });
writeFileSync(new URL('documents.json', output), `${JSON.stringify(docs, null, 2)}\n`);
console.log(`Prepared ${docs.length} approved Business Suites SG documents.`);
