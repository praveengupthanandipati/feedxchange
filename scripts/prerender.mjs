// Prerenders the public website into plain HTML after `vite build`, and writes sitemap.xml, robots.txt and llms.txt.
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
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync, statSync } from "node:fs";
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
/** slug -> { name, category, image } of every active product, for the sitemap's images and llms.txt */
const productInfo = new Map();
try {
  const response = await fetch(`${apiUrl}/api/Product/GetAllProducts`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  const list = Array.isArray(body) ? body : (body?.result ?? body?.data ?? []);
  for (const product of list.filter((item) => item.isActive && !item.isDeleted)) {
    const slug = product.seoName?.trim() || slugify(product.name?.trim() || "") || String(product.id);
    if (productInfo.has(slug)) continue;
    productInfo.set(slug, {
      name: product.name?.trim() || slug,
      category: product.categoryName?.trim() || "",
      image: product.fileName ? `${apiUrl}${product.fileName}` : null,
    });
  }
  slugs = [...productInfo.keys()];
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
const xml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// how often a page changes and how it ranks within the site (hints only; lastmod is what search engines use most)
const weight = (route) =>
  route === "/" ? ["daily", "1.0"]
  : route === "/products" ? ["daily", "0.9"]
  : route.startsWith("/products/") ? ["daily", "0.8"]
  : ["/faqs", "/blogs", "/about", "/join", "/contact"].includes(route) ? ["weekly", "0.7"]
  : ["yearly", "0.3"];
const urls = routes
  .map((route) => {
    const [changefreq, priority] = weight(route);
    const product = route.startsWith("/products/") ? productInfo.get(route.slice("/products/".length)) : null;
    const image = product?.image
      ? `\n    <image:image><image:loc>${xml(product.image)}</image:loc><image:title>${xml(product.name)}</image:title></image:image>`
      : "";
    return `  <url>\n    <loc>${xml(`${siteUrl}${route === "/" ? "/" : route}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${image}\n  </url>`;
  })
  .join("\n");
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`,
);

// Search engines and AI answer engines (ChatGPT, Claude, Perplexity, Gemini, Copilot ...) may read the public website; the signed-in
// app and the API stay out. Listed by name so a host's default bot rules cannot block them by accident.
const answerEngines = ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "CCBot", "DuckAssistBot", "Meta-ExternalAgent"];
const rules = "Allow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /hubs/\nDisallow: /app.html\n";
writeFileSync(
  join(dist, "robots.txt"),
  `# feedXchange: India's B2B marketplace for animal feed ingredients\n\nUser-agent: *\n${rules}\n${answerEngines.map((bot) => `User-agent: ${bot}`).join("\n")}\n${rules}\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

// llms.txt (llmstxt.org): a plain summary of the site for AI assistants, with links to the pages worth reading.
const llmsTemplate = join(root, "public", "llms.txt");
if (existsSync(llmsTemplate)) {
  const productLines = [...productInfo.entries()]
    .map(([slug, product]) => `- [${product.name}](${siteUrl}/products/${slug})${product.category ? `: ${product.category}` : ""}, indicative price, specifications and verified sellers`)
    .join("\n");
  const llms = readFileSync(llmsTemplate, "utf8")
    .replace(/\{\{SITE_URL\}\}/g, siteUrl)
    .replace("{{PRODUCTS}}", productLines || `- [All products](${siteUrl}/products)`);
  writeFileSync(join(dist, "llms.txt"), llms);
}
console.log(`prerender: sitemap.xml with ${routes.length} pages, robots.txt, llms.txt`);

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

/**
 * Critical CSS (beasties): each saved page gets the CSS rules its own HTML uses inlined in <head> (media queries kept, so it is right
 * on every screen size), and the full stylesheets move to the end of <body>, where they no longer hold back the first paint. No
 * script or inline event handler is involved, so the Content-Security-Policy is unchanged. The stylesheet files themselves are left
 * whole: the app needs every rule once it takes over. Kept on purpose:
 * - the @font-face rules of the fonts the page uses, so text is drawn in its real font from the first paint (no re-wrap);
 * - the dark / high-contrast theme blocks: a visitor's saved theme is applied before the first paint (index.html);
 * - :where() / :is() rules, which beasties cannot match against the page (they include sizes, e.g. 24px touch targets).
 */
let beasties = null;
// The Latin @font-face rules (Inter, Poppins), inlined next to the critical CSS: beasties leaves them out, and without them the
// text would be drawn in the fallback font until the full stylesheet arrives, then re-wrap. Latin-extended faces stay in the CSS.
const fontFaces = (() => {
  const entryCss = readdirSync(join(dist, "assets")).filter((name) => /^index-.*\.css$/.test(name));
  const rules = entryCss.flatMap((name) => readFileSync(join(dist, "assets", name), "utf8").match(/@font-face\{[^}]*\}/g) ?? []);
  const latin = rules.filter((rule) => /-latin-\d+-normal/.test(rule));
  return latin.length ? `<style data-fx-fonts>${latin.join("")}</style>` : "";
})();
try {
  const { default: Beasties } = await import("beasties");
  beasties = new Beasties({
    path: dist,
    publicPath: "/",
    preload: "body",
    noscriptFallback: false,
    pruneSource: false,
    reduceInlineStyles: false,
    mergeStylesheets: true,
    inlineFonts: true,
    preloadFonts: false,
    // :where() / :is() rules (e.g. the WCAG 24px target-size rule in tokens.scss) are not matched by beasties: always keep them
    allowRules: [/data-theme/, /data-bs-theme/, /data-app/, /:where\(/, /:is\(/],
    compress: true,
    logLevel: "warn",
  });
} catch (error) {
  console.warn(`prerender: critical CSS skipped (${error.message}); pages keep their render-blocking stylesheets`);
}

// ---- a tiny static server over dist/ (unknown paths get the app shell, like the real server)
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml" };
/**
 * The built site calls its API on its own address (/api/..., src/core/api/api.js), which nginx / IIS pass on to the .NET API in
 * production. A local server has no API behind it, so /api is forwarded to the one this build uses (VITE_API_URL); without that
 * every product request would get the HTML shell and product pages would be saved as "not found".
 */
const forwardApi = async (req, res, target) => {
  try {
    const upstream = await fetch(`${target}${req.url}`, { method: req.method === "HEAD" ? "HEAD" : "GET", signal: AbortSignal.timeout(30000) });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") ?? "application/json" });
    res.end(body);
  } catch (error) {
    res.writeHead(502, { "Content-Type": "text/plain" }).end(`API not reachable: ${error.message}`);
  }
};
const server = createServer((req, res) => {
  if (/^\/(api|hubs|images)\//i.test(req.url ?? "")) { void forwardApi(req, res, apiUrl); return; }
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let file = normalize(join(dist, path));
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, "app.html");
  res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

// The two hero photos (assets/images/hero), by their hashed names in this build.
const assetNames = readdirSync(join(dist, "assets"));
const heroSmall = assetNames.find((name) => /^hero-960-.*\.webp$/.test(name));
const heroLarge = assetNames.find((name) => /^hero-1920-.*\.webp$/.test(name));

/**
 * Makes a saved page right for a first visit before any JavaScript runs:
 * - every section visible: the scroll-in animation hides sections until the app reveals them, which the static copy never would;
 * - the hero photo chosen by screen width in CSS and preloaded at high priority, instead of the 1920px one the headless browser
 *   picked (phones get the 960px photo, as heroImage.ts does once the app runs);
 * - no early downloads of the app's JavaScript chunks (modulepreload): the page is readable without them, and on a slow phone
 *   connection they would compete with the CSS the first paint waits for. The entry script still loads them right after;
 * - only the first banner photo: the others are off-screen slides that would otherwise download before the first paint.
 */
const finishSnapshot = (html) => {
  let out = html
    .replace(/<link rel="modulepreload"[^>]*>/g, "")
    // banner slides after the first: the carousel loads them once the app runs; the static copy shows only the first
    .replace(/(<img [^>]*loading="lazy"[^>]*?) src="(\/images\/bannerimages\/[^"]+)"/g, '$1 data-src="$2"')
    .replace(/class="fx-site([^"]*)"/, (_, rest) => `class="fx-site${rest.replace(/\s*reveal-ready/g, "")}"`)
    .replace(/(<div class="fx-site[^"]*")\s+aria-busy="true"/, "$1");
  const hero = /\sstyle="--hero-bg: url\(\/assets\/hero-[^)]+\);?"/;
  if (heroSmall && heroLarge && hero.test(out)) {
    out = out.replace(hero, "");
    const head =
      `<link rel="preload" as="image" type="image/webp" href="/assets/${heroSmall}" media="(max-width: 767px)" fetchpriority="high">` +
      `<link rel="preload" as="image" type="image/webp" href="/assets/${heroLarge}" media="(min-width: 768px)" fetchpriority="high">` +
      `<style>.hero{--hero-bg:url(/assets/${heroLarge})}@media (max-width:767px){.hero{--hero-bg:url(/assets/${heroSmall})}}</style>`;
    out = out.replace("</title>", `</title>${head}`);
  }
  return out;
};

/**
 * Link previews (WhatsApp, Telegram, LinkedIn, Facebook) read only the start of a page, and the inlined critical CSS pushes the
 * page's own title / description / og: / twitter: tags well past 150 KB. They are moved to the top of <head>, right after the
 * charset and viewport, so every preview finds the title, description and image.
 */
const SHARE_TAG = /<title>[\s\S]*?<\/title>|<meta\s+(?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")[^>]*>|<link\s+rel="canonical"[^>]*>/g;
const hoistShareTags = (html) => {
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) return html;
  const head = html.slice(0, headEnd);
  const tags = head.match(SHARE_TAG) ?? [];
  if (tags.length === 0) return html;
  const rest = head.replace(SHARE_TAG, "");
  const anchor = /<meta\s+name="viewport"[^>]*>/.exec(rest) ?? /<meta\s+charset[^>]*>/i.exec(rest) ?? /<head[^>]*>/.exec(rest);
  if (!anchor) return html;
  const at = anchor.index + anchor[0].length;
  return rest.slice(0, at) + tags.join("") + rest.slice(at) + html.slice(headEnd);
};

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
      if (!/<h1[\s>]/.test(html)) throw new Error("no <h1> in the rendered page");
      html = finishSnapshot(html);
      if (beasties) html = (await beasties.process(html)).replace("</head>", `${fontFaces}</head>`);
      html = hoistShareTags(html);
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
