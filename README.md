# Business Suites SG

Premium bilingual hotel concept built with Astro. Spanish homepage `/`; English `/en/`.

Deployed preview: https://business-suites-sg.vercel.app/ (Spanish) and https://business-suites-sg.vercel.app/en/ (English).

## Develop

Requires Node 22.23.4 or newer in the Node 22 line (`nvm use`).

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

The two hotel pages are prerendered. The Vercel adapter additionally builds the server-only `/api/olivia/session` and `/api/olivia/chat` routes in `.vercel/output/`. The hotel pages work without an AI credential; Olivia requires the server-only `OLIVIA_GATEWAY_KEY` environment variable. `npm run dev` serves the local preview.

## Files

- `src/components/Hotel.astro`: page structure and bilingual copy
- `src/data/rooms.ts`: six suites and their verified characteristics
- `src/styles/global.css`: responsive visual design
- `src/styles/header.css`: fixed header and uppercase navigation
- `src/styles/readability.css`: readable body text, stronger contrast and responsive spacing
- `src/components/Olivia.astro`: bilingual hotel concierge widget
- `src/server/olivia-gateway.ts`: signed visitor sessions and the fixed-hotel API gateway
- `services/olivia-v36/`: dedicated VPS1 Olivia 3.6 service, deployment and backend tests
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

The Olivia integration updates Astro to 7.4.10 and its Vercel adapter to 11.0.21 for the new server routes; this removes the earlier critical Astro audit finding. The remaining `npm audit` findings are in the adapter/build tooling chain (three moderate, three high). No forced dependency downgrade or incompatible override was applied.

The readability revision uses 16 px for primary paragraphs, 14 px for most controls and darker secondary text. Both languages were checked in Firefox at 1440, 1101, 1024, 768, 390 and 320 px, including the fixed header, suites, gallery, chat consent, keyboard closing, safe text rendering and explicit failure handling. `npm test` covers five gateway/session/isolation scenarios. The VPS image passes six backend tests using a separate in-memory test database. Real ES/EN AI checks confirmed the hotel address/check-in policy, lack of air conditioning and referral to Cloudbeds for live prices.

## Olivia 3.6

Olivia runs in the dedicated `business-suites-sg-olivia36` service on VPS1, with its own PostgreSQL volume, gateway credential and eight approved hotel documents. The existing Olivia 3.6 RAG/chat core is retained under `services/olivia-v36/core/` with upstream repository/revision metadata. Suites Mine and Vialterna business profiles are not used for hotel replies.

The browser calls same-origin session/chat endpoints. An HttpOnly, signed, expiring cookie binds each conversation to its visitor; tenant, engine URL and upstream headers are fixed server-side. No AI provider key or gateway credential is included in browser assets. Chat requires consent before sending/storing messages. Requests have size, concurrency and rate limits. Replies render as text, and failures offer direct hotel contact. Booking links open Cloudbeds; Olivia has no live inventory or booking/payment capability.

Run `npm run knowledge` after reviewing a hotel-information change. The service deliberately refuses silently replacing an existing knowledge revision: deploy an explicit scoped KB migration when changing that corpus. Secrets and database data are excluded from Git. The VPS service has a graceful dedicated nginx prefix, `/business-suites-sg/`, and a saved pre-change proxy configuration under `/opt/o7/backups/business-suites-sg-olivia36/`.

## Deployment

The repository is linked to the Vercel project `olivier-steineur/business-suites-sg`. `vercel.json` specifies Astro, `npm ci` and `npm run build`; the adapter handles static/function output. `.nvmrc`, `package.json` and the Vercel project use Node 22. `OLIVIA_GATEWAY_KEY` is stored as an encrypted production/preview variable in Vercel. The Astro `site` value is the deployed Vercel URL. The intentional `noindex, nofollow` remains enabled for this preview.

```sh
vercel deploy --prod --scope olivier-steineur
```

Local Vercel linkage and environment files are ignored by Git.
