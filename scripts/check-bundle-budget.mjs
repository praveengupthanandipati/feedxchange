// Bundle-size budget: fails when the files a visitor downloads to open the site or the app grow past a limit.
//   npm run size        (after npm run build)
// It reads the built HTML pages, follows the JS and CSS they load (and the modules those import statically), and adds up
// the gzip sizes. Lazy screens and charts load later and are not counted; a big single file is caught by MAX_FILE_KB.
// Raise a budget only on purpose, with the reason in the commit message.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const BUDGETS_KB = {
  // measured after Phase 7: website 188 KB JS / 54 KB CSS, admin 117 KB JS / 40 KB CSS
  "website home (index.html)": { file: "index.html", js: 200, css: 60 },
  "admin app (app.html)": { file: "app.html", js: 130, css: 50 },
};
const MAX_FILE_KB = 110; // gzip, any single JS or CSS file

const gz = (path) => gzipSync(readFileSync(path)).length / 1024;
const assetPath = (url) => join(dist, url.replace(/^\//, ""));

/** The JS and CSS an HTML page loads up front, following static imports between chunks. */
const initialFiles = (html) => {
  const files = new Set();
  for (const [, url] of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)) files.add(url);
  const queue = [...files].filter((url) => url.endsWith(".js"));
  while (queue.length) {
    const code = readFileSync(assetPath(queue.shift()), "utf8");
    for (const [, name] of code.matchAll(/(?:^|[;\n}])\s*import\s*(?:[^"'()]*?from\s*)?["']\.\/([^"']+\.js)["']/g)) {
      const url = `/assets/${name}`;
      if (!files.has(url) && existsSync(assetPath(url))) {
        files.add(url);
        queue.push(url);
      }
    }
  }
  return [...files];
};

let failed = false;
for (const [label, budget] of Object.entries(BUDGETS_KB)) {
  const html = readFileSync(join(dist, budget.file), "utf8");
  const files = initialFiles(html);
  const js = files.filter((url) => url.endsWith(".js")).reduce((sum, url) => sum + gz(assetPath(url)), 0);
  const css = files.filter((url) => url.endsWith(".css")).reduce((sum, url) => sum + gz(assetPath(url)), 0);
  const ok = js <= budget.js && css <= budget.css;
  failed ||= !ok;
  console.log(`${ok ? "ok  " : "OVER"} ${label}: JS ${js.toFixed(1)} / ${budget.js} KB, CSS ${css.toFixed(1)} / ${budget.css} KB (gzip, ${files.length} files)`);
}

const big = (await import("node:fs")).readdirSync(join(dist, "assets"))
  .filter((name) => /\.(js|css)$/.test(name))
  .map((name) => [name, gz(join(dist, "assets", name))])
  .filter(([, size]) => size > MAX_FILE_KB);
for (const [name, size] of big) console.log(`OVER single file ${name}: ${size.toFixed(1)} KB gzip (limit ${MAX_FILE_KB})`);
if (failed || big.length) process.exit(1);
