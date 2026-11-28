# Baseline before the UI modernization (Phase 0)

Recorded on 2026-10-26 on branch `ui-modernization`, before any visual change. Later phases compare against these numbers and screenshots.

## Checks

| Check | Result |
| --- | --- |
| `npm run build` (tsc, vite build, prerender) | passes; 13 website pages prerendered |
| `npx oxlint` | passes: 0 errors, 169 warnings (154 `react(only-export-components)`, 15 `react-hooks(exhaustive-deps)`) |
| `npm run test:visual` | 60 screenshots (20 screens x 3 widths), identical across three consecutive runs |

## Screenshot tests

`npm run test:visual` builds the app, serves `dist/` on port 4173 with `scripts/serve-dist.mjs` and compares each screen with
`tests/visual/__screenshots__`. Add `-- --update-snapshots` to accept an intended change. Set `VISUAL_NO_BUILD=1` to skip the build.

- No live API or real account: `tests/visual/stubs.ts` answers every `/api` and `/hubs` request with fixed data (5 contracts,
  4 business owners, empty lists elsewhere) and signs in by writing the session keys from `src/core/auth/session.ts` with a fake
  token. No permission keys are written, so nothing is hidden by role.
- Fixed clock (26 Oct 2026, 10:30 IST), animations off, reduced motion, the installed Chrome (`PW_CHANNEL=msedge` for Edge).
- Widths: phone 375 x 812, tablet 768 x 1024, desktop 1440 x 900.
- Screens: website home, about, products, contact; admin login, dashboard, contracts list, new contract, payment advice,
  payment allocation, seller invoice, business owners, transporters, users, role access, notifications centre, settings,
  products, pending contracts (truck management), contract summary report.
- Website pages are captured full length. Admin screens scroll inside their own panel, so they are captured at window height.
- Screenshots depend on the browser version and fonts of the machine that made them; after a Chrome update, re-check and update
  the baseline in a separate commit.

## Bundle sizes (`node scripts/bundle-report.mjs`)

| Files | Count | Raw KB | Gzip KB |
| --- | ---: | ---: | ---: |
| JavaScript | 202 | 2460.1 | 722.2 |
| CSS | 98 | 972.5 | 183.6 |
| All assets | 303 | 4111.8 | 1585.0 |

Largest files:

| File | Raw KB | Gzip KB |
| --- | ---: | ---: |
| herobg.jpg | 663.1 | 663.1 |
| index.js | 375.3 | 109.8 |
| CartesianChart.js (recharts) | 298.8 | 83.9 |
| index.css | 224.7 | 29.8 |
| Home.js | 126.1 | 41.2 |
| WebsiteLayout.css | 61.9 | 10.6 |
| Assigntransports.js | 60.3 | 12.3 |
| SellerBuyerAccounts.js | 56.1 | 10.5 |
| NotificationProvider.js | 55.2 | 14.4 |
| SubModuleOverview.js | 43.6 | 11.4 |
| rtk-query-react.modern.js | 41.2 | 13.5 |
| NewContract.js | 40.0 | 8.1 |
| fi.js (react-icons Feather) | 38.6 | 5.7 |
| businessOwnerWizard.utils.js | 35.9 | 6.9 |
| redux-toolkit.modern.js | 35.4 | 13.0 |

## After the performance phase (Phase 7)

Changes: Bootstrap's JavaScript only on the two screens that use it (it loaded everywhere); Bootstrap CSS built from its
Sass with only the parts in use; the home page photo as WebP / recompressed JPEG with a phone size (663 KB to 47 KB, 19 KB
on phones); Inter and Poppins self-hosted with the two first-needed files preloaded (no Google Fonts requests); libraries
in their own long-lived files (vendor-react, -redux, -charts, -signalr, -swiper, -icons); `npm run size` budget check.

### Lighthouse (`npm run lighthouse`, median of three runs)

Measured on this PC against `scripts/serve-dist.mjs`, which does not compress files, so transfer sizes and mobile
times are higher than a production server with gzip or brotli would give. Compare the rows with each other, not with
field data. The admin login's SEO score is low on purpose (`noindex`).

