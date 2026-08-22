// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export const defaultSeller = "Ankur Animal Feeds, Ahmedabad";
export const defaultBuyer = "Green Valley Dairy, Pune";

export const paymentTypeOptions = [
  { value: "all", label: "All Payments" },
  { value: "overdue", label: "Overdue Payments" },
  { value: "on-time", label: "On-Time Payments" },
];

export const filterTypeOptions = [
  { value: "all", label: "All Balances" },
  { value: "high-balance", label: "High Balance (>= 20,000)" },
  { value: "low-balance", label: "Low Balance (< 20,000)" },
];

export interface DeductionItem {
  id: string;
  sNo: number;
  date: string;
  remarks: string;
  amount: number;
}

export interface InvoiceDetail {
  contractNumber: string;
  entryDate: string;
  entryBy: string;
  invoiceNo: string;
  invoiceDate: string;
  seller: string;
  buyer: string;
  truckNo: string;
  noOfBags: number;
  invoiceQuantity: number;
  invoiceRatePerMt: number;
  freight: number;
  invoiceAmount: number;
  remarks: string;
  contractQuantity: number;
  remainingSupplyQuantity: number;
  deductions: DeductionItem[];
}

export interface PendingPaymentRow {
  id: string;
  invoiceNum: string;
  invoiceDate: string;
  invoiceDateValue: number;
  buyerName: string;
  invoiceAmount: number;
  paidAmount: number;
  balance: number;
  overDueDays: number;
  detail: InvoiceDetail;
}

