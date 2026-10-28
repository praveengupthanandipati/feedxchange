// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export interface UnaccountBalanceRow {
  id: string;
  sNo: number;
  seller: string;
  paymentDate: string;
  paymentDateValue: number;
  mode: string;
  paymentAmount: number;
  adjustedAmount: number;
  pendingAmount: number;
  totalUnaccountBalToSeller: number;
}

const rawRows = [
  { seller: "Sai Feeds Pvt Ltd", paymentDate: "2026-04-01", mode: "PUNBR - 52023070116477320", paymentAmount: 500000, adjustedAmount: 414410, pendingAmount: 85590, totalUnaccountBalToSeller: 200000 },
  { seller: "Ankur Animal Feeds", paymentDate: "2026-04-02", mode: "PUNBR - 52023070116477321", paymentAmount: 400000, adjustedAmount: 200000, pendingAmount: 200000, totalUnaccountBalToSeller: 150000 },
  { seller: "Blue Aqua Farms", paymentDate: "2026-04-03", mode: "PUNBR - 52023070116477322", paymentAmount: 600000, adjustedAmount: 300000, pendingAmount: 300000, totalUnaccountBalToSeller: 250000 },
  { seller: "Green Valley Dairy", paymentDate: "2026-04-04", mode: "PUNBR - 52023070116477323", paymentAmount: 300000, adjustedAmount: 100000, pendingAmount: 200000, totalUnaccountBalToSeller: 100000 },
  { seller: "Shree Animal Nutrition", paymentDate: "2026-04-05", mode: "PUNBR - 52023070116477324", paymentAmount: 550000, adjustedAmount: 250000, pendingAmount: 300000, totalUnaccountBalToSeller: 180000 },
  { seller: "Farm Fresh Feeds", paymentDate: "2026-04-06", mode: "PUNBR - 52023070116477325", paymentAmount: 420000, adjustedAmount: 150000, pendingAmount: 270000, totalUnaccountBalToSeller: 120000 },
  { seller: "FairSquare Trading Pvt Ltd", paymentDate: "2026-04-07", mode: "PUNBR - 52023070116477326", paymentAmount: 480000, adjustedAmount: 280000, pendingAmount: 200000, totalUnaccountBalToSeller: 160000 },
  { seller: "Srinivasa Traders", paymentDate: "2026-04-08", mode: "PUNBR - 52023070116477327", paymentAmount: 350000, adjustedAmount: 100000, pendingAmount: 250000, totalUnaccountBalToSeller: 110000 },
  { seller: "AgroStar Enterprises", paymentDate: "2026-04-09", mode: "PUNBR - 52023070116477328", paymentAmount: 570000, adjustedAmount: 350000, pendingAmount: 220000, totalUnaccountBalToSeller: 190000 },
  { seller: "Sunrise Agro Solutions", paymentDate: "2026-04-10", mode: "PUNBR - 52023070116477329", paymentAmount: 410000, adjustedAmount: 210000, pendingAmount: 200000, totalUnaccountBalToSeller: 130000 },
];

export const unaccountBalanceRows: UnaccountBalanceRow[] = rawRows.map((row, index) => ({
  id: `uab-${index + 1}`,
  sNo: index + 1,
  seller: row.seller,
  paymentDate: row.paymentDate,
  paymentDateValue: toTimestamp(row.paymentDate),
  mode: row.mode,
  paymentAmount: row.paymentAmount,
  adjustedAmount: row.adjustedAmount,
  pendingAmount: row.pendingAmount,
  totalUnaccountBalToSeller: row.totalUnaccountBalToSeller,
}));
