import { formatDisplayDate } from "../../components/dropdown/Calendar";
import type { InterestInvoice } from "./create-interest/interestCalculation.data";

// Shared by Create Interest and View Interest Detail so both work the figures out the same way.

const DAY_MS = 24 * 60 * 60 * 1000;

/** yyyy-mm-dd parsed as UTC, so day counts are never off by one across DST changes. */
const toUtc = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

export const daysBetween = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / DAY_MS);

export const addDays = (iso: string, days: number) => new Date(toUtc(iso) + days * DAY_MS).toISOString().slice(0, 10);

export const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export const formatDate = (iso: string) => (iso ? formatDisplayDate(iso) : "—");

/** One invoice with every figure the interest tables show worked out. */
export interface CalculatedRow extends InterestInvoice {
  sNo: number;
  dueDate: string;
  paidDate: string;
  paidAmount: number;
  /** Days from invoice to final payment. */
  totalDays: number;
  /** Credit period agreed: days from invoice to payment due date. */
  conditionDays: number;
  /** Days beyond the grace period that interest is charged for. */
  overDueDays: number;
  interest: number;
}

/**
 * Over Due = days from invoice to final payment minus grace; interest is simple interest on the paid
 * amount for those days. `dueDays` overrides the stored due date (invoice date + that many days).
 */
export function calculateInvoice(invoice: InterestInvoice, sNo: number, dueDays: number | null, rate: number): CalculatedRow {
  const dueDate = dueDays === null ? invoice.paymentDueDate : addDays(invoice.invoiceDate, dueDays);
  const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidDate = invoice.payments.reduce((latest, payment) => (payment.date > latest ? payment.date : latest), "");
  const totalDays = paidDate ? Math.max(0, daysBetween(invoice.invoiceDate, paidDate)) : 0;
  const overDueDays = Math.max(0, totalDays - invoice.grace);
  return {
    ...invoice,
    sNo,
    dueDate,
    paidDate,
    paidAmount,
    totalDays,
    conditionDays: daysBetween(invoice.invoiceDate, dueDate),
    overDueDays,
    interest: Math.round((paidAmount * rate * overDueDays) / (365 * 100)),
  };
}
