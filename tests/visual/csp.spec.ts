import { expect, test } from "@playwright/test";
import { SCREENS, openScreen } from "./screens";

// The test server sends the production security headers (scripts/serve-dist.mjs), so every screen must load without a
// single Content-Security-Policy violation: a blocked script, style, font, image or API call would show up here.

test.use({ viewport: { width: 1440, height: 900 } });

test("the security headers are sent", async ({ request }) => {
  const response = await request.get("/admin/login");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
});

for (const screen of SCREENS) {
  test(`no CSP violations: ${screen.name}`, async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __csp: string[] }).__csp = [];
      document.addEventListener("securitypolicyviolation", (event) => {
        (window as unknown as { __csp: string[] }).__csp.push(`${event.effectiveDirective} ${event.blockedURI}`);
      });
    });
    await openScreen(page, screen);
    const violations = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
    expect(violations).toEqual([]);
  });
}
