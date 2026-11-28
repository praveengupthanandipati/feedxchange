import type { InvoiceToClear, PaymentDetail, PaymentPart, Receipt, ReceiptMode } from "../../../../core/store/paymentAdviceApi";

// Form model, validation and the allocation preview of the Payment Advice page. The server applies the same rules and its figures are final.

export type PaymentMode = "online" | "cheque" | "cash" | "none";

export const paymentModeLabels: Record<PaymentMode, string> = {
  online: "Online",
  cheque: "Cheque",
  cash: "Cash",
  none: "No details",
};

export const paymentModes: PaymentMode[] = ["online", "cheque", "cash", "none"];

/** The page works with lower-case modes, the API with Online / Cheque / Cash / None. */
export const toApiMode = (mode: PaymentMode): ReceiptMode => (mode.charAt(0).toUpperCase() + mode.slice(1)) as ReceiptMode;
export const fromApiMode = (mode: ReceiptMode): PaymentMode => mode.toLowerCase() as PaymentMode;

/** A regular payment is allocated to invoices by hand; an advance is paid against one contract and is adjusted into that contract's invoices by its advance %. */
export type PaymentKind = "regular" | "advance";

export type PaymentFieldKey = "date" | "reference" | "bankName" | "amount" | "towards" | "remarks" | "contractId";

export interface PaymentFieldConfig {
  key: PaymentFieldKey;
  label: string;
  placeholder?: string;
  type: "date" | "text";
  inputMode?: "decimal";
  required: boolean;
}

const dateField: PaymentFieldConfig = { key: "date", label: "Select Date", type: "date", required: true };
const amountField: PaymentFieldConfig = {
  key: "amount",
  label: "Amount",
  placeholder: "Enter Amount",
  type: "text",
  inputMode: "decimal",
  required: true,
};
const towardsField: PaymentFieldConfig = {
  key: "towards",
  label: "Towards",
  placeholder: "Enter Towards",
  type: "text",
  required: false,
};
const remarksField: PaymentFieldConfig = {
  key: "remarks",
  label: "Remarks",
  placeholder: "Enter Remarks",
  type: "text",
  required: false,
};

/** Which inputs the form shows for each payment mode, in display order. */
export const modeFields: Record<PaymentMode, PaymentFieldConfig[]> = {
  online: [
    dateField,
    {
      key: "reference",
      label: "Enter Transaction ID",
      placeholder: "Enter Transaction ID",
      type: "text",
      required: true,
    },
    amountField,
    towardsField,
    remarksField,
  ],
  cheque: [
    dateField,
    {
      key: "reference",
      label: "Cheque / UTR",
      placeholder: "Cheque / UTR Number",
      type: "text",
      required: true,
    },
    {
      key: "bankName",
      label: "Bank Name",
      placeholder: "Enter Bank Name",
      type: "text",
      required: true,
    },
    amountField,
    towardsField,
    remarksField,
  ],
  cash: [dateField, amountField, towardsField, remarksField],
  none: [dateField, amountField, towardsField, remarksField],
};

export interface PaymentFormValues {
  kind: PaymentKind;
  /** Contract an advance is paid against (advance only), as the id text of the dropdown. */
  contractId: string;
  mode: PaymentMode;
  date: string;
  reference: string;
  bankName: string;
  amount: string;
  towards: string;
  remarks: string;
}

export type PaymentFormErrors = Partial<Record<PaymentFieldKey, string>>;

export function todayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function createEmptyPaymentForm(mode: PaymentMode = "online", kind: PaymentKind = "regular"): PaymentFormValues {
  return { kind, contractId: "", mode, date: todayInput(), reference: "", bankName: "", amount: "", towards: "", remarks: "" };
}

