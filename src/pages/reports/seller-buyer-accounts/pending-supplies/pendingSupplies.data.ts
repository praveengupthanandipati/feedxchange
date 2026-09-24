// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export interface PendingSupplyRow {
  id: string;
  sNo: number;
  contDate: string;
  contDateValue: number;
  contractNumber: string;
  buyerName: string;
  productName: string;
  qty: number;
  netRate: number;
  suppliedQty: number;
  balanceQty: number;
  package: string;
  deliverySchedule: string;
  paymentTerms: string;
  dcType: string;
}

export const totalPendingQuantity = 880;

const rawRows = [
  { contDate: "2026-04-01", contractNumber: "C1001", buyerName: "Sai Feeds Pvt Ltd", productName: "DORB", qty: 700, netRate: 16000, suppliedQty: 500, balanceQty: 200, package: "PP Bags", deliverySchedule: "Ready Loading", paymentTerms: "Credits", dcType: "F.O.R" },
  { contDate: "2026-04-02", contractNumber: "C1002", buyerName: "Ankur Animal Feeds", productName: "DORB", qty: 30, netRate: 14500, suppliedQty: 10, balanceQty: 20, package: "PP Bags", deliverySchedule: "Within 8 Days", paymentTerms: "Credits", dcType: "Ex-Loading" },
  { contDate: "2026-04-03", contractNumber: "C1003", buyerName: "Blue Aqua Farms", productName: "DGTA", qty: 150, netRate: 14500, suppliedQty: 100, balanceQty: 50, package: "PP Bags", deliverySchedule: "Ready Loading", paymentTerms: "Credits", dcType: "F.O.R" },
  { contDate: "2026-04-04", contractNumber: "C1004", buyerName: "Green Valley Dairy", productName: "DORB", qty: 500, netRate: 16000, suppliedQty: 300, balanceQty: 200, package: "PP Bags", deliverySchedule: "Within 8 Days", paymentTerms: "Credits", dcType: "Ex-Loading" },
  { contDate: "2026-04-05", contractNumber: "C1005", buyerName: "Shree Animal Nutrition", productName: "DGTA", qty: 200, netRate: 14500, suppliedQty: 120, balanceQty: 80, package: "PP Bags", deliverySchedule: "Ready Loading", paymentTerms: "Credits", dcType: "F.O.R" },
  { contDate: "2026-04-06", contractNumber: "C1006", buyerName: "Farm Fresh Feeds", productName: "DORB", qty: 400, netRate: 16000, suppliedQty: 250, balanceQty: 150, package: "PP Bags", deliverySchedule: "Within 8 Days", paymentTerms: "Credits", dcType: "Ex-Loading" },
  { contDate: "2026-04-07", contractNumber: "C1007", buyerName: "FairSquare Trading Pvt Ltd", productName: "DGTA", qty: 180, netRate: 14500, suppliedQty: 90, balanceQty: 90, package: "PP Bags", deliverySchedule: "Ready Loading", paymentTerms: "Credits", dcType: "F.O.R" },
  { contDate: "2026-04-08", contractNumber: "C1008", buyerName: "Srinivasa Traders", productName: "DORB", qty: 260, netRate: 16000, suppliedQty: 160, balanceQty: 100, package: "PP Bags", deliverySchedule: "Within 8 Days", paymentTerms: "Credits", dcType: "Ex-Loading" },
  { contDate: "2026-04-09", contractNumber: "C1009", buyerName: "AgroStar Enterprises", productName: "DGTA", qty: 320, netRate: 14500, suppliedQty: 210, balanceQty: 110, package: "PP Bags", deliverySchedule: "Ready Loading", paymentTerms: "Credits", dcType: "F.O.R" },
  { contDate: "2026-04-10", contractNumber: "C1010", buyerName: "Sunrise Agro Solutions", productName: "DORB", qty: 220, netRate: 16000, suppliedQty: 140, balanceQty: 80, package: "PP Bags", deliverySchedule: "Within 8 Days", paymentTerms: "Credits", dcType: "Ex-Loading" },
];

export const pendingSupplyRows: PendingSupplyRow[] = rawRows.map((row, index) => ({
  id: row.contractNumber,
  sNo: index + 1,
  contDate: row.contDate,
  contDateValue: toTimestamp(row.contDate),
  contractNumber: row.contractNumber,
  buyerName: row.buyerName,
  productName: row.productName,
  qty: row.qty,
  netRate: row.netRate,
  suppliedQty: row.suppliedQty,
  balanceQty: row.balanceQty,
  package: row.package,
  deliverySchedule: row.deliverySchedule,
  paymentTerms: row.paymentTerms,
  dcType: row.dcType,
}));
