// After a build: the inline scripts in dist/*.html must be the ones the Content-Security-Policy allows by hash
// (deploy/security-headers.conf and public/web.config). Editing the theme script in index.html changes its hash; this
// stops the build and prints the value to put in both files, instead of shipping a site whose theme script is blocked.
//   node scripts/check-csp.mjs        (part of npm run build)
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const needed = new Set();
for (const file of walk(join(root, "dist")).filter((path) => path.endsWith(".html"))) {
  for (const [, attributes, body] of readFileSync(file, "utf8").matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(attributes) || !body.trim()) continue;
    needed.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
}

let ok = true;
for (const policyFile of ["deploy/security-headers.conf", "public/web.config"]) {
  const text = readFileSync(join(root, policyFile), "utf8");
  for (const hash of needed) {
    if (!text.includes(hash)) {
      ok = false;
      console.error(`check-csp: ${policyFile} does not allow an inline script of the build. Add ${hash} to its script-src.`);
    }
  }
}
if (!ok) process.exit(1);
console.log(`check-csp: ${needed.size} inline script(s), all allowed by the policy`);
