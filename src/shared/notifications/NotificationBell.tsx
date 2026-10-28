import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "../components/icon";
import {
  useGetInboxQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../../core/store/notificationsApi";
import type { InboxItem } from "../../core/store/notificationsApi";
import { formatApiDateTime } from "../utils/apiDateTime";
import { disableDesktopNotifications, enableDesktopNotifications, getDesktopPermission, getDesktopPreference } from "./desktopNotify";
import type { DesktopPermission } from "./desktopNotify";
import { adminPath } from "../../core/routes/adminPaths";
import { useNotificationConnection } from "./NotificationProvider";
import { subscribeWebPush, unsubscribeWebPush } from "./webPush";
import "./Notifications.scss";

/** The header bell: unread count, the latest items, mark-as-read, and the opt-in for OS notifications. */
const NotificationBell = () => {
  const navigate = useNavigate();
  const { connected } = useNotificationConnection();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [permission, setPermission] = useState<DesktopPermission>("default");
  const [desktopOn, setDesktopOn] = useState(getDesktopPreference());

  // The count is re-read when the hub pushes (cache tags) and every 60s as a fallback when the live connection is down.
  const { data: unread = 0 } = useGetUnreadCountQuery(undefined, { pollingInterval: connected ? 0 : 60_000 });
  const { data: inbox } = useGetInboxQuery({ pageSize: 8 }, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!open) return;
    void getDesktopPermission().then(setPermission);
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openItem = (item: InboxItem) => {
    if (!item.isRead) void markRead(item.inboxId);
    if (item.deepLink) {
      setOpen(false);
      navigate(adminPath(item.deepLink));
    }
  };

  const toggleDesktop = async () => {
    if (desktopOn) {
      disableDesktopNotifications();
      setDesktopOn(false);
      void unsubscribeWebPush();
      return;
    }
    const result = await enableDesktopNotifications();
    setPermission(result);
    setDesktopOn(result === "granted");
    // Also register for pushes, so notifications arrive when no FeedXchange tab is open (browsers only, when the server has push set up).
    if (result === "granted") void subscribeWebPush().catch(() => undefined);
  };

  return (
    <div className="header__notifications" ref={rootRef}>
      <button
        type="button"
        className="header__icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        title={connected ? "Notifications (live)" : "Notifications"}
      >
        <BellIcon aria-hidden />
        {unread > 0 && <span className="header__badge">{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className="header__dropdown header__dropdown--notifications fx-bell">
          <p className="header__dropdown-heading">Notifications</p>
          {!inbox ? (
            <p className="px-3 py-2 text-secondary small mb-0">Loading…</p>
          ) : inbox.items.length === 0 ? (
            <p className="px-3 py-2 text-secondary small mb-0">You are all caught up.</p>
          ) : (
            <ul className="fx-bell__list">
              {inbox.items.map((item) => (
                <li key={item.inboxId}>
                  <button type="button" className={`fx-bell__item ${item.isRead ? "" : "is-unread"}`} onClick={() => openItem(item)}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="fx-bell__item-title">{item.title}</span>
                      <span className="fx-bell__item-body">{item.body}</span>
                      <span className="fx-bell__item-time">{formatApiDateTime(item.createdAt)}</span>
                    </span>
                    {!item.isRead && <span className="fx-bell__dot" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="fx-bell__footer">
            <button type="button" className="fx-bell__link" onClick={() => { setOpen(false); navigate("/admin/notifications"); }}>
              View all
            </button>
            {unread > 0 && (
              <button type="button" className="fx-bell__link" onClick={() => void markAll()}>
                Mark all read
              </button>
            )}
          </div>
          {permission !== "unsupported" && (
            <div className="fx-bell__footer border-top">
              {permission === "denied" ? (
                <span className="text-secondary">Desktop alerts are blocked in your browser settings.</span>
              ) : (
                <label className="d-flex align-items-center gap-2 mb-0">
                  <input type="checkbox" className="form-check-input mt-0" checked={desktopOn} onChange={() => void toggleDesktop()} />
                  Desktop notifications
                </label>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
