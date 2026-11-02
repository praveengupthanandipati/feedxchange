import type { PendingContractApiResponse } from "../../../core/store/contractsApi";
import { DAY_MS, inAttention, statusKey } from "../contracts/dashboard/contractsDashboard.utils";

// The Home dashboard, worked out in the browser from the contracts list (GET /api/Contracts/GetAllContractsByFilters).

export type PeriodKey = "fy" | "month" | "fortnight" | "yesterday" | "today";

/** In the order the toggle shows them. */
export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "fy", label: "Current FY" },
  { key: "month", label: "Month" },
  { key: "fortnight", label: "Fortnight" },
  { key: "yesterday", label: "Yesterday" },
  { key: "today", label: "Today" },
];

export interface Range {
  start: number;
  /** Exclusive. */
  end: number;
}

const startOfDay = (time: number) => new Date(time).setHours(0, 0, 0, 0);
/** Indian financial year: 1 April to 31 March. */
const fyStartYear = (date: Date) => (date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1);

/** The chosen period, and the one just before it (for the "vs previous" comparisons). */
export function periodRanges(period: PeriodKey, now: number): { current: Range; previous: Range } {
  const today = startOfDay(now);
  const date = new Date(now);
  switch (period) {
    case "today":
      return { current: { start: today, end: today + DAY_MS }, previous: { start: today - DAY_MS, end: today } };
    case "yesterday":
      return { current: { start: today - DAY_MS, end: today }, previous: { start: today - 2 * DAY_MS, end: today - DAY_MS } };
    case "fortnight":
      return {
        current: { start: today - 13 * DAY_MS, end: today + DAY_MS },
        previous: { start: today - 27 * DAY_MS, end: today - 13 * DAY_MS },
      };
    case "month": {
      const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      return {
        current: { start, end: new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime() },
        previous: { start: new Date(date.getFullYear(), date.getMonth() - 1, 1).getTime(), end: start },
      };
    }
    case "fy": {
      const year = fyStartYear(date);
      const start = new Date(year, 3, 1).getTime();
      return {
        current: { start, end: new Date(year + 1, 3, 1).getTime() },
        previous: { start: new Date(year - 1, 3, 1).getTime(), end: start },
      };
    }
  }
}

const contractTime = (contract: PendingContractApiResponse) => {
  const time = contract.contractDate ? new Date(contract.contractDate).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
};
const quantity = (contract: PendingContractApiResponse) => contract.basicDetails.quantity ?? 0;
/** Value before GST: quantity x contract rate (rupees per MT). */
const value = (contract: PendingContractApiResponse) => quantity(contract) * (contract.basicDetails.contractRate ?? 0);
const isCounted = (contract: PendingContractApiResponse) => !["deleted", "cancelled"].includes(statusKey(contract.basicDetails.calculatedStatus));

const inRange = (contracts: PendingContractApiResponse[], range: Range) =>
  contracts.filter((contract) => {
    const time = contractTime(contract);
    return time !== null && time >= range.start && time < range.end && isCounted(contract);
  });

export interface Totals {
  contracts: number;
  quantity: number;
  value: number;
  customers: number;
}

const totals = (contracts: PendingContractApiResponse[]): Totals => {
  // Each business once, whether it bought, sold or both: by its id, or by its name when the list sends no id.
  const ids = new Set<string>();
  const add = (id: number | null, name: string | null) => {
    if (id != null) ids.add(`id:${id}`);
    else if (name?.trim()) ids.add(`name:${name.trim().toLowerCase()}`);
  };
  for (const contract of contracts) {
    add(contract.buyerId, contract.buyerName);
    add(contract.sellerId, contract.sellerName);
  }
  return {
    contracts: contracts.length,
    quantity: contracts.reduce((sum, contract) => sum + quantity(contract), 0),
    value: contracts.reduce((sum, contract) => sum + value(contract), 0),
    customers: ids.size,
  };
};

export interface Commodity {
  name: string;
  quantity: number;
  value: number;
  contracts: number;
  /** Share of the period's quantity, 0-1. */
  share: number;
}

/** Quantity by product, largest first; the rest folded into "Other products". */
function commodities(contracts: PendingContractApiResponse[], limit: number): Commodity[] {
  const byProduct = new Map<string, Commodity>();
  for (const contract of contracts) {
    const name = contract.productName?.trim() || "Unnamed product";
    const entry = byProduct.get(name) ?? { name, quantity: 0, value: 0, contracts: 0, share: 0 };
    entry.quantity += quantity(contract);
    entry.value += value(contract);
    entry.contracts += 1;
    byProduct.set(name, entry);
  }
  const total = contracts.reduce((sum, contract) => sum + quantity(contract), 0) || 1;
  const sorted = [...byProduct.values()].sort((a, b) => b.quantity - a.quantity);
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit);
  if (rest.length) {
    top.push({
      name: `Other products (${rest.length})`,
      quantity: rest.reduce((s, item) => s + item.quantity, 0),
      value: rest.reduce((s, item) => s + item.value, 0),
      contracts: rest.reduce((s, item) => s + item.contracts, 0),
      share: 0,
    });
  }
  return top.map((item) => ({ ...item, share: item.quantity / total }));
}

export interface PriceMove {
  product: string;
  /** Average contract rate (rupees per MT, weighted by quantity) in the period; null without contracts. */
  current: number | null;
  previous: number | null;
  /** Change from the previous period, as a fraction (0.05 = +5%); null when either side is missing. */
  change: number | null;
}

