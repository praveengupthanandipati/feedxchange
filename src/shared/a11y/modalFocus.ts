// Keyboard focus for every modal dialog and drawer in the app, in one place (WCAG 2.4.3 focus order, 2.1.2 no trap outside).
//
// Any element with aria-modal="true" that is on screen counts as an open modal: the confirmation dialog, the share and
// notify modals, every offcanvas drawer, the website menu. While one is open:
//   - focus moves into it (unless the dialog already focused something inside itself),
//   - Tab and Shift+Tab cycle inside the top-most one instead of escaping to the page behind,
// and when it closes, focus goes back to the control that opened it.
// Dialogs keep handling Escape and their own buttons themselves; nothing here closes anything.

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const isShown = (element: Element) => {
  if (element.closest("[inert], [hidden]")) return false;
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const box = element.getBoundingClientRect();
  // a closed drawer sits off screen
  return box.width > 0 && box.height > 0 && box.right > 0 && box.left < window.innerWidth && box.bottom > 0 && box.top < window.innerHeight;
};

const focusables = (root: Element) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) => isShown(element) && !element.closest("[aria-hidden='true']"));

const openModals = () => Array.from(document.querySelectorAll<HTMLElement>('[aria-modal="true"]')).filter(isShown);

let started = false;

export const startModalFocus = () => {
  if (started || typeof document === "undefined") return;
  started = true;

  let open: HTMLElement[] = [];
  // the last few controls focused outside any modal, newest first: the one that opened a dialog may be gone by the time it
  // closes (a menu item in a menu that closed), and then the control before it (the menu button) gets focus back
  const returnTo = new WeakMap<HTMLElement, HTMLElement[]>();
  let history: HTMLElement[] = [];

  document.addEventListener(
    "focusin",
    (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest?.('[aria-modal="true"]')) history = [target, ...history.filter((item) => item !== target)].slice(0, 5);
    },
    true,
  );

  const update = () => {
    const now = openModals();
    for (const modal of now.filter((item) => !open.includes(item))) {
      returnTo.set(modal, [...history]);
      // give the dialog a frame to focus its own field first
      requestAnimationFrame(() => {
        if (modal.contains(document.activeElement)) return;
        const first = focusables(modal)[0];
        if (first) first.focus();
        else {
          if (!modal.hasAttribute("tabindex")) modal.setAttribute("tabindex", "-1");
          modal.focus();
        }
      });
    }
    for (const modal of open.filter((item) => !now.includes(item))) {
      const back = (returnTo.get(modal) ?? []).find((item) => item.isConnected && item.getClientRects().length > 0);
      const focusWasInside = !document.activeElement || document.activeElement === document.body || modal.contains(document.activeElement);
      if (back && focusWasInside) back.focus();
    }
    open = now;
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    // after the open / close transition has started, so position and visibility are final enough to judge
    requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  };

  new MutationObserver(schedule).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-modal", "hidden", "inert", "open"],
  });
  window.addEventListener("transitionend", schedule, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || open.length === 0) return;
    const modal = open[open.length - 1];
    const items = focusables(modal);
    if (items.length === 0) {
      event.preventDefault();
      modal.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (!active || !modal.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
};
