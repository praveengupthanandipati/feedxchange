import type { DeliveryStatus } from "../../../core/store/notificationsApi";
import "../../../shared/notifications/Notifications.scss";

const GOOD: DeliveryStatus[] = ["Submitted", "Sent", "Delivered", "Read"];
const WAIT: DeliveryStatus[] = ["Pending", "Queued", "Processing", "RetryScheduled"];
const BAD: DeliveryStatus[] = ["Failed", "Cancelled", "Suppressed"];

const LABELS: Partial<Record<DeliveryStatus, string>> = { RetryScheduled: "Retrying", Submitted: "Submitted to provider" };

/** Do not read "Submitted" as "Delivered": a provider accepting a message is not the recipient receiving it. */
const StatusPill = ({ status }: { status: DeliveryStatus }) => {
  const tone = GOOD.includes(status) ? "ok" : WAIT.includes(status) ? "wait" : BAD.includes(status) ? "bad" : "";
  return <span className={`fx-status ${tone ? `fx-status--${tone}` : ""}`}>{LABELS[status] ?? status}</span>;
};

export default StatusPill;
