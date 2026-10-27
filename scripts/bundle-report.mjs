// Prints the size of every file in dist/assets (raw and gzip) plus totals, as a Markdown table.
//   node scripts/bundle-report.mjs            after a build
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const assets = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "assets");
const kb = (n) => (n / 1024).toFixed(1);
const rows = readdirSync(assets)
  .filter((name) => statSync(join(assets, name)).isFile())
  .map((name) => {
    const data = readFileSync(join(assets, name));
    const text = [".js", ".css"].includes(extname(name));
    return { name, type: extname(name).slice(1), raw: data.length, gzip: text ? gzipSync(data).length : data.length };
  })
  .sort((a, b) => b.raw - a.raw);

const total = (type) => rows.filter((r) => !type || r.type === type).reduce((sum, r) => ({ raw: sum.raw + r.raw, gzip: sum.gzip + r.gzip, n: sum.n + 1 }), { raw: 0, gzip: 0, n: 0 });
const line = (label, t) => `| ${label} | ${t.n} | ${kb(t.raw)} | ${kb(t.gzip)} |`;
console.log("| Files | Count | Raw KB | Gzip KB |\n| --- | ---: | ---: | ---: |");
console.log(line("JavaScript", total("js")));
console.log(line("CSS", total("css")));
console.log(line("All assets", total()));
console.log("\nLargest 15:\n\n| File | Raw KB | Gzip KB |\n| --- | ---: | ---: |");
for (const r of rows.slice(0, 15)) console.log(`| ${r.name.replace(/-[\w-]{8}(\.\w+)$/, "$1")} | ${kb(r.raw)} | ${kb(r.gzip)} |`);
