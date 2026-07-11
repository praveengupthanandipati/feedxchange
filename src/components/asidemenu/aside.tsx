import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiLogOut, FiX } from "react-icons/fi";
import logo from "../../assets/img/logo.png";
import favIcon from "../../assets/img/fav.png";
import { asideNavSections } from "./aside.data";
import AsideMenuItem from "./AsideMenuItem";
import "./aside.scss";

const SCROLL_INDICATOR_TIMEOUT = 800;

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

  useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

  const handleItemToggle = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

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
          <FiChevronLeft className={collapsed ? "is-rotated" : ""} />
        </button>
        <button
          type="button"
          className="aside__mobile-close"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <FiX aria-hidden />
        </button>
      </div>

      <nav
        className={`aside__nav ${isScrolling ? "is-scrolling" : ""}`}
        onScroll={handleNavScroll}
      >
        {asideNavSections.map((section) => (
          <div key={section.id} className="aside__section">
            {section.title && (
              <p className="aside__section-title">{section.title}</p>
            )}
            <ul className="aside__list">
              {section.items.map((item) => (
                <AsideMenuItem
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  isOpen={openItemId === item.id}
                  onToggle={handleItemToggle}
                  onNavigate={onCloseMobile}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="aside__footer">
        <button
          type="button"
          className="aside__cta"
          title="Logout"
          onClick={() => {
            onCloseMobile?.();
            navigate("/login");
          }}
        >
          {!collapsed && <span>Logout</span>}
          <FiLogOut aria-hidden />
        </button>
      </div>
    </aside>
  );
};

export default Aside;
