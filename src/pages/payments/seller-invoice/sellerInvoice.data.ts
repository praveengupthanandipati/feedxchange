// TODO: replace with real data once the payments API is wired up.

export interface DeductionEntry {
  id: string;
  date: string;
  amount: string;
  tdsTcs: boolean;
  remarks: string;
}

export interface SellerInvoiceRow {
  id: string;
  contractNumber: string;
  invoiceNumber: string;
  truckNumber: string;
  bags: string;
  invoiceQty: string;
  totalMts: string;
  freight: string;
  invoiceAmount: string;
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
    invoiceNumber: "",
    truckNumber: "",
    bags: "",
    invoiceQty: "",
    totalMts: "",
    freight: "",
    invoiceAmount: "",
    remarks: "",
    deductions: [],
  };
}

/** Fields that must be filled before the invoice rows can be saved. */
export const REQUIRED_SELLER_INVOICE_FIELDS: (keyof SellerInvoiceRow)[] = [
  "contractNumber",
  "invoiceNumber",
  "truckNumber",
  "invoiceQty",
  "invoiceAmount",
];

export function getMissingSellerInvoiceFields(row: SellerInvoiceRow): Set<keyof SellerInvoiceRow> {
  const missing = new Set<keyof SellerInvoiceRow>();
  REQUIRED_SELLER_INVOICE_FIELDS.forEach((field) => {
    if (!String(row[field]).trim()) missing.add(field);
  });
  return missing;
}

export function deductionsTotal(deductions: DeductionEntry[]): number {
  return deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function formatTodayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export const financialYearOptions = [
  { value: "2026-27", label: "2026-27" },
  { value: "2025-26", label: "2025-26" },
  { value: "2024-25", label: "2024-25" },
];

export interface ContractLookupRow {
  contractNumber: string;
  contractDate: string;
  seller: string;
  buyer: string;
  commodity: string;
  qty: number;
  balanceQty: number;
  rate: number;
}

const GST_PERCENT = 5;

const rawContractLookupRows = [
  { contractNumber: "CT001", contractDate: "10-01-2026", seller: "Sai Feeds Pvt Ltd - Mumbai", buyer: "Rajesh Kumar", commodity: "Rice DDGS", qty: 50, balanceQty: 20, rate: 25000 },
  { contractNumber: "CT002", contractDate: "12-01-2026", seller: "Ankur Animal Feeds - Ahmedabad", buyer: "Venkatesh Iyer", commodity: "Maize", qty: 40, balanceQty: 25, rate: 18000 },
  { contractNumber: "CT003", contractDate: "15-01-2026", seller: "Blue Aqua Farms - Kochi", buyer: "Ramesh Gowda", commodity: "Soybean Meal", qty: 60, balanceQty: 0, rate: 32000 },
  { contractNumber: "CT004", contractDate: "18-01-2026", seller: "Green Valley Dairy - Pune", buyer: "Priya Sharma", commodity: "Wheat Bran", qty: 35, balanceQty: 25, rate: 12000 },
  { contractNumber: "CT005", contractDate: "20-01-2026", seller: "FairSquare Trading Pvt Ltd - Pune", buyer: "Anil Kapoor", commodity: "Rice DDGS", qty: 45, balanceQty: 25, rate: 25500 },
];

export const contractLookupRows: ContractLookupRow[] = rawContractLookupRows;

export function contractNetRate(rate: number): number {
  return Math.round(rate * (1 + GST_PERCENT / 100));
}

export { GST_PERCENT };

export const sellerPartyOptions = Array.from(new Set(contractLookupRows.map((row) => row.seller))).map(
  (value) => ({ value, label: value }),
);

export const buyerPartyOptions = Array.from(new Set(contractLookupRows.map((row) => row.buyer))).map(
  (value) => ({ value, label: value }),
);