const rawRows = [
  {
    invoiceNum: "INV-1001", invoiceDate: "2026-04-01", buyerName: "Green Valley Dairy, Pune",
    invoiceAmount: 120000, paidAmount: 100000, overDueDays: 5,
    detail: {
      contractNumber: "5043", entryDate: "2026-04-01", entryBy: "787", invoiceNo: "2526/29", invoiceDate: "2026-04-01",
      truckNo: "TG05T9459", noOfBags: 640, invoiceQuantity: 35.28, invoiceRatePerMt: 16600, freight: 0,
      remarks: "No Data", contractQuantity: 400, remainingSupplyQuantity: -6.73,
      deductions: [
        { date: "2026-04-01", remarks: "TDS", amount: 1000 },
        { date: "2026-04-01", remarks: "Weighment Loss", amount: 450 },
        { date: "2026-04-01", remarks: "Quality Cut", amount: 800 },
        { date: "2026-04-02", remarks: "Broken Bags", amount: 300 },
        { date: "2026-04-02", remarks: "Moisture Deduction", amount: 600 },
        { date: "2026-04-02", remarks: "Transport Damage", amount: 250 },
        { date: "2026-04-03", remarks: "Short Weight", amount: 500 },
        { date: "2026-04-03", remarks: "Rebate", amount: 350 },
        { date: "2026-04-03", remarks: "Late Delivery Penalty", amount: 700 },
        { date: "2026-04-04", remarks: "Sample Testing Fee", amount: 150 },
        { date: "2026-04-04", remarks: "Handling Charges", amount: 400 },
      ],
    },
  },
  {
    invoiceNum: "INV-1002", invoiceDate: "2026-04-03", buyerName: "Ankur Animal Feeds, Ahmedabad",
    invoiceAmount: 250000, paidAmount: 200000, overDueDays: 2,
    detail: {
      contractNumber: "5044", entryDate: "2026-04-03", entryBy: "787", invoiceNo: "2526/30", invoiceDate: "2026-04-03",
      truckNo: "TS09FB3345", noOfBags: 1200, invoiceQuantity: 60, invoiceRatePerMt: 16800, freight: 4000,
      remarks: "No Data", contractQuantity: 700, remainingSupplyQuantity: 12.5,
      deductions: [{ date: "2026-04-03", remarks: "TDS", amount: 2500 }],
    },
  },
  {
    invoiceNum: "INV-1003", invoiceDate: "2026-04-05", buyerName: "Blue Aqua Farms, Hyderabad",
    invoiceAmount: 80000, paidAmount: 60000, overDueDays: 0,
    detail: {
      contractNumber: "5045", entryDate: "2026-04-05", entryBy: "412", invoiceNo: "2526/31", invoiceDate: "2026-04-05",
      truckNo: "AP07TB6612", noOfBags: 380, invoiceQuantity: 19, invoiceRatePerMt: 16800, freight: 0,
      remarks: "No Data", contractQuantity: 150, remainingSupplyQuantity: 4.2,
      deductions: [],
    },
  },
  {
    invoiceNum: "INV-1004", invoiceDate: "2026-04-07", buyerName: "Sai Feeds Pvt Ltd, Mumbai",
    invoiceAmount: 300000, paidAmount: 250000, overDueDays: 10,
    detail: {
      contractNumber: "5046", entryDate: "2026-04-07", entryBy: "787", invoiceNo: "2526/32", invoiceDate: "2026-04-07",
      truckNo: "AP16TA9021", noOfBags: 1400, invoiceQuantity: 70, invoiceRatePerMt: 16500, freight: 5500,
      remarks: "No Data", contractQuantity: 800, remainingSupplyQuantity: 20.4,
      deductions: [
        { date: "2026-04-07", remarks: "TDS", amount: 3000 },
        { date: "2026-04-08", remarks: "Quality Cut", amount: 1500 },
      ],
    },
  },
  {
    invoiceNum: "INV-1005", invoiceDate: "2026-04-10", buyerName: "Ramesh Agro, Delhi",
    invoiceAmount: 110000, paidAmount: 100000, overDueDays: 1,
    detail: {
      contractNumber: "5047", entryDate: "2026-04-10", entryBy: "412", invoiceNo: "2526/33", invoiceDate: "2026-04-10",
      truckNo: "TS27C512", noOfBags: 520, invoiceQuantity: 26, invoiceRatePerMt: 16900, freight: 1200,
      remarks: "No Data", contractQuantity: 300, remainingSupplyQuantity: 8.1,
      deductions: [{ date: "2026-04-10", remarks: "TDS", amount: 1100 }],
    },
  },
  {
    invoiceNum: "INV-1006", invoiceDate: "2026-04-11", buyerName: "Sunrise Foods, Chennai",
    invoiceAmount: 210000, paidAmount: 200000, overDueDays: 3,
    detail: {
      contractNumber: "5048", entryDate: "2026-04-11", entryBy: "787", invoiceNo: "2526/34", invoiceDate: "2026-04-11",
      truckNo: "AP16AB1234", noOfBags: 980, invoiceQuantity: 49, invoiceRatePerMt: 16700, freight: 3200,
      remarks: "No Data", contractQuantity: 600, remainingSupplyQuantity: -3.5,
      deductions: [{ date: "2026-04-11", remarks: "TDS", amount: 2100 }],
    },
  },
  {
    invoiceNum: "INV-1007", invoiceDate: "2026-04-12", buyerName: "Fresh Farms, Kolkata",
    invoiceAmount: 90000, paidAmount: 80000, overDueDays: 0,
    detail: {
      contractNumber: "5049", entryDate: "2026-04-12", entryBy: "412", invoiceNo: "2526/35", invoiceDate: "2026-04-12",
      truckNo: "AP07TB6612", noOfBags: 420, invoiceQuantity: 21, invoiceRatePerMt: 16600, freight: 0,
      remarks: "No Data", contractQuantity: 200, remainingSupplyQuantity: 1.8,
      deductions: [],
    },
  },
  {
    invoiceNum: "INV-1008", invoiceDate: "2026-04-13", buyerName: "Agro India, Lucknow",
    invoiceAmount: 170000, paidAmount: 150000, overDueDays: 7,
    detail: {
      contractNumber: "5050", entryDate: "2026-04-13", entryBy: "787", invoiceNo: "2526/36", invoiceDate: "2026-04-13",
      truckNo: "TG05T9459", noOfBags: 800, invoiceQuantity: 40, invoiceRatePerMt: 16750, freight: 2800,
      remarks: "No Data", contractQuantity: 450, remainingSupplyQuantity: 6.9,
      deductions: [{ date: "2026-04-13", remarks: "TDS", amount: 1700 }],
    },
  },
  {
    invoiceNum: "INV-1009", invoiceDate: "2026-04-14", buyerName: "Shree Feeds, Jaipur",
    invoiceAmount: 280000, paidAmount: 260000, overDueDays: 1,
    detail: {
      contractNumber: "5051", entryDate: "2026-04-14", entryBy: "412", invoiceNo: "2526/37", invoiceDate: "2026-04-14",
      truckNo: "TS09FB3345", noOfBags: 1300, invoiceQuantity: 65, invoiceRatePerMt: 16650, freight: 4800,
      remarks: "No Data", contractQuantity: 750, remainingSupplyQuantity: 14.6,
      deductions: [{ date: "2026-04-14", remarks: "TDS", amount: 2800 }],
    },
  },
  {
    invoiceNum: "INV-1010", invoiceDate: "2026-04-15", buyerName: "Farm Fresh, Surat",
    invoiceAmount: 160000, paidAmount: 140000, overDueDays: 4,
    detail: {
      contractNumber: "5052", entryDate: "2026-04-15", entryBy: "787", invoiceNo: "2526/38", invoiceDate: "2026-04-15",
      truckNo: "AP16TA9021", noOfBags: 750, invoiceQuantity: 37.5, invoiceRatePerMt: 16600, freight: 2500,
      remarks: "No Data", contractQuantity: 400, remainingSupplyQuantity: -2.1,
      deductions: [{ date: "2026-04-15", remarks: "TDS", amount: 1600 }],
    },
  },
];

