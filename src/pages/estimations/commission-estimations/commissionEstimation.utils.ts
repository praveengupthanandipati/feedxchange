import { formatDisplayDate } from "../../../components/dropdown/Calendar";
import { downloadBlob } from "../../truck-management/seller-dispatches-new/update-seller-dispatch/invoicePdf";
import type { EstimationContract } from "./commissionEstimation.data";

/**
 * Ticked contracts, keyed by contract id, each with its ticked invoice ids.
 * A contract that is present but has no invoices still counts (it has nothing to pick from).
 */
export type Selection = Record<string, string[]>;

export interface SummaryLine {
  commission: number;
  qty: number;
  amount: number;
}

export const formatNumber = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const formatInr = (value: number) => `₹${formatNumber(value)}`;

export const uniqueOptions = (values: string[]) =>
  Array.from(new Set(values))
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));

export const contractCommission = (row: EstimationContract) => row.quantityMt * row.commissionPerMt;

export const isTicked = (selection: Selection, id: string) => selection[id] !== undefined;

/**
 * Quantity each contract contributes to the estimate. With nothing ticked every listed contract counts
 * in full; otherwise only ticked contracts count, by their ticked invoices (or in full when they have none).
 */
export function estimatedQuantities(rows: EstimationContract[], selection: Selection) {
  const ticked = rows.filter((row) => isTicked(selection, row.id));
  if (ticked.length === 0) return rows.map((row) => ({ row, qty: row.quantityMt }));
  return ticked.map((row) => ({
    row,
    qty:
      row.invoices.length === 0
        ? row.quantityMt
        : row.invoices.filter((invoice) => selection[row.id].includes(invoice.id)).reduce((sum, invoice) => sum + invoice.qty, 0),
  }));
}

/** Quantity and amount per commission rate, highest rate first. */
export function summariseByRate(lines: { row: EstimationContract; qty: number }[]): SummaryLine[] {
  const byRate = new Map<number, SummaryLine>();
  for (const { row, qty } of lines) {
    const entry = byRate.get(row.commissionPerMt) ?? { commission: row.commissionPerMt, qty: 0, amount: 0 };
    entry.qty += qty;
    entry.amount += qty * row.commissionPerMt;
    byRate.set(row.commissionPerMt, entry);
  }
  return Array.from(byRate.values()).sort((a, b) => b.commission - a.commission);
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function exportEstimations(rows: EstimationContract[]) {
  const head = ["Contract Dt", "Contract No", "Party Name", "Action Type", "Commodity", "Contract Rate", "No of MT", "Commission / MT", "Total Commission"];
  const body = rows
    .map((row) =>
      [
        formatDisplayDate(row.contractDate),
        row.contractNo,
        row.partyName,
        row.actionType,
        row.commodity,
        formatNumber(row.contractRate),
        String(row.quantityMt),
        String(row.commissionPerMt),
        formatNumber(contractCommission(row)),
      ]
        .map((cell) => `<td>${escapeHtml(cell)}</td>`)
        .join(""),
    )
    .map((cells) => `<tr>${cells}</tr>`)
    .join("");
  const html = `<meta charset="utf-8"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
  downloadBlob(new Blob([html], { type: "application/vnd.ms-excel" }), "commission-estimations.xls");
}
