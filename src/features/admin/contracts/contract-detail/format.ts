/** Display helpers for the contract detail page. Everything tolerates null / undefined / unparsable input and shows "—". */

export const DASH = "—";

export const isBlank = (value: unknown) => value === null || value === undefined || value === "";

export const text = (value: unknown): string => (isBlank(value) ? DASH : String(value));

const inr = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

export const money = (value: number | null | undefined, symbol: string | null | undefined = "₹"): string =>
  value === null || value === undefined || Number.isNaN(value) ? DASH : `${symbol || "₹"}${inr.format(value)}`;

export const num = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? DASH : plain.format(value);

export const qty = (value: number | null | undefined, unit = "MT"): string =>
  value === null || value === undefined || Number.isNaN(value) ? DASH : `${plain.format(value)} ${unit}`;

export const percent = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? DASH : `${plain.format(value)}%`;

const toDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const date = (value: string | null | undefined): string => {
  const parsed = toDate(value);
  return parsed ? parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : DASH;
};

export const dateTime = (value: string | null | undefined): string => {
  const parsed = toDate(value);
  return parsed
    ? parsed.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : DASH;
};

export const travelTime = (days: number | null | undefined, hours: number | null | undefined): string => {
  if (isBlank(days) && isBlank(hours)) return "Not specified";
  return `${days ?? 0} day${(days ?? 0) === 1 ? "" : "s"} ${hours ?? 0} hr${(hours ?? 0) === 1 ? "" : "s"}`;
};

/** "ready-loading" / "forward_contract" -> "Ready Loading" / "Forward Contract". */
export const humanize = (value: string | null | undefined): string => {
  if (isBlank(value)) return DASH;
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/** Colour for a status label (contract, dispatch, invoice, receipt, response ...). */
export const statusTone = (status: string | null | undefined): Tone => {
  const key = (status ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (!key) return "neutral";
  if (/^(open|active|paid|completed|loaded|accepted|approved|delivered|assigned|dispatched|received)$/.test(key)) {
    return key === "assigned" ? "info" : "success";
  }
  if (/pending|partial|awaiting|negotiat|inprogress|processing/.test(key)) return "warning";
  if (/reject|cancel|delet|fail|reversed|expired|declin|overdue/.test(key)) return "danger";
  if (/closed/.test(key)) return "neutral";
  return "info";
};

/** Share of `part` in `whole`, clamped to 0-100 (for progress bars). */
export const share = (part: number, whole: number): number =>
  whole > 0 ? Math.max(0, Math.min(100, (part / whole) * 100)) : 0;
