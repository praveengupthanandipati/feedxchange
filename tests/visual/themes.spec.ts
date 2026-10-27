import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { SCREENS, openScreen } from "./screens";

// Key screens in the Dark and High contrast themes (Light is covered by screens.spec.ts), and "Match my device".

const THEMED = ["website-home", "website-contact", "admin-login", "dashboard", "contracts-list", "contract-new", "payment-advice", "business-owners", "notifications", "settings"];
const THEMES = ["dark", "high-contrast"] as const;
const WIDTHS = [
  { name: "phone", width: 375, height: 812 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const chooseTheme = (choice: string) => async (page: Page) => {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("fx-theme", value);
    } catch {
      /* the test then fails on the screenshot */
    }
  }, choice);
};

for (const theme of THEMES) {
  for (const viewport of WIDTHS) {
    test.describe(`${theme} ${viewport.name}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const screen of SCREENS.filter((item) => THEMED.includes(item.name))) {
        test(screen.name, async ({ page }) => {
          await openScreen(page, screen, chooseTheme(theme));
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
          await expect(page).toHaveScreenshot(`${theme}/${screen.name}-${viewport.name}.png`, { fullPage: true });
        });
      }
    });
  }
}

test.describe("match my device", () => {
  test.use({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });

  test("follows a dark device setting", async ({ page }) => {
    const login = SCREENS.find((item) => item.name === "admin-login")!;
    await openScreen(page, login, chooseTheme("system"));
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme-choice", "system");
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "dark");
  });

  test("the theme is applied before the first paint", async ({ page }) => {
    await chooseTheme("dark")(page);
    // stop the app's scripts: whatever is on <html> now came from the inline script in index.html
    await page.route(/\/assets\/.*\.js$/, (route) => route.abort());
    await page.goto("/admin/login");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
