import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { SCREENS, openScreen } from "./screens";

// Field borders. DELIBERATE EXCEPTION to WCAG 1.4.11 (non-text contrast 3:1): the owner chose soft grey borders for
// text fields, selects and date pickers at rest (Light #d4d4d4, 1.48:1 on white; Dark #4a4a4a, 2.05:1 on the dark field).
// So the resting border is checked for being that soft neutral grey, not for 3:1. What keeps real contrast is the
// FOCUSED field: its border or focus outline must reach 3:1 against the page, so keyboard users always see where they are.
// See docs/design-tokens.md, "Field borders".

const THEMES = { light: "rgb(212, 212, 212)", dark: "rgb(74, 74, 74)" } as const;

const withTheme = (theme: string) => async (page: Page) => {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("fx-theme", value);
    } catch {
      /* the colours then fail visibly */
    }
  }, theme);
};

/** WCAG contrast of two rgb() strings. */
const contrast = (a: string, b: string) => {
  const lum = (rgb: string) => {
    const [r, g, bl] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map((value) => {
      const channel = Number(value) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [high, low] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

for (const [theme, restingBorder] of Object.entries(THEMES)) {
  test.describe(`field borders ${theme}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("resting borders are the soft neutral grey (deliberate exception), focus reaches 3:1", async ({ page }) => {
      await page.addInitScript(() => {
        document.addEventListener("DOMContentLoaded", () => {
          const style = document.createElement("style");
          style.textContent = "*, *::before, *::after { transition: none !important; }";
          document.head.appendChild(style);
        });
      });
      await openScreen(page, SCREENS.find((item) => item.name === "contract-new")!, withTheme(theme));
      const field = page.locator(".form-field__control").first();

      // resting: the soft grey
      expect(await field.evaluate((element) => getComputedStyle(element).borderTopColor)).toBe(restingBorder);

      // focused: border or outline at least 3:1 against what is behind the field
      await field.focus();
      const focused = await field.evaluate((element) => {
        const style = getComputedStyle(element);
        let background = "rgb(255, 255, 255)";
        for (let node = element.parentElement; node; node = node.parentElement) {
          const colour = getComputedStyle(node).backgroundColor;
          if (colour && !colour.startsWith("rgba(0, 0, 0, 0)") && colour !== "transparent") {
            background = colour;
            break;
          }
        }
        return {
          border: style.borderTopColor,
          outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 ? style.outlineColor : null,
          background,
        };
      });
      const best = Math.max(contrast(focused.border, focused.background), focused.outline ? contrast(focused.outline, focused.background) : 0);
      expect(best, `focused field: border ${focused.border}, outline ${focused.outline} on ${focused.background}`).toBeGreaterThanOrEqual(3);
    });
  });
}