export const pendingPaymentRows: PendingPaymentRow[] = rawRows.map((row) => ({
  id: row.invoiceNum,
  invoiceNum: row.invoiceNum,
  invoiceDate: row.invoiceDate,
  invoiceDateValue: toTimestamp(row.invoiceDate),
  buyerName: row.buyerName,
  invoiceAmount: row.invoiceAmount,
  paidAmount: row.paidAmount,
  balance: row.invoiceAmount - row.paidAmount,
  overDueDays: row.overDueDays,
  detail: {
    contractNumber: row.detail.contractNumber,
    entryDate: row.detail.entryDate,
    entryBy: row.detail.entryBy,
    invoiceNo: row.detail.invoiceNo,
    invoiceDate: row.detail.invoiceDate,
    seller: defaultSeller,
    buyer: row.buyerName,
    truckNo: row.detail.truckNo,
    noOfBags: row.detail.noOfBags,
    invoiceQuantity: row.detail.invoiceQuantity,
    invoiceRatePerMt: row.detail.invoiceRatePerMt,
    freight: row.detail.freight,
    invoiceAmount: row.invoiceAmount,
    remarks: row.detail.remarks,
    contractQuantity: row.detail.contractQuantity,
    remainingSupplyQuantity: row.detail.remainingSupplyQuantity,
    deductions: row.detail.deductions.map((item, index) => ({
      id: `${row.invoiceNum}-deduction-${index + 1}`,
      sNo: index + 1,
      ...item,
    })),
  },
}));

export interface BuyerSummaryRow {
  id: string;
  buyerName: string;
  balanceAmount: number;
  invoiceCount: number;
}

export function buildBuyerSummaryRows(rows: PendingPaymentRow[]): BuyerSummaryRow[] {
  const byBuyer = new Map<string, BuyerSummaryRow>();
  rows.forEach((row) => {
    const existing = byBuyer.get(row.buyerName);
    if (existing) {
      existing.balanceAmount += row.balance;
      existing.invoiceCount += 1;
    } else {
      byBuyer.set(row.buyerName, {
        id: row.buyerName,
        buyerName: row.buyerName,
        balanceAmount: row.balance,
        invoiceCount: 1,
      });
    }
  });
  return Array.from(byBuyer.values());
}
