export interface InvoicePayment {
  /** yyyy-mm-dd */
  date: string;
  paymentType: "Cheque" | "NEFT" | "RTGS" | "UPI";
  bankName: string;
  chequeNo: string;
  amount: number;
}

export interface InterestInvoice {
  id: string;
  seller: string;
  buyer: string;
  /** All dates yyyy-mm-dd */
  contractDate: string;
  contractNo: string;
  invoiceDate: string;
  invoiceNo: string;
  invoiceAmount: number;
  paymentDueDate: string;
  /** Grace days allowed before interest starts. */
  grace: number;
  payments: InvoicePayment[];
}

export const DEFAULT_INTEREST_RATE = 18;

export const PAYMENT_DUE_DAY_OPTIONS = [7, 15, 30, 45, 60, 90];

// TODO: replace with the interest calculation API once it is available.
export const interestInvoices: InterestInvoice[] = [
  {
    id: "1", seller: "Adilabad - KK Proteins Pvt Ltd", buyer: "Gunnampalli - Srinidhi Feeds Pvt Ltd",
    contractDate: "2025-06-24", contractNo: "CON-001", invoiceDate: "2025-06-25", invoiceNo: "INV-001", invoiceAmount: 410000,
    paymentDueDate: "2025-06-30", grace: 15,
    payments: [
      { date: "2025-07-10", paymentType: "Cheque", bankName: "SBI", chequeNo: "CHQ-1001", amount: 200000 },
      { date: "2025-07-15", paymentType: "NEFT", bankName: "HDFC", chequeNo: "", amount: 200000 },
    ],
  },
  {
    id: "2", seller: "Adilabad - KK Proteins Pvt Ltd", buyer: "Gunnampalli - Srinidhi Feeds Pvt Ltd",
    contractDate: "2025-06-24", contractNo: "CON-002", invoiceDate: "2025-06-26", invoiceNo: "INV-002", invoiceAmount: 320000,
    paymentDueDate: "2025-07-06", grace: 14,
    payments: [
      { date: "2025-07-15", paymentType: "Cheque", bankName: "ICICI", chequeNo: "CHQ-2001", amount: 160000 },
      { date: "2025-07-21", paymentType: "Cheque", bankName: "ICICI", chequeNo: "CHQ-2002", amount: 160000 },
    ],
  },
  {
    id: "3", seller: "Adilabad - KK Proteins Pvt Ltd", buyer: "Gunnampalli - Srinidhi Feeds Pvt Ltd",
    contractDate: "2025-06-24", contractNo: "CON-003", invoiceDate: "2025-06-27", invoiceNo: "INV-003", invoiceAmount: 250000,
    paymentDueDate: "2025-06-30", grace: 15,
    payments: [{ date: "2025-07-15", paymentType: "RTGS", bankName: "Axis", chequeNo: "", amount: 250000 }],
  },
  {
    id: "4", seller: "Adilabad - KK Proteins Pvt Ltd", buyer: "Gunnampalli - Srinidhi Feeds Pvt Ltd",
    contractDate: "2025-07-02", contractNo: "CON-004", invoiceDate: "2025-07-03", invoiceNo: "INV-004", invoiceAmount: 180000,
    paymentDueDate: "2025-07-18", grace: 10,
    payments: [
      { date: "2025-08-05", paymentType: "UPI", bankName: "SBI", chequeNo: "", amount: 100000 },
      { date: "2025-08-12", paymentType: "Cheque", bankName: "SBI", chequeNo: "CHQ-1045", amount: 80000 },
    ],
  },
  {
    id: "5", seller: "Tanuku - Sai Feeds Pvt Ltd", buyer: "Hyderabad - Godrej Agrovet",
    contractDate: "2025-07-05", contractNo: "CON-005", invoiceDate: "2025-07-06", invoiceNo: "INV-005", invoiceAmount: 560000,
    paymentDueDate: "2025-07-21", grace: 7,
    payments: [{ date: "2025-08-20", paymentType: "NEFT", bankName: "HDFC", chequeNo: "", amount: 560000 }],
  },
  {
    id: "6", seller: "Tanuku - Sai Feeds Pvt Ltd", buyer: "Hyderabad - Godrej Agrovet",
    contractDate: "2025-07-08", contractNo: "CON-006", invoiceDate: "2025-07-10", invoiceNo: "INV-006", invoiceAmount: 275000,
    paymentDueDate: "2025-07-17", grace: 5,
    payments: [{ date: "2025-07-28", paymentType: "Cheque", bankName: "Canara", chequeNo: "CHQ-3301", amount: 275000 }],
  },
];
