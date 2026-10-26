import { useCallback, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const VIEWPORT_MARGIN = 8;
const PANEL_GAP = 4;
const MIN_LIST_HEIGHT = 96;

interface AnchoredPanelOptions {
  /** Narrowest the panel may be, in px, before it is limited by the viewport. */
  minWidth?: number;
  /** Height of everything in the panel that is not the scrolling list (search box, padding). */
  chromeHeight?: number;
  /** Tallest the scrolling list may be, in px. */
  maxListHeight?: number;
  /**
   * Size the panel to its content (at least `minWidth`) and hang it from one edge of the trigger —
   * for small action menus opened from an icon button — instead of matching the trigger's width.
   */
  fitContent?: "left" | "right";
}

/**
 * Places a dropdown panel against the viewport rather than its parent, so it is never clipped by
 * a scrolling container and never runs off-screen. Render the panel in a portal with `panelStyle`
 * (position: fixed): it is as wide as the trigger, clamped horizontally, opens upward when there is
 * more room above, and `listMaxHeight` shrinks the scrolling list to whatever space is left.
 */
export function useAnchoredPanel(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  { minWidth = 224, chromeHeight = 52, maxListHeight = 224, fitContent }: AnchoredPanelOptions = {},
) {
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [listMaxHeight, setListMaxHeight] = useState(maxListHeight);

  const position = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const vertical = (openUp: boolean): CSSProperties =>
      openUp ? { bottom: viewportHeight - rect.top + PANEL_GAP } : { top: rect.bottom + PANEL_GAP };

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_MARGIN - PANEL_GAP;
    const spaceAbove = rect.top - VIEWPORT_MARGIN - PANEL_GAP;
    const openUp = spaceBelow < chromeHeight + MIN_LIST_HEIGHT && spaceAbove > spaceBelow;
    const space = openUp ? spaceAbove : spaceBelow;

    setListMaxHeight(Math.max(Math.min(space - chromeHeight, maxListHeight), 48));

    // Never taller than the room it opened into, even for panels with no scrolling list.
    const maxHeight = Math.max(space, 0);

    if (fitContent) {
      // Width follows the content; it is only capped to the room beside the trigger.
      const edge =
        fitContent === "right"
          ? { right: Math.max(viewportWidth - rect.right, VIEWPORT_MARGIN) }
          : { left: Math.max(rect.left, VIEWPORT_MARGIN) };
      const roomBeside =
        fitContent === "right" ? rect.right - VIEWPORT_MARGIN : viewportWidth - rect.left - VIEWPORT_MARGIN;
      setPanelStyle({
        ...edge,
        minWidth: Math.min(minWidth, viewportWidth - VIEWPORT_MARGIN * 2),
        maxWidth: Math.max(roomBeside, Math.min(minWidth, viewportWidth - VIEWPORT_MARGIN * 2)),
        maxHeight,
        ...vertical(openUp),
      });
      return;
    }

    const width = Math.min(Math.max(rect.width, minWidth), viewportWidth - VIEWPORT_MARGIN * 2);
    const left = Math.min(Math.max(rect.left, VIEWPORT_MARGIN), viewportWidth - VIEWPORT_MARGIN - width);
    setPanelStyle({ left, width, maxHeight, ...vertical(openUp) });
  }, [triggerRef, minWidth, chromeHeight, maxListHeight, fitContent]);

  useLayoutEffect(() => {
    if (!open) return;
    position();
    window.addEventListener("resize", position);
    // Capture, so scrolling any ancestor keeps the panel attached to its trigger.
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, position]);

  return { panelStyle, listMaxHeight };
}
