import { createContext, useContext } from "react";
import type { PendingContractApiResponse } from "../../../core/store/contractsApi";
import type { Invoice } from "../../../core/store/sellerInvoiceApi";
import { DAY_MS } from "../contracts/dashboard/contractsDashboard.utils";
import { changeOf, periodRanges, type PeriodKey, type Range } from "./homeDashboard.utils";

// The dashboard's original widgets (Sales Analytics, Top Selling Products, Top Users, Recent Activity) with live data for the
// chosen period: built from the seller invoices and the contracts the overview already loads, shared through a context.

export interface SalesBucket {
  label: string;
  /** Invoice amount per top product, keyed s0 / s1 / s2. */
  s0: number;
  s1: number;
  s2: number;
}

export interface LiveSales {
  income: number;
  invoices: number;
  /** Share of the invoices fully paid, 0-1. */
  paidShare: number;
  /** The three products with the largest invoice amount (series s0..s2). */
  products: string[];
  buckets: SalesBucket[];
}

export interface LiveTopProduct {
  name: string;
  amount: number;
  /** Bar length, relative to the first. */
  percent: number;
}

export interface LiveTopBuyer {
  name: string;
  amount: number;
  invoices: number;
  /** Every invoice of the period paid. */
  paid: boolean;
  trend: "up" | "down";
}

export interface LiveActivity {
  key: string;
  time: number;
  text: string;
}

export interface HomeLive {
  periodLabel: string;
  /** null while the invoices / contracts load. */
  sales: LiveSales | null;
  topProducts: LiveTopProduct[] | null;
  topBuyers: LiveTopBuyer[] | null;
  activity: LiveActivity[] | null;
  /** The invoices could not be read (e.g. no permission for them). */
  invoicesFailed: boolean;
}

export const HomeLiveContext = createContext<HomeLive | null>(null);
export const useHomeLive = () => useContext(HomeLiveContext);

const timeOf = (iso: string) => {
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
};
const within = (iso: string, range: Range) => {
  const time = timeOf(iso);
  return time !== null && time >= range.start && time < range.end;
};
const inPeriod = (invoices: Invoice[], range: Range) => invoices.filter((invoice) => invoice.status !== "Cancelled" && within(invoice.invoiceDate, range));
const amountOf = (invoice: Invoice) => invoice.invoiceAmount || 0;

/** Chart slots: months for the financial year, days for a month or fortnight, 4-hour blocks for a single day. */
function slots(period: PeriodKey, range: Range): { label: string; start: number; end: number }[] {
  const result: { label: string; start: number; end: number }[] = [];
  if (period === "fy") {
    const first = new Date(range.start);
    for (let index = 0; index < 12; index += 1) {
      const start = new Date(first.getFullYear(), first.getMonth() + index, 1);
      result.push({ label: start.toLocaleDateString("en-IN", { month: "short" }), start: start.getTime(), end: new Date(first.getFullYear(), first.getMonth() + index + 1, 1).getTime() });
    }
  } else if (period === "month" || period === "fortnight") {
    for (let start = range.start; start < range.end; start += DAY_MS) {
      result.push({ label: String(new Date(start).getDate()), start, end: start + DAY_MS });
    }
  } else {
    for (let hour = 0; hour < 24; hour += 4) {
      const start = range.start + hour * 3600000;
      result.push({ label: `${String(hour).padStart(2, "0")}:00`, start, end: start + 4 * 3600000 });
    }
  }
  return result;
}

const byAmount = <K extends string>(invoices: Invoice[], keyOf: (invoice: Invoice) => K) => {
  const totals = new Map<K, number>();
  for (const invoice of invoices) totals.set(keyOf(invoice), (totals.get(keyOf(invoice)) ?? 0) + amountOf(invoice));
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
};

const productOf = (invoice: Invoice) => invoice.productName?.trim() || "Other";
const buyerOf = (invoice: Invoice) => invoice.buyerName?.trim() || "Unknown buyer";

export function buildSales(invoices: Invoice[], period: PeriodKey, now: number): LiveSales {
  const { current } = periodRanges(period, now);
  const list = inPeriod(invoices, current);
  const products = byAmount(list, productOf).slice(0, 3).map(([name]) => name);
  const buckets = slots(period, current).map((slot) => {
    const inSlot = list.filter((invoice) => {
      const time = timeOf(invoice.invoiceDate) ?? -1;
      return time >= slot.start && time < slot.end;
    });
    const amountFor = (product: string | undefined) =>
      product ? inSlot.filter((invoice) => productOf(invoice) === product).reduce((sum, invoice) => sum + amountOf(invoice), 0) : 0;
    return { label: slot.label, s0: amountFor(products[0]), s1: amountFor(products[1]), s2: amountFor(products[2]) };
  });
  return {
    income: list.reduce((sum, invoice) => sum + amountOf(invoice), 0),
    invoices: list.length,
    paidShare: list.length ? list.filter((invoice) => invoice.status === "Paid").length / list.length : 0,
    products,
    buckets,
  };
}

export function buildTopProducts(invoices: Invoice[], period: PeriodKey, now: number): LiveTopProduct[] {
  const ranked = byAmount(inPeriod(invoices, periodRanges(period, now).current), productOf).slice(0, 5);
  const top = ranked[0]?.[1] || 1;
  return ranked.map(([name, amount]) => ({ name, amount, percent: Math.max(4, Math.round((amount / top) * 100)) }));
}

export function buildTopBuyers(invoices: Invoice[], period: PeriodKey, now: number): LiveTopBuyer[] {
  const { current, previous } = periodRanges(period, now);
  const thisPeriod = inPeriod(invoices, current);
  const before = new Map(byAmount(inPeriod(invoices, previous), buyerOf));
  return byAmount(thisPeriod, buyerOf)
    .slice(0, 5)
    .map(([name, amount]) => {
      const theirs = thisPeriod.filter((invoice) => buyerOf(invoice) === name);
      const change = changeOf(amount, before.get(name) ?? 0);
      return { name, amount, invoices: theirs.length, paid: theirs.every((invoice) => invoice.status === "Paid"), trend: change !== null && change < 0 ? "down" : "up" };
    });
}

/** The latest contracts and invoices of the period, newest first. */
export function buildActivity(invoices: Invoice[], contracts: PendingContractApiResponse[], period: PeriodKey, now: number, limit = 6): LiveActivity[] {
  const { current } = periodRanges(period, now);
  const fromContracts: LiveActivity[] = contracts
    .filter((contract) => within(contract.contractDate, current))
    .map((contract) => ({
      key: `c-${contract.contractId}`,
      time: timeOf(contract.contractDate) ?? 0,
      text: `Contract ${contract.contractNumber}: ${contract.basicDetails.quantity ?? 0} ${contract.basicDetails.quantityMeasure?.toUpperCase() || "MT"} ${contract.productName ?? ""} for ${contract.buyerName ?? "a buyer"}`.replace(/\s+/g, " "),
    }));
  const fromInvoices: LiveActivity[] = inPeriod(invoices, current).map((invoice) => ({
    key: `i-${invoice.invoiceId}`,
    time: timeOf(invoice.invoiceDate) ?? 0,
    text: `Invoice ${invoice.invoiceNumber} raised to ${buyerOf(invoice)} (${invoice.status})`,
  }));
  return [...fromContracts, ...fromInvoices].sort((a, b) => b.time - a.time).slice(0, limit);
}
