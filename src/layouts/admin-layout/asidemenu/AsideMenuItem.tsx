import { createElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDownIcon } from "../../../shared/components/icon";
import type { AsideNavChild, AsideNavItem } from "./aside.types";
import { childIconFor } from "./iconMap";

interface AsideMenuItemProps {
  item: AsideNavItem;
  collapsed: boolean;
  /** The one open submenu is kept by the menu (accordion): opening this one closes any other. */
  isOpen: boolean;
  onToggle: (id: string) => void;
  /** The current page is in this section: the menu opens it (and closes the others). */
  onRouteActive: (id: string) => void;
  onNavigate?: () => void;
}

const FLYOUT_CLOSE_DELAY = 150;

const AsideMenuItem = ({ item, collapsed, isOpen, onToggle, onRouteActive, onNavigate }: AsideMenuItemProps) => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const closeTimer = useRef<number | undefined>(undefined);
  const itemRef = useRef<HTMLLIElement>(null);
  const location = useLocation();

  const hasChildren = Boolean(item.children?.length);
  const hasPath = Boolean(item.path);
  const Icon = item.icon;

  // Deeper screens (an edit or detail page under a submenu item) still belong to the
  // section, so anything below a path counts as being inside it.
  const isInsidePath = (path: string) => {
    const base = path.split("?")[0];
    return location.pathname === base || location.pathname.startsWith(`${base}/`);
  };

  const isChildActive = (child: AsideNavChild) =>
    isInsidePath(child.path) || Boolean(child.relatedPaths?.some(isInsidePath));

  const isSectionActive =
    (hasPath && isInsidePath(item.path!)) || Boolean(item.children?.some(isChildActive));

  const expanded = isOpen;

  // Navigating into this section opens it (closing the others), unless it is meant to stay closed until clicked.
  useEffect(() => {
    if (hasChildren && isSectionActive && !item.collapsedByDefault) onRouteActive(item.id);
    // Only on navigation: a click elsewhere in the menu must not reopen this section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleToggle = () => {
    if (collapsed) return; // collapsed rail relies on the hover flyout instead
    onToggle(item.id);
  };

  const handleCollapse = () => {
    if (collapsed || !hasChildren || !expanded) return;
    onToggle(item.id);
  };

  const openFlyout = () => {
    if (!collapsed || !hasChildren) return;
    window.clearTimeout(closeTimer.current);
    const rect = itemRef.current?.getBoundingClientRect();
    if (rect) setFlyoutPos({ top: rect.top, left: rect.right + 8 });
    setFlyoutOpen(true);
  };

  const scheduleFlyoutClose = () => {
    closeTimer.current = window.setTimeout(() => setFlyoutOpen(false), FLYOUT_CLOSE_DELAY);
  };

  const childList = (className: string) => (
    <ul className={className}>
      {item.children!.map((child) => (
        <li key={child.id}>
          <NavLink
            to={child.path}
            className={`aside-item__child-link ${isChildActive(child) ? "is-active" : ""}`}
            onClick={onNavigate}
          >
            {/* An icon picked from the page's name (pages have no icon of their own). */}
            {createElement(childIconFor(child.label, child.path), { className: "aside-item__child-icon", "aria-hidden": true })}
            <span>{child.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <li
      ref={itemRef}
      className="aside-item"
      onMouseEnter={openFlyout}
      onMouseLeave={scheduleFlyoutClose}
    >
      <div className="aside-item__row">
        {hasPath ? (
          <NavLink
            to={item.path ?? "#"}
            end
            className={({ isActive }) => `aside-item__link ${isActive ? "is-active" : ""}`}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            onDoubleClick={handleCollapse}
          >
            <Icon className="aside-item__icon" aria-hidden />
            <span className="aside-item__label" aria-hidden={collapsed}>
              {item.label}
            </span>
          </NavLink>
        ) : (
          <button
            type="button"
            className="aside-item__link"
            onClick={handleToggle}
            aria-expanded={expanded}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="aside-item__icon" aria-hidden />
            <span className="aside-item__label" aria-hidden={collapsed}>
              {item.label}
            </span>
            <ChevronDownIcon className={`aside-item__chevron ${expanded ? "is-open" : ""}`} aria-hidden />
          </button>
        )}

        {hasPath && hasChildren && (
          <button
            type="button"
            className="aside-item__toggle"
            onClick={handleToggle}
            aria-expanded={expanded}
            aria-label={`Toggle ${item.label} submenu`}
          >
            <ChevronDownIcon className={`aside-item__chevron ${expanded ? "is-open" : ""}`} aria-hidden />
          </button>
        )}
      </div>

      {hasChildren && childList(`aside-item__children ${expanded ? "is-open" : ""}`)}

      {hasChildren &&
        collapsed &&
        createPortal(
          <div
            className={`aside-item__flyout ${flyoutOpen ? "is-open" : ""}`}
            style={{ top: flyoutPos.top, left: flyoutPos.left }}
            onMouseEnter={openFlyout}
            onMouseLeave={scheduleFlyoutClose}
          >
            <p className="aside-item__flyout-title">{item.label}</p>
            {childList("aside-item__flyout-children")}
          </div>,
          document.body,
        )}
    </li>
  );
};

export default AsideMenuItem;
