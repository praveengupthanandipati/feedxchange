import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { SCREENS, openScreen } from "./screens";

// WCAG AA text contrast (axe-core's color-contrast rule): every screen in Light, the key screens in Dark and High contrast.
// Each failing element is listed in test-results/contrast/<theme>-<screen>.json with its colours and ratio.

const SCREENS_CHECKED = ["website-home", "website-contact", "admin-login", "dashboard", "contracts-list", "contract-new", "payment-advice", "business-owners", "notifications", "settings"];
const THEMES = ["light", "dark", "high-contrast"] as const;

const chooseTheme = (choice: string) => async (page: Page) => {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("fx-theme", value);
    } catch {
      /* the check then runs in Light */
    }
  }, choice);
};

for (const theme of THEMES) {
  test.describe(`contrast ${theme}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    for (const screen of SCREENS.filter((item) => theme === "light" || SCREENS_CHECKED.includes(item.name))) {
      test(screen.name, async ({ page }) => {
        await openScreen(page, screen, chooseTheme(theme));
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        const failures = results.violations.flatMap((violation) =>
          violation.nodes.map((node) => {
            const data = (node.any[0]?.data ?? {}) as { fgColor?: string; bgColor?: string; contrastRatio?: number; expectedContrastRatio?: string };
            return {
              target: node.target.join(" "),
              text: node.html.replace(/\s+/g, " ").slice(0, 120),
              fg: data.fgColor,
              bg: data.bgColor,
              ratio: data.contrastRatio,
              needed: data.expectedContrastRatio,
            };
          }),
        );
        mkdirSync("test-results/contrast", { recursive: true });
        writeFileSync(`test-results/contrast/${theme}-${screen.name}.json`, JSON.stringify(failures, null, 2));
        expect(failures, `${failures.length} text elements below WCAG AA contrast`).toEqual([]);
      });
    }
  });
}
