import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { SCREENS, WIDTHS, openScreen } from "./screens";

// the screenshot widths plus the smallest common phone (360) and a small laptop (1024)
const LAYOUT_WIDTHS = [{ name: "phone-360", width: 360, height: 740 }, ...WIDTHS, { name: "laptop", width: 1024, height: 768 }];

// Layout rules for every screen at every width: the page never scrolls sideways, no visible text is smaller than 11px, and
// interactive targets are at least 24 x 24px (WCAG 2.2, 2.5.8). Small targets are listed in test-results/layout/ rather than
// failing the run, because WCAG allows them when they have enough space around them (an inline link, a checkbox in a row).

for (const viewport of LAYOUT_WIDTHS) {
  test.describe(`layout ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const screen of SCREENS) {
      test(screen.name, async ({ page }) => {
        await openScreen(page, screen);
        const report = await page.evaluate(() => {
          const visible = (element: Element) => {
            const box = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0;
          };
          const label = (element: Element) =>
            `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}.${[...element.classList].slice(0, 2).join(".")} "${(element.textContent ?? "").trim().slice(0, 30)}"`;

          const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

          const tinyText: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const parent = node.parentElement;
            if (!parent || !(node.textContent ?? "").trim() || !visible(parent)) continue;
            if (parent.closest("svg, [aria-hidden='true'], .visually-hidden, .sr-only")) continue;
            const size = parseFloat(getComputedStyle(parent).fontSize);
            if (size < 10.95) tinyText.push(`${size.toFixed(1)}px ${label(parent)}`);
          }

          const smallTargets: string[] = [];
          for (const element of document.querySelectorAll("button, a[href], input:not([type='hidden']), select, textarea, [role='button'], [tabindex='0']")) {
            if (!visible(element)) continue;
            const box = element.getBoundingClientRect();
            // a link inside a sentence is exempt
            if (element.tagName === "A" && getComputedStyle(element).display === "inline") continue;
            if (box.width < 24 || box.height < 24) smallTargets.push(`${Math.round(box.width)}x${Math.round(box.height)} ${label(element)}`);
          }
          // content cut off at the right edge (the admin layout hides sideways overflow, so it would not scroll)
          const scrollsSideways = (element: Element | null): boolean => {
            for (let node = element?.parentElement; node && node !== document.body; node = node.parentElement) {
              const style = getComputedStyle(node);
              if (/(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth) return true;
              if (style.position === "fixed") return false;
            }
            return false;
          };
          // content kept only for screen readers (a 1px clipped box, like Bootstrap's visually-hidden)
          const visuallyHidden = (element: Element) => {
            for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) {
              const style = getComputedStyle(node);
              const box = node.getBoundingClientRect();
              if (style.clip !== "auto" || (box.width <= 1 && box.height <= 1 && style.overflow === "hidden")) return true;
            }
            return false;
          };
          const clipped: string[] = [];
          for (const element of document.querySelectorAll("body *")) {
            if (!visible(element) || element.closest("svg, .swiper, [aria-hidden='true']") || visuallyHidden(element)) continue;
            const box = element.getBoundingClientRect();
            if (box.right > window.innerWidth + 1 && box.left < window.innerWidth && !scrollsSideways(element)) {
              clipped.push(`${Math.round(box.right - window.innerWidth)}px ${label(element)}`);
            }
          }
          return { overflow, tinyText: [...new Set(tinyText)], smallTargets: [...new Set(smallTargets)], clipped: clipped.slice(0, 10) };
        });

        mkdirSync("test-results/layout", { recursive: true });
        writeFileSync(`test-results/layout/${viewport.name}-${screen.name}.json`, JSON.stringify(report, null, 2));
        expect(report.overflow, "the page scrolls sideways").toBeLessThanOrEqual(0);
        expect(report.tinyText, "text smaller than 11px").toEqual([]);
        expect(report.clipped, "content cut off at the right edge").toEqual([]);
      });
    }
  });
}
