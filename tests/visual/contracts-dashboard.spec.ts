import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { SCREENS, openScreen } from "./screens";

// The contracts overview: Light at 375 / 768 / 1440 and both other themes at phone and desktop are in screens.spec.ts and
// themes.spec.ts (the contracts-list screen); here the tablet width in Dark and High contrast, and what the overview does.

const contractsList = SCREENS.find((item) => item.name === "contracts-list")!;

const withTheme = (theme: string) => async (page: Page) => {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("fx-theme", value);
    } catch {
      /* the screenshot then fails visibly */
    }
  }, theme);
};

/** "Showing 1-10 of 18 Results" -> 18 */
const resultCount = async (page: Page) => {
  const text = await page.locator(".contracts-pagination p").innerText();
  return Number(text.match(/of (\d+)/)?.[1] ?? (text.includes("0 Results") ? 0 : NaN));
};

for (const theme of ["dark", "high-contrast"]) {
  test(`${theme} tablet`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openScreen(page, contractsList, withTheme(theme));
    await expect(page).toHaveScreenshot(`contracts-dashboard-${theme}-tablet.png`, { fullPage: true });
  });
}

test.describe("what the overview does", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("headline figures come from the contracts", async ({ page }) => {
    await openScreen(page, contractsList);
    const overview = page.getByRole("region", { name: "Contracts overview" });
    await expect(overview.locator(".cd-card").first()).toContainText("18");
    await expect(overview.locator(".cd-card").first()).toContainText("13 active");
    await expect(overview).toContainText("4,630 MT");
    await expect(overview).toContainText("42% of contracted");
  });

  test("an attention group narrows the list, Clear brings everything back", async ({ page }) => {
    await openScreen(page, contractsList);
    expect(await resultCount(page)).toBe(18);
    await page.getByRole("button", { name: /Delivery overdue/ }).click();
    expect(await resultCount(page)).toBe(3);
    await expect(page.getByRole("button", { name: /Delivery overdue/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Clear" }).click();
    expect(await resultCount(page)).toBe(18);
  });

  test("a status and a month use the list's own filters", async ({ page }) => {
    await openScreen(page, contractsList);
    await page.locator(".cd-legend__row", { hasText: "Open" }).click();
    expect(await resultCount(page)).toBe(6);
    await page.locator(".cd-legend__row", { hasText: "Open" }).click(); // again: off
    expect(await resultCount(page)).toBe(18);
    await page.getByRole("button", { name: /^Oct 26: 5 contracts/ }).click();
    expect(await resultCount(page)).toBe(5);
    await expect(page.locator(".contracts-card__header p")).toContainText("Custom Date Range");
  });

  test("a product narrows the list through the search", async ({ page }) => {
    await openScreen(page, contractsList);
    await page.locator(".cd-ranked__row", { hasText: "Crude Oil" }).click();
    expect(await resultCount(page)).toBe(3);
  });

  test("hide / show is remembered", async ({ page }) => {
    await openScreen(page, contractsList);
    await page.getByRole("button", { name: "Hide overview" }).click();
    await expect(page.getByRole("region", { name: "Contracts overview" })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("button", { name: "Show overview" })).toBeVisible();
    await expect(page.locator(".contracts-page__summary")).toBeVisible();
  });
});

// The four headline cards: one row of equal cards from 900px (sidebar open from 992px), 2 x 2 at tablet, one column on phones.
const cardBoxes = async (page: Page) => {
  const boxes = await page.locator(".cd-cards > .cd-card").evaluateAll((cards) =>
    cards.map((card) => {
      const box = card.getBoundingClientRect();
      return { top: Math.round(box.top), left: Math.round(box.left), width: Math.round(box.width), height: Math.round(box.height) };
    }),
  );
  expect(boxes).toHaveLength(4);
  return boxes;
};
const rowsOf = (boxes: { top: number }[]) => new Set(boxes.map((box) => box.top)).size;

for (const width of [900, 1024, 1280, 1440, 1920]) {
  test(`cards: one row of four equal cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openScreen(page, contractsList);
    const boxes = await cardBoxes(page);
    expect(rowsOf(boxes)).toBe(1);
    expect(new Set(boxes.map((box) => box.height)).size, "equal heights").toBe(1);
    expect(Math.max(...boxes.map((box) => box.width)) - Math.min(...boxes.map((box) => box.width)), "equal widths").toBeLessThanOrEqual(1);
    expect(boxes[0].height, "compact height").toBeLessThanOrEqual(96);
    // the figures fit (no ellipsis needed for these values)
    const clipped = await page.locator(".cd-card__value").evaluateAll((values) => values.filter((value) => value.scrollWidth > value.clientWidth).length);
    expect(clipped).toBe(0);
  });
}

test("cards: two by two at 768px, one column at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await openScreen(page, contractsList);
  let boxes = await cardBoxes(page);
  expect(rowsOf(boxes)).toBe(2);
  expect(new Set(boxes.map((box) => box.height)).size).toBe(1);
  await page.setViewportSize({ width: 375, height: 812 });
  boxes = await cardBoxes(page);
  expect(rowsOf(boxes)).toBe(4);
});

test("dispatched bar shows its share", async ({ page }) => {
  await openScreen(page, contractsList);
  const bar = page.getByRole("progressbar", { name: "Share of contracted quantity dispatched" });
  await expect(bar).toHaveAttribute("aria-valuenow", "42");
  const fill = await bar.locator(".cd-meter__fill").evaluate((element) => element.getBoundingClientRect().width / element.parentElement!.getBoundingClientRect().width);
  expect(fill).toBeGreaterThan(0.38);
  expect(fill).toBeLessThan(0.46);
});

for (const theme of ["light", "dark", "high-contrast"]) {
  for (const width of [1440, 1920]) {
    test(`cards ${theme} ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openScreen(page, contractsList, withTheme(theme));
      await expect(page.locator(".cd-cards")).toHaveScreenshot(`contracts-cards-${theme}-${width}.png`);
    });
  }
}
