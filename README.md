# Business Suites SG

Premium bilingual hotel concept built with Astro. Spanish homepage `/`; English `/en/`.

Deployed preview: https://business-suites-sg.vercel.app/ (Spanish) and https://business-suites-sg.vercel.app/en/ (English).

## Develop

Requires Node 22 LTS or a compatible Astro 5 runtime.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

Astro generates a static site in `dist/`. No database or secret key is required.

## Files

- `src/components/Hotel.astro`: page structure and bilingual copy
- `src/data/rooms.ts`: six suites and their verified characteristics
- `src/styles/global.css`: responsive visual design
- `src/scripts/interactions.ts`: suite tabs, accessible lightbox, mobile navigation, date validation
- `src/data/hotel-source.json`: source property information from Cloudbeds
- `src/data/image-sources.json`: photo URLs, dimensions and credits

## Reservation handoff

The date form opens the supplied Cloudbeds booking engine with `currency`, `checkin`, `checkout` and `adults` query parameters. Suite links add `accommodation_types` using the property's room IDs. The website does not fetch live inventory, collect guest data or create reservations; booking and rate confirmation happen in Cloudbeds.

Cloudbeds parameter reference: https://myfrontdesk.cloudbeds.com/hc/en-us/articles/52705769630747-Booking-Engine-Plus-filters-FAQ

Property source: https://hotels.cloudbeds.com/es/reservation/Z2jMb3/?currency=mxn

Cloudbeds opened successfully in Firefox during delivery checks. A test handoff for January 15–18, 2027 displayed the requested dates in the booking engine. No room was added and no reservation or payment was made.

## Content and imagery

Hotel images are the actual Business Suites SG photos from the supplied Cloudbeds listing. No synthetic room photography is used. The Reforma panorama is a destination image, not a hotel view. It is by Mario Yaír TS, CC BY-SA 4.0; attribution and original source link are included in the photo-credits dialog.

The concept has `noindex, nofollow` intentionally. Review before a production hotel launch.

## Validation

Checked on November 11, 2026 with Node 22.23.4 and Firefox:

- `npm ci` and `npm run build` succeeded; both generated routes also returned HTTP 200 from `npm run preview`.
- Spanish and English at 1440, 768 and 390 px: no horizontal overflow, missing local resources, duplicate IDs, broken anchor targets or JavaScript page errors. Local fonts loaded and all images decoded.
- All six suite tabs displayed the expected name, photo and Cloudbeds accommodation ID; arrow/Home keyboard navigation worked.
- Suite and main galleries opened, navigated forwards/backwards, wrapped, and closed with their close button or Escape. Credits, FAQs, mobile navigation and language switching worked.
- Arrival changes advanced the minimum departure date. Invalid departures were rejected. Form submission opened a new tab with the correct currency, dates and adult count; the automated handoff assertion intercepted the external request separately from the real Cloudbeds visit above.
- Telephone/email destinations were checked. The Maps short link resolved to the Business Suites SG location through Google's consent page.

The supplied dependency versions were preserved. `npm audit` reports five dependency findings (one low, three high and one critical); its proposed full fix requires a major Astro upgrade. That migration is outside the requested faithful preview setup. The deployed output is static HTML/CSS/JavaScript with no Astro server or image optimization endpoint.

## Deployment

The repository is linked to the Vercel project `olivier-steineur/business-suites-sg`. `vercel.json` specifies Astro, `npm ci`, `npm run build` and `dist`; `.nvmrc`, `package.json` and the Vercel project use Node 22. The Astro `site` value is the deployed Vercel URL. The intentional `noindex, nofollow` remains enabled for this preview.

```sh
vercel deploy --prod --scope olivier-steineur
```

Local Vercel linkage and environment files are ignored by Git.
