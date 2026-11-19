import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, LogOutIcon, XIcon } from "../../../shared/components/icon";
import logo from "../../../shared/assets/img/logo.png";
import favIcon from "../../../shared/assets/img/fav.png";
import { asideNavSections } from "./aside.data";
import { filterNavSections, withLocalChildren, withLocalSections } from "./filterNav";
import { toNavSections } from "../../../core/auth/menu";
import { isShownProfileStep } from "../../../features/admin/usermanagement/profileSettingsVisibility";
import { useAuth } from "../../../core/auth/AuthContext";
import AsideMenuItem from "./AsideMenuItem";
import { useSelectedContract } from "../../../core/context/SelectedContractContext";
import "./aside.scss";

// The Contract Dispatch Management children all act on one specific contract.
// Once a contract has been picked they carry it along automatically; before that
// they still open, and each screen asks for a contract itself.
// (the built-in menu calls it "contract-dispatch-management", the Pages table "pending-contracts")
const CONTRACT_SCOPED_ITEM_IDS = ["contract-dispatch-management", "pending-contracts"];

const SCROLL_INDICATOR_TIMEOUT = 800;
/** Pause before a hovered module heading opens its module (ms). */
const HOVER_OPEN_DELAY = 150;

/** The FeedXchange module (backend key FEEDXCHANGE, built-in menu id "your-company") is never collapsed. */
const isAlwaysOpenSection = (section: { id: string; title?: string }) =>
  ["feedxchange", "your-company"].includes(section.id.toLowerCase()) || /^feedxchange$/i.test(section.title?.trim() ?? "");

