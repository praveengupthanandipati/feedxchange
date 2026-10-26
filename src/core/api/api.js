// The API every request goes to: VITE_API_URL from .env.local (development), .env.desktop (desktop app) or the build
// environment. A production build refuses to start without it (vite.config.ts); only `npm run dev` without any setting
// falls back to the QA server.
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "https://qa.feedxchange.in" : "");
