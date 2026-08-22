// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export interface StatementRow {
  id: string;
  date: string;
  dateValue: number;
  narration: string;
  qtyRateFreight: string;
  purchase: number | null;
  payment: number | null;
  balance: number;
}

export const statementRows: StatementRow[] = [
  {
    id: "S1",
    date: "2026-04-01",
    dateValue: toTimestamp("2026-04-01"),
    narration: "Purchase of DORB @ 16600 with F.O.R against Invoice No:2526/29 (TG05T9459)",
    qtyRateFreight: "( 585648 - 0 )",
    purchase: 585648,
    payment: null,
    balance: 585648,
  },
  {
    id: "S2",
    date: "2026-04-03",
    dateValue: toTimestamp("2026-04-03"),
    narration: "Payment by NEFT Ref: 1234567890",
    qtyRateFreight: "-",
    purchase: null,
    payment: 200000,
    balance: 385648,
  },
  {
    id: "S3",
    date: "2026-04-05",
    dateValue: toTimestamp("2026-04-05"),
    narration: "Purchase of GN Cake @ 32000 with Ex-Loading against Invoice No:2530/12 (AP16AB1234)",
    qtyRateFreight: "( 320000 - 0 )",
    purchase: 320000,
    payment: null,
    balance: 705648,
  },
  {
    id: "S4",
    date: "2026-04-07",
    dateValue: toTimestamp("2026-04-07"),
    narration: "Payment by RTGS Ref: 9876543210",
    qtyRateFreight: "-",
    purchase: null,
    payment: 100000,
    balance: 605648,
  },
  {
    id: "S5",
    date: "2026-04-10",
    dateValue: toTimestamp("2026-04-10"),
    narration: "Purchase of Maize DDGS @ 18500 with F.O.R against Invoice No:2535/07 (AP16AB5678)",
    qtyRateFreight: "( 185000 - 0 )",
    purchase: 185000,
    payment: null,
    balance: 790648,
  },
  {
    id: "S6",
    date: "2026-04-12",
    dateValue: toTimestamp("2026-04-12"),
    narration: "Purchase of Cottonseed Meal @ 28000 with F.O.R against Invoice No:2540/15 (AP16AB9012)",
    qtyRateFreight: "( 280000 - 0 )",
    purchase: 280000,
    payment: null,
    balance: 1070648,
  },
  {
    id: "S7",
    date: "2026-04-14",
    dateValue: toTimestamp("2026-04-14"),
    narration: "Payment by NEFT Ref: 1234567891",
    qtyRateFreight: "-",
    purchase: null,
    payment: 150000,
    balance: 920648,
  },
  {
    id: "S8",
    date: "2026-04-16",
    dateValue: toTimestamp("2026-04-16"),
    narration: "Purchase of Wheat Bran @ 14000 with Ex-Loading against Invoice No:2545/09 (TS09FB3345)",
    qtyRateFreight: "( 140000 - 0 )",
    purchase: 140000,
    payment: null,
    balance: 1060648,
  },
  {
    id: "S9",
    date: "2026-04-18",
    dateValue: toTimestamp("2026-04-18"),
    narration: "Payment by RTGS Ref: 9876543211",
    qtyRateFreight: "-",
    purchase: null,
    payment: 100000,
    balance: 960648,
  },
  {
    id: "S10",
    date: "2026-04-20",
    dateValue: toTimestamp("2026-04-20"),
    narration: "Purchase of Rice Bran @ 16800 with F.O.R against Invoice No:2550/03 (AP07TB6612)",
    qtyRateFreight: "( 168000 - 0 )",
    purchase: 168000,
    payment: null,
    balance: 1128648,
  },
];

export const accountSummaryTotals = {
  totalPurchase: 1250000,
  payments: 800000,
  balance: 450000,
};

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
