# Frontend structure: website and admin on one domain

One React app, two completely separate experiences:

| URL | Layout | Auth |
| --- | --- | --- |
| `/`, `/about`, `/products`, `/products/:slug`, `/faqs`, `/blogs`, `/contact`, `/join` | `layouts/website-layout` (public header and footer) | none |
| `/admin/login` | none (bare page) | public |
| `/admin/**` | `layouts/admin-layout` (sidebar, header, bottom bar) | signed in, then role per screen |

## Folders

```
src/
  main.tsx                     Redux provider + <App/>
  app/
    App.tsx                    BrowserRouter
    app.routes.tsx             the one route table: website group, /admin group, legacy redirects
    AdminShell.tsx             providers only the admin needs (auth, live notifications, selected contract), admin styles, noindex
  layouts/
    website-layout/            WebsiteLayout + its header and footer
    admin-layout/              AdminLayout + asidemenu, header, bottomnav
  features/
    website/                   home, about, products, faqs, blogs, contact, join, not-found, components, data, hooks, styles
      website.routes.tsx       website routes (lazy pages), relative to /
    admin/                     one folder per module (contracts, payments, truck-management, usermanagement, ...)
      admin.routes.tsx         admin routes (lazy pages), relative to /admin
      auth/login, not-found
  core/                        api, auth (session, guards, menu, route permissions), store (Redux), context, routes (adminPaths, legacy redirects)
  shared/                      components (table, dropdown, dialog, ...), notifications UI, utils, assets/styles
```

Rules: `features/website` and `features/admin` never import from each other; both may use `core` and `shared`; layouts own only chrome.

## Routing and loading

- Layouts, the admin shell and every page are `lazy()`: a website visitor never downloads admin code and the reverse.
- `AdminLayout` wraps the signed-in group in `RequireSession` (not signed in -> `/admin/login`) and `RoutePermissionGate` (role check from the menu API, or `core/auth/routePermissions.ts`).
- Write admin links with the `/admin` prefix, or pass server paths through `adminPath()` (`core/routes/adminPaths.ts`). The menu API still stores routes without the prefix; `normalizeMenu` adds it when the menu is loaded. Notification deep links go through `adminPath()` too.
- Old addresses keep working: `/website/*` -> `/*`, and `/contracts/...`, `/dashboard`, ... -> `/admin/...` (`core/routes/LegacyRedirects.tsx`).

## Adding a screen

1. Create it under `features/admin/<module>/`.
2. Add a `lazy()` import and a `<Route path="...">` (no leading slash) to `features/admin/admin.routes.tsx`.
3. Add it to the Pages table (or `layouts/admin-layout/asidemenu/aside.data.ts`) and `core/auth/routePermissions.ts` using the full `/admin/...` path.

## SEO

- `npm run build` runs `vite build` and then `scripts/prerender.mjs`: it opens every website route (`/`, `/about`, `/products`, one per product in `data/content.ts`, `/faqs`, `/blogs`, `/contact`, `/join`) in headless Chrome or Edge and saves the finished HTML as `dist/<route>.html`. Crawlers and link previews get real content; browsers still start the app and replace the snapshot. A new website route needs adding to the route list in that script.
- The same step writes `dist/sitemap.xml` and `dist/robots.txt` (admin disallowed). Set `VITE_SITE_URL` when building for another address (default `https://feedxchange.in`). Set `CHROME_PATH` if no Chrome or Edge is found; without a browser the snapshots are skipped and the build still succeeds.
- Each website page sets its title, description, canonical and Open Graph tags with `usePageTitle(title, description)`. Admin pages are `noindex`, and the not-found page too (the server answers 200 for unknown paths because it serves the app).
- The untouched app shell is saved as `dist/app.html`. The server must use it, not `index.html` (which is the prerendered home page), for `/admin` and unknown paths.

## Deployment on one domain

- `deploy/nginx.conf` (nginx) and `public/web.config` (IIS with URL Rewrite, copied into `dist/`) implement the rule: a real file, else `<path>.html`, else `app.html`; `/api` goes to the API (and `/hubs/` for live notifications if the API is on the same host); hashed files under `/assets` are cached for a year, HTML not at all.
- `npm run build && npm run serve:dist` serves `dist/` with the same rules locally (port 4173) to check a build.
- Emails link to the app through `AppLinks` in the API (`AppSettings:SiteBaseUrl`, `AppSettings:AdminBaseUrl`; defaults `https://feedxchange.in` and `https://feedxchange.in/admin`). The logo in registration emails is `public/brand/logo.png` on the site.
- The website header has a Login link to `/admin/login` (in the menu on small phones).
