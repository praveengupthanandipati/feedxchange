// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export interface OverDuePayRow {
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
}

const rawRows = [
  { invoiceDate: "2026-04-01", invoiceNum: "INV1001", buyerName: "Sai Feeds Pvt Ltd", invoiceQty: 30.63, freight: 12000, invoiceAmount: 500000, paid: 414410, pendingAmount: 85590, sellerwiseTotalDue: 200000, dueDate: "2026-04-15", overDueDays: 5 },
  { invoiceDate: "2026-04-02", invoiceNum: "INV1002", buyerName: "Ankur Animal Feeds", invoiceQty: 25, freight: 10000, invoiceAmount: 400000, paid: 200000, pendingAmount: 200000, sellerwiseTotalDue: 150000, dueDate: "2026-04-16", overDueDays: 4 },
  { invoiceDate: "2026-04-03", invoiceNum: "INV1003", buyerName: "Blue Aqua Farms", invoiceQty: 40.12, freight: 15000, invoiceAmount: 600000, paid: 300000, pendingAmount: 300000, sellerwiseTotalDue: 250000, dueDate: "2026-04-17", overDueDays: 3 },
  { invoiceDate: "2026-04-04", invoiceNum: "INV1004", buyerName: "Green Valley Dairy", invoiceQty: 20, freight: 8000, invoiceAmount: 300000, paid: 100000, pendingAmount: 200000, sellerwiseTotalDue: 100000, dueDate: "2026-04-18", overDueDays: 2 },
  { invoiceDate: "2026-04-05", invoiceNum: "INV1005", buyerName: "Shree Animal Nutrition", invoiceQty: 35.5, freight: 13000, invoiceAmount: 550000, paid: 250000, pendingAmount: 300000, sellerwiseTotalDue: 180000, dueDate: "2026-04-19", overDueDays: 1 },
  { invoiceDate: "2026-04-06", invoiceNum: "INV1006", buyerName: "Farm Fresh Feeds", invoiceQty: 28.75, freight: 11000, invoiceAmount: 420000, paid: 150000, pendingAmount: 270000, sellerwiseTotalDue: 120000, dueDate: "2026-04-20", overDueDays: 0 },
  { invoiceDate: "2026-04-07", invoiceNum: "INV1007", buyerName: "FairSquare Trading Pvt Ltd", invoiceQty: 32.1, freight: 12500, invoiceAmount: 480000, paid: 280000, pendingAmount: 200000, sellerwiseTotalDue: 160000, dueDate: "2026-04-21", overDueDays: 0 },
  { invoiceDate: "2026-04-08", invoiceNum: "INV1008", buyerName: "Srinivasa Traders", invoiceQty: 22.9, freight: 9000, invoiceAmount: 350000, paid: 100000, pendingAmount: 250000, sellerwiseTotalDue: 110000, dueDate: "2026-04-22", overDueDays: 0 },
  { invoiceDate: "2026-04-09", invoiceNum: "INV1009", buyerName: "AgroStar Enterprises", invoiceQty: 38, freight: 14000, invoiceAmount: 570000, paid: 350000, pendingAmount: 220000, sellerwiseTotalDue: 190000, dueDate: "2026-04-23", overDueDays: 0 },
  { invoiceDate: "2026-04-10", invoiceNum: "INV1010", buyerName: "Sunrise Agro Solutions", invoiceQty: 27.45, freight: 10500, invoiceAmount: 410000, paid: 210000, pendingAmount: 200000, sellerwiseTotalDue: 130000, dueDate: "2026-04-24", overDueDays: 0 },
];

export const overDuePayRows: OverDuePayRow[] = rawRows.map((row) => ({
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
}));
