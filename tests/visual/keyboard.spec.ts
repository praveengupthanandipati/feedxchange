import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { SCREENS, openScreen } from "./screens";

// Keyboard-only walkthroughs of the key flows: everything reachable with Tab shows where focus is, sorting works from the
// keyboard, and dialogs keep focus inside while open and give it back when they close.

const screen = (name: string) => SCREENS.find((item) => item.name === name)!;

/**
 * The focused element and whether focus is visible: an outline or shadow on it, or a ring / border change on its field
 * wrapper (fields that style their box with :focus-within).
 */
const focused = (page: Page) =>
  page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) return null;
    const look = (node: Element | null) => {
      if (!node) return "";
      const style = getComputedStyle(node);
      return `${style.outlineStyle}/${style.outlineWidth}/${style.boxShadow}/${style.borderColor}`;
    };
    const ring = (node: Element) => {
      const style = getComputedStyle(node);
      return (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none";
    };
    // compare the field and its two parents with and without focus
    const nodes = [element, element.parentElement, element.parentElement?.parentElement ?? null];
    const withFocus = nodes.map(look);
    element.blur();
    const withoutFocus = nodes.map(look);
    element.focus();
    const indicator = ring(element) || withFocus.some((value, index) => value !== withoutFocus[index]);
    return {
      name: `${element.tagName.toLowerCase()} ${element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 30) ?? ""}`,
      indicator,
      inDialog: Boolean(element.closest('[aria-modal="true"]')),
    };
  });

test.use({ viewport: { width: 1440, height: 900 } });

// focus styles often animate their colour; measure the end state
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "*, *::before, *::after { transition: none !important; animation: none !important; }";
      document.head.appendChild(style);
    });
  });
});

test("login: every control reachable with Tab, with a visible focus indicator", async ({ page }) => {
  await openScreen(page, screen("admin-login"));
  const seen: string[] = [];
  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press("Tab");
    const now = await focused(page);
    if (!now) continue;
    expect(now.indicator, `no focus indicator on ${now.name}`).toBe(true);
    seen.push(now.name);
  }
  expect(seen.join(" | ")).toMatch(/input/);
  expect(seen.join(" | ")).toMatch(/Sign In/i);
});

test("contracts list: sort from the keyboard; the delete dialog keeps and returns focus", async ({ page }) => {
  await openScreen(page, screen("contracts-list"));

  const dateHeader = page.getByRole("columnheader", { name: /Date/ });
  await expect(dateHeader).toHaveAttribute("aria-sort", "none");
  await dateHeader.getByRole("button").focus();
  await page.keyboard.press("Enter");
  await expect(dateHeader).toHaveAttribute("aria-sort", "ascending");
  await page.keyboard.press("Enter");
  await expect(dateHeader).toHaveAttribute("aria-sort", "descending");

  const trigger = page.getByRole("button", { name: "Row actions" }).first();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const remove = page.getByRole("button", { name: /delete/i }).first();
  await remove.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect.poll(async () => (await focused(page))?.inDialog).toBe(true);
  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press("Tab");
    expect((await focused(page))?.inDialog, "focus left the open dialog").toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect((await focused(page))?.inDialog).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  // focus goes back to where the user was (the row's actions)
  await expect.poll(async () => (await focused(page))?.name ?? "").toMatch(/Row actions|Delete/i);
});

test("new contract: the first fields are reachable with Tab and show focus", async ({ page }) => {
  await openScreen(page, screen("contract-new"));
  await page.locator(".new-contract").first().click({ position: { x: 5, y: 5 } }).catch(() => undefined);
  let fields = 0;
  for (let step = 0; step < 25 && fields < 4; step += 1) {
    await page.keyboard.press("Tab");
    const now = await focused(page);
    if (!now) continue;
    expect(now.indicator, `no focus indicator on ${now.name}`).toBe(true);
    if (/^(input|select|textarea|button)/.test(now.name)) fields += 1;
  }
  expect(fields).toBeGreaterThanOrEqual(4);
});
