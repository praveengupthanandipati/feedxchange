import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiMail,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiTrendingUp,
  FiTruck,
} from "react-icons/fi";
import {
  CATEGORY_LABELS,
  initialNotifications,
  type AppNotification,
  type NotificationCategory,
} from "./notifications.data";
import "./Notifications.scss";

const PAGE_SIZE = 8;

type Filter = "all" | "unread" | NotificationCategory;

const CATEGORY_ICONS: Record<NotificationCategory, IconType> = {
  contracts: FiFileText,
  dispatch: FiTruck,
  payments: FiDollarSign,
  prices: FiTrendingUp,
  system: FiSettings,
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  ...(Object.keys(CATEGORY_LABELS) as NotificationCategory[]).map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  })),
];

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(iso).toLocaleDateString("en-GB");
}

function groupOf(iso: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const time = new Date(iso).getTime();
  if (time >= startOfToday.getTime()) return "Today";
  if (time >= startOfToday.getTime() - 24 * 60 * 60 * 1000) return "Yesterday";
  return "Earlier";
}

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>(initialNotifications);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const unreadCount = items.filter((item) => !item.read).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (filter === "unread" && item.read) return false;
        if (filter !== "all" && filter !== "unread" && item.category !== filter) return false;
        if (q && !`${item.title} ${item.message}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, filter, search]);

  const visible = filtered.slice(0, visibleCount);

  // Consecutive items share a group heading (the list is sorted newest first).
  const groups = visible.reduce<{ label: string; items: AppNotification[] }[]>((acc, item) => {
    const label = groupOf(item.createdAt);
    const last = acc[acc.length - 1];
    if (last?.label === label) last.items.push(item);
    else acc.push({ label, items: [item] });
    return acc;
  }, []);

  const setRead = (id: string, read: boolean) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read } : item)));

  const remove = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const markAllRead = () => setItems((prev) => prev.map((item) => ({ ...item, read: true })));

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
  };

  const openNotification = (item: AppNotification) => {
    setRead(item.id, true);
    if (item.link) navigate(item.link);
  };

  return (
    <div className="notifications">
      <div className="notifications__header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}</p>
        </div>
        <button
          type="button"
          className="notifications__btn"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <FiCheckCircle aria-hidden /> Mark all as read
        </button>
      </div>

      <div className="notifications__toolbar">
        <div className="notifications__tabs" role="tablist" aria-label="Filter notifications">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={`notifications__tab ${filter === value ? "is-active" : ""}`}
              onClick={() => changeFilter(value)}
            >
              {label}
              {value === "unread" && unreadCount > 0 && <span className="notifications__count">{unreadCount}</span>}
            </button>
          ))}
        </div>
        <div className="notifications__search">
          <FiSearch aria-hidden />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search notifications..."
            aria-label="Search notifications"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="notifications__empty" role="status">
          <FiBell aria-hidden />
          <h2>No notifications</h2>
          <p>{search || filter !== "all" ? "Nothing matches the current filter." : "New activity will show up here."}</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="notifications__group" aria-label={group.label}>
            <h2 className="notifications__group-title">{group.label}</h2>
            <ul className="notifications__list">
              {group.items.map((item) => {
                const Icon = CATEGORY_ICONS[item.category];
                return (
                  <li key={item.id} className={`notification ${item.read ? "" : "is-unread"}`}>
                    <span className={`notification__icon notification__icon--${item.category}`}>
                      <Icon aria-hidden />
                    </span>

                    <button type="button" className="notification__body" onClick={() => openNotification(item)}>
                      <span className="notification__title">
                        {!item.read && <span className="notification__dot" aria-label="Unread" />}
                        {item.title}
                      </span>
                      <span className="notification__message">{item.message}</span>
                      <span className="notification__meta">
                        <span className={`notification__tag notification__tag--${item.category}`}>
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
                      </span>
                    </button>

                    <div className="notification__actions">
                      <button
                        type="button"
                        onClick={() => setRead(item.id, !item.read)}
                        aria-label={item.read ? "Mark as unread" : "Mark as read"}
                        title={item.read ? "Mark as unread" : "Mark as read"}
                      >
                        {item.read ? <FiMail aria-hidden /> : <FiCheck aria-hidden />}
                      </button>
                      <button
                        type="button"
                        className="notification__delete"
                        onClick={() => remove(item.id)}
                        aria-label="Delete notification"
                        title="Delete"
                      >
                        <FiTrash2 aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      {filtered.length > visibleCount && (
        <button
          type="button"
          className="notifications__more"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          Load more ({filtered.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
};

export default Notifications;