interface AsideProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Aside = ({ mobileOpen = false, onCloseMobile }: AsideProps) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const scrollTimer = useRef<number | undefined>(undefined);
  const { selectedContract } = useSelectedContract();
  const { can, logout, menu } = useAuth();

  // the phone drawer closes with Escape, like every other dialog
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseMobile?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

  const navSections = useMemo(
    () =>
      withLocalSections(menu ? withLocalChildren(toNavSections(menu), can) : filterNavSections(asideNavSections, can)).map((section) => ({
        ...section,
        items: section.items.map((item) => {
          // Profile Settings is hidden for now (profileSettingsVisibility.ts), whichever menu it came from.
          if (item.children?.some((child) => !isShownProfileStep(child))) item = { ...item, children: item.children.filter(isShownProfileStep) };
          if (!CONTRACT_SCOPED_ITEM_IDS.includes(item.id) || !selectedContract) return item;

          return {
            ...item,
            children: item.children?.map((child) => ({
              ...child,
              path: `${child.path}?contract=${encodeURIComponent(selectedContract)}`,
            })),
          };
        }),
      })),
    [selectedContract, can, menu],
  );

  const handleItemToggle = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  // Module headings are collapsible. The current screen's module is open and never collapses on hover. Pointing at
  // another module previews it (closes again when the pointer leaves, if nothing was opened); clicking / tapping a
  // heading switches to that module; opening a screen makes its module the open one.
  const location = useLocation();
  /** A module the user switched to by clicking its heading (null = the current screen's module). */
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const activeSectionId = useMemo(() => {
    const inside = (path?: string) => {
      const base = path?.split("?")[0];
      return Boolean(base) && (location.pathname === base || location.pathname.startsWith(`${base}/`));
    };
    return navSections.find((section) =>
      section.items.some((item) => inside(item.path) || item.children?.some((child) => inside(child.path) || child.relatedPaths?.some(inside))),
    )?.id;
  }, [navSections, location.pathname]);
  // Opening a screen: its module is the open one again.
  useEffect(() => {
    setOpenSectionId(null);
  }, [activeSectionId]);
  /** The one open module: the one switched to by a click, else the current screen's module. */
  const shownSectionId = openSectionId ?? activeSectionId ?? null;
  const toggleSection = (id: string) => {
    window.clearTimeout(hoverTimer.current);
    // Clicking the open module's heading closes it, except the current screen's module, which stays open.
    if (id === shownSectionId) {
      if (id !== activeSectionId) setOpenSectionId(null);
      return;
    }
    setOpenSectionId(id === activeSectionId ? null : id);
  };
  // Hover preview: pointing at another module (after a short pause, so passing over headings does not open them) shows
  // its sub-modules; moving the pointer away from it closes it again unless a screen in it was opened. The current
  // screen's module stays open throughout.
  const [hoverSectionId, setHoverSectionId] = useState<string | null>(null);
  const enterSection = (id: string) => {
    window.clearTimeout(hoverTimer.current);
    if (collapsed || id === shownSectionId) return;
    hoverTimer.current = window.setTimeout(() => setHoverSectionId(id), HOVER_OPEN_DELAY);
  };
  const leaveSection = (id: string) => {
    window.clearTimeout(hoverTimer.current);
    setHoverSectionId((prev) => (prev === id ? null : prev));
  };
  // Opening a screen ends any preview.
  useEffect(() => {
    setHoverSectionId(null);
  }, [location.pathname]);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const handleNavScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(
      () => setIsScrolling(false),
      SCROLL_INDICATOR_TIMEOUT,
    );
  };

  return (
    <aside
      className={`aside ${collapsed ? "aside--collapsed" : ""} ${mobileOpen ? "aside--mobile-open" : ""}`}
      // open on a phone it is a modal drawer (focus stays inside: shared/a11y/modalFocus.ts)
      {...(mobileOpen ? { role: "dialog", "aria-modal": true, "aria-label": "Menu" } : {})}
    >
      <div className="aside__brand">
        <img
          src={collapsed ? favIcon : logo}
          alt="feedXchange"
          className={collapsed ? "aside__logo-icon" : "aside__logo"}
        />
        <button
          type="button"
          className="aside__toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <ChevronLeftIcon className={collapsed ? "is-rotated" : ""} />
        </button>
        <button
          type="button"
          className="aside__mobile-close"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <XIcon aria-hidden />
        </button>
      </div>

      <nav
        className={`aside__nav ${isScrolling ? "is-scrolling" : ""}`}
        onScroll={handleNavScroll}
      >
        {navSections.map((section) => {
          // A module heading opens / closes its sub-modules. Always open: a section without a heading, and the
          // FeedXchange module (Dashboard, Seller Buyer Report), whose heading is plain text.
          const alwaysOpen = !section.title || isAlwaysOpenSection(section);
          const sectionOpen = alwaysOpen || shownSectionId === section.id || hoverSectionId === section.id;
          return (
          <div
            key={section.id}
            className={`aside__section ${sectionOpen ? "" : "is-closed"}`}
            // the whole module (heading and its list) counts as "pointed at", so moving down into the list keeps it open
            onMouseEnter={alwaysOpen ? undefined : () => enterSection(section.id)}
            onMouseLeave={alwaysOpen ? undefined : () => leaveSection(section.id)}
          >
            {section.title && alwaysOpen && <p className="aside__section-title">{section.title}</p>}
            {section.title && !alwaysOpen && (
              <button
                type="button"
                className="aside__section-title aside__section-toggle"
                onClick={() => toggleSection(section.id)}
                aria-expanded={sectionOpen}
                aria-controls={`aside-section-${section.id}`}
              >
                {section.title}
              </button>
            )}
            <ul className="aside__list" id={`aside-section-${section.id}`}>
              {section.items.map((item) => (
                <AsideMenuItem
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  isOpen={openItemId === item.id}
                  onToggle={handleItemToggle}
                  onRouteActive={setOpenItemId}
                  onRouteLeft={(id) => setOpenItemId((prev) => (prev === id ? null : prev))}
                  onNavigate={onCloseMobile}
                />
              ))}
            </ul>
          </div>
          );
        })}
      </nav>

      <div className="aside__footer">
        <button
          type="button"
          className="aside__cta"
          title="Logout"
          onClick={() => {
            onCloseMobile?.();
            logout();
            navigate("/", { replace: true });
          }}
        >
          {!collapsed && <span>Logout</span>}
          <LogOutIcon aria-hidden />
        </button>
      </div>
    </aside>
  );
};

export default Aside;
