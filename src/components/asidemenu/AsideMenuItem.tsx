import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import type { AsideNavItem } from "./aside.types";

interface AsideMenuItemProps {
  item: AsideNavItem;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onNavigate?: () => void;
}

const FLYOUT_CLOSE_DELAY = 150;

const AsideMenuItem = ({ item, collapsed, isOpen, onToggle, onNavigate }: AsideMenuItemProps) => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const closeTimer = useRef<number | undefined>(undefined);
  const itemRef = useRef<HTMLLIElement>(null);

  const hasChildren = Boolean(item.children?.length);
  const Icon = item.icon;

  const handleToggle = () => {
    if (collapsed) return; // collapsed rail relies on the hover flyout instead
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

  return (
    <li
      ref={itemRef}
      className="aside-item"
      onMouseEnter={openFlyout}
      onMouseLeave={scheduleFlyoutClose}
    >
      {hasChildren ? (
        <button
          type="button"
          className="aside-item__link"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-label={collapsed ? item.label : undefined}
          title={collapsed ? item.label : undefined}
        >
          <Icon className="aside-item__icon" aria-hidden />
          <span className="aside-item__label" aria-hidden={collapsed}>
            {item.label}
          </span>
          <FiChevronDown
            className={`aside-item__chevron ${isOpen ? "is-open" : ""}`}
            aria-hidden
          />
        </button>
      ) : (
        <NavLink
          to={item.path ?? "#"}
          className={({ isActive }) =>
            `aside-item__link ${isActive ? "is-active" : ""}`
          }
          aria-label={collapsed ? item.label : undefined}
          title={collapsed ? item.label : undefined}
          onClick={onNavigate}
        >
          <Icon className="aside-item__icon" aria-hidden />
          <span className="aside-item__label" aria-hidden={collapsed}>
            {item.label}
          </span>
        </NavLink>
      )}

      {hasChildren && (
        <ul className={`aside-item__children ${isOpen ? "is-open" : ""}`}>
          {item.children!.map((child) => (
            <li key={child.id}>
              <NavLink
                to={child.path}
                className={({ isActive }) =>
                  `aside-item__child-link ${isActive ? "is-active" : ""}`
                }
                onClick={onNavigate}
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}

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
            <ul className="aside-item__flyout-children">
              {item.children!.map((child) => (
                <li key={child.id}>
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      `aside-item__child-link ${isActive ? "is-active" : ""}`
                    }
                    onClick={onNavigate}
                  >
                    {child.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </li>
  );
};

export default AsideMenuItem;
