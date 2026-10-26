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
