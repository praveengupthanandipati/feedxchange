// Serves dist/ the way production should (see deploy/nginx.conf and public/web.config):
//   a real file, else <path>.html (prerendered website page), else app.html (the app shell: /admin and anything unknown).
// Use it to check a build locally:   npm run build && node scripts/serve-dist.mjs [port]
// It also sends the production security headers (deploy/security-headers.conf), so the screenshot tests run under the real
// Content-Security-Policy: the API origin there is swapped for the one this build uses (VITE_API_URL), and the two
// HTTPS-only parts (upgrade-insecure-requests, HSTS) are left out because this server speaks plain http.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync, constants as zlib } from "node:zlib";

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

/**
 * The built site calls its API on its own address (/api/..., src/core/api/api.js), which nginx / IIS pass on to the .NET API in
 * production. A local server has no API behind it, so /api is forwarded to the one this build uses (VITE_API_URL); without that
 * every product request would get the HTML shell and product pages would be saved as "not found".
 */
const forwardApi = async (req, res, target) => {
  // product and blog pictures are files of the API as well (/images/...)
  try {
    const upstream = await fetch(`${target}${req.url}`, { method: req.method === "HEAD" ? "HEAD" : "GET", signal: AbortSignal.timeout(30000) });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") ?? "application/json" });
    res.end(body);
  } catch (error) {
    res.writeHead(502, { "Content-Type": "text/plain" }).end(`API not reachable: ${error.message}`);
  }
};
createServer((req, res) => {
  if (/^\/(api|images)\//i.test(req.url ?? "")) { void forwardApi(req, res, apiOrigin); return; }
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]).replace(/\/$/, "") || "/";
  const base = normalize(join(dist, path));
  let file = null;
  if (!base.startsWith(dist)) { res.writeHead(403).end(); return; }
  // like production: a missing /.well-known file is a 404, not the website page
  if (path.startsWith("/.well-known/") && !isFile(base)) { res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); return; }
  if (path === "/") file = join(dist, "index.html");
  else if (isFile(base)) file = base;
  else if (isFile(`${base}.html`)) file = `${base}.html`;
  else file = join(dist, "app.html");
  const type = types[extname(file)] ?? "application/octet-stream";
  let body = readFileSync(file);
  // Text is compressed as production does it (deploy/nginx.conf, public/web.config), so measurements match real visits.
  const headers = { "Content-Type": type, "Cache-Control": relative(dist, file).split(sep)[0] === "assets" ? "public, max-age=31536000, immutable" : "no-cache", Vary: "Accept-Encoding", ...Object.fromEntries(securityHeaders) };
  const accept = String(req.headers["accept-encoding"] ?? "");
  if (/^(text\/|application\/(javascript|json|xml)|image\/svg)/.test(type) && body.length > 1024) {
    if (/\bbr\b/.test(accept)) { body = brotliCompressSync(body, { params: { [zlib.BROTLI_PARAM_QUALITY]: 5 } }); headers["Content-Encoding"] = "br"; }
    else if (/\bgzip\b/.test(accept)) { body = gzipSync(body, { level: 6 }); headers["Content-Encoding"] = "gzip"; }
  }
  res.writeHead(200, headers);
  res.end(body);
}).listen(port, () => console.log(`serving dist/ at http://localhost:${port}`));
