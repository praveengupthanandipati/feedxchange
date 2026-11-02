// Card set-up for the stat row; the Revenue, Invoices, Revenue growth and Customers figures are replaced with live ones
// for the chosen period (Dashboard.tsx). Social Source is still sample data: there is no source for it yet.

export interface StatCard {
  id: string;
  label: string;
  value: string;
  deltaPercent: number;
  deltaDirection: "up" | "down";
  visual: "bars" | "ring";
  color: string;
  sparkline?: number[];
  ringPercent?: number;
  /** Words after the change percentage; "since last week" when not given. */
  deltaLabel?: string;
  /** Leaves the change line out (nothing to compare with). */
  hideDelta?: boolean;
}

export const statCards: StatCard[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "₹34,152",
    deltaPercent: 2.65,
    deltaDirection: "up",
    visual: "bars",
    color: "var(--fx-indigo-67)",
    sparkline: [14, 22, 10, 18, 26, 16, 24, 30, 20, 28],
  },
  {
    id: "orders",
    label: "Orders",
    value: "5,643",
    deltaPercent: 0.82,
    deltaDirection: "down",
    visual: "ring",
    color: "var(--fx-green-45)",
    ringPercent: 68,
  },
  {
    id: "customers",
    label: "Customers",
    value: "45,254",
    deltaPercent: 6.24,
    deltaDirection: "down",
    visual: "ring",
    color: "var(--fx-indigo-67)",
    ringPercent: 42,
  },
  {
    id: "growth",
    label: "Growth",
    value: "+12.58%",
    deltaPercent: 10.51,
    deltaDirection: "up",
    visual: "bars",
    color: "var(--fx-amber-50)",
    sparkline: [10, 14, 12, 20, 16, 24, 18, 28, 22, 32],
  },
];

export const socialSource = {
  platform: "Facebook",
  sales: 125,
  description:
    "SSRTS is a social media platform focused on short-form video content shared by farm suppliers.",
};