| Build | Page | Device | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| before | website home | mobile | 46 | 100 | 100 | 100 | 8.22 s | 11.60 s | 452 ms | 0.000 | 1957 KB |
| after | website home | mobile | 56 | 100 | 100 | 100 | 8.89 s | 9.64 s | 0 ms | 0.000 | 1428 KB |
| before | website home | desktop | 82 | 100 | 100 | 100 | 1.52 s | 2.04 s | 80 ms | 0.000 | 1957 KB |
| after | website home | desktop | 84 | 100 | 100 | 100 | 1.68 s | 1.84 s | 0 ms | 0.000 | 1408 KB |
| before | admin login | mobile | 60 | 98 | 100 | 54 | 6.58 s | 7.26 s | 58 ms | 0.000 | 1023 KB |
| after | admin login | mobile | 62 | 98 | 100 | 54 | 5.86 s | 6.69 s | 0 ms | 0.000 | 985 KB |
| before | admin login | desktop | 92 | 98 | 100 | 58 | 1.29 s | 1.42 s | 0 ms | 0.000 | 1031 KB |
| after | admin login | desktop | 94 | 98 | 100 | 58 | 1.11 s | 1.29 s | 0 ms | 0.000 | 999 KB |

### Bundle (`node scripts/bundle-report.mjs`, gzip)

| | Phase 0 | After Phase 7 |
| --- | ---: | ---: |
| All JavaScript | 722 KB | 720 KB |
| All CSS | 184 KB | 200 KB (themes, density, components) |
| Website home, loaded up front | not measured | 188 KB JS, 54 KB CSS |
| Admin app, loaded up front | not measured | 117 KB JS, 40 KB CSS |

`npm run size` fails the build check when the up-front download passes 200 KB JS / 60 KB CSS (website) or
130 KB JS / 50 KB CSS (admin app), or any single JS / CSS file passes 110 KB.

The font files make the "all assets" total larger (a file per weight and character range), but a browser downloads only
the ones a page uses.

### SEO and performance pass (26 Nov 2026)

Measured with `scripts/serve-dist.mjs`, which now compresses text (brotli / gzip) like production should (deploy/nginx.conf
and public/web.config now turn compression on) and forwards `/api` and `/images` to the API, so the pages load real data.
One Lighthouse 13.5 run each, simulated throttling. QA data: some product pictures are 300-650 KB uploads and three return 404
(that is what keeps Best practices at 96 on pages that show them).

| Page | Device | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | mobile | 55 | 100 | 96 | 100 | 4.2 s | 8.0 s | 400 ms | 0.035 |
| / | desktop | 82 | 100 | 96 | 100 | 1.0 s | 2.4 s | 0 ms | 0.117 |
| /products | mobile | 74 | 100 | 96 | 100 | 3.4 s | 4.9 s | 70 ms | 0.001 |
| /products | desktop | 98 | 100 | 96 | 100 | 0.8 s | 1.1 s | 0 ms | 0.001 |
| /products/maize-ddgs | mobile | 71 | 100 | 96 | 100 | 3.8 s | 5.4 s | 60 ms | 0 |
| /products/maize-ddgs | desktop | 97 | 100 | 96 | 100 | 0.8 s | 1.2 s | 0 ms | 0 |
| /faqs | mobile | 77 | 100 | 100 | 100 | 3.4 s | 4.5 s | 60 ms | 0 |
| /faqs | desktop | 99 | 100 | 100 | 100 | 0.7 s | 0.9 s | 0 ms | 0 |
| /about | mobile | 76 | 100 | 100 | 100 | 3.4 s | 4.3 s | 170 ms | 0.015 |
| /about | desktop | 97 | 100 | 100 | 100 | 0.8 s | 1.2 s | 0 ms | 0.001 |

The real (unthrottled) home page paints in about 0.6 s; the mobile scores are held back by the uploaded banner and product
pictures, the render-blocking CSS (index.css + WebsiteLayout.css, ~55 KB compressed) and the Inter / Poppins Latin-extended
font files Chrome fetches on the home page.

#### After the second pass (27 Nov 2026)

Lighthouse 13.5, all categories, production build on `scripts/serve-dist.mjs` (compressed, /api forwarded to QA). Changes: real
404 for missing `/.well-known/*` files (Agentic browsing read the HTML shell as an invalid `ai-catalog.json`), the app's twin is
laid out invisibly so the hand-over moves nothing, Poppins 700 (the heading weight) preloaded, metric-matched fallback fonts.
Best practices stays at 96 where a product picture is missing on QA (the API now leaves out pictures whose file is gone, which
fixes it once deployed).

