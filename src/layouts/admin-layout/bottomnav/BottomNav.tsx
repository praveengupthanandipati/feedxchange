import type { CSSProperties } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../../core/auth/AuthContext";
import { bottomNavItems, isTabActive } from "./bottomNav.data";
import "./BottomNav.scss";

/** Phone-only tab bar: Dashboard, Contracts, Reports, Settings. Hidden from tablets up, where the side menu takes over. */
const BottomNav = () => {
  const { can } = useAuth();
  const { pathname } = useLocation();

  const items = bottomNavItems.filter((item) => !item.permissions || can(...item.permissions));
  const activeIndex = items.findIndex((item) => isTabActive(item, pathname));

  // The sliding bar reads these to size itself and move under the active tab.
  const style = { "--tab-count": items.length, "--tab-index": Math.max(activeIndex, 0) } as CSSProperties;

  return (
    <nav className="bottom-nav" aria-label="Main">
      <div className="bottom-nav__bar" style={style}>
        {activeIndex >= 0 && <span className="bottom-nav__indicator" aria-hidden />}
        {items.map((item, index) => {
          const Icon = item.icon;
          const active = index === activeIndex;
          return (
            <NavLink key={item.id} to={item.path} className={`bottom-nav__item ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
              <span className="bottom-nav__icon">
                <Icon aria-hidden />
              </span>
              <span className="bottom-nav__label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
