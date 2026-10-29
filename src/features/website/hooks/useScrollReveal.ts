import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fades elements marked `data-reveal` up into place as they scroll into view (vertical movement only).
 * Each element animates once. The hidden starting state only applies after `reveal-ready` is added to
 * the root, so content stays visible if JavaScript fails, and nothing is hidden for reduced-motion users.
 * Optional `data-reveal-delay="120"` (ms) staggers items in a row.
 */
export const useScrollReveal = (rootRef: RefObject<HTMLElement | null>, disabled: boolean) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || disabled || !("IntersectionObserver" in window)) return;

    root.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay;
          // A one-off animation (not a transition), so it never interferes with the element's hover effects.
          if (delay) el.style.animationDelay = `${delay}ms`;
          // An attribute, not a class: React rewrites className on re-render (e.g. an FAQ toggling
          // "is-open"), which would wipe a class and hide the element again.
          el.setAttribute("data-revealed", "");
          observer.unobserve(el);
        });
      },
      // Start a little before the element reaches the viewport bottom.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const watch = () => root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((el) => observer.observe(el));
    // New page content mounts after the route changes, so wait a frame before collecting elements.
    let frame = requestAnimationFrame(watch);
    // Content that arrives later (e.g. products loaded from the API) is picked up too, once per frame.
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(watch);
    });
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      // Re-added straight away by the next run; if motion was just turned off, everything shows.
      root.classList.remove("reveal-ready");
    };
  }, [rootRef, disabled, pathname]);
};
