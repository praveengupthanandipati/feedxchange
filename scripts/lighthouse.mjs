// Lighthouse scores of the production build, served the way production serves it (scripts/serve-dist.mjs).
//   npm run build && node scripts/lighthouse.mjs [label]
// Runs the website home page and the admin login page, mobile and desktop, three times each, and prints the median
// scores as a Markdown table (to paste into docs/baseline.md). Needs Chrome; uses `npx lighthouse` (not a dependency).
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 4174;
const LIGHTHOUSE = "lighthouse@13.5.0";
const pages = [
  ["website home", "/"],
  ["admin login", "/admin/login"],
];
const label = process.argv[2] ?? "";

const server = spawn(process.execPath, ["scripts/serve-dist.mjs", String(PORT)], { stdio: "ignore" });
await new Promise((resolve) => setTimeout(resolve, 1500));

const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
const rows = [];
try {
  for (const [name, path] of pages) {
    for (const formFactor of ["mobile", "desktop"]) {
      const runs = [];
      for (let run = 0; run < 3; run += 1) {
        const dir = mkdtempSync(join(tmpdir(), "fx-lh-"));
        const out = join(dir, "report.json");
        const args = [
          "--yes", LIGHTHOUSE, `http://localhost:${PORT}${path}`,
          "--output=json", `--output-path=${out}`, "--quiet",
          "--only-categories=performance,accessibility,best-practices,seo",
          "--chrome-flags=--headless=new",
          ...(formFactor === "desktop" ? ["--preset=desktop"] : []),
        ];
        const result = spawnSync("npx", args, { shell: true, encoding: "utf8" });
        if (result.status !== 0) throw new Error(result.stderr.slice(0, 500));
        const report = JSON.parse(readFileSync(out, "utf8"));
        runs.push(report);
        rmSync(dir, { recursive: true, force: true });
      }
      const score = (key) => Math.round(median(runs.map((r) => r.categories[key].score * 100)));
      const metric = (id) => median(runs.map((r) => r.audits[id].numericValue));
      rows.push(
        `| ${label} | ${name} | ${formFactor} | ${score("performance")} | ${score("accessibility")} | ${score("best-practices")} | ${score("seo")} | ` +
          `${(metric("first-contentful-paint") / 1000).toFixed(2)} s | ${(metric("largest-contentful-paint") / 1000).toFixed(2)} s | ` +
          `${metric("total-blocking-time").toFixed(0)} ms | ${metric("cumulative-layout-shift").toFixed(3)} | ${(metric("total-byte-weight") / 1024).toFixed(0)} KB |`,
      );
    }
  }
} finally {
  server.kill();
}
console.log("| Build | Page | Device | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |");
console.log("| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
console.log(rows.join("\n"));