export function validatePaymentForm(values: PaymentFormValues, options: { requireContract?: boolean } = {}): PaymentFormErrors {
  const errors: PaymentFormErrors = {};
  modeFields[values.mode].forEach((field) => {
    if (field.required && !values[field.key].trim()) errors[field.key] = "Required";
  });
  if (!errors.amount && !(Number(values.amount) > 0)) errors.amount = "Enter a valid amount";
  if (values.kind === "advance" && options.requireContract !== false && !values.contractId) errors.contractId = "Choose the contract this advance is for";
  return errors;
}

// ---------------------------------------------------------------------------------------------------------------
// One payment split over several contracts (advances) and / or a regular part
// ---------------------------------------------------------------------------------------------------------------

export type SplitBasis = "amount" | "percent";

export interface SplitRow {
  key: string;
  contractId: string;
  basis: SplitBasis;
  /** The amount (₹) or the percent of the payment, as typed. */
  value: string;
  /** Editing a payment: the existing receipt (part) this row is, with what was done with it. */
  part?: PaymentPart;
}

export interface SplitRegular {
  enabled: boolean;
  /** "rest" = whatever is left after the contracts. */
  basis: SplitBasis | "rest";
  value: string;
  /** Editing a payment: the existing regular receipt. */
  part?: PaymentPart;
}

export interface SplitState {
  rows: SplitRow[];
  regular: SplitRegular;
}

let splitSeq = 0;
export const newSplitRow = (): SplitRow => ({ key: `split-${Date.now()}-${splitSeq++}`, contractId: "", basis: "amount", value: "" });
export const createEmptySplit = (): SplitState => ({ rows: [newSplitRow()], regular: { enabled: false, basis: "rest", value: "" } });

const numberOf = (text: string) => {
  const value = Number(text);
  return Number.isFinite(value) ? value : 0;
};

export interface ResolvedSplit {
  /** The amount each contract row gets. */
  rowAmounts: Record<string, number>;
  regularAmount: number;
  /** Everything given to contracts and the regular part. */
  allocated: number;
  /** Payment total - allocated (0 when the parts add up). */
  left: number;
  rowErrors: Record<string, string>;
  /** A problem with the split as a whole (parts do not add up ...). */
  problem?: string;
  valid: boolean;
}

/** What each part of the split gets (the server repeats this and is final). A lone contract with no figure takes the whole payment. */
export function resolveSplit(split: SplitState, total: number): ResolvedSplit {
  const rowAmounts: Record<string, number> = {};
  const rowErrors: Record<string, string> = {};
  const lone = split.rows.length === 1 && !split.regular.enabled;
  const seen = new Set<string>();
  split.rows.forEach((row) => {
    let amount = 0;
    if (!row.value.trim()) {
      if (lone) amount = total;
    } else {
      amount = row.basis === "percent" ? round2((total * numberOf(row.value)) / 100) : round2(numberOf(row.value));
    }
    rowAmounts[row.key] = amount;
    if (!row.contractId) rowErrors[row.key] = "Choose the contract";
    else if (seen.has(row.contractId)) rowErrors[row.key] = "This contract is already in the list";
    else if (!(amount > 0)) rowErrors[row.key] = row.basis === "percent" ? "Enter the %" : "Enter the amount";
    else if (row.basis === "percent" && numberOf(row.value) > 100) rowErrors[row.key] = "A percent cannot be more than 100";
    if (row.contractId) seen.add(row.contractId);
  });

  const advanceSum = round2(Object.values(rowAmounts).reduce((sum, v) => sum + v, 0));
  let regularAmount = 0;
  if (split.regular.enabled) {
    if (split.regular.basis === "rest") regularAmount = round2(Math.max(total - advanceSum, 0));
    else if (split.regular.basis === "percent") regularAmount = round2((total * numberOf(split.regular.value)) / 100);
    else regularAmount = round2(numberOf(split.regular.value));
  }

  const allocated = round2(advanceSum + regularAmount);
  const left = round2(total - allocated);
  let problem: string | undefined;
  if (split.regular.enabled && !(regularAmount > 0)) problem = split.regular.basis === "rest" ? "Nothing is left for the regular part." : "Enter the amount or % of the regular part.";
  else if (Math.abs(left) > 0.02) problem = left > 0 ? `${money(left)} of the payment is not given to any contract.` : `The parts are ${money(-left)} more than the payment.`;
  const valid = total > 0 && !problem && Object.keys(rowErrors).length === 0;
  return { rowAmounts, regularAmount, allocated, left, rowErrors, problem, valid };
}

