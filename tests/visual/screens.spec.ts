import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { FIXED_NOW, seedSession, stubApi } from "./stubs";

// Key screens at phone, tablet and desktop width. Each screenshot is compared with tests/visual/__screenshots__.

export const WIDTHS = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

export interface Screen {
  name: string;
  path: string;
  signedIn: boolean;
}

export const SCREENS: Screen[] = [
  { name: "website-home", path: "/", signedIn: false },
  { name: "website-about", path: "/about", signedIn: false },
  { name: "website-products", path: "/products", signedIn: false },
  { name: "website-contact", path: "/contact", signedIn: false },
  { name: "admin-login", path: "/admin/login", signedIn: false },
  { name: "dashboard", path: "/admin/dashboard", signedIn: true },
  { name: "contracts-list", path: "/admin/contracts", signedIn: true },
  { name: "contract-new", path: "/admin/contracts/new", signedIn: true },
  { name: "payment-advice", path: "/admin/payments/payment-advice", signedIn: true },
  { name: "payment-allocation", path: "/admin/payments/payment-allocation", signedIn: true },
  { name: "seller-invoice", path: "/admin/payments/seller-invoice", signedIn: true },
  { name: "business-owners", path: "/admin/business-owners", signedIn: true },
  { name: "transporters", path: "/admin/transporters", signedIn: true },
  { name: "users", path: "/admin/masters/users", signedIn: true },
  { name: "role-access", path: "/admin/menu-management/assign-role", signedIn: true },
  { name: "notifications", path: "/admin/notifications", signedIn: true },
  { name: "settings", path: "/admin/settings", signedIn: true },
  { name: "products", path: "/admin/products", signedIn: true },
  { name: "pending-contracts", path: "/admin/truck-management/pending-contracts", signedIn: true },
  { name: "contract-summary", path: "/admin/reports/contract-summary", signedIn: true },
];

/** Opens a screen with stubbed data and a fixed clock, and waits until it has settled. */
export const openScreen = async (page: Page, screen: Screen, setup?: (page: Page) => Promise<void>) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await stubApi(page);
  if (screen.signedIn) await seedSession(page);
  if (setup) await setup(page);
  await page.goto(screen.path);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  // lazy screens show a loader first; wait for it to go
  await expect(page.locator(".page-loader, [aria-busy='true']")).toHaveCount(0, { timeout: 10_000 }).catch(() => undefined);
  // lazy images below the fold
  await page.evaluate(() => document.querySelectorAll("img[loading='lazy']").forEach((img) => img.setAttribute("loading", "eager")));
  await page.waitForLoadState("networkidle");
};

for (const viewport of WIDTHS) {
  test.describe(`${viewport.name} ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const screen of SCREENS) {
      test(screen.name, async ({ page }) => {
        await openScreen(page, screen);
        await expect(page).toHaveScreenshot(`${screen.name}-${viewport.name}.png`, { fullPage: true });
      });
    }
  });
}
