import type { PendingContractApiResponse } from "../../../../core/store/contractsApi";

// Everything the contracts dashboard shows, worked out from the same list the page already loads
// (GET /api/Contracts/GetAllContractsByFilters). No extra request.

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Statuses that are finished: nothing left to arrange or deliver. */
const FINISHED = new Set(["dispatched", "closed", "cancelled", "deleted"]);
const AWAITING_APPROVAL = new Set(["pending", "pendingforapproval"]);
const OPEN = new Set(["open"]);

export const statusKey = (value: string | null | undefined) => (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const isFinished = (contract: PendingContractApiResponse) => FINISHED.has(statusKey(contract.basicDetails.calculatedStatus));

const quantity = (contract: PendingContractApiResponse) => contract.basicDetails.quantity ?? 0;
const pending = (contract: PendingContractApiResponse) => contract.basicDetails.pendingQuantity ?? quantity(contract);
const arranged = (contract: PendingContractApiResponse) => contract.basicDetails.arrangedQuantity ?? 0;
const dispatched = (contract: PendingContractApiResponse) => contract.basicDetails.dispatchedQuantity ?? 0;
/** Value before GST: quantity (MT) x contract rate (rupees per MT). */
const value = (contract: PendingContractApiResponse) => quantity(contract) * (contract.basicDetails.contractRate ?? 0);
const deliveryEnd = (contract: PendingContractApiResponse) => {
  const time = contract.basicDetails.deliveryToDate ? new Date(contract.basicDetails.deliveryToDate).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
};

// ---------------------------------------------------------------- "needs attention" groups

export type AttentionKind = "overdue" | "due7" | "due30" | "noTrucks" | "approval";

export const ATTENTION: Record<AttentionKind, { label: string; hint: string }> = {
  overdue: { label: "Delivery overdue", hint: "Delivery window has ended and quantity is still pending" },
  due7: { label: "Delivery ends in 7 days", hint: "Quantity still pending, delivery window ends within a week" },
  due30: { label: "Delivery ends in 30 days", hint: "Quantity still pending, delivery window ends within a month" },
  noTrucks: { label: "Open, no trucks arranged", hint: "Open contracts with nothing arranged yet" },
  approval: { label: "Awaiting approval", hint: "Contracts pending for approval" },
};

/** Does a contract belong to an attention group, as of `now`. */
export const inAttention = (kind: AttentionKind, contract: PendingContractApiResponse, now: number): boolean => {
  const status = statusKey(contract.basicDetails.calculatedStatus);
  if (kind === "approval") return AWAITING_APPROVAL.has(status);
  if (kind === "noTrucks") return OPEN.has(status) && arranged(contract) <= 0;
  if (FINISHED.has(status) || pending(contract) <= 0) return false;
  const end = deliveryEnd(contract);
  if (end === null) return false;
  const today = new Date(now).setHours(0, 0, 0, 0);
  if (kind === "overdue") return end < today;
  const days = kind === "due7" ? 7 : 30;
  return end >= today && end < today + (days + 1) * DAY_MS;
};

// ---------------------------------------------------------------- the whole dashboard

export interface StatusSlice {
  /** As the API sends it (the status's display name), which is also what the list's status filter matches. */
  status: string;
  count: number;
  quantity: number;
}

export interface MonthBar {
  /** First day of the month (local time) */
  start: number;
  label: string;
  count: number;
  quantity: number;
}

export interface Ranked {
  name: string;
  quantity: number;
  value: number;
  count: number;
}

export interface ContractsMetrics {
  total: number;
  /** Contracts not yet dispatched or closed */
  active: number;
  quantity: number;
  value: number;
  arranged: number;
  dispatched: number;
  pending: number;
  /** Of the quantity still to dispatch (active contracts), how much already has trucks arranged */
  pendingArranged: number;
  /** Share of the contracted quantity dispatched so far, 0 to 1 */
  dispatchedShare: number;
  statuses: StatusSlice[];
  attention: Record<AttentionKind, string[]>;
  months: MonthBar[];
  topProducts: Ranked[];
  topBuyers: Ranked[];
}

const STATUS_ORDER = ["pendingforapproval", "pending", "open", "partiallydispatched", "dispatched", "closed"];

const rank = (items: PendingContractApiResponse[], name: (contract: PendingContractApiResponse) => string | null, limit: number): Ranked[] => {
  const groups = new Map<string, Ranked>();
  for (const contract of items) {
    const key = name(contract)?.trim();
    if (!key) continue;
    const group = groups.get(key) ?? { name: key, quantity: 0, value: 0, count: 0 };
    group.quantity += quantity(contract);
    group.value += value(contract);
    group.count += 1;
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name)).slice(0, limit);
};

