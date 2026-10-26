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

## SEO and deployment

- `public/robots.txt` disallows `/admin`; the admin shell adds `<meta name="robots" content="noindex, nofollow">`.
- The website is still a single-page app. For crawlers to see real HTML, prerender its routes at build time (for example `vite-ssg`); give each page its own title, description, canonical and Open Graph tags; add `sitemap.xml`.
- Host both on the same domain: serve `index.html` for every path that is not a file and not `/api` (IIS: URL Rewrite rule; nginx: `try_files $uri /index.html`). Cache hashed assets for a year, `index.html` not at all.
- Links in server-sent emails still point at `dashboard.feedxchange.in/...`. When the admin moves to `feedxchange.in/admin`, change those base URLs (the legacy redirects cover paths sent without the prefix).
