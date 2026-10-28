import { useState } from "react";
import { InboxIcon, SendIcon } from "../../../shared/components/icon";
import { usePermission } from "../../../core/auth/AuthContext";
import { useGetUnreadCountQuery } from "../../../core/store/notificationsApi";
import NotificationHistoryPanel from "./NotificationHistoryPanel";
import NotificationInbox from "./NotificationInbox";
import "./NotificationsCenter.scss";

type Tab = "sent" | "inbox";

/** Notifications: what was sent (found by contract, or by seller and buyer), and the signed-in user's own inbox. */
const NotificationsCenter = () => {
  const canHistory = usePermission("notifications.history");
  const [tab, setTab] = useState<Tab>(canHistory ? "sent" : "inbox");
  const { data: unread = 0 } = useGetUnreadCountQuery();
  const active: Tab = canHistory ? tab : "inbox";

  return (
    <div className="nc-page">
      <header className="nc-page__header">
        <h1>Notifications</h1>
        <p>{active === "sent" ? "See what was sent to buyers, sellers and transporters, and whether it arrived." : "Your own notifications, newest first."}</p>
      </header>

      {canHistory && (
        <div className="nc-tabs" role="tablist" aria-label="Notifications">
          <button type="button" role="tab" aria-selected={active === "sent"} className={active === "sent" ? "is-active" : ""} onClick={() => setTab("sent")}><SendIcon aria-hidden /> Sent messages</button>
          <button type="button" role="tab" aria-selected={active === "inbox"} className={active === "inbox" ? "is-active" : ""} onClick={() => setTab("inbox")}>
            <InboxIcon aria-hidden /> My inbox{unread > 0 && <span className="nc-count">{unread}</span>}
          </button>
        </div>
      )}

      {active === "sent" ? <NotificationHistoryPanel /> : <NotificationInbox embedded />}
    </div>
  );
};

export default NotificationsCenter;
