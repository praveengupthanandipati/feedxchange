import { useHomeLive } from "./homeLive";

const when = (time: number) =>
  new Date(time).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });

/** The latest contracts and invoices of the chosen period, newest first. */
const RecentActivity = () => {
  const live = useHomeLive();
  const items = live?.activity ?? null;
  const status = !live || !items ? (live?.invoicesFailed ? "Not available." : "Loading…") : items.length === 0 ? "Nothing in this period." : "";

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Recent Activity</h2>
        <span className="dashboard-card__sort">
          <strong>{live?.periodLabel}</strong>
        </span>
      </div>

      {status ? (
        <p className="dashboard-card__empty">{status}</p>
      ) : (
        <ul className="dashboard-activity">
          {items?.map((item) => (
            <li key={item.key} className="dashboard-activity__item">
              <span className="dashboard-activity__dot" aria-hidden />
              <div>
                <p className="dashboard-activity__time">{when(item.time)}</p>
                <p className="dashboard-activity__text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
