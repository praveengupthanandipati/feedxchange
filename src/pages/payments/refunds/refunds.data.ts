// TODO: replace with real data once the payments API is wired up.

export type PayType = "Online" | "Cheque" | "Cash";

export const payTypes: PayType[] = ["Online", "Cheque", "Cash"];

export interface RefundRow {
  id: string;
  seller: string;
  buyer: string;
  /** ISO yyyy-mm-dd. */
  date: string;
  refNumber: string;
  payType: PayType;
  amountPaid: number;
  /** Positive: balance still to be refunded. Negative: excess refunded. */
  difference: number;
  remarks: string;
}

export interface RefundFormValues {
  date: string;
  refNumber: string;
  payType: PayType;
  amountPaid: string;
  difference: string;
  remarks: string;
}

export type RefundFormErrors = Partial<Record<keyof RefundFormValues, string>>;

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function todayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function emptyRefundForm(): RefundFormValues {
  return { date: todayInput(), refNumber: "", payType: "Online", amountPaid: "", difference: "0", remarks: "" };
}

export function refundToForm(row: RefundRow): RefundFormValues {
  return {
    date: row.date,
    refNumber: row.refNumber,
    payType: row.payType,
    amountPaid: String(row.amountPaid),
    difference: String(row.difference),
    remarks: row.remarks,
  };
}

export function validateRefundForm(values: RefundFormValues): RefundFormErrors {
  const errors: RefundFormErrors = {};
  if (!values.date) errors.date = "Required";
  if (!values.refNumber.trim()) errors.refNumber = "Required";
  if (!(Number(values.amountPaid) > 0)) errors.amountPaid = "Enter a valid amount";
  if (values.difference.trim() !== "" && Number.isNaN(Number(values.difference))) {
    errors.difference = "Enter a valid number";
  }
  return errors;
}

let refundSeq = 0;
export const nextRefundId = () => `refund-${Date.now()}-${refundSeq++}`;

export const sellerOptions = [
  { value: "Ankur Animal Feeds, Ahmedabad", label: "Ankur Animal Feeds, Ahmedabad" },
  { value: "Chatrai - Lakshmi Poultry Complex", label: "Chatrai - Lakshmi Poultry Complex" },
  { value: "Miryalguda - Rayapudi Agro Industries", label: "Miryalguda - Rayapudi Agro Industries" },
];

export const buyerOptions = [
  { value: "Green Valley Dairy, Pune", label: "Green Valley Dairy, Pune" },
  { value: "Blue Aqua Farms - Kochi", label: "Blue Aqua Farms - Kochi" },
  { value: "Miryalguda - Rayapudi Agro Industries", label: "Miryalguda - Rayapudi Agro Industries" },
];

export const defaultSeller = sellerOptions[0].value;
export const defaultBuyer = buyerOptions[0].value;

function refund(
  n: number,
  date: string,
  refNumber: string,
  payType: PayType,
  amountPaid: number,
  difference: number,
  remarks: string,
  seller = defaultSeller,
  buyer = defaultBuyer,
): RefundRow {
  return { id: `refund-seed-${n}`, seller, buyer, date, refNumber, payType, amountPaid, difference, remarks };
}

export const seedRefundRows: RefundRow[] = [
  refund(1, "2026-01-05", "REF-2026-001", "Online", 50000, 5000, "Partial refund processed"),
  refund(2, "2026-01-04", "REF-2026-002", "Cheque", 75000, -2000, "Full refund completed"),
  refund(3, "2026-01-03", "REF-2026-003", "Cash", 30000, 0, "Refund settled"),
  refund(4, "2026-01-02", "REF-2026-004", "Online", 100000, 10000, "Refund in progress"),
  refund(5, "2026-01-01", "REF-2026-005", "Cheque", 45000, -1500, "Adjusted refund"),
  refund(6, "2025-12-30", "REF-2025-150", "Online", 85000, 3000, "Refund pending verification"),
  refund(7, "2025-12-29", "REF-2025-149", "Cash", 60000, 0, "Completed successfully"),
  refund(8, "2025-12-28", "REF-2025-148", "Online", 95000, -5000, "Excess refund adjusted"),
  refund(9, "2026-01-06", "REF-2026-006", "Cheque", 20000, 1500, "Advance returned", sellerOptions[1].value, buyerOptions[1].value),
  refund(10, "2025-12-27", "REF-2025-147", "Online", 35000, 0, "Refund settled", sellerOptions[1].value, buyerOptions[1].value),
];
