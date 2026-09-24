// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export interface PaymentSubEntry {
  id: string;
  towards: string;
  paymentOf: string;
  remarks: string;
}

export interface PaymentRow {
  id: string;
  sNo: number;
  entryDate: string;
  entryDateValue: number;
  refNo: string;
  buyer: string;
  payDate: string;
  payType: string;
  bankName: string;
  chequeNo: string;
  amountPaid: number;
  refund: number;
  usage: string;
  unAccount: number;
  entries: PaymentSubEntry[];
}

const rawRows = [
  {
    entryDate: "2026-04-01", refNo: "PR-1001", buyer: "Sai Feeds Pvt Ltd", payDate: "2026-04-02", payType: "Cheque", bankName: "State Bank of India", chequeNo: "123456", amountPaid: 500000, refund: 0, usage: "Invoice INV1001", unAccount: 0,
    entries: [
      { towards: "Invoice", paymentOf: "INV1001", remarks: "Full payment" },
      { towards: "Advance", paymentOf: "ADV2001", remarks: "Partial" },
      { towards: "Invoice", paymentOf: "INV1002", remarks: "Cleared" },
    ],
  },
  {
    entryDate: "2026-04-03", refNo: "PR-1002", buyer: "Ankur Animal Feeds", payDate: "2026-04-04", payType: "Online", bankName: "HDFC Bank", chequeNo: "-", amountPaid: 400000, refund: 0, usage: "Invoice INV1002", unAccount: 0,
    entries: [{ towards: "Invoice", paymentOf: "INV1002", remarks: "Full payment" }],
  },
  {
    entryDate: "2026-04-05", refNo: "PR-1003", buyer: "Blue Aqua Farms", payDate: "2026-04-06", payType: "Cheque", bankName: "ICICI Bank", chequeNo: "654321", amountPaid: 600000, refund: 10000, usage: "Invoice INV1003", unAccount: 5000,
    entries: [
      { towards: "Invoice", paymentOf: "INV1003", remarks: "Part payment" },
      { towards: "Refund", paymentOf: "REF3001", remarks: "Excess amount returned" },
    ],
  },
  {
    entryDate: "2026-04-07", refNo: "PR-1004", buyer: "Green Valley Dairy", payDate: "2026-04-08", payType: "Online", bankName: "Axis Bank", chequeNo: "-", amountPaid: 300000, refund: 0, usage: "Invoice INV1004", unAccount: 0,
    entries: [{ towards: "Invoice", paymentOf: "INV1004", remarks: "Full payment" }],
  },
  {
    entryDate: "2026-04-09", refNo: "PR-1005", buyer: "Shree Animal Nutrition", payDate: "2026-04-10", payType: "Cheque", bankName: "Punjab National Bank", chequeNo: "789012", amountPaid: 550000, refund: 5000, usage: "Invoice INV1005", unAccount: 2000,
    entries: [
      { towards: "Invoice", paymentOf: "INV1005", remarks: "Part payment" },
      { towards: "Advance", paymentOf: "ADV2002", remarks: "Pending adjustment" },
    ],
  },
  {
    entryDate: "2026-04-11", refNo: "PR-1006", buyer: "Farm Fresh Feeds", payDate: "2026-04-12", payType: "Online", bankName: "Bank of Baroda", chequeNo: "-", amountPaid: 420000, refund: 0, usage: "Invoice INV1006", unAccount: 0,
    entries: [{ towards: "Invoice", paymentOf: "INV1006", remarks: "Full payment" }],
  },
  {
    entryDate: "2026-04-13", refNo: "PR-1007", buyer: "FairSquare Trading Pvt Ltd", payDate: "2026-04-14", payType: "Cheque", bankName: "State Bank of India", chequeNo: "234567", amountPaid: 480000, refund: 0, usage: "Invoice INV1007", unAccount: 0,
    entries: [{ towards: "Invoice", paymentOf: "INV1007", remarks: "Full payment" }],
  },
  {
    entryDate: "2026-04-15", refNo: "PR-1008", buyer: "Srinivasa Traders", payDate: "2026-04-16", payType: "Online", bankName: "HDFC Bank", chequeNo: "-", amountPaid: 350000, refund: 0, usage: "Invoice INV1008", unAccount: 0,
    entries: [{ towards: "Invoice", paymentOf: "INV1008", remarks: "Full payment" }],
  },
  {
    entryDate: "2026-04-17", refNo: "PR-1009", buyer: "AgroStar Enterprises", payDate: "2026-04-18", payType: "Cheque", bankName: "ICICI Bank", chequeNo: "345678", amountPaid: 570000, refund: 0, usage: "Invoice INV1009", unAccount: 0,
    entries: [{ towards: "Invoice", paymentOf: "INV1009", remarks: "Full payment" }],
  },
  {
    entryDate: "2026-04-19", refNo: "PR-1010", buyer: "Sunrise Agro Solutions", payDate: "2026-04-20", payType: "Online", bankName: "Axis Bank", chequeNo: "-", amountPaid: 410000, refund: 0, usage: "Invoice INV1010", unAccount: 0,
    entries: [{ towards: "Invoice", paymentOf: "INV1010", remarks: "Full payment" }],
  },
];

export const paymentRows: PaymentRow[] = rawRows.map((row, index) => ({
  id: row.refNo,
  sNo: index + 1,
  entryDate: row.entryDate,
  entryDateValue: toTimestamp(row.entryDate),
  refNo: row.refNo,
  buyer: row.buyer,
  payDate: row.payDate,
  payType: row.payType,
  bankName: row.bankName,
  chequeNo: row.chequeNo,
  amountPaid: row.amountPaid,
  refund: row.refund,
  usage: row.usage,
  unAccount: row.unAccount,
  entries: row.entries.map((entry, entryIndex) => ({
    id: `${row.refNo}-${entryIndex + 1}`,
    ...entry,
  })),
}));
