// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export interface PaymentLineItem {
  id: string;
  sNo: number;
  invoiceDate: string;
  invoiceNo: string;
  truckNo: string;
  bags: number;
  qty: string;
  freight: number;
  deduction: number;
  invoiceAmount: number;
  pendingAmount: number;
  totalPendingOfContract: number;
}

export interface PendingPaymentRow {
  id: string;
  invoiceDate: string;
  invoiceDateValue: number;
  invoiceNum: string;
  buyerName: string;
  invoiceQty: number;
  freight: number;
  invoiceAmount: number;
  paid: number;
  pendingAmount: number;
  sellerwiseTotalDue: number;
  dueDate: string;
  dueDateValue: number;
  overDueDays: number;
  paymentDetails: PaymentLineItem[];
}

const rawRows = [
  {
    invoiceDate: "2026-04-01", invoiceNum: "INV1001", buyerName: "Sai Feeds Pvt Ltd", invoiceQty: 30.63, freight: 12000, invoiceAmount: 500000, paid: 414410, pendingAmount: 85590, sellerwiseTotalDue: 200000, dueDate: "2026-04-15", overDueDays: 5,
    paymentDetails: [
      { invoiceDate: "2026-04-11", invoiceNo: "INV-001", truckNo: "AP16AB1234", bags: 200, qty: "10 MT", freight: 2000, deduction: 500, invoiceAmount: 320000, pendingAmount: 20000, totalPendingOfContract: 100000 },
      { invoiceDate: "2026-04-12", invoiceNo: "INV-002", truckNo: "AP16AB5678", bags: 180, qty: "9 MT", freight: 1800, deduction: 400, invoiceAmount: 290000, pendingAmount: 15000, totalPendingOfContract: 85000 },
    ],
  },
  {
    invoiceDate: "2026-04-02", invoiceNum: "INV1002", buyerName: "Ankur Animal Feeds", invoiceQty: 25, freight: 10000, invoiceAmount: 400000, paid: 200000, pendingAmount: 200000, sellerwiseTotalDue: 150000, dueDate: "2026-04-16", overDueDays: 4,
    paymentDetails: [
      { invoiceDate: "2026-04-13", invoiceNo: "INV-003", truckNo: "TS09FB3345", bags: 250, qty: "12.5 MT", freight: 1600, deduction: 300, invoiceAmount: 200000, pendingAmount: 40000, totalPendingOfContract: 150000 },
    ],
  },
  {
    invoiceDate: "2026-04-03", invoiceNum: "INV1003", buyerName: "Blue Aqua Farms", invoiceQty: 40.12, freight: 15000, invoiceAmount: 600000, paid: 300000, pendingAmount: 300000, sellerwiseTotalDue: 250000, dueDate: "2026-04-17", overDueDays: 3,
    paymentDetails: [
      { invoiceDate: "2026-04-14", invoiceNo: "INV-004", truckNo: "AP07TB6612", bags: 400, qty: "20 MT", freight: 2500, deduction: 450, invoiceAmount: 300000, pendingAmount: 60000, totalPendingOfContract: 250000 },
    ],
  },
  {
    invoiceDate: "2026-04-04", invoiceNum: "INV1004", buyerName: "Green Valley Dairy", invoiceQty: 20, freight: 8000, invoiceAmount: 300000, paid: 100000, pendingAmount: 200000, sellerwiseTotalDue: 100000, dueDate: "2026-04-18", overDueDays: 2,
    paymentDetails: [
      { invoiceDate: "2026-04-15", invoiceNo: "INV-005", truckNo: "AP16TA9021", bags: 200, qty: "10 MT", freight: 1400, deduction: 250, invoiceAmount: 150000, pendingAmount: 50000, totalPendingOfContract: 100000 },
    ],
  },
  {
    invoiceDate: "2026-04-05", invoiceNum: "INV1005", buyerName: "Shree Animal Nutrition", invoiceQty: 35.5, freight: 13000, invoiceAmount: 550000, paid: 250000, pendingAmount: 300000, sellerwiseTotalDue: 180000, dueDate: "2026-04-19", overDueDays: 1,
    paymentDetails: [
      { invoiceDate: "2026-04-16", invoiceNo: "INV-006", truckNo: "TS27C512", bags: 350, qty: "17.5 MT", freight: 2200, deduction: 400, invoiceAmount: 275000, pendingAmount: 75000, totalPendingOfContract: 180000 },
    ],
  },
  {
    invoiceDate: "2026-04-06", invoiceNum: "INV1006", buyerName: "Farm Fresh Feeds", invoiceQty: 28.75, freight: 11000, invoiceAmount: 420000, paid: 150000, pendingAmount: 270000, sellerwiseTotalDue: 120000, dueDate: "2026-04-20", overDueDays: 0,
    paymentDetails: [
      { invoiceDate: "2026-04-17", invoiceNo: "INV-007", truckNo: "AP16AB1234", bags: 280, qty: "14 MT", freight: 1900, deduction: 350, invoiceAmount: 210000, pendingAmount: 60000, totalPendingOfContract: 120000 },
    ],
  },
  {
    invoiceDate: "2026-04-07", invoiceNum: "INV1007", buyerName: "FairSquare Trading Pvt Ltd", invoiceQty: 32.1, freight: 12500, invoiceAmount: 480000, paid: 280000, pendingAmount: 200000, sellerwiseTotalDue: 160000, dueDate: "2026-04-21", overDueDays: 0,
    paymentDetails: [
      { invoiceDate: "2026-04-18", invoiceNo: "INV-008", truckNo: "TS09FB3345", bags: 320, qty: "16 MT", freight: 2100, deduction: 380, invoiceAmount: 240000, pendingAmount: 70000, totalPendingOfContract: 160000 },
    ],
  },
  {
    invoiceDate: "2026-04-08", invoiceNum: "INV1008", buyerName: "Srinivasa Traders", invoiceQty: 22.9, freight: 9000, invoiceAmount: 350000, paid: 100000, pendingAmount: 250000, sellerwiseTotalDue: 110000, dueDate: "2026-04-22", overDueDays: 0,
    paymentDetails: [
      { invoiceDate: "2026-04-19", invoiceNo: "INV-009", truckNo: "AP07TB6612", bags: 230, qty: "11.5 MT", freight: 1500, deduction: 280, invoiceAmount: 175000, pendingAmount: 50000, totalPendingOfContract: 110000 },
    ],
  },
  {
    invoiceDate: "2026-04-09", invoiceNum: "INV1009", buyerName: "AgroStar Enterprises", invoiceQty: 38, freight: 14000, invoiceAmount: 570000, paid: 350000, pendingAmount: 220000, sellerwiseTotalDue: 190000, dueDate: "2026-04-23", overDueDays: 0,
    paymentDetails: [
      { invoiceDate: "2026-04-20", invoiceNo: "INV-010", truckNo: "AP16TA9021", bags: 380, qty: "19 MT", freight: 2400, deduction: 420, invoiceAmount: 285000, pendingAmount: 80000, totalPendingOfContract: 190000 },
    ],
  },
  {
    invoiceDate: "2026-04-10", invoiceNum: "INV1010", buyerName: "Sunrise Agro Solutions", invoiceQty: 27.45, freight: 10500, invoiceAmount: 410000, paid: 210000, pendingAmount: 200000, sellerwiseTotalDue: 130000, dueDate: "2026-04-24", overDueDays: 0,
    paymentDetails: [
      { invoiceDate: "2026-04-21", invoiceNo: "INV-011", truckNo: "TS27C512", bags: 270, qty: "13.5 MT", freight: 1700, deduction: 300, invoiceAmount: 205000, pendingAmount: 55000, totalPendingOfContract: 130000 },
    ],
  },
];

export const pendingPaymentRows: PendingPaymentRow[] = rawRows.map((row) => ({
  id: row.invoiceNum,
  invoiceDate: row.invoiceDate,
  invoiceDateValue: toTimestamp(row.invoiceDate),
  invoiceNum: row.invoiceNum,
  buyerName: row.buyerName,
  invoiceQty: row.invoiceQty,
  freight: row.freight,
  invoiceAmount: row.invoiceAmount,
  paid: row.paid,
  pendingAmount: row.pendingAmount,
  sellerwiseTotalDue: row.sellerwiseTotalDue,
  dueDate: row.dueDate,
  dueDateValue: toTimestamp(row.dueDate),
  overDueDays: row.overDueDays,
  paymentDetails: row.paymentDetails.map((item, index) => ({
    id: `${row.invoiceNum}-${item.invoiceNo}`,
    sNo: index + 1,
    ...item,
  })),
}));
