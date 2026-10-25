import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import { useGetInboxQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from "../../store/notificationsApi";
import type { InboxItem } from "../../store/notificationsApi";
import { formatApiDateTime } from "../../utils/apiDateTime";
import "./NotificationsCenter.scss";

const STEP = 30;

/** The signed-in user's own notifications, newest first. Everyone can open this; it only ever shows their own. */
const NotificationInbox = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [size, setSize] = useState(STEP);
  const { data, isFetching } = useGetInboxQuery({ pageSize: size });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll] = useMarkAllNotificationsReadMutation();

  const open = (item: InboxItem) => {
    if (!item.isRead) void markRead(item.inboxId);
    if (item.deepLink) navigate(item.deepLink);
  };

  const unread = data?.unreadCount ?? 0;

  const body = (
    <section className="nc-inbox" aria-label="My inbox">
      <header className="nc-inbox__head">
        <strong>{unread > 0 ? `${unread} unread` : "All caught up"}</strong>
        <button type="button" className="nc-btn" disabled={unread === 0} onClick={() => void markAll()}><FiCheckCircle aria-hidden /> Mark all read</button>
      </header>

      {!data && isFetching && <p className="nc-muted nc-pad">Loading…</p>}
      {data && data.items.length === 0 && (
        <div className="nc-empty nc-empty--flat">
          <span aria-hidden><FiBell /></span>
          <h3>No notifications yet</h3>
          <p>Messages sent to you in the app will appear here.</p>
        </div>
      )}

      <ul className="nc-inbox__list">
        {data?.items.map((item) => (
          <li key={item.inboxId}>
            <button type="button" className={`nc-inbox__item ${item.isRead ? "" : "is-unread"}`} onClick={() => open(item)}>
              <span className="nc-inbox__dot" aria-hidden />
              <span className="nc-inbox__text">
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </span>
              <time className="nc-inbox__time">{formatApiDateTime(item.createdAt)}</time>
            </button>
          </li>
        ))}
      </ul>

      {data?.nextCursor != null && (
        <div className="nc-pad nc-center">
          <button type="button" className="nc-btn" disabled={isFetching} onClick={() => setSize(size + STEP)}>{isFetching ? "Loading…" : "Show older"}</button>
        </div>
      )}
    </section>
  );

  if (embedded) return body;
  return (
    <div className="nc-page">
      <header className="nc-page__header"><h1>Notifications</h1><p>Your own notifications, newest first.</p></header>
      {body}
    </div>
  );
};

export default NotificationInbox;
