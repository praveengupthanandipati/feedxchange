// Serves dist/ the way production should (see deploy/nginx.conf and public/web.config):
//   a real file, else <path>.html (prerendered website page), else app.html (the app shell: /admin and anything unknown).
// Use it to check a build locally:   npm run build && node scripts/serve-dist.mjs [port]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.argv[2] ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml" };

const isFile = (p) => existsSync(p) && statSync(p).isFile();

createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]).replace(/\/$/, "") || "/";
  const base = normalize(join(dist, path));
  let file = null;
  if (!base.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (path === "/") file = join(dist, "index.html");
  else if (isFile(base)) file = base;
  else if (isFile(`${base}.html`)) file = `${base}.html`;
  else file = join(dist, "app.html");
  res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`serving dist/ at http://localhost:${port}`));
