import type { InvoiceToClear, Receipt, ReceiptMode } from "../../../store/paymentAdviceApi";

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

export function validatePaymentForm(values: PaymentFormValues): PaymentFormErrors {
  const errors: PaymentFormErrors = {};
  modeFields[values.mode].forEach((field) => {
    if (field.required && !values[field.key].trim()) errors[field.key] = "Required";
  });
  if (!errors.amount && !(Number(values.amount) > 0)) errors.amount = "Enter a valid amount";
  if (values.kind === "advance" && !values.contractId) errors.contractId = "Choose the contract this advance is for";
  return errors;
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
