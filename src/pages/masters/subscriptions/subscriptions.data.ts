export type SubscriptionStatus = "Subscribed" | "Unsubscribed";

/** A newsletter sign-up from the website. */
export interface Subscription {
  id: string;
  email: string;
  status: SubscriptionStatus;
  /** yyyy-mm-dd */
  subscribedOn: string;
}

// TODO: replace with the subscriptions API once it is available.
export const subscriptions: Subscription[] = [
  { id: "1", email: "eliteagrofoods2024@gmail.com", status: "Subscribed", subscribedOn: "2026-04-13" },
  { id: "2", email: "mithinti.swathi@gmail.com", status: "Subscribed", subscribedOn: "2026-03-29" },
];

export const matchesEmail = (subscription: Subscription, query: string) =>
  subscription.email.toLowerCase().includes(query.trim().toLowerCase());
