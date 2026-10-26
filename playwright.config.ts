import { defineConfig } from "@playwright/test";

// Screenshot tests against a production build (the same files a server would send), served the way production serves them.
// The API is never called: tests/visual/stubs.ts answers every /api and /hubs request, so no live server or real account is needed.
//   npm run test:visual                      build, serve on :4173, compare with the saved screenshots
//   npm run test:visual -- --update-snapshots   accept the current look as the new baseline
// Set VISUAL_NO_BUILD=1 to reuse the dist/ folder from the last build.
const PORT = 4173;

export default defineConfig({
  testDir: "tests/visual",
  outputDir: "test-results",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  timeout: 60_000,
  expect: {
    // anti-aliasing differs a little between runs; a real change moves far more pixels than this
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    // the Chrome already installed on this machine, so no browser download is needed (set PW_CHANNEL=msedge to use Edge)
    channel: process.env.PW_CHANNEL ?? "chrome",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    colorScheme: "light",
    reducedMotion: "reduce",
  },
  webServer: {
    command: process.env.VISUAL_NO_BUILD ? `node scripts/serve-dist.mjs ${PORT}` : `npm run build && node scripts/serve-dist.mjs ${PORT}`,
    url: `http://localhost:${PORT}/app.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
