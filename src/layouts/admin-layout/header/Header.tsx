import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  LogOutIcon,
  MaximizeIcon,
  MenuIcon,
  Minimize2Icon,
  SettingsIcon,
  UserIcon,
} from "../../../shared/components/icon";
import NotificationBell from "../../../shared/notifications/NotificationBell";
import ThemePicker from "../../../shared/theme/ThemePicker";
import { useAuth } from "../../../core/auth/AuthContext";
import "./Header.scss";

interface HeaderProps {
  title?: string;
  onToggleMobileNav?: () => void;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

type OpenMenu = "user" | null;

const Header = ({ title = "Dashboard", onToggleMobileNav }: HeaderProps) => {
  const navigate = useNavigate();
  const { displayName, roleName, logout } = useAuth();
  const USER_NAME = displayName;
  const USER_INITIALS = initialsOf(displayName);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="header">
      <button
        type="button"
        className="header__menu-btn"
        onClick={onToggleMobileNav}
        aria-label="Open navigation menu"
      >
        <MenuIcon aria-hidden />
      </button>

      <h1 className="header__title">{title}</h1>

      <div className="header__actions">
        <NotificationBell />

        <ThemePicker triggerClassName="header__icon-btn" />

        <button
          type="button"
          className="header__icon-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Minimize" : "Maximize"}
        >
          {isFullscreen ? <Minimize2Icon aria-hidden /> : <MaximizeIcon aria-hidden />}
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
            <ChevronDownIcon
              className={`header__chevron ${openMenu === "user" ? "is-open" : ""}`}
              aria-hidden
            />
          </button>

          {openMenu === "user" && (
            <ul className="header__dropdown">
              <li className="header__dropdown-heading">
                {USER_NAME}
                {roleName && <small className="d-block text-secondary fw-normal">{roleName}</small>}
              </li>
              <li>
                <button type="button" className="header__dropdown-item">
                  <UserIcon aria-hidden />
                  <span>Profile</span>
                </button>
              </li>
              <li>
                <button type="button" className="header__dropdown-item">
                  <SettingsIcon aria-hidden />
                  <span>Settings</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="header__dropdown-item header__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <LogOutIcon aria-hidden />
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
