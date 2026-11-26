import type { ContractStage } from "../../../core/store/businessDashboardApi";
import type { BadgeTone } from "../../../shared/components/ui";

export { formatMT, formatRupees } from "../contracts/dashboard/contractsDashboard.utils";

// ---------------------------------------------------------------- periods

export type PeriodKey = "thisMonth" | "lastMonth" | "last3Months" | "thisFY" | "lastFY" | "all" | "custom";

export interface Period {
  key: PeriodKey;
  /** yyyy-MM-dd or "" (no limit) */
  from: string;
  to: string;
}

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "last3Months", label: "Last 3 months" },
  { key: "thisFY", label: "This financial year" },
  { key: "lastFY", label: "Last financial year" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom range" },
];

const pad = (value: number) => String(value).padStart(2, "0");

/** Local yyyy-MM-dd (not toISOString, which would shift the day in India). */
export const isoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** The Indian financial year (1 April - 31 March) that `date` falls in, `offset` years back or forward. */
const financialYear = (date: Date, offset = 0) => {
  const start = (date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1) + offset;
  return { from: new Date(start, 3, 1), to: new Date(start + 1, 2, 31) };
};

export const periodFor = (key: Exclude<PeriodKey, "custom">, today = new Date()): Period => {
  const y = today.getFullYear();
  const m = today.getMonth();
  switch (key) {
    case "thisMonth":
      return { key, from: isoDate(new Date(y, m, 1)), to: isoDate(today) };
    case "lastMonth":
      return { key, from: isoDate(new Date(y, m - 1, 1)), to: isoDate(new Date(y, m, 0)) };
    case "last3Months":
      return { key, from: isoDate(new Date(y, m - 2, 1)), to: isoDate(today) };
    case "thisFY": {
      const fy = financialYear(today);
      return { key, from: isoDate(fy.from), to: isoDate(today) };
    }
    case "lastFY": {
      const fy = financialYear(today, -1);
      return { key, from: isoDate(fy.from), to: isoDate(fy.to) };
    }
    case "all":
      return { key, from: "", to: "" };
  }
};

/** Short "1 Apr 2026 - 26 Nov 2026" text for the header. */
export const describePeriod = (from: string, to: string) => {
  if (!from && !to) return "All time";
  if (from && !to) return `From ${formatDate(from)}`;
  if (!from && to) return `Up to ${formatDate(to)}`;
  return `${formatDate(from)} – ${formatDate(to)}`;
};

// ---------------------------------------------------------------- formatting

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

/** Full rupees with paise where they exist, for tables (the cards use the short L / Cr form). */
export const formatAmount = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const formatQty = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const formatCount = (value: number) => value.toLocaleString("en-IN");

/** "2026-11" -> "Nov 26" */
export const monthLabel = (month: string) => {
  const [year, mon] = month.split("-").map(Number);
  return new Date(year, (mon ?? 1) - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

// ---------------------------------------------------------------- stages and statuses

export const STAGE_LABELS: Record<ContractStage, string> = {
  Executing: "Executing",
  Executed: "Executed",
  PendingApproval: "Pending approval",
  Rejected: "Rejected",
};

export const STAGE_TONES: Record<ContractStage, BadgeTone> = {
  Executing: "info",
  Executed: "success",
  PendingApproval: "warning",
  Rejected: "danger",
};

export const truckTone = (statusName: string): BadgeTone =>
  statusName === "Loaded" ? "success" : statusName === "Cancelled" ? "danger" : "info";

/** Chart colours from the theme tokens, so the charts follow Light, Dark and High contrast. */
export const STATUS_COLOURS: Record<string, string> = {
  Pending: "var(--fx-chart-3)",
  Open: "var(--fx-chart-1)",
  PartiallyDispatched: "var(--fx-chart-4)",
  Dispatched: "var(--fx-chart-2)",
  Closed: "var(--fx-slate-50)",
  Rejected: "var(--fx-chart-5)",
};
