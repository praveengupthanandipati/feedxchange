import type { PendingContractApiResponse } from "../../../../core/store/contractsApi";

/** Which side of the contracts the first business owner is on; the second business owner is always the other side. */
export type PartyRole = "Seller" | "Buyer";

export const otherRole = (role: PartyRole): PartyRole => (role === "Seller" ? "Buyer" : "Seller");

// ---------------------------------------------------------------- date filter

export type DatePreset = "today" | "yesterday" | "thisMonth" | "lastMonth" | "thisYear" | "lastYear" | "custom";

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
  { value: "custom", label: "Custom" },
];

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export interface DateRange {
  /** yyyy-MM-dd */
  from?: string;
  to?: string;
  label: string;
}

const pretty = (iso?: string) => (iso ? iso.split("-").reverse().join("-") : "…");

/** The dates of a preset. A year is the financial year (April to March), like everywhere else in the application. */
export function rangeFor(preset: DatePreset, customFrom: string, customTo: string): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = (offset: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  switch (preset) {
    case "today":
      return { from: ymd(today), to: ymd(today), label: `Today (${pretty(ymd(today))})` };
    case "yesterday":
      return { from: ymd(day(-1)), to: ymd(day(-1)), label: `Yesterday (${pretty(ymd(day(-1)))})` };
    case "thisMonth": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: ymd(from), to: ymd(to), label: `This month (${pretty(ymd(from))} to ${pretty(ymd(to))})` };
    }
    case "lastMonth": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: ymd(from), to: ymd(to), label: `Last month (${pretty(ymd(from))} to ${pretty(ymd(to))})` };
    }
    case "thisYear": {
      const from = new Date(fyStartYear, 3, 1);
      const to = new Date(fyStartYear + 1, 2, 31);
      return { from: ymd(from), to: ymd(to), label: `This year, FY ${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, "0")}` };
    }
    case "lastYear": {
      const from = new Date(fyStartYear - 1, 3, 1);
      const to = new Date(fyStartYear, 2, 31);
      return { from: ymd(from), to: ymd(to), label: `Last year, FY ${fyStartYear - 1}-${String(fyStartYear % 100).padStart(2, "0")}` };
    }
    default:
      return { from: customFrom || undefined, to: customTo || undefined, label: `${pretty(customFrom || undefined)} to ${pretty(customTo || undefined)}` };
  }
}

// ---------------------------------------------------------------- the reports

export type ReportId =
  | "all-contracts"
  | "profile-overview"
  | "pending-contracts"
  | "payments-pending"
  | "due-payments"
  | "unallocated-advices"
  | "avg-payment-days"
  | "payment-advices"
  | "profile-info"
  | "contact-info";

export interface ReportDef {
  id: ReportId;
  label: string;
  hint: string;
}

export interface ReportGroup {
  id: string;
  label: string;
  /** What the group heading opens: the whole group at a glance. */
  overview: ReportDef;
  reports: ReportDef[];
}

export const REPORT_GROUPS: ReportGroup[] = [
  {
    id: "contracts",
    label: "Contracts",
    overview: { id: "all-contracts", label: "All Contracts", hint: "Every contract of the chosen business owners in the period, whatever its status" },
    reports: [
      { id: "pending-contracts", label: "Pending Contracts", hint: "Contracts still waiting for approval or delivery" },
      { id: "payments-pending", label: "Payments Pending", hint: "Invoices with money still to be paid" },
      { id: "due-payments", label: "Due Payments", hint: "Every unpaid invoice of the chosen business owners, whatever the date filter (over due ones first)" },
      { id: "unallocated-advices", label: "Un-allocated Payments", hint: "Money received but not yet adjusted to invoices" },
      { id: "avg-payment-days", label: "Average Payment Days", hint: "Per business: how many days payments really took, against the committed days" },
      { id: "payment-advices", label: "Payment Advices", hint: "Every payment received, and where it went" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    overview: { id: "profile-overview", label: "Profile", hint: "Business details and contact people of the seller and the buyer" },
    reports: [
      { id: "profile-info", label: "Profile Info", hint: "Business details of the seller and the buyer" },
      { id: "contact-info", label: "Contact Info", hint: "The people to contact at the seller and the buyer" },
    ],
  },
];

/** What every report receives: who and when. */
export interface AccountContext {
  sellerId?: number;
  buyerId?: number;
  /** The business owners as picked (A is `aRole`, B the other side). */
  aId?: number;
  bId?: number;
  aRole: PartyRole;
  aLabel: string;
  bLabel: string;
  range: DateRange;
}

// ---------------------------------------------------------------- formatting and contract helpers

export const money = (value: number | null | undefined) =>
  `₹${(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const shortDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : iso;
};

export const dayOf = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "");

/** Inside the date filter (a day without a limit is open on that side). */
export const inRange = (iso: string | null | undefined, range: DateRange) => {
  const day = dayOf(iso);
  if (!day) return false;
  return (!range.from || day >= range.from) && (!range.to || day <= range.to);
};

/** Contracts of the chosen seller / buyer, made inside the date filter. */
export const contractsFor = (rows: PendingContractApiResponse[], ctx: AccountContext) =>
  rows.filter(
    (row) =>
      (ctx.sellerId === undefined || row.sellerId === ctx.sellerId) &&
      (ctx.buyerId === undefined || row.buyerId === ctx.buyerId) &&
      inRange(row.contractDate, ctx.range),
  );

export const PENDING_STATUSES = ["Pending for Approval", "Open", "Partially Dispatched"];

export const daysBetween = (fromIso: string, toIso: string) =>
  Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000);

export const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