export interface SplitPart {
  kind: "Advance" | "Regular";
  contractId: number | null;
  amount: number;
}

/** The parts to send to the API. */
export function splitPayload(split: SplitState, resolved: ResolvedSplit): SplitPart[] {
  const parts: SplitPart[] = split.rows.map((row) => ({ kind: "Advance", contractId: Number(row.contractId), amount: resolved.rowAmounts[row.key] }));
  if (split.regular.enabled) parts.push({ kind: "Regular", contractId: null, amount: resolved.regularAmount });
  return parts;
}

/** The form values of a whole payment (for Edit payment). */
export function formFromDetail(detail: PaymentDetail): PaymentFormValues {
  return {
    kind: detail.parts.some((p) => p.receipt.kind === "Advance") ? "advance" : "regular",
    contractId: "",
    mode: fromApiMode(detail.paymentMode),
    date: detail.receiptDate.slice(0, 10),
    reference: detail.reference ?? "",
    bankName: detail.bankName ?? "",
    amount: String(detail.totalAmount),
    towards: detail.towards ?? "",
    remarks: detail.remarks ?? "",
  };
}

/** The parts of a whole payment as the split editor shows them: one row per advance, and the regular part. */
export function splitFromDetail(detail: PaymentDetail): SplitState {
  const rows: SplitRow[] = detail.parts
    .filter((p) => p.receipt.kind === "Advance")
    .map((p) => ({ key: `part-${p.receipt.receiptId}`, contractId: String(p.receipt.contractId ?? ""), basis: "amount" as const, value: String(p.receipt.amount), part: p }));
  const regular = detail.parts.find((p) => p.receipt.kind === "Regular");
  return {
    rows,
    regular: regular ? { enabled: true, basis: "amount", value: String(regular.receipt.amount), part: regular } : { enabled: false, basis: "rest", value: "" },
  };
}

export interface EditImpact {
  /** Parts whose allocations have to be deleted for the edit to go through. */
  reverse: { receiptNumber: string; allocated: number; why: string }[];
  /** Edits that cannot be done at all. */
  blocked: string[];
}

/** What editing the payment into this split does to the existing parts (the server repeats the check and is final). */
export function editImpact(split: SplitState, detail: PaymentDetail, resolved: ResolvedSplit): EditImpact {
  const reverse: EditImpact["reverse"] = [];
  const blocked: string[] = [];
  const kept = new Map<number, { kind: "Advance" | "Regular"; contractId: number | null; amount: number }>();
  split.rows.forEach((row) => {
    if (row.part) kept.set(row.part.receipt.receiptId, { kind: "Advance", contractId: row.contractId ? Number(row.contractId) : null, amount: resolved.rowAmounts[row.key] ?? 0 });
  });
  if (split.regular.enabled && split.regular.part) kept.set(split.regular.part.receipt.receiptId, { kind: "Regular", contractId: null, amount: resolved.regularAmount });

  detail.parts.forEach((p) => {
    const r = p.receipt;
    const next = kept.get(r.receiptId);
    const floor = round2((r.refundedAmount ?? 0) + (r.convertedAmount ?? 0));
    if (!next) {
      if (floor > 0) blocked.push(`${r.receiptNumber} has been refunded or converted, so it cannot be removed.`);
      else if (r.allocatedAmount > 0) reverse.push({ receiptNumber: r.receiptNumber, allocated: r.allocatedAmount, why: "removed" });
      return;
    }
    const identityChanged = next.kind !== r.kind || (next.contractId ?? null) !== (r.contractId ?? null);
    if (identityChanged && floor > 0) blocked.push(`${r.receiptNumber} has been refunded or converted, so its type and contract cannot be changed.`);
    else if (!identityChanged && next.amount < floor - 0.004) blocked.push(`${r.receiptNumber}: the amount cannot be less than what was refunded or converted (${money(floor)}).`);
    else if (r.allocatedAmount > 0 && (identityChanged || next.amount < round2(floor + r.allocatedAmount) - 0.004)) {
      reverse.push({ receiptNumber: r.receiptNumber, allocated: r.allocatedAmount, why: identityChanged ? "contract / type changed" : "amount reduced below what is allocated" });
    }
  });
  return { reverse, blocked };
}

