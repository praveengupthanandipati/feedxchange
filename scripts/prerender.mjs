// Prerenders the public website into plain HTML after `vite build`, and writes sitemap.xml and robots.txt.
//
//   npm run build            builds, then runs this
//   CHROME_PATH=...          which Chrome / Edge to use (found automatically on most machines)
//   VITE_SITE_URL=...        public address used in the sitemap (default https://feedxchange.in)
//
// How: it serves dist/ locally, opens every website route in a headless browser, waits until the page has finished loading and saves the
// resulting HTML as dist/<route>.html. Search engines and link previews then get real content; browsers still start the app normally and
// replace the snapshot. The untouched app shell is kept as dist/app.html: the server uses it for /admin and for anything not prerendered.
// If no browser is found the step is skipped (with a warning) and the build still succeeds.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const siteUrl = (process.env.VITE_SITE_URL ?? "https://feedxchange.in").replace(/\/$/, "");

// ---- the website's routes: the fixed pages plus one per product
// Products come from the API (GetAllProducts, public), like the website itself: VITE_API_URL, else .env.local / .env.
const apiUrl = (
  process.env.VITE_API_URL ||
  [".env.local", ".env"]
    .map((name) => join(root, name))
    .filter((file) => existsSync(file))
    .map((file) => readFileSync(file, "utf8").match(/^VITE_API_URL=(.+)$/m)?.[1]?.trim())
    .find(Boolean) ||
  "https://qa.feedxchange.in"
).replace(/\/$/, "");
// Same slug rule as the website (hooks/useCatalogue.ts): the SEO name, else the name made URL-friendly, else the id.
const slugify = (value) => value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
let slugs = [];
try {
  const response = await fetch(`${apiUrl}/api/Product/GetAllProducts`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  const list = Array.isArray(body) ? body : (body?.result ?? body?.data ?? []);
  slugs = [
    ...new Set(
      list
        .filter((product) => product.isActive && !product.isDeleted)
        .map((product) => product.seoName?.trim() || slugify(product.name?.trim() || "") || String(product.id)),
    ),
  ];
} catch (error) {
  console.warn(`prerender: could not load products from ${apiUrl} (${error.message}); product pages will not be prerendered or listed in the sitemap`);
}
const routes = ["/", "/about", "/products", ...slugs.map((s) => `/products/${s}`), "/faqs", "/blogs", "/contact", "/join", "/privacy", "/terms"];

if (!existsSync(join(dist, "index.html"))) {
  console.error("prerender: dist/index.html is missing. Run `vite build` first.");
  process.exit(1);
}

// The shell the server falls back to (admin, unknown paths). Copy it before the home page overwrites index.html.
if (!existsSync(join(dist, "app.html"))) copyFileSync(join(dist, "index.html"), join(dist, "app.html"));
const shell = readFileSync(join(dist, "app.html"), "utf8");

// ---- sitemap and robots (these do not need a browser)
const today = new Date().toISOString().slice(0, 10);
const urls = routes.map((r) => `  <url><loc>${siteUrl}${r === "/" ? "/" : r}</loc><lastmod>${today}</lastmod></url>`).join("\n");
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`prerender: sitemap.xml with ${routes.length} pages, robots.txt`);

// ---- find a browser
const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) {
  console.warn("prerender: no Chrome or Edge found (set CHROME_PATH). Skipping the HTML snapshots; the site still works as a normal app.");
  process.exit(0);
}

const { default: puppeteer } = await import("puppeteer-core");

// ---- a tiny static server over dist/ (unknown paths get the app shell, like the real server)
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml" };
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let file = normalize(join(dist, path));
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, "app.html");
  res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
let failures = 0;
try {
  for (const route of routes) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    try {
      await page.goto(`${base}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector(".fx-site", { timeout: 30000 });
      // the loading screen fades out once fonts and the hero image are in
      await page.waitForFunction(() => !document.querySelector(".fx-loader"), { timeout: 30000 });
      await page.waitForFunction(() => document.querySelector("main")?.innerText.trim().length > 20, { timeout: 15000 });
      let html = "<!doctype html>\n" + (await page.evaluate(() => document.documentElement.outerHTML));
      html = html.split(base).join(""); // the app adds absolute preload links while it runs here: make them root-relative
      if (!/<h1[\s>]/.test(html) && route !== "/") throw new Error("no <h1> in the rendered page");
      const target = route === "/" ? join(dist, "index.html") : join(dist, `${route.slice(1)}.html`);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, html);
      console.log(`prerender: ${route}  ->  ${target.slice(dist.length + 1)}`);
    } catch (error) {
      failures += 1;
      console.warn(`prerender: ${route} failed (${error.message}); the app shell will be served for it`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`prerender: done, ${routes.length - failures} of ${routes.length} pages saved`);
if (failures === routes.length) process.exitCode = 1;
void shell;
