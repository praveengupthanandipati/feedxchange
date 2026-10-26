import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { SCREENS, openScreen } from "./screens";

// Overlays only appear after a click, so the screen tests never see them: the website's off-canvas menu, the admin
// sidebar drawer and the confirmation dialog, each opened at phone, tablet, laptop and desktop width. Each must fit the
// window (nothing cut off at the right or bottom edge) and is compared with a saved screenshot.

const OVERLAY_WIDTHS = [
  { name: "phone-360", width: 360, height: 740 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const screen = (name: string) => SCREENS.find((item) => item.name === name)!;

/** Every visible element of the overlay lies inside the window. */
const expectInsideWindow = async (page: Page, selector: string) => {
  const outside = await page.locator(selector).evaluate((root) => {
    const bad: string[] = [];
    for (const element of [root, ...root.querySelectorAll("*")]) {
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.right > window.innerWidth + 1 || box.left < -1) bad.push(`${element.tagName.toLowerCase()}.${element.className}`.slice(0, 80));
    }
    return bad.slice(0, 5);
  });
  expect(outside, "parts of the overlay outside the window").toEqual([]);
};

for (const viewport of OVERLAY_WIDTHS) {
  test.describe(`overlays ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("website menu", async ({ page }) => {
      test.skip(viewport.width >= 1200, "the website shows its full menu from 1200px");
      await openScreen(page, screen("website-home"));
      await page.getByRole("button", { name: "Open menu" }).click();
      const panel = page.locator("#mobile-menu");
      await expect(panel).toBeVisible();
      await page.waitForTimeout(400); // slide-in
      await expectInsideWindow(page, "#mobile-menu");
      await expect(page).toHaveScreenshot(`overlay-website-menu-${viewport.name}.png`);
    });

    test("admin sidebar", async ({ page }) => {
      test.skip(viewport.width >= 992, "the sidebar is always open from 992px");
      await openScreen(page, screen("dashboard"));
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      await page.waitForTimeout(400);
      await expectInsideWindow(page, ".aside");
      await expect(page).toHaveScreenshot(`overlay-admin-sidebar-${viewport.name}.png`);
    });

    test("confirmation dialog", async ({ page }) => {
      await openScreen(page, screen("contracts-list"));
      await page.getByRole("button", { name: "Row actions" }).first().click();
      await page.getByRole("button", { name: /delete/i }).first().click();
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await expectInsideWindow(page, '[role="alertdialog"]');
      await expect(page).toHaveScreenshot(`overlay-confirm-dialog-${viewport.name}.png`);
    });
  });
}

// Bootstrap's JavaScript is no longer loaded for every page: the two screens that use it import their own module.
test.describe("bootstrap behaviour where it is used", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("contract detail: Share information dropdown opens", async ({ page }) => {
    await openScreen(page, { name: "contract-detail", path: "/admin/contracts/FX-2026-101", signedIn: true });
    const toggle = page.getByRole("button", { name: "Share information" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator(".dropdown-menu.show")).toBeVisible();
  });

  test("driver view: Send message modal opens", async ({ page }) => {
    await openScreen(page, { name: "driver-view", path: "/admin/truck-management/transporters/driver-master/1", signedIn: true });
    const opener = page.locator('[data-bs-toggle="modal"]').first();
    await expect(opener).toBeVisible();
    await opener.click();
    await expect(page.locator("#sendMessageModal.show")).toBeVisible();
  });
});
