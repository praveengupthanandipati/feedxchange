import { BellIcon, ChevronRightIcon, LogOutIcon } from "../../../shared/components/icon";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/AuthContext";
import ThemePicker from "../../../shared/theme/ThemePicker";
import { PageHeader } from "../../../shared/components/ui";
import "./Settings.scss";

/** Account screen behind the phone tab bar's Settings tab. */
const Settings = () => {
  const { displayName, roleName, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (displayName || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="settings">
      <PageHeader title="Settings" />

      <section className="settings__profile" aria-label="Account">
        <span className="settings__avatar" aria-hidden>
          {initials}
        </span>
        <div>
          <strong>{displayName || "Signed in"}</strong>
          {roleName && <small>{roleName}</small>}
        </div>
      </section>

      <section className="settings__section" aria-label="Appearance">
        <ThemePicker variant="list" />
      </section>

      <ul className="settings__list">
        <li>
          <Link to="/admin/notifications" className="settings__row">
            <BellIcon aria-hidden />
            <span>Notifications</span>
            <ChevronRightIcon aria-hidden className="settings__chevron" />
          </Link>
        </li>
        <li>
          <button
            type="button"
            className="settings__row settings__row--danger"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            <LogOutIcon aria-hidden />
            <span>Log out</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Settings;