| Page | Device | Performance | Accessibility | Best practices | SEO | Agentic | FCP | LCP | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | mobile | 62 | 100 | 96 | 100 | 3/3 | 3.9 s | 7.5 s | 210 ms | 0.001 |
| / | desktop | 85 | 100 | 96 | 100 | 3/3 | 1.0 s | 2.4 s | 0 ms | 0 |
| /products | mobile | 73 | 100 | 96 | 100 | 3/3 | 3.3 s | 5.3 s | 80 ms | 0 |
| /products | desktop | 90 | 100 | 96 | 100 | 3/3 | 0.7 s | 2.0 s | 0 ms | 0 |
| /products/maize-ddgs | mobile | 71 | 100 | 96 | 100 | 3/3 | 3.7 s | 5.4 s | 100 ms | 0 |
| /products/maize-ddgs | desktop | 97 | 100 | 96 | 100 | 3/3 | 0.8 s | 1.2 s | 0 ms | 0 |
| /faqs | mobile | 76 | 100 | 100 | 100 | 3/3 | 3.3 s | 4.6 s | 80 ms | 0 |
| /faqs | desktop | 98 | 100 | 100 | 100 | 3/3 | 0.7 s | 1.0 s | 0 ms | 0 |
| /about | mobile | 74 | 100 | 100 | 100 | 3/3 | 3.4 s | 4.4 s | 210 ms | 0 |
| /about | desktop | 97 | 100 | 100 | 100 | 3/3 | 0.8 s | 1.1 s | 0 ms | 0 |
| /contact | mobile | 78 | 100 | 100 | 100 | 3/3 | 3.3 s | 4.3 s | 100 ms | 0 |
| /contact | desktop | 99 | 100 | 100 | 100 | 3/3 | 0.7 s | 0.9 s | 0 ms | 0 |

Run Lighthouse on a production build (`npm run build`, then `npm run serve:dist`, port 4173), never on `npm run dev` (5173):
the dev server sends unbundled, uncompressed modules and no prerendered pages, so its Performance score (about 37) says nothing
about the live site.

#### With critical CSS (27 Nov 2026)

Each prerendered page now carries the CSS its own HTML needs inline (beasties 0.5.5, scripts/prerender.mjs) and loads the full
stylesheets at the end of <body>; the layout with only the inlined CSS was checked against the full CSS on 9 pages at desktop and
phone width (identical apart from 1-2 px text widths).

| Page | Device | Performance | Accessibility | Best practices | SEO | Agentic | FCP | LCP | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | mobile | 65 | 100 | 96 | 100 | 3/3 | 3.5 s | 6.0 s | 260 ms | 0.001 |
| / | desktop | 96 | 100 | 96 | 100 | 3/3 | 0.9 s | 1.2 s | 0 ms | 0.002 |
| /products | mobile | 78 | 100 | 96 | 100 | 3/3 | 3.0 s | 4.6 s | 60 ms | 0.001 |
| /products | desktop | 90 | 100 | 96 | 100 | 3/3 | 0.7 s | 2.0 s | 0 ms | 0.002 |
| /products/maize-ddgs | mobile | 75 | 100 | 96 | 100 | 3/3 | 3.2 s | 4.5 s | 180 ms | 0 |
| /products/maize-ddgs | desktop | 97 | 100 | 96 | 100 | 3/3 | 0.8 s | 1.2 s | 0 ms | 0 |
| /faqs | mobile | 76 | 100 | 100 | 100 | 3/3 | 3.2 s | 4.4 s | 170 ms | 0 |
| /faqs | desktop | 99 | 100 | 100 | 100 | 3/3 | 0.7 s | 0.9 s | 0 ms | 0 |
| /about | mobile | 81 | 100 | 100 | 100 | 3/3 | 3.1 s | 3.9 s | 90 ms | 0.002 |
| /about | desktop | 98 | 100 | 100 | 100 | 3/3 | 0.8 s | 1.0 s | 0 ms | 0.001 |
| /contact | mobile | 77 | 100 | 100 | 100 | 3/3 | 3.2 s | 4.4 s | 110 ms | 0 |
| /contact | desktop | 99 | 100 | 100 | 100 | 3/3 | 0.7 s | 0.9 s | 0 ms | 0 |
