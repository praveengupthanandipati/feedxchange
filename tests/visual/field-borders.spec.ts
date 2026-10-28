import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { SCREENS, openScreen } from "./screens";

// Field borders. DELIBERATE EXCEPTION to WCAG 1.4.11 (non-text contrast 3:1) and to the app's dark focus ring, by the
// owner's choice: text fields, selects and date pickers keep soft grey edges in every state (Light rest #dcdcdc, focus
// #bdbdbd; Dark rest #3f3f3f, focus #5c5c5c) and a focused field shows a soft grey glow instead of the navy / orange ring.
// So fields are checked for exactly that soft look (grey border, grey glow, no dark outline), while everything that is
// not a text field (buttons, links, checkboxes, menus) must still show the strong ring at 3:1 or more.
// High contrast keeps strong field edges and the ring. See docs/design-tokens.md, "Field borders".

const THEMES = {
  light: { rest: "rgb(220, 220, 220)", focus: "rgb(189, 189, 189)", glow: "rgba(128, 128, 128, 0.25)" },
  dark: { rest: "rgb(63, 63, 63)", focus: "rgb(92, 92, 92)", glow: "rgba(160, 160, 160, 0.25)" },
} as const;

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

for (const [theme, expected] of Object.entries(THEMES)) {
  test.describe(`field borders ${theme}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("fields stay soft grey at rest and on focus (deliberate exception); buttons keep the strong ring", async ({ page }) => {
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
      expect(await field.evaluate((element) => getComputedStyle(element).borderTopColor)).toBe(expected.rest);

      // focused from the keyboard: light grey border and the grey glow, no dark outline
      await field.focus();
      const focused = await field.evaluate((element) => {
        const style = getComputedStyle(element);
        return { border: style.borderTopColor, shadow: style.boxShadow, outline: style.outlineStyle === "none" ? "none" : style.outlineColor };
      });
      expect(focused.border).toBe(expected.focus);
      expect(focused.shadow).toContain(expected.glow);
      expect(["none", "rgba(0, 0, 0, 0)"]).toContain(focused.outline);

      // not a field: a button focused from the keyboard keeps a ring at 3:1 or more against the page
      const button = page.getByRole("button").first();
      await button.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const ring = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement;
        const style = getComputedStyle(element);
        let background = "rgb(255, 255, 255)";
        for (let node = element.parentElement; node; node = node.parentElement) {
          const colour = getComputedStyle(node).backgroundColor;
          if (colour && !colour.startsWith("rgba(0, 0, 0, 0)") && colour !== "transparent") {
            background = colour;
            break;
          }
        }
        return { tag: element.tagName, outline: style.outlineStyle !== "none" ? style.outlineColor : null, background };
      });
      expect(ring.outline, `no focus ring on ${ring.tag}`).not.toBeNull();
      expect(contrast(ring.outline!, ring.background)).toBeGreaterThanOrEqual(3);
    });
  });
}

// The clear "x" inside a field matches the chevron (14px, the same fine stroke), keeps a 24px click area, and clears.
test("clear x: same size as the chevron, 24px target, clears the value", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openScreen(page, { name: "generate-invoice", path: "/admin/company-invoices/generate", signedIn: true });
  const trigger = page.locator(".searchable-select__trigger:visible").first();
  const placeholder = await trigger.innerText();
  await trigger.click();
  await page.locator('[role="option"]').nth(1).click();
  const clear = trigger.getByRole("button", { name: "Clear selection" });
  const sizes = await trigger.evaluate((element) => {
    const box = (node: Element | null) => {
      const rect = node!.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height), stroke: node!.getAttribute("stroke-width") };
    };
    return {
      x: box(element.querySelector(".field-clear svg")),
      target: box(element.querySelector(".field-clear")),
      chevron: box(element.querySelector(".lucide-chevron-down")),
    };
  });
  expect(sizes.x).toEqual({ width: 14, height: 14, stroke: "1.5" });
  expect(sizes.chevron).toEqual(sizes.x);
  expect(sizes.target.width).toBeGreaterThanOrEqual(24);
  expect(sizes.target.height).toBeGreaterThanOrEqual(24);
  await clear.click();
  await expect(trigger).toHaveText(placeholder);
  await expect(page.locator('[role="listbox"]')).toHaveCount(0);
});
