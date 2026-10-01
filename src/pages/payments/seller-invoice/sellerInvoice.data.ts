import type { InvoiceContract, InvoiceRowInput } from "../../../store/sellerInvoiceApi";

export interface DeductionEntry {
  id: string;
  date: string;
  amount: string;
  tdsTcs: boolean;
  remarks: string;
}

/** One invoice on the screen. Amount, GST and total are calculated (shown, never typed). */
export interface SellerInvoiceRow {
  id: string;
  contractNumber: string;
  /** The contract the number resolved to: gives the rate, GST and quantity limits used to calculate the invoice. */
  contract: InvoiceContract | null;
  /** Set when the typed contract number could not be found. */
  contractError: string;
  invoiceNumber: string;
  truckNumber: string;
  bags: string;
  invoiceQty: string;
  /** Total loaded on the truck. Follows the invoice quantity until the user types their own value. */
  totalMts: string;
  totalMtsEdited: boolean;
  freight: string;
  /** Invoice amount follows quantity x rate until the user types their own figure. */
  invoiceAmount: string;
  invoiceAmountEdited: boolean;
  /** GST percentage the user types. Empty = the contract's rate (5% by default). The GST amount is worked out from it. */
  gstPercent: string;
  /** The final (rounded) total the user types. Empty = the same as the calculated total (no round-off). */
  roundedTotal: string;
  remarks: string;
  deductions: DeductionEntry[];
}

let rowSeq = 0;
export const nextSellerInvoiceRowId = () => `sinv-row-${Date.now()}-${rowSeq++}`;

let deductionSeq = 0;
export const nextDeductionId = () => `sinv-ded-${Date.now()}-${deductionSeq++}`;

export function createEmptySellerInvoiceRow(): SellerInvoiceRow {
  return {
    id: nextSellerInvoiceRowId(),
    contractNumber: "",
    contract: null,
    contractError: "",
    invoiceNumber: "",
    truckNumber: "",
    bags: "",
    invoiceQty: "",
    totalMts: "",
    totalMtsEdited: false,
    freight: "",
    invoiceAmount: "",
    invoiceAmountEdited: false,
    gstPercent: "",
    roundedTotal: "",
    remarks: "",
    deductions: [],
  };
}

export function createEmptyDeduction(date: string): DeductionEntry {
  return { id: nextDeductionId(), date, amount: "", tdsTcs: false, remarks: "" };
}

