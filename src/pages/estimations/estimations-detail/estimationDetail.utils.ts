import { formatDisplayDate } from "../../../components/dropdown/Calendar";
import { downloadBlob } from "../../truck-management/seller-dispatches-new/update-seller-dispatch/invoicePdf";
import type { EstimationDetailRecord, EstimationLine } from "./estimationDetail.data";

export interface SummaryLine {
  commission: number;
  qty: number;
  amount: number;
}

export interface DetailTotals {
  totalMt: number;
  grossAmount: number;
  difference: number;
  totalAmount: number;
}

export const formatNumber = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const formatInr = (value: number) => `₹${formatNumber(value)}`;
export const lineCommission = (line: EstimationLine) => line.quantityMt * line.commissionPerMt;

export const EMPTY_VALUE = "—";

/** 01-04-2026, or a dash when the date is not set yet. */
export const displayDate = (iso: string) => (iso ? formatDisplayDate(iso) : EMPTY_VALUE);

/** 2026-04-01 → 01-04-26, as on the From and To Date card. */
export const formatShortDate = (iso: string) => {
  if (!iso) return EMPTY_VALUE;
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year.slice(-2)}`;
};

/** Quantity and amount per commission rate, highest rate first. */
export function summariseByRate(lines: EstimationLine[]): SummaryLine[] {
  const byRate = new Map<number, SummaryLine>();
  for (const line of lines) {
    const entry = byRate.get(line.commissionPerMt) ?? { commission: line.commissionPerMt, qty: 0, amount: 0 };
    entry.qty += line.quantityMt;
    entry.amount += lineCommission(line);
    byRate.set(line.commissionPerMt, entry);
  }
  return Array.from(byRate.values()).sort((a, b) => b.commission - a.commission);
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const LINE_HEAD = ["S.No", "Contract Date", "Contract #", "Buyer / Seller Name", "Action Type", "Commodity", "No. of MT", "Commission Per MT", "Total Commission"];

const lineCells = (line: EstimationLine, index: number) => [
  String(index + 1),
  formatDisplayDate(line.contractDate),
  line.contractNo,
  line.partyName,
  line.actionType,
  line.commodity,
  String(line.quantityMt),
  formatInr(line.commissionPerMt),
  formatInr(lineCommission(line)),
];

const row = (cells: string[], tag = "td") => `<tr>${cells.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join("")}</tr>`;

function detailHtml(record: EstimationDetailRecord, lines: EstimationLine[], totals: DetailTotals) {
  const facts = [
    ["Estimate No", record.estimateNo],
    ["From and To Date", `${displayDate(record.fromDate)} - ${displayDate(record.toDate)}`],
    ["Party Name", record.partyName || EMPTY_VALUE],
    ["Total MT", formatNumber(totals.totalMt)],
    ["Gross Amount", formatInr(totals.grossAmount)],
    ["Difference", formatInr(totals.difference)],
    ["Total Amount", formatInr(totals.totalAmount)],
  ]
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");
  return `<table>${facts}</table><table><thead>${row(LINE_HEAD, "th")}</thead><tbody>${lines.map((line, index) => row(lineCells(line, index))).join("")}</tbody></table>`;
}

/** Opens a print-ready copy of the estimate in a new window. */
export function printEstimation(record: EstimationDetailRecord, lines: EstimationLine[], totals: DetailTotals) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Estimate ${escapeHtml(record.estimateNo)}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1d24}h1{font-size:18px}table{border-collapse:collapse;width:100%;margin-bottom:18px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:12px}th{background:#f2f4f6}</style>
</head><body><h1>Commission Estimate – ${escapeHtml(record.estimateNo)}</h1>${detailHtml(record, lines, totals)}</body></html>`;
  // A same-origin blob page prints in every browser without the deprecated document.write.
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const win = window.open(url, "_blank", "width=900,height=700");
  if (!win) {
    URL.revokeObjectURL(url);
    return false;
  }
  win.addEventListener("load", () => {
    win.focus();
    win.print();
  });
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

/** Saves the estimate and its contracts as an Excel sheet. */
export function downloadEstimation(record: EstimationDetailRecord, lines: EstimationLine[], totals: DetailTotals) {
  const html = `<meta charset="utf-8">${detailHtml(record, lines, totals)}`;
  downloadBlob(new Blob([html], { type: "application/vnd.ms-excel" }), `estimate-${record.estimateNo}.xls`);
}
