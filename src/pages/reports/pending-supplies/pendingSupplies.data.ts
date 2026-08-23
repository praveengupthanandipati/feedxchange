// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatTodayLabel(): string {
  const now = new Date();
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
}

export interface PendingSupplyRow {
  id: string;
  sNo: number;
  type: "Credits" | "100%";
  contractDt: string;
  contractDtValue: number;
  contractNumber: string;
  seller: string;
  buyer: string;
  commodity: string;
  qty: number;
  rate: number;
  gstPercent: number;
  netRate: number;
  supplied: number;
  pending: number;
  deliverySchedule: string;
  deliveryType: "Ex-loading" | "F.O.R";
}

const GST_PERCENT = 5;

const rawRows = [
  { type: "Credits", contractDt: "2026-04-01", contractNumber: "5043", seller: "Sai Feeds Pvt Ltd - Mumbai", buyer: "Rajesh Kumar", commodity: "Rice DDGS", qty: 50, rate: 25000, supplied: 30, deliveryType: "Ex-loading" },
  { type: "100%", contractDt: "2026-04-02", contractNumber: "5044", seller: "Ankur Animal Feeds - Ahmedabad", buyer: "Venkatesh Iyer", commodity: "Maize", qty: 40, rate: 18000, supplied: 15, deliveryType: "F.O.R" },
  { type: "Credits", contractDt: "2026-04-03", contractNumber: "5045", seller: "Blue Aqua Farms - Kochi", buyer: "Ramesh Gowda", commodity: "Soybean Meal", qty: 60, rate: 32000, supplied: 60, deliveryType: "Ex-loading" },
  { type: "100%", contractDt: "2026-04-05", contractNumber: "5046", seller: "Green Valley Dairy - Pune", buyer: "Priya Sharma", commodity: "Wheat Bran", qty: 35, rate: 12000, supplied: 10, deliveryType: "F.O.R" },
  { type: "Credits", contractDt: "2026-04-06", contractNumber: "5047", seller: "FairSquare Trading Pvt Ltd - Pune", buyer: "Anil Kapoor", commodity: "Rice DDGS", qty: 45, rate: 25000, supplied: 20, deliveryType: "Ex-loading" },
  { type: "100%", contractDt: "2026-04-07", contractNumber: "5048", seller: "Shubham Pvt Ltd - Vijayawada", buyer: "Sanjay Das", commodity: "Maize", qty: 55, rate: 18500, supplied: 40, deliveryType: "F.O.R" },
  { type: "Credits", contractDt: "2026-04-08", contractNumber: "5049", seller: "Sai Feeds Pvt Ltd - Mumbai", buyer: "Ramesh Gowda", commodity: "Soybean Meal", qty: 30, rate: 31500, supplied: 5, deliveryType: "Ex-loading" },
  { type: "100%", contractDt: "2026-04-10", contractNumber: "5050", seller: "Ankur Animal Feeds - Ahmedabad", buyer: "Priya Sharma", commodity: "Wheat Bran", qty: 35, rate: 12000, supplied: 10, deliveryType: "F.O.R" },
  { type: "Credits", contractDt: "2026-04-11", contractNumber: "5051", seller: "Blue Aqua Farms - Kochi", buyer: "Anil Kapoor", commodity: "Rice DDGS", qty: 48, rate: 25500, supplied: 18, deliveryType: "Ex-loading" },
  { type: "100%", contractDt: "2026-04-12", contractNumber: "5052", seller: "Green Valley Dairy - Pune", buyer: "Venkatesh Iyer", commodity: "Maize", qty: 42, rate: 18200, supplied: 22, deliveryType: "F.O.R" },
] as const;

export const pendingSupplyRows: PendingSupplyRow[] = rawRows.map((row, index) => ({
  id: row.contractNumber,
  sNo: index + 1,
  type: row.type,
  contractDt: row.contractDt,
  contractDtValue: toTimestamp(row.contractDt),
  contractNumber: row.contractNumber,
  seller: row.seller,
  buyer: row.buyer,
  commodity: row.commodity,
  qty: row.qty,
  rate: row.rate,
  gstPercent: GST_PERCENT,
  netRate: Math.round(row.rate * (1 + GST_PERCENT / 100)),
  supplied: row.supplied,
  pending: row.qty - row.supplied,
  deliverySchedule: "Ready Loading",
  deliveryType: row.deliveryType,
}));

export const commodityOptions = Array.from(new Set(pendingSupplyRows.map((row) => row.commodity))).map(
  (commodity) => ({ value: commodity, label: commodity }),
);
