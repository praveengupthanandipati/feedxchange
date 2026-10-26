// Serves dist/ the way production should (see deploy/nginx.conf and public/web.config):
//   a real file, else <path>.html (prerendered website page), else app.html (the app shell: /admin and anything unknown).
// Use it to check a build locally:   npm run build && node scripts/serve-dist.mjs [port]
// It also sends the production security headers (deploy/security-headers.conf), so the screenshot tests run under the real
// Content-Security-Policy: the API origin there is swapped for the one this build uses (VITE_API_URL), and the two
// HTTPS-only parts (upgrade-insecure-requests, HSTS) are left out because this server speaks plain http.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.argv[2] ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml" };

const isFile = (p) => existsSync(p) && statSync(p).isFile();

const apiOrigin = (() => {
  const fromEnv = process.env.VITE_API_URL;
  const fromFile = [".env.local", ".env"].map((name) => join(dist, "..", name)).filter(isFile)
    .map((file) => readFileSync(file, "utf8").match(/^VITE_API_URL=(.+)$/m)?.[1]?.trim()).find(Boolean);
  try { return new URL(fromEnv || fromFile || "https://qa.feedxchange.in").origin; } catch { return "https://qa.feedxchange.in"; }
})();
const headerFile = join(dist, "..", "deploy", "security-headers.conf");
const securityHeaders = isFile(headerFile)
  ? [...readFileSync(headerFile, "utf8").matchAll(/^add_header ([\w-]+) "([^"]+)" always;$/gm)]
      .filter(([, name]) => name !== "Strict-Transport-Security")
      .map(([, name, value]) => [name, name === "Content-Security-Policy"
        ? value.replace("https://qa.feedxchange.in wss://qa.feedxchange.in", `${apiOrigin} ${apiOrigin.replace(/^http/, "ws")}`).replace(/; upgrade-insecure-requests/, "")
        : value])
  : [];

createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]).replace(/\/$/, "") || "/";
  const base = normalize(join(dist, path));
  let file = null;
  if (!base.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (path === "/") file = join(dist, "index.html");
  else if (isFile(base)) file = base;
  else if (isFile(`${base}.html`)) file = `${base}.html`;
  else file = join(dist, "app.html");
  res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", ...Object.fromEntries(securityHeaders) });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`serving dist/ at http://localhost:${port}`));
