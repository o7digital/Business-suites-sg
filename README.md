# Business Suites SG

Premium trilingual hotel concept built with Astro. Spanish homepage `/`, English `/en/` and Simplified Chinese `/zh/`.

Deployed site: https://www.businesssuitessg.com/ (Spanish), https://www.businesssuitessg.com/en/ (English) and https://www.businesssuitessg.com/zh/ (Simplified Chinese).

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

The three hotel pages, three location guides and three privacy notices are prerendered. The Vercel adapter additionally builds the server-only `/api/events-calendar`, `/api/olivia/status`, `/api/olivia/session` and `/api/olivia/chat` routes in `.vercel/output/`. The hotel pages work without an AI credential; Olivia requires the server-only `OLIVIA_GATEWAY_KEY` environment variable. `npm run dev` serves the local preview.

## Files

- `src/components/Hotel.astro`: page structure and trilingual hotel copy
- `src/data/rooms.ts`: six suites and their verified characteristics
- `src/data/seo.ts`: canonical domain, language routes, localized metadata and hotel schema
- `src/data/location.ts`: five local area guides and exactly 25 search phrases per language
- `src/components/HotelImage.astro`: responsive WebP through Astro assets
- `src/assets/hotel/`: original hotel photos and panorama used by the image pipeline
- `src/styles/global.css`: responsive visual design
- `src/styles/header.css`: fixed header and uppercase navigation
- `src/styles/readability.css`: readable body text, stronger contrast and responsive spacing
- `src/components/Olivia.astro`: trilingual hotel concierge widget
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

## Events and Chinese homepage

The top navigation and mobile menu place Eventos / Events / 活动 directly after Galería / Gallery / 相册, linking to `#eventos` on each homepage. The shared agenda reproduces Kepler’s event cards, translated copy, dates, venues, photos, official links and chronological order. Its introduction describes Business Suites SG near Reforma and its booking links use SG’s `Z2jMb3` engine.

The same-origin `/api/events-calendar` route reads only Kepler’s public published calendar. It validates all three translations, dates, links and image dimensions; no credentials or draft content are used. The browser refreshes the agenda every minute and when returning to the page. A local copy of the November 2026–February 2027 calendar and its WebP images keeps the current month available during a temporary feed outage. After the last prepared month, the fallback displays an empty state instead of old events. Month boundaries use `America/Mexico_City`.

The new `/zh/` homepage translates the full hotel copy, suite descriptions and features, FAQs, booking controls, menus and photo credits into Simplified Chinese. The original hotel facts, room names and photo assets are retained. The ES / EN / 中文 header links preserve the current section, including `#eventos`; the Chinese privacy notice and footer now link back to `/zh/`.

`npm test` includes eight calendar/proxy checks and six Olivia gateway checks. Calendar checks cover month/year transitions, chronological ordering, complete translations, local images, published-only feeds, fixed-source requests, invalid data and HTML/link safety.

## Contact form

The desktop and mobile menus place Contacto / Contact / 联系我们 after Eventos, linking to `#contacto` on all three homepages. The form posts directly to the supplied endpoint `https://formspree.io/f/xppdqgep`, with name, email, optional phone, message, consent, language and the notification subject. The named `email` field supplies Formspree's reply-to address. A `_gotcha` honeypot follows Formspree's documented spam-filtering convention.

The native POST action works without JavaScript. JavaScript adds native field validation, whitespace checks, duplicate-submission prevention, a pending state and localized feedback. A success message and reset occur only after a successful JSON response with `ok: true`; validation, rate-limit, network, timeout and unconfirmed responses preserve the entries for correction or retry. The three privacy notices describe the Formspree contact flow.

Firefox verification covered all three languages at 1440, 1366, 1341, 1340, 1024, 768, 390 and 320 px, menu order, section-preserving language links, required fields and consent, the exact POST payload, duplicate prevention, success/reset and six failure modes. Submission responses were intercepted during testing: no test message was sent to the hotel. Formspree account activation, recipient configuration and actual email receipt have not been verified from this repository.

