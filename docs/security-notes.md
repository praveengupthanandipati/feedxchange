# Security notes (front end)

## What the front end does now

| Area | Where | What |
| --- | --- | --- |
| Security headers | `deploy/security-headers.conf` (nginx), `public/web.config` (IIS) | Content-Security-Policy, Strict-Transport-Security, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy. |
| CSP and the inline theme script | `index.html`, `scripts/check-csp.mjs` | The one inline script (applies the saved theme before the first paint) is allowed by its SHA-256 hash, not by `'unsafe-inline'`. `npm run build` fails, printing the new hash, if the script changes and the policy files were not updated. |
| CSP tested | `scripts/serve-dist.mjs`, `tests/visual/csp.spec.ts` | The test server sends the production headers; every screen must load with no CSP violation. |
| API address | `vite.config.ts`, `src/core/api/api.js` | A production build stops if `VITE_API_URL` is not set (it used to fall back to the QA server silently). Only `npm run dev` without a setting uses QA. |
| Console output | `vite.config.ts` | `console.*` and `debugger` are removed from production files, so logged contract data and API responses never reach a user's console. |
| Stored profile | `src/features/admin/auth/login/Login.tsx` | Only what the app reads back is kept in localStorage (user id, name, email, role name, business unit type, tokens, permission keys). Phone number, business profile id, role id, business name, last login and the full user object are no longer stored, and old copies are removed at the next sign-in. |

Deployment: copy `deploy/security-headers.conf` to `/etc/nginx/snippets/feedxchange-security-headers.conf`, and in it
(and in `public/web.config`) replace `https://qa.feedxchange.in wss://qa.feedxchange.in` with the API the build uses.
The desktop app has its own policy in `src-tauri/tauri.conf.json`.

## What needs the backend (C:\FeedXchange\FeedXchange)

1. **Refresh token in an httpOnly cookie.** The access and refresh tokens are in localStorage, readable by any script that
   runs on the page. The API should set the refresh token as a `Secure; HttpOnly; SameSite=Strict` cookie on login and
   refresh, read it from the cookie on `/api/Authentication/refresh` and `/logout`, and stop returning it in the body.
   The front end then stops storing it (`saveTokens`) and calls refresh with `credentials: "include"`. CORS must then
   name the allowed origins (a wildcard is not allowed with credentials).
2. **CORS.** `Program.cs` allows any origin. List the site and admin origins and the desktop app's
   (`http://tauri.localhost` on Windows) instead.
3. **Role checks on the server.** The menu and route permission checks in the front end only hide screens; every API
   action must check the caller's permission keys itself (`Rbac:Mode` should be `Enforce` in production, not `Off` or
   `LogOnly`). Worth a review endpoint by endpoint, especially delete, payment and invoice actions.
4. **Swagger** is served in every environment; limit it to Development or put it behind authentication.
5. **Secrets** were in the tracked appsettings files (moved out on the backend branch `backend-local-setup`); rotate them.
6. **`Auth:ExposeSecretsInResponse`** must never be true outside Development (it returns OTPs and reset tokens).
