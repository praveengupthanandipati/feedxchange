import type { SubscriptionStatus } from "../subscriptions.data";

const SubscriptionStatusBadge = ({ status }: { status: SubscriptionStatus }) => (
  <span className={`subscriptions__status subscriptions__status--${status.toLowerCase()}`}>{status}</span>
);

export default SubscriptionStatusBadge;