## Measurement tag

All nine hotel/location/privacy pages use the shared `GoogleAnalytics.astro` component to load the supplied Google Tag Manager container `GTM-5XBP7Q9H`, with the asynchronous `gtm.js` snippet and `dataLayer` / `gtag('js', new Date())` initialization. The earlier direct GA4 loader and measurement configuration have been removed. The three privacy notices describe measurement tags managed through Google Tag Manager.

## Privacy notice

The notice is available in Spanish at `/privacy-policy/`, English at `/en/privacy-policy/` and Simplified Chinese at `/zh/privacy-policy/`. Each notice has a three-language selector and a localized footer; the hotel footer and Olivia's consent text link to the matching language notice. The Chinese notice returns to the Chinese hotel homepage. All three versions contain the same 12 sections, adapted from https://www.businesssuiteskepler.com/privacy-policy/ for BUSINESS SUITES SG, Río Nazas 138 and `contacto@businesssuitessg.com`, updated November 14, 2026. They cover accommodation enquiries, Cloudbeds, Olivia, Google Tag Manager, analytics cookies, session cookies and ARCO requests. The footer uses the same contact email; this change does not provision an email mailbox.

## Content and imagery

Hotel images are the actual Business Suites SG photos from the supplied Cloudbeds listing. Originals live in `src/assets/hotel/`; Astro generates WebP at widths up to the source size with `srcset`, `sizes` and intrinsic dimensions. The hero prioritizes the first image, and below-the-fold photos are lazy loaded. Gallery dialogs also load generated WebP. Source attribution is recorded in `src/data/image-sources.json`. No synthetic room photography is used. The Reforma panorama is a destination image, not a hotel view. It is by Mario Yaír TS, CC BY-SA 4.0; attribution and original source link are included in the photo-credits dialog.

## SEO work on dev

The `dev` branch contains the current `main` and the published location-copy correction. Development is deployed with the Vercel CLI as a **preview**, without promoting it to the production domain.

The hotel, privacy and location pages share canonical URLs on `https://www.businesssuitessg.com`, reciprocal `es` / `en` / `zh-Hans` / `x-default` alternates, localized titles and descriptions, Open Graph and Twitter metadata. Hotel and location pages publish a `LodgingBusiness` schema using the verified address, coordinates, contact details, six suites and check-in/out times; no prices, reviews or star ratings are invented.

Indexing is environment-dependent: Vercel production builds outside `dev` emit `index, follow`; preview, local and `dev` builds emit `noindex, follow`. Vercel also protects preview deployments with its own indexing headers. Production SEO changes take effect only after this work is merged and deployed there.

The nine canonical pages are listed in `/sitemap.xml`, including reciprocal language alternates. `/robots.txt` allows public content and excludes `/api/` from crawling. Submission to Search Console is separate from publishing these files and has not been performed.

The location guides are `/ubicacion/`, `/en/location/` and `/zh/location/`. They cover Colonia Cuauhtémoc, Río Nazas 138, Paseo de la Reforma, the Angel of Independence, and the Mexican Stock Exchange / Zona Rosa. Exactly 25 distinct search phrases per language appear as footer links to the relevant guide section. Geographic wording places the property on Río Nazas in Colonia Cuauhtémoc and describes nearby landmarks without inventing walking times. The phrases are editorial targets, not measured search volumes.

Validate the rendered pages after building:

```sh
npm test
npm run build
python3 scripts/verify-seo.py
```

To validate the future main production indexing behavior locally:

```sh
VERCEL_ENV=production VERCEL_GIT_COMMIT_REF=main npm run build
python3 scripts/verify-seo.py --production
```

The rendered-output check covers all nine pages, canonical and language URLs, schema, the 25 keyword links per page, local link targets, WebP images and responsive variants, sitemap and robots.txt.

