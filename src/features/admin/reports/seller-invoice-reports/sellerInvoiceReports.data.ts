// TODO: replace with real data once the reports API is wired up.

export interface SellerInvoiceRow {
  id: string;
  sNo: number;
  contractNumber: string;
  invDate: string;
  invDateValue: number;
  invQty: string;
  invQtyValue: number;
  balQty: string;
  balQtyValue: number;
  bags: number;
  freight: string;
  freightValue: number;
  invAmount: string;
  invAmountValue: number;
  netAmount: string;
  netAmountValue: number;
}

function toTimestamp(ddMmYyyy: string): number {
  const [day, month, year] = ddMmYyyy.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

const rawRows = [
  { contractNumber: "CT001", invDate: "15-01-2026", invQty: 25, balQty: 5, bags: 500, freight: 15000, invAmount: 625000 },
  { contractNumber: "CT002", invDate: "16-01-2026", invQty: 30, balQty: 0, bags: 600, freight: 18000, invAmount: 750000 },
  { contractNumber: "CT003", invDate: "17-01-2026", invQty: 20, balQty: 10, bags: 400, freight: 12000, invAmount: 500000 },
  { contractNumber: "CT004", invDate: "18-01-2026", invQty: 35, balQty: 0, bags: 700, freight: 21000, invAmount: 875000 },
  { contractNumber: "CT005", invDate: "19-01-2026", invQty: 28, balQty: 2, bags: 560, freight: 16800, invAmount: 700000 },
  { contractNumber: "CT006", invDate: "20-01-2026", invQty: 22, balQty: 8, bags: 440, freight: 13200, invAmount: 550000 },
  { contractNumber: "CT007", invDate: "21-01-2026", invQty: 32, balQty: 0, bags: 640, freight: 19200, invAmount: 800000 },
  { contractNumber: "CT008", invDate: "22-01-2026", invQty: 26, balQty: 4, bags: 520, freight: 15600, invAmount: 650000 },
  { contractNumber: "CT009", invDate: "23-01-2026", invQty: 29, balQty: 1, bags: 580, freight: 17400, invAmount: 725000 },
  { contractNumber: "CT010", invDate: "24-01-2026", invQty: 24, balQty: 6, bags: 480, freight: 14400, invAmount: 600000 },
];

export const sellerInvoiceRows: SellerInvoiceRow[] = rawRows.map((row, index) => {
  const netAmountValue = row.freight + row.invAmount;
  return {
    id: row.contractNumber,
    sNo: index + 1,
    contractNumber: row.contractNumber,
    invDate: row.invDate,
    invDateValue: toTimestamp(row.invDate),
    invQty: `${row.invQty} MT`,
    invQtyValue: row.invQty,
    balQty: `${row.balQty} MT`,
    balQtyValue: row.balQty,
    bags: row.bags,
    freight: money(row.freight),
    freightValue: row.freight,
    invAmount: money(row.invAmount),
    invAmountValue: row.invAmount,
    netAmount: money(netAmountValue),
    netAmountValue: netAmountValue,
  };
});

export const sellerOptions = [
  { value: "Sai Feeds Pvt Ltd - Mumbai", label: "Sai Feeds Pvt Ltd - Mumbai" },
  { value: "Ankur Animal Feeds, Ahmedabad", label: "Ankur Animal Feeds, Ahmedabad" },
  { value: "Chatrai - Lakshmi Poultry", label: "Chatrai - Lakshmi Poultry" },
  { value: "Miryalguda - Rayapudi Agro", label: "Miryalguda - Rayapudi Agro" },
];

export const buyerOptions = [
  { value: "Venkatesh Iyer Krishnamurthy - Chennai", label: "Venkatesh Iyer Krishnamurthy - Chennai" },
  { value: "Green Valley Dairy, Pune", label: "Green Valley Dairy, Pune" },
  { value: "Tadepalligudem - SL Traders", label: "Tadepalligudem - SL Traders" },
  { value: "Mudinepalli - Purnima Feeds", label: "Mudinepalli - Purnima Feeds" },
];

export const financialYearOptions = [
  { value: "2026-27", label: "2026-27" },
  { value: "2025-26", label: "2025-26" },
  { value: "2024-25", label: "2024-25" },
];

export const contractOptions = sellerInvoiceRows.map((row) => ({
  value: row.contractNumber,
  label: row.contractNumber,
}));

export interface ReportPartySummary {
  sellerName: string;
  buyerName: string;
}

export const reportPartySummary: ReportPartySummary = {
  sellerName: "Ankur Animal Feeds, Ahmedabad",
  buyerName: "Green Valley Dairy, Pune",
};
