export type NotificationCategory = "contracts" | "dispatch" | "payments" | "prices" | "system";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  /** ISO timestamp */
  createdAt: string;
  read: boolean;
  /** Page the notification opens. */
  link?: string;
}

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  contracts: "Contracts",
  dispatch: "Dispatch",
  payments: "Payments",
  prices: "Price Alerts",
  system: "System",
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const HOUR = 60;
const DAY = 24 * HOUR;

// TODO: replace with the notifications API once it is available.
export const initialNotifications: AppNotification[] = [
  { id: "n1", category: "contracts", title: "New contract CON-2026-011 created", message: "Sai Feeds Pvt Ltd → Srinidhi Feeds Pvt Ltd for 200 MT Soya DOC.", createdAt: minutesAgo(2), read: false, link: "/contracts" },
  { id: "n2", category: "dispatch", title: "Truck TS25U1234 dispatched", message: "CON-2026-001 left Adilabad with 20 MT. Expected at Gunnampalli by tomorrow.", createdAt: minutesAgo(18), read: false, link: "/truck-management/seller-dispatches-new" },
  { id: "n3", category: "payments", title: "Payment of ₹6,72,000 received", message: "Srinidhi Feeds Pvt Ltd paid invoice INV-2026-001 in full.", createdAt: minutesAgo(45), read: false, link: "/payments/payment-advice" },
  { id: "n4", category: "dispatch", title: "DO pending for truck AP09KL0909", message: "Chatrai - Lakshmi Poultry is waiting for a delivery order on contract 2026-16.", createdAt: minutesAgo(2 * HOUR), read: false, link: "/truck-management/pending-delivery-orders" },
  { id: "n5", category: "prices", title: "Soya DOC price up 3.2%", message: "Today's average rate is ₹3,300/MT across 12 trades.", createdAt: minutesAgo(4 * HOUR), read: true, link: "/products/price-tracking" },
  { id: "n6", category: "payments", title: "Invoice INV-2026-004 generated", message: "FairSquare Trading invoiced ITC Agro ₹77,000 for 22 MT Corn Gluten.", createdAt: minutesAgo(6 * HOUR), read: true, link: "/payments/seller-invoice" },
  { id: "n7", category: "dispatch", title: "Freight approval needed", message: "Jawahar Transporters quoted ₹2,000/MT for CON-2026-005.", createdAt: minutesAgo(DAY + 3 * HOUR), read: false, link: "/truck-management/seller-dispatches-new" },
  { id: "n8", category: "contracts", title: "Contract CON-2026-007 nearing end date", message: "Delivery schedule ends in 2 days with 40 MT still pending.", createdAt: minutesAgo(DAY + 6 * HOUR), read: true, link: "/contracts" },
  { id: "n9", category: "system", title: "New business profile awaiting approval", message: "Royal Feeds submitted KYC documents for review.", createdAt: minutesAgo(DAY + 9 * HOUR), read: true },
  { id: "n10", category: "prices", title: "Maize price down 1.8%", message: "Average rate dropped to ₹2,100/MT after a large Ex-Loading trade.", createdAt: minutesAgo(2 * DAY), read: true, link: "/products/price-tracking" },
  { id: "n11", category: "dispatch", title: "Truck KA05G3311 reached destination", message: "Green Valley Dairy delivery for CON-2026-004 marked as received.", createdAt: minutesAgo(3 * DAY), read: true, link: "/truck-management/seller-dispatches-new" },
  { id: "n12", category: "payments", title: "Payment overdue: INV-2026-002", message: "KK Proteins Pvt Ltd is 5 days past the due date for ₹37,800.", createdAt: minutesAgo(4 * DAY), read: false, link: "/payments/payment-advice" },
  { id: "n13", category: "contracts", title: "Contract CON-2026-003 updated", message: "Quantity changed from 20 MT to 25 MT by the buyer.", createdAt: minutesAgo(5 * DAY), read: true, link: "/contracts" },
  { id: "n14", category: "system", title: "Scheduled maintenance", message: "FeedXchange will be unavailable on Sunday 02:00–03:00 AM IST.", createdAt: minutesAgo(6 * DAY), read: true },
];