export const buildMetrics = (all: PendingContractApiResponse[], now: number, monthCount = 12): ContractsMetrics => {
  // the list hides deleted contracts; so does the dashboard
  const contracts = all.filter((contract) => statusKey(contract.basicDetails.calculatedStatus) !== "deleted");

  const statusMap = new Map<string, StatusSlice>();
  for (const contract of contracts) {
    const status = contract.basicDetails.calculatedStatus || "Unknown";
    const slice = statusMap.get(status) ?? { status, count: 0, quantity: 0 };
    slice.count += 1;
    slice.quantity += quantity(contract);
    statusMap.set(status, slice);
  }
  const statuses = [...statusMap.values()].sort((a, b) => {
    const ia = STATUS_ORDER.indexOf(statusKey(a.status));
    const ib = STATUS_ORDER.indexOf(statusKey(b.status));
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.status.localeCompare(b.status);
  });

  const attention = Object.fromEntries(
    (Object.keys(ATTENTION) as AttentionKind[]).map((kind) => [
      kind,
      contracts.filter((contract) => inAttention(kind, contract, now)).map((contract) => contract.contractNumber),
    ]),
  ) as Record<AttentionKind, string[]>;

  const current = new Date(now);
  const months: MonthBar[] = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(current.getFullYear(), current.getMonth() - (monthCount - 1 - index), 1);
    return {
      start: date.getTime(),
      label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      count: 0,
      quantity: 0,
    };
  });
  for (const contract of contracts) {
    if (!contract.contractDate) continue;
    const date = new Date(contract.contractDate);
    const bar = months.find((month) => {
      const start = new Date(month.start);
      return date.getFullYear() === start.getFullYear() && date.getMonth() === start.getMonth();
    });
    if (bar) {
      bar.count += 1;
      bar.quantity += quantity(contract);
    }
  }

  const totalQuantity = contracts.reduce((sum, contract) => sum + quantity(contract), 0);
  const totalDispatched = contracts.reduce((sum, contract) => sum + dispatched(contract), 0);

  return {
    total: contracts.length,
    active: contracts.filter((contract) => !isFinished(contract)).length,
    quantity: totalQuantity,
    value: contracts.reduce((sum, contract) => sum + value(contract), 0),
    arranged: contracts.reduce((sum, contract) => sum + arranged(contract), 0),
    dispatched: totalDispatched,
    pending: contracts.filter((contract) => !isFinished(contract)).reduce((sum, contract) => sum + pending(contract), 0),
    // trucks arranged but not yet dispatched, capped at what is still pending, per active contract
    pendingArranged: contracts
      .filter((contract) => !isFinished(contract))
      .reduce((sum, contract) => sum + Math.min(pending(contract), Math.max(0, arranged(contract) - dispatched(contract))), 0),
    dispatchedShare: totalQuantity > 0 ? Math.min(1, totalDispatched / totalQuantity) : 0,
    statuses,
    attention,
    months,
    topProducts: rank(contracts, (contract) => contract.productName, 5),
    topBuyers: rank(contracts, (contract) => contract.buyerName, 5),
  };
};

// ---------------------------------------------------------------- formatting

export const formatMT = (value: number) => `${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })} MT`;

/** Rupees in the Indian way: 12.5 L, 3.2 Cr. */
export const formatRupees = (value: number) => {
  if (value >= 1e7) return `₹${(value / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};
