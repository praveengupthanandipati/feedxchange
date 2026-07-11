import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiMaximize,
  FiMinimize2,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import { notifications } from "./header.data";
import "./Header.scss";

interface HeaderProps {
  title?: string;
  onToggleMobileNav?: () => void;
}

const USER_NAME = "Admin User";
const USER_INITIALS = "AU";

type OpenMenu = "notifications" | "user" | null;

const Header = ({ title = "Dashboard", onToggleMobileNav }: HeaderProps) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current?.contains(target)) return;
      if (userMenuRef.current?.contains(target)) return;
      setOpenMenu(null);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenu]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  };

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const handleLogout = () => {
    setOpenMenu(null);
    navigate("/login");
  };

  return (
    <header className="header">
      <button
        type="button"
        className="header__menu-btn"
        onClick={onToggleMobileNav}
        aria-label="Open navigation menu"
      >
        <FiMenu aria-hidden />
      </button>

      <h1 className="header__title">{title}</h1>

      <div className="header__actions">
        <div className="header__notifications" ref={notificationsRef}>
          <button
            type="button"
            className="header__icon-btn"
            onClick={() => toggleMenu("notifications")}
            aria-label="Notifications"
            aria-expanded={openMenu === "notifications"}
            aria-haspopup="true"
          >
            <FiBell aria-hidden />
            {unreadCount > 0 && (
              <span className="header__badge">{unreadCount}</span>
            )}
          </button>

          {openMenu === "notifications" && (
            <div className="header__dropdown header__dropdown--notifications">
              <p className="header__dropdown-heading">Notifications</p>
              <ul className="header__notification-list">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.id}
                      className={`header__notification ${item.read ? "" : "is-unread"}`}
                    >
                      <span className="header__notification-icon">
                        <Icon aria-hidden />
                      </span>
                      <span className="header__notification-body">
                        <span className="header__notification-title">
                          {item.title}
                        </span>
                        <span className="header__notification-time">
                          {item.time}
                        </span>
                      </span>
                      {!item.read && <span className="header__notification-dot" />}
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="header__notifications-more">
                View More Notifications
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="header__icon-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Minimize" : "Maximize"}
        >
          {isFullscreen ? <FiMinimize2 aria-hidden /> : <FiMaximize aria-hidden />}
        </button>

        <div className="header__user" ref={userMenuRef}>
          <button
            type="button"
            className="header__user-trigger"
            onClick={() => toggleMenu("user")}
            aria-expanded={openMenu === "user"}
            aria-haspopup="true"
          >
            <span className="header__avatar">{USER_INITIALS}</span>
            <FiChevronDown
              className={`header__chevron ${openMenu === "user" ? "is-open" : ""}`}
              aria-hidden
            />
          </button>

          {openMenu === "user" && (
            <ul className="header__dropdown">
              <li className="header__dropdown-heading">{USER_NAME}</li>
              <li>
                <button type="button" className="header__dropdown-item">
                  <FiUser aria-hidden />
                  <span>Profile</span>
                </button>
              </li>
              <li>
                <button type="button" className="header__dropdown-item">
                  <FiSettings aria-hidden />
                  <span>Settings</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="header__dropdown-item header__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <FiLogOut aria-hidden />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