/** The form values of an existing receipt (for Edit). */
export function formFromReceipt(receipt: Receipt): PaymentFormValues {
  return {
    kind: receipt.kind === "Advance" ? "advance" : "regular",
    contractId: receipt.contractId ? String(receipt.contractId) : "",
    mode: fromApiMode(receipt.paymentMode),
    date: receipt.receiptDate.slice(0, 10),
    reference: receipt.reference ?? "",
    bankName: receipt.bankName ?? "",
    amount: String(receipt.amount),
    towards: receipt.towards ?? "",
    remarks: receipt.remarks ?? "",
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Allocation preview (the server repeats this under locks when "Apply Allocation" is pressed)
// ---------------------------------------------------------------------------------------------------------------

export const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export const shortDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : iso;
};

export const invoiceBalance = (invoice: InvoiceToClear) => invoice.balanceAmount;
export const receiptUnallocated = (receipt: Receipt) => receipt.unallocatedAmount;

export interface AdvanceAdjustment {
  /** Advance to adjust into the invoice now. */
  amount: number;
  /** The contract's advance %, the share of the invoice the advance should cover. */
  percent: number;
  /** Set when the contract's advance receipts ran out before the invoice got its full share. */
  short: boolean;
}

/**
 * Advance is adjusted into each invoice at the SAME percentage the contract's payment terms give (e.g. 30% of every invoice).
 * Invoices of a contract take it oldest first, from the advance receipts paid against that contract, never more than the
 * advance that is left and never more than the invoice still owes.
 */
export function planAdvance(invoices: InvoiceToClear[], receipts: Receipt[]): Record<number, AdvanceAdjustment> {
  const pool: Record<number, number> = {};
  receipts
    .filter((r) => r.kind === "Advance" && r.contractId)
    .forEach((r) => {
      pool[r.contractId!] = round2((pool[r.contractId!] ?? 0) + receiptUnallocated(r));
    });
  const plan: Record<number, AdvanceAdjustment> = {};
  [...invoices]
    .sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate) || a.invoiceNumber.localeCompare(b.invoiceNumber))
    .forEach((invoice) => {
      const percent = invoice.advancePercent;
      const entitled = round2((invoice.payableAmount * percent) / 100);
      const due = Math.min(Math.max(round2(entitled - invoice.advanceAdjusted), 0), invoice.balanceAmount);
      const available = pool[invoice.contractId] ?? 0;
      const amount = round2(Math.min(due, available));
      pool[invoice.contractId] = round2(available - amount);
      plan[invoice.invoiceId] = { amount, percent, short: amount < due };
    });
  return plan;
}

/** One line for a receipt in the summary of a split payment: its number, what it is and its amount (a converted payment says where it came from). */
export function groupPartLabel(r: Receipt, withNumber: boolean): string {
  const what = r.convertedFromReceiptNumber
    ? `regular ${money(r.amount)} (converted from advance ${r.convertedFromReceiptNumber})`
    : r.kind === "Advance"
      ? `advance ${r.contractNumber ?? ""} ${money(r.amount)}`.replace("  ", " ")
      : `regular ${money(r.amount)}`;
  return withNumber ? `${r.receiptNumber} ${what}` : what;
}
