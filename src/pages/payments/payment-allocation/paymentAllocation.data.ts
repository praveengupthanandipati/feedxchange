// TODO: replace with real data once the payments API is wired up.

export type AllocationMode = "general" | "invoices" | "contracts";

export const allocationModes: { value: AllocationMode; label: string }[] = [
  { value: "general", label: "General" },
  { value: "invoices", label: "Pending Invoices" },
  { value: "contracts", label: "Pending Contracts" },
];

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export const sellerOptions = [
  { value: "Ankur Animal Feeds - Ahmedabad", label: "Ankur Animal Feeds - Ahmedabad" },
  { value: "Chatrai - Lakshmi Poultry Complex", label: "Chatrai - Lakshmi Poultry Complex" },
  { value: "Green Valley Dairy - Pune", label: "Green Valley Dairy - Pune" },
];

export const buyerOptions = [
  { value: "Blue Aqua Farms - Kochi", label: "Blue Aqua Farms - Kochi" },
  { value: "Sai Feeds Pvt Ltd - Mumbai", label: "Sai Feeds Pvt Ltd - Mumbai" },
  { value: "Chilakaluripet - Eswar Industries", label: "Chilakaluripet - Eswar Industries" },
];

export const defaultSeller = sellerOptions[0].value;
export const defaultBuyer = buyerOptions[0].value;

// ---------------------------------------------------------------
// Pending rows
// ---------------------------------------------------------------
interface PartyRow {
  seller: string;
  buyer: string;
}

export interface PendingContractRow extends PartyRow {
  id: string;
  contractNumber: string;
  contractValue: number;
  immediateAdvance: number;
  balanceAdvance: number;
  paid: number;
}

export interface PendingInvoiceRow extends PartyRow {
  id: string;
  /** dd-mm-yyyy */
  date: string;
  contractNumber: string;
  invoiceNumber: string;
  invoiceAmount: number;
  amountToPay: number;
  paid: number;
  balance: number;
}

const party: PartyRow = { seller: defaultSeller, buyer: defaultBuyer };

export const seedContractRows: PendingContractRow[] = [
  { id: "c-3840", ...party, contractNumber: "3840", contractValue: 1146663, immediateAdvance: 100000, balanceAdvance: 100000, paid: 500000 },
  { id: "c-3841", ...party, contractNumber: "3841", contractValue: 925450, immediateAdvance: 75000, balanceAdvance: 75000, paid: 400000 },
  { id: "c-3842", ...party, contractNumber: "3842", contractValue: 1575880, immediateAdvance: 150000, balanceAdvance: 150000, paid: 750000 },
  { id: "c-3843", ...party, contractNumber: "3843", contractValue: 892340, immediateAdvance: 90000, balanceAdvance: 90000, paid: 350000 },
  { id: "c-3844", ...party, contractNumber: "3844", contractValue: 1268920, immediateAdvance: 125000, balanceAdvance: 125000, paid: 600000 },
];

function invoice(
  date: string,
  contractNumber: string,
  invoiceNumber: string,
  amount: number,
  paid: number,
): PendingInvoiceRow {
  return {
    id: `i-${invoiceNumber.replace("/", "-")}`,
    ...party,
    date,
    contractNumber,
    invoiceNumber,
    invoiceAmount: amount,
    amountToPay: amount,
    paid,
    balance: amount - paid,
  };
}

export const seedInvoiceRows: PendingInvoiceRow[] = [
  invoice("29-12-2025", "3840", "2526/837", 1146663, 500000),
  invoice("28-12-2025", "3841", "2527/838", 925450, 400000),
  invoice("27-12-2025", "3842", "2528/839", 1575880, 750000),
  invoice("26-12-2025", "3843", "2529/840", 892340, 350000),
  invoice("25-12-2025", "3844", "2530/841", 1268920, 600000),
];

// ---------------------------------------------------------------
// Receipts and how each has been split so far
// ---------------------------------------------------------------
export interface ReceiptInvoiceSplit {
  id: string;
  date: string;
  contractNumber: string;
  invoiceNumber: string;
  amount: number;
}

export interface ReceiptContractSplit {
  id: string;
  date: string;
  contractNumber: string;
  amount: number;
}

export interface PaymentReceipt {
  id: string;
  label: string;
  invoiceSplits: ReceiptInvoiceSplit[];
  contractSplits: ReceiptContractSplit[];
}

export const receipts: PaymentReceipt[] = [
  {
    id: "rct-2601",
    label: "RCT-2601 · 03-01-2026",
    invoiceSplits: [
      { id: "s1", date: "03-01-2026", contractNumber: "3840", invoiceNumber: "2526/837", amount: 350000 },
      { id: "s2", date: "02-01-2026", contractNumber: "3841", invoiceNumber: "2527/838", amount: 275000 },
      { id: "s3", date: "04-01-2026", contractNumber: "3842", invoiceNumber: "2528/839", amount: 425000 },
      { id: "s4", date: "03-01-2026", contractNumber: "3843", invoiceNumber: "2529/840", amount: 185000 },
      { id: "s5", date: "05-01-2026", contractNumber: "3844", invoiceNumber: "2530/841", amount: 315000 },
    ],
    contractSplits: [
      { id: "s1", date: "03-01-2026", contractNumber: "3840", amount: 550000 },
      { id: "s2", date: "02-01-2026", contractNumber: "3841", amount: 425000 },
      { id: "s3", date: "04-01-2026", contractNumber: "3842", amount: 675000 },
      { id: "s4", date: "03-01-2026", contractNumber: "3843", amount: 385000 },
      { id: "s5", date: "05-01-2026", contractNumber: "3844", amount: 515000 },
    ],
  },
  {
    id: "rct-2602",
    label: "RCT-2602 · 10-01-2026",
    invoiceSplits: [
      { id: "s1", date: "10-01-2026", contractNumber: "3841", invoiceNumber: "2527/838", amount: 300000 },
      { id: "s2", date: "10-01-2026", contractNumber: "3843", invoiceNumber: "2529/840", amount: 200000 },
    ],
    contractSplits: [
      { id: "s1", date: "10-01-2026", contractNumber: "3841", amount: 500000 },
      { id: "s2", date: "10-01-2026", contractNumber: "3843", amount: 300000 },
    ],
  },
  {
    id: "rct-2603",
    label: "RCT-2603 · 18-01-2026",
    invoiceSplits: [],
    contractSplits: [],
  },
];

export const receiptOptions = receipts.map((receipt) => ({ value: receipt.id, label: receipt.label }));

// ---------------------------------------------------------------
// Per-row entry state and validation
// ---------------------------------------------------------------
export interface AllocationEntry {
  amount: string;
  receiptId: string;
}

export type AllocationEntries = Record<string, AllocationEntry>;

export interface AllocationRowErrors {
  amount?: string;
  receipt?: string;
}

/** A row is "filled" once the user has touched either of its two inputs. */
export function validateEntries(entries: AllocationEntries, rowIds: string[]): {
  errors: Record<string, AllocationRowErrors>;
  filledCount: number;
} {
  const errors: Record<string, AllocationRowErrors> = {};
  let filledCount = 0;

  rowIds.forEach((id) => {
    const entry = entries[id];
    if (!entry || (!entry.amount.trim() && !entry.receiptId)) return;
    filledCount += 1;

    const rowErrors: AllocationRowErrors = {};
    if (!(Number(entry.amount) > 0)) rowErrors.amount = "Enter an amount";
    if (!entry.receiptId) rowErrors.receipt = "Select a receipt";
    if (rowErrors.amount || rowErrors.receipt) errors[id] = rowErrors;
  });

  return { errors, filledCount };
}
