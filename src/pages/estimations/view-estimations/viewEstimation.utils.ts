import { formatDisplayDate } from "../../../components/dropdown/Calendar";
import { buildInvoicePdf, downloadBlob } from "../../truck-management/seller-dispatches-new/update-seller-dispatch/invoicePdf";
import type { Estimation, EstimationFilters } from "./viewEstimation.data";

export const EMPTY_VALUE = "—";

export const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
export const displayDate = (iso: string) => (iso ? formatDisplayDate(iso) : EMPTY_VALUE);
export const displayAmount = (value: number | null) => (value === null ? EMPTY_VALUE : formatInr(value));

export const uniqueOptions = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean)))
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));

/** Keeps estimates whose period overlaps the chosen range; an open estimate (no To Date) covers just its From Date. */
export function matchesFilters(estimation: Estimation, filters: EstimationFilters) {
  if (filters.party && estimation.partyName !== filters.party) return false;
  const periodEnd = estimation.toDate || estimation.fromDate;
  if (filters.from && periodEnd < filters.from) return false;
  if (filters.to && estimation.fromDate > filters.to) return false;
  return true;
}

/** "Today: 9/10/2026" until a date range is applied, then the range itself. */
export function dataShowingLabel(filters: EstimationFilters) {
  if (filters.from && filters.to) return `${formatDisplayDate(filters.from)} to ${formatDisplayDate(filters.to)}`;
  if (filters.from) return `From ${formatDisplayDate(filters.from)}`;
  if (filters.to) return `Up to ${formatDisplayDate(filters.to)}`;
  return `Today: ${new Date().toLocaleDateString("en-IN")}`;
}

export function downloadEstimation(estimation: Estimation) {
  const lines = [
    { label: "Estimate No", value: estimation.estimateNo },
    { label: "Party Name", value: estimation.partyName || EMPTY_VALUE },
    { label: "Period", value: `${displayDate(estimation.fromDate)} to ${displayDate(estimation.toDate)}` },
    { label: "Qty", value: `${estimation.qty} MT` },
    { label: "Net Amount", value: displayAmount(estimation.netAmount) },
    ...(estimation.remarks ? [{ label: "Remarks", value: estimation.remarks }] : []),
  ];
  downloadBlob(buildInvoicePdf(`Commission Estimate ${estimation.estimateNo}`, lines), `${estimation.estimateNo}.pdf`);
}
