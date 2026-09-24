// TODO: replace with real data once the reports API is wired up.

export interface AgingBucket {
  amount: number;
  count: number;
}

export interface SummaryRow {
  id: string;
  sNo: number;
  buyerName: string;
  totalDue: number;
  totalOverdue: number;
  bucket0to30: AgingBucket;
  bucket31to45: AgingBucket;
  bucket46to60: AgingBucket;
  bucketOver60: AgingBucket;
}

const emptyBucket: AgingBucket = { amount: 0, count: 0 };

const rawRows: Omit<SummaryRow, "id" | "sNo">[] = [
  { buyerName: "Sai Feeds Pvt Ltd", totalDue: 1539240, totalOverdue: 588897, bucket0to30: { amount: 588897, count: 3 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: { amount: 143056, count: 1 } },
  { buyerName: "Ankur Animal Feeds", totalDue: 820000, totalOverdue: 250000, bucket0to30: { amount: 250000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Blue Aqua Farms", totalDue: 1200000, totalOverdue: 400000, bucket0to30: { amount: 400000, count: 2 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Green Valley Dairy", totalDue: 950000, totalOverdue: 300000, bucket0to30: { amount: 300000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Shree Animal Nutrition", totalDue: 780000, totalOverdue: 280000, bucket0to30: { amount: 280000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Farm Fresh Feeds", totalDue: 670000, totalOverdue: 170000, bucket0to30: { amount: 170000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "FairSquare Trading Pvt Ltd", totalDue: 1000000, totalOverdue: 300000, bucket0to30: { amount: 300000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Srinivasa Traders", totalDue: 550000, totalOverdue: 150000, bucket0to30: { amount: 150000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "AgroStar Enterprises", totalDue: 890000, totalOverdue: 290000, bucket0to30: { amount: 290000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Sunrise Agro Solutions", totalDue: 720000, totalOverdue: 220000, bucket0to30: { amount: 220000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Ganesh Roadlines Traders", totalDue: 1200000, totalOverdue: 400000, bucket0to30: { amount: 400000, count: 2 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Krishna Carriers Feeds", totalDue: 1000000, totalOverdue: 310000, bucket0to30: { amount: 310000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
  { buyerName: "Balaji Agro Traders", totalDue: 960000, totalOverdue: 250000, bucket0to30: { amount: 250000, count: 1 }, bucket31to45: emptyBucket, bucket46to60: emptyBucket, bucketOver60: emptyBucket },
];

export const summaryRows: SummaryRow[] = rawRows.map((row, index) => ({
  id: `summary-${index + 1}`,
  sNo: index + 1,
  ...row,
}));

function sumBucket(rows: SummaryRow[], pick: (row: SummaryRow) => AgingBucket): AgingBucket {
  return rows.reduce(
    (acc, row) => {
      const bucket = pick(row);
      return { amount: acc.amount + bucket.amount, count: acc.count + bucket.count };
    },
    { amount: 0, count: 0 },
  );
}

export const summaryTotals = {
  totalDue: summaryRows.reduce((sum, row) => sum + row.totalDue, 0),
  totalOverdue: summaryRows.reduce((sum, row) => sum + row.totalOverdue, 0),
  bucket0to30: sumBucket(summaryRows, (row) => row.bucket0to30),
  bucket31to45: sumBucket(summaryRows, (row) => row.bucket31to45),
  bucket46to60: sumBucket(summaryRows, (row) => row.bucket46to60),
  bucketOver60: sumBucket(summaryRows, (row) => row.bucketOver60),
};