Validated on November 14, 2026: 17 Node tests; rendered-output checks for production and preview indexing; Firefox at actual viewports of 1440, 768, 390 and 320 px on all nine pages. Suite tabs, twelve room-gallery photos, hero controls, mobile navigation and section-preserving language switches passed without JavaScript page errors. Full-width WebP counterparts of the twelve unique hotel photos referenced in the homepage HTML total 1,165,344 bytes, compared with 3,666,286 bytes for the source JPEGs (68.2% less); responsive variants are also emitted. The tall mobile hero deliberately selects sufficient source resolution for its cover crop.

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

The shared widget appears on all three hotel homepages, three location guides and three privacy pages. Its Olivia 3.6 floating card uses a dark burgundy/gold palette, layered shadow, a subtle float animation, animated typing dots and a labelled launcher. Four quick questions and a consent-first composer use SG's hotel information. Visitors can switch the chat interface between Spanish, English and Simplified Chinese without changing pages. The engine follows the actual visitor message language, including explicit language requests and conversation follow-ups; the interface language is a fallback. The existing deployed visitor-language policy is retained in the repository.

The browser calls same-origin session/chat endpoints. An HttpOnly, signed, expiring cookie binds each conversation to its visitor; tenant, engine URL and upstream headers are fixed server-side. No AI provider key or gateway credential is included in browser assets. Chat requires consent before sending/storing messages. Requests have size, concurrency and rate limits. Replies use text nodes and HTTPS links, and failures preserve the question for retry. Direct contact opens `contacto@businesssuitessg.com` or the hotel phone; the engine's instructions use this current email in preference to older source records. Booking links open SG's Cloudbeds engine; Olivia has no live inventory or booking/payment capability.

The launcher's indicator and header status are green when the SG Olivia 3.6 service is ready, and orange when unavailable or the browser is offline. `/api/olivia/status` probes only the fixed SG health endpoint, checks the tenant, engine version and provider configuration, and returns a minimal public readiness result without creating a visitor session or conversation. It is refreshed every minute while the page is visible, when reopening after 30 seconds, and on reconnection. Chat/network failures turn the indicator orange; a successful reply or readiness check restores green. Status text is localized in ES/EN/中文. The indicator describes the AI service, not hotel room availability.

The gateway passes eight Node tests; the complete website suite has 19 tests. The existing isolated backend suite has six tests. Firefox checks cover the hotel and privacy routes at desktop, tablet, mobile and landscape sizes, including consent gating, quick questions, language switching, expired-session recovery, safe reply rendering and rate/network error recovery. The floating card was also checked on all nine hotel/location/privacy pages at 1440 and 390 px, and at 320 px, tablet and landscape sizes. Firefox checks covered green/orange states, offline/reconnection, consent, safe reply rendering, failed-message recovery, language changes, draft preservation, Escape and reduced motion. The service image and changed source files have a dedicated rollback backup under `/opt/o7/backups/business-suites-sg-olivia36/`.

Run `npm run knowledge` after reviewing a hotel-information change. The service deliberately refuses silently replacing an existing knowledge revision: deploy an explicit scoped KB migration when changing that corpus. Secrets and database data are excluded from Git. The VPS service has a graceful dedicated nginx prefix, `/business-suites-sg/`, and a saved pre-change proxy configuration under `/opt/o7/backups/business-suites-sg-olivia36/`.

## Deployment

The repository is linked to the Vercel project `olivier-steineur/business-suites-sg`. `vercel.json` specifies Astro, `npm ci` and `npm run build`; the adapter handles static/function output. `.nvmrc`, `package.json` and the Vercel project use Node 22. `OLIVIA_GATEWAY_KEY` is stored as an encrypted production/preview variable in Vercel. The Astro `site` value is the public canonical domain, `https://www.businesssuitessg.com`. Preview builds retain `noindex, follow`; the production indexing policy is described above.

For work on `dev`, deploy a preview:

```sh
vercel deploy --scope olivier-steineur
```

After a separately requested merge/release to production:

```sh
vercel deploy --prod --scope olivier-steineur
```

Local Vercel linkage and environment files are ignored by Git.