const averageRate = (contracts: PendingContractApiResponse[]) => {
  const qty = contracts.reduce((sum, contract) => sum + quantity(contract), 0);
  return qty > 0 ? contracts.reduce((sum, contract) => sum + value(contract), 0) / qty : null;
};

/** Average contract rate of the period's top products against the period before. */
function priceMoves(current: PendingContractApiResponse[], previous: PendingContractApiResponse[], limit: number): PriceMove[] {
  return commodities(current, limit)
    .filter((item) => !item.name.startsWith("Other products"))
    .map((item) => {
      const now = averageRate(current.filter((contract) => (contract.productName?.trim() || "Unnamed product") === item.name));
      const before = averageRate(previous.filter((contract) => (contract.productName?.trim() || "Unnamed product") === item.name));
      return { product: item.name, current: now, previous: before, change: now !== null && before ? (now - before) / before : null };
    });
}

export interface HomeMetrics {
  range: Range;
  totals: Totals;
  previousTotals: Totals;
  commodities: Commodity[];
  prices: PriceMove[];
  /** Contracts of the period waiting for approval / with no trucks arranged. */
  awaitingApproval: number;
  awaitingTrucks: number;
  /** Contract quantity / value / count in ten equal slices of the period, for the cards' small bar charts. */
  quantityTrend: number[];
  valueTrend: number[];
  countTrend: number[];
}

const SLICES = 10;

/** A figure per tenth of the range (contracts by their date). */
const trend = (contracts: PendingContractApiResponse[], range: Range, figure: (contract: PendingContractApiResponse) => number) => {
  const sliceLength = (range.end - range.start) / SLICES;
  const result = Array<number>(SLICES).fill(0);
  for (const contract of contracts) {
    const time = contractTime(contract);
    if (time === null) continue;
    result[Math.min(SLICES - 1, Math.max(0, Math.floor((time - range.start) / sliceLength)))] += figure(contract);
  }
  return result;
};

export function buildHomeMetrics(all: PendingContractApiResponse[], period: PeriodKey, now: number): HomeMetrics {
  const { current, previous } = periodRanges(period, now);
  const inCurrent = inRange(all, current);
  const inPrevious = inRange(all, previous);
  return {
    range: current,
    totals: totals(inCurrent),
    previousTotals: totals(inPrevious),
    commodities: commodities(inCurrent, 5),
    prices: priceMoves(inCurrent, inPrevious, 5),
    awaitingApproval: inCurrent.filter((contract) => inAttention("approval", contract, now)).length,
    awaitingTrucks: inCurrent.filter((contract) => inAttention("noTrucks", contract, now)).length,
    quantityTrend: trend(inCurrent, current, quantity),
    valueTrend: trend(inCurrent, current, value),
    countTrend: trend(inCurrent, current, () => 1),
  };
}

/** Change from the previous period as a fraction, or null when there was nothing before. */
export const changeOf = (current: number, previous: number) => (previous > 0 ? (current - previous) / previous : null);

/** What the invoice-based cards need from an invoice. */
export interface InvoiceLike {
  invoiceDate: string;
  invoiceAmount: number;
  status: string;
}

export interface InvoiceFigures {
  /** Sum of the invoice amounts in the period. */
  revenue: number;
  revenueChange: number | null;
  /** Revenue in ten equal slices of the period, for the small bar chart. */
  revenueTrend: number[];
  /** Number of invoices in the period. */
  orders: number;
  ordersChange: number | null;
  /** Share of the invoices in the period that are fully paid, 0-1. */
  paidShare: number;
}

const TREND_SLICES = 10;

/** Revenue and orders for the period (and the change from the period before), from the seller invoices. */
export function buildInvoiceFigures(invoices: InvoiceLike[], period: PeriodKey, now: number): InvoiceFigures {
  const { current, previous } = periodRanges(period, now);
  const timeOf = (invoice: InvoiceLike) => new Date(invoice.invoiceDate).getTime();
  const notCancelled = invoices.filter((invoice) => invoice.status !== "Cancelled");
  const within = (range: Range) =>
    notCancelled.filter((invoice) => {
      const time = timeOf(invoice);
      return time >= range.start && time < range.end;
    });
  const thisPeriod = within(current);
  const lastPeriod = within(previous);
  const sum = (list: InvoiceLike[]) => list.reduce((total, invoice) => total + (invoice.invoiceAmount || 0), 0);

  const sliceLength = (current.end - current.start) / TREND_SLICES;
  const sliceOf = (invoice: InvoiceLike) => Math.min(TREND_SLICES - 1, Math.floor((timeOf(invoice) - current.start) / sliceLength));
  const revenueTrend = Array.from({ length: TREND_SLICES }, (_, index) => sum(thisPeriod.filter((invoice) => sliceOf(invoice) === index)));

  return {
    revenue: sum(thisPeriod),
    revenueChange: changeOf(sum(thisPeriod), sum(lastPeriod)),
    revenueTrend,
    orders: thisPeriod.length,
    ordersChange: changeOf(thisPeriod.length, lastPeriod.length),
    paidShare: thisPeriod.length ? thisPeriod.filter((invoice) => invoice.status === "Paid").length / thisPeriod.length : 0,
  };
}
