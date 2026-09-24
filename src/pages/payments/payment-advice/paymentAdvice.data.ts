// TODO: replace with real data once the payments API is wired up.

export type PaymentMode = "online" | "cheque" | "cash" | "none";

export const paymentModeLabels: Record<PaymentMode, string> = {
  online: "Online",
  cheque: "Cheque",
  cash: "Cash",
  none: "No details",
};

export const paymentModes: PaymentMode[] = ["online", "cheque", "cash", "none"];

export type PaymentFieldKey = "date" | "reference" | "bankName" | "amount" | "towards" | "remarks";

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

export function createEmptyPaymentForm(mode: PaymentMode = "online"): PaymentFormValues {
  return { mode, date: todayInput(), reference: "", bankName: "", amount: "", towards: "", remarks: "" };
}

export function validatePaymentForm(values: PaymentFormValues): PaymentFormErrors {
  const errors: PaymentFormErrors = {};
  modeFields[values.mode].forEach((field) => {
    if (field.required && !values[field.key].trim()) errors[field.key] = "Required";
  });
  if (!errors.amount && !(Number(values.amount) > 0)) errors.amount = "Enter a valid amount";
  return errors;
}

export interface PaymentAdviceRow {
  id: string;
  seller: string;
  buyer: string;
  /** ISO yyyy-mm-dd. */
  date: string;
  mode: PaymentMode;
  /** Transaction ID (online) or cheque / UTR number; empty for cash / no details. */
  reference: string;
  bankName: string;
  amount: number;
  towards: string;
  remarks: string;
}

export interface PaymentAdviceViewRow extends PaymentAdviceRow {
  /** Running total of payments for the selected parties, not yet allocated to invoices. */
  unAccountBalance: number;
}

let paymentSeq = 0;
export const nextPaymentId = () => `pay-${Date.now()}-${paymentSeq++}`;

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export const sellerOptions = [
  { value: "Ankur Animal Feeds - Ahmedabad", label: "Ankur Animal Feeds - Ahmedabad" },
  { value: "Chatrai - Lakshmi Poultry Complex", label: "Chatrai - Lakshmi Poultry Complex" },
  { value: "Blue Aqua Farms - Kochi", label: "Blue Aqua Farms - Kochi" },
  { value: "Green Valley Dairy - Pune", label: "Green Valley Dairy - Pune" },
];

export const buyerOptions = [
  { value: "Sai Feeds Pvt Ltd - Mumbai", label: "Sai Feeds Pvt Ltd - Mumbai" },
  { value: "Chilakaluripet - Eswar Industries", label: "Chilakaluripet - Eswar Industries" },
  { value: "FairSquare Trading Pvt Ltd - Pune", label: "FairSquare Trading Pvt Ltd - Pune" },
  { value: "Venkatesh Iyer - Chennai", label: "Venkatesh Iyer - Chennai" },
];

export const defaultSeller = sellerOptions[0].value;
export const defaultBuyer = buyerOptions[0].value;

export const seedPaymentRows: PaymentAdviceRow[] = [
  {
    id: "pay-seed-1",
    seller: defaultSeller,
    buyer: defaultBuyer,
    date: "2026-09-24",
    mode: "online",
    reference: "25556",
    bankName: "",
    amount: 5000,
    towards: "Transport",
    remarks: "Remarks",
  },
  {
    id: "pay-seed-2",
    seller: defaultSeller,
    buyer: defaultBuyer,
    date: "2026-09-24",
    mode: "online",
    reference: "255566",
    bankName: "",
    amount: 5000,
    towards: "Transport",
    remarks: "Remarks",
  },
];
