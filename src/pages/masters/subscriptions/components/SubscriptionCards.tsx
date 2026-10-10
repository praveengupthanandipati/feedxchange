import SubscriptionStatusBadge from "./SubscriptionStatusBadge";
import type { SubscriptionListProps } from "./SubscriptionsTable";

/** Phones: one card per subscriber instead of the table. */
const SubscriptionCards = ({ rows, emptyMessage }: SubscriptionListProps) => (
  <ul className="subscriptions__cards">
    {rows.length === 0 && <li className="subscriptions__cards-empty">{emptyMessage}</li>}
    {rows.map((row) => (
      <li key={row.id} className="subscriptions__card">
        <span className="subscriptions__email">{row.email}</span>
        <div className="subscriptions__card-meta">
          <SubscriptionStatusBadge status={row.status} />
          <span>
            Subscribed on <time dateTime={row.subscribedOn}>{row.subscribedOn}</time>
          </span>
        </div>
      </li>
    ))}
  </ul>
);

export default SubscriptionCards;