export function toNumber(value: string): number {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export interface RowAmounts {
  /** What quantity x rate gives (shown as the default, and used when the user has not typed an amount). */
  autoAmount: number;
  amount: number;
  gst: number;
  /** GST percentage in use (typed, else the contract's). */
  gstPercent: number;
  /** amount + GST, before any round-off. */
  total: number;
  roundOff: number;
  /** total after round-off: what the invoice is raised for. */
  finalTotal: number;
  freight: number;
  deductions: number;
  payable: number;
}

/** The default GST percentage of a row: the contract's, else 5. */
export const defaultGstPercent = (row: SellerInvoiceRow) => row.contract?.gstPercent ?? 5;

/** amount = qty x rate, GST = amount x GST %, total = amount + GST, final total = the (editable) rounded total. The server's figures are final. */
export function calculateRow(row: SellerInvoiceRow): RowAmounts | null {
  const qty = toNumber(row.invoiceQty);
  if (!row.contract || !(qty > 0)) return null;
  const freight = toNumber(row.freight);
  // freight, when entered, is part of the invoice amount (so of the GST base and the total)
  const autoAmount = round2(qty * 1000 * row.contract.pricePerKg + freight);
  const amount = row.invoiceAmountEdited ? round2(toNumber(row.invoiceAmount)) : autoAmount;
  const gstPercent = row.gstPercent.trim() ? toNumber(row.gstPercent) : defaultGstPercent(row);
  const gst = round2((amount * gstPercent) / 100);
  const total = round2(amount + gst);
  const finalTotal = row.roundedTotal.trim() ? round2(toNumber(row.roundedTotal)) : total;
  const roundOff = round2(finalTotal - total);
  const deductions = round2(deductionsTotal(row.deductions));
  return { autoAmount, amount, gstPercent, gst, total, roundOff, finalTotal, freight, deductions, payable: round2(finalTotal - deductions) };
}

export function deductionsTotal(deductions: DeductionEntry[]): number {
  return deductions.reduce((sum, item) => sum + (toNumber(item.amount) || 0), 0);
}

/** A deduction line with nothing entered is ignored (not an error), so a spare "Add deduction" line costs the user nothing. */
const isBlankDeduction = (d: DeductionEntry) => !d.amount.trim() && !d.remarks.trim() && !d.tdsTcs;

export interface RowErrors {
  contractNumber?: string;
  invoiceNumber?: string;
  truckNumber?: string;
  invoiceQty?: string;
  totalMts?: string;
  roundedTotal?: string;
  gstPercent?: string;
  freight?: string;
  invoiceAmount?: string;
  /** message per deduction id */
  deductions: Record<string, string>;
}

/** What is wrong with an invoice, in words, next to the field it belongs to. */
export function validateRow(row: SellerInvoiceRow): RowErrors {
  const errors: RowErrors = { deductions: {} };
  const qty = toNumber(row.invoiceQty);

  if (row.contractError) errors.contractNumber = row.contractError;
  else if (!row.contractNumber.trim()) errors.contractNumber = "Select or type a contract number.";
  else if (row.contract && !row.contract.canInvoice) errors.contractNumber = `This contract is ${row.contract.statusName.toLowerCase()} and cannot be invoiced.`;

  if (!row.invoiceNumber.trim()) errors.invoiceNumber = "Enter the invoice number.";
  if (row.truckNumber.replace(/[^a-z0-9]/gi, "").length < 4) errors.truckNumber = "Enter the truck number.";

  if (!row.invoiceQty.trim()) errors.invoiceQty = "Enter the invoice quantity.";
  else if (!(qty > 0)) errors.invoiceQty = "Quantity must be more than zero.";
  else if (row.contract && qty > row.contract.maxAllowedQtyMT) errors.invoiceQty = `At most ${row.contract.maxAllowedQtyMT} MT more can be invoiced on this contract.`;

  if (row.totalMts.trim() && toNumber(row.totalMts) < qty) errors.totalMts = "Cannot be less than the invoice quantity.";
  if (row.gstPercent.trim() && (toNumber(row.gstPercent) < 0 || toNumber(row.gstPercent) > 100)) errors.gstPercent = "GST % must be between 0 and 100.";
  if (row.freight.trim() && toNumber(row.freight) < 0) errors.freight = "Cannot be negative.";
  if (row.invoiceAmountEdited && toNumber(row.invoiceAmount) < 0) errors.invoiceAmount = "Cannot be negative.";

  row.deductions.filter((d) => !isBlankDeduction(d)).forEach((d) => {
    if (!(toNumber(d.amount) > 0)) errors.deductions[d.id] = "Enter the deduction amount.";
    else if (!d.date) errors.deductions[d.id] = "Choose the deduction date.";
  });

  const amounts = calculateRow(row);
  if (amounts && Math.abs(amounts.roundOff) > 100) errors.roundedTotal = "The round-off can be at most 100 up or down from the total.";
  if (amounts && amounts.deductions > amounts.finalTotal) {
    const first = row.deductions.find((d) => !isBlankDeduction(d));
    if (first && !errors.deductions[first.id]) errors.deductions[first.id] = "Deductions cannot be more than the invoice total.";
  }
  return errors;
}

export function hasErrors(errors: RowErrors): boolean {
  return Object.entries(errors).some(([key, value]) => (key === "deductions" ? Object.keys(value as object).length > 0 : Boolean(value)));
}

/** Everything that is wrong with the invoices, one sentence each ("Invoice 2: Enter the truck number."). */
export function problemMessages(rows: SellerInvoiceRow[]): string[] {
  return rows.flatMap((row, index) => {
    const errors = validateRow(row);
    const list: string[] = [];
    (["contractNumber", "invoiceNumber", "truckNumber", "invoiceQty", "totalMts", "invoiceAmount", "gstPercent", "roundedTotal", "freight"] as const).forEach((key) => {
      if (errors[key]) list.push(`Invoice ${index + 1}: ${errors[key]}`);
    });
    Object.values(errors.deductions).forEach((message) => list.push(`Invoice ${index + 1}: ${message}`));
    return list;
  });
}

export function formatTodayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Indian financial year of a yyyy-mm-dd date (April to March): shown next to the date; the server works out the same value. */
export function financialYearOf(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  if (!year || !month) return "";
  const start = month >= 4 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

function calcGstForSave(row: SellerInvoiceRow): number | null {
  if (!row.gstPercent.trim() || toNumber(row.gstPercent) === defaultGstPercent(row)) return null;
  return calculateRow(row)?.gst ?? null;
}

export function toRowInput(row: SellerInvoiceRow): InvoiceRowInput {
  return {
    contractNumber: row.contractNumber.trim(),
    invoiceNumber: row.invoiceNumber.trim(),
    truckNumber: row.truckNumber.trim(),
    numberOfBags: row.bags.trim() ? Math.trunc(toNumber(row.bags)) : null,
    invoiceQty: toNumber(row.invoiceQty),
    totalMTs: row.totalMts.trim() ? toNumber(row.totalMts) : null,
    freight: row.freight.trim() ? toNumber(row.freight) : null,
    // only a figure the user typed is sent; otherwise the server calculates it
    invoiceAmount: row.invoiceAmountEdited ? toNumber(row.invoiceAmount) : null,
    // the server takes the GST as an amount; sent only when the percentage differs from the contract's
    gstAmount: calcGstForSave(row),
    roundOff: calculateRow(row)?.roundOff ?? 0,
    remarks: row.remarks.trim() || undefined,
    deductions: row.deductions
      .filter((d) => !isBlankDeduction(d))
      .map((d) => ({ date: d.date, amount: toNumber(d.amount), isTdsTcs: d.tdsTcs, remarks: d.remarks.trim() || undefined })),
  };
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
