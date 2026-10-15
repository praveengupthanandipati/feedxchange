import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetInboxQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from "../../store/notificationsApi";
import type { InboxItem } from "../../store/notificationsApi";
import { formatApiDateTime } from "../../utils/apiDateTime";
import "../../notifications/Notifications.scss";

const STEP = 30;

/** The signed-in user's own notifications, newest first. Everyone can open this; it only ever shows their own. */
const NotificationInbox = () => {
  const navigate = useNavigate();
  const [size, setSize] = useState(STEP);
  const { data, isFetching } = useGetInboxQuery({ pageSize: size });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll] = useMarkAllNotificationsReadMutation();

  const open = (item: InboxItem) => {
    if (!item.isRead) void markRead(item.inboxId);
    if (item.deepLink) navigate(item.deepLink);
  };

  return (
    <div className="container py-3" style={{ maxWidth: "48rem" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Notifications{data && data.unreadCount > 0 ? ` (${data.unreadCount} unread)` : ""}</h1>
        <button type="button" className="btn btn-outline-secondary btn-sm" disabled={!data || data.unreadCount === 0} onClick={() => void markAll()}>
          Mark all read
        </button>
      </div>

      {!data && isFetching && <p className="text-secondary">Loading…</p>}
      {data && data.items.length === 0 && <p className="text-secondary">You have no notifications.</p>}

      <div className="list-group">
        {data?.items.map((item) => (
          <button key={item.inboxId} type="button" className={`list-group-item list-group-item-action text-start ${item.isRead ? "" : "fw-semibold"}`} onClick={() => open(item)}>
            <div className="d-flex justify-content-between gap-2">
              <span>{item.title}</span>
              <span className="small text-secondary text-nowrap fw-normal">{formatApiDateTime(item.createdAt)}</span>
            </div>
            <div className="small text-secondary fw-normal" style={{ whiteSpace: "pre-wrap" }}>{item.body}</div>
          </button>
        ))}
      </div>

      {data?.nextCursor != null && (
        <div className="text-center mt-3">
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={isFetching} onClick={() => setSize(size + STEP)}>
            {isFetching ? "Loading…" : "Show older"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationInbox;
