// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export interface ContractSupplyRow {
  id: string;
  date: string;
  invoice: string;
  qty: string;
  truck: string;
  remarks: string;
}

export interface ContractStatusRow {
  id: string;
  contractDt: string;
  contractDtValue: number;
  contractNumber: string;
  seller: string;
  buyer: string;
  product: string;
  qty: string;
  qtyValue: number;
  rate: number;
  gstPercent: number;
  netRate: number;
  balQty: string;
  deliveryType: string;
  contractType: string;
  supplies: ContractSupplyRow[];
}

export const filterOptions = [
  { value: "All", label: "All" },
  { value: "100% Advance", label: "100% Advance" },
  { value: "Part Advance", label: "Part Advance" },
  { value: "Credits", label: "Credits" },
  { value: "Seller", label: "Seller" },
  { value: "Buyer", label: "Buyer" },
  { value: "Both", label: "Both" },
];

export const contractStatusRows: ContractStatusRow[] = [
  {
    id: "CT001",
    contractDt: "2026-04-01",
    contractDtValue: toTimestamp("2026-04-01"),
    contractNumber: "CT001",
    seller: "Sai Feeds Pvt Ltd",
    buyer: "Rajesh Kumar",
    product: "Soybean Meal",
    qty: "100 MT",
    qtyValue: 100,
    rate: 32000,
    gstPercent: 5,
    netRate: 33600,
    balQty: "40 MT",
    deliveryType: "F.O.R",
    contractType: "Credit",
    supplies: [
      { id: "CT001-S1", date: "2026-04-01", invoice: "INV1001", qty: "10 MT", truck: "AP16AB1234", remarks: "On time" },
      { id: "CT001-S2", date: "2026-04-02", invoice: "INV1002", qty: "8 MT", truck: "AP16AB5678", remarks: "Partial" },
    ],
  },
  {
    id: "CT002",
    contractDt: "2026-04-02",
    contractDtValue: toTimestamp("2026-04-02"),
    contractNumber: "CT002",
    seller: "Ankur Animal Feeds",
    buyer: "Venkatesh Iyer",
    product: "Corn",
    qty: "200 MT",
    qtyValue: 200,
    rate: 18500,
    gstPercent: 5,
    netRate: 19425,
    balQty: "80 MT",
    deliveryType: "Ex-Loading",
    contractType: "100%",
    supplies: [
      { id: "CT002-S1", date: "2026-04-03", invoice: "INV1003", qty: "20 MT", truck: "TS09FB3345", remarks: "On time" },
    ],
  },
  {
    id: "CT003",
    contractDt: "2026-04-03",
    contractDtValue: toTimestamp("2026-04-03"),
    contractNumber: "CT003",
    seller: "Blue Aqua Farms",
    buyer: "Ramesh Gowda",
    product: "Wheat Bran",
    qty: "150 MT",
    qtyValue: 150,
    rate: 14000,
    gstPercent: 0,
    netRate: 14000,
    balQty: "50 MT",
    deliveryType: "F.O.R",
    contractType: "Credit",
    supplies: [
      { id: "CT003-S1", date: "2026-04-04", invoice: "INV1004", qty: "15 MT", truck: "AP07TB6612", remarks: "On time" },
    ],
  },
  {
    id: "CT004",
    contractDt: "2026-04-04",
    contractDtValue: toTimestamp("2026-04-04"),
    contractNumber: "CT004",
    seller: "Green Valley Dairy",
    buyer: "Priya Sharma",
    product: "Rice Bran",
    qty: "120 MT",
    qtyValue: 120,
    rate: 16000,
    gstPercent: 5,
    netRate: 16800,
    balQty: "30 MT",
    deliveryType: "Ex-Loading",
    contractType: "100%",
    supplies: [
      { id: "CT004-S1", date: "2026-04-05", invoice: "INV1005", qty: "12 MT", truck: "AP16TA9021", remarks: "On time" },
    ],
  },
  {
    id: "CT005",
    contractDt: "2026-04-05",
    contractDtValue: toTimestamp("2026-04-05"),
    contractNumber: "CT005",
    seller: "Shree Animal Nutrition",
    buyer: "Anil Kapoor",
    product: "Cottonseed Meal",
    qty: "90 MT",
    qtyValue: 90,
    rate: 28000,
    gstPercent: 5,
    netRate: 29400,
    balQty: "20 MT",
    deliveryType: "F.O.R",
    contractType: "Credit",
    supplies: [
      { id: "CT005-S1", date: "2026-04-06", invoice: "INV1006", qty: "9 MT", truck: "TN22CD4589", remarks: "On time" },
    ],
  },
];
