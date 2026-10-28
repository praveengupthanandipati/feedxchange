import { expect, test } from "@playwright/test";
import { SCREENS, WIDTHS, openScreen } from "./screens";

// Key screens at phone, tablet and desktop width in the Light theme. Each screenshot is compared with tests/visual/__screenshots__.

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
