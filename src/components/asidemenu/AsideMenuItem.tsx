import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import type { AsideNavChild, AsideNavItem } from "./aside.types";

interface AsideMenuItemProps {
  item: AsideNavItem;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onNavigate?: () => void;
}

const FLYOUT_CLOSE_DELAY = 150;

// null = no manual override, follow the automatic (route-driven) expand rules.
type ManualState = "open" | "closed" | null;

const AsideMenuItem = ({ item, collapsed, isOpen, onToggle, onNavigate }: AsideMenuItemProps) => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const [manualState, setManualState] = useState<ManualState>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const itemRef = useRef<HTMLLIElement>(null);
  const location = useLocation();

  const hasChildren = Boolean(item.children?.length);
  const hasPath = Boolean(item.path);
  const Icon = item.icon;

  const isChildActive = (child: AsideNavChild) => location.pathname === child.path;

  const isSectionActive =
    (hasPath && location.pathname === item.path) || Boolean(item.children?.some(isChildActive));

  const autoExpanded = isOpen || isSectionActive;
  const expanded = manualState !== null ? manualState === "open" : autoExpanded;

  // A route change means the user navigated somewhere new — drop any manual
  // open/close override so the section goes back to following the active route.
  useEffect(() => {
    setManualState(null);
  }, [location.pathname]);

  const handleToggle = () => {
    if (collapsed) return; // collapsed rail relies on the hover flyout instead
    setManualState(expanded ? "closed" : "open");
    onToggle(item.id);
  };

  const handleCollapse = () => {
    if (collapsed || !hasChildren) return;
    setManualState("closed");
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
            {child.label}
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
            <FiChevronDown className={`aside-item__chevron ${expanded ? "is-open" : ""}`} aria-hidden />
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
            <FiChevronDown className={`aside-item__chevron ${expanded ? "is-open" : ""}`} aria-hidden />
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
