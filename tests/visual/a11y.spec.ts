import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { SCREENS, openScreen } from "./screens";

// Full axe-core scan (WCAG 2.0 / 2.1 / 2.2 A and AA rules) of every screen in every theme. Serious and critical issues fail
// the test; every issue is listed in test-results/a11y/<theme>-<screen>.json.

const THEMES = ["light", "dark", "high-contrast"] as const;

const chooseTheme = (choice: string) => async (page: Page) => {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("fx-theme", value);
    } catch {
      /* the scan then runs in Light */
    }
  }, choice);
};

for (const theme of THEMES) {
  test.describe(`a11y ${theme}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    for (const screen of SCREENS) {
      test(screen.name, async ({ page }) => {
        await openScreen(page, screen, chooseTheme(theme));
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const issues = results.violations.map((violation) => ({
          rule: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.slice(0, 5).map((node) => node.target.join(" ")),
          count: violation.nodes.length,
        }));
        mkdirSync("test-results/a11y", { recursive: true });
        writeFileSync(`test-results/a11y/${theme}-${screen.name}.json`, JSON.stringify(issues, null, 2));
        const blocking = issues.filter((issue) => issue.impact === "serious" || issue.impact === "critical");
        expect(blocking, "serious or critical accessibility issues").toEqual([]);
      });
    }
  });
}
