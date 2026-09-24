// TODO: replace with real data once the reports API is wired up.

export interface SellerMonthlyValues {
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  jan: number;
  feb: number;
  mar: number;
}

export type MonthKey = keyof SellerMonthlyValues;

export interface SellerRow {
  id: string;
  sellerName: string;
  values: SellerMonthlyValues;
  total: number;
}

export interface MonthlyStat {
  key: MonthKey;
  label: string;
}

export const monthlyStats: MonthlyStat[] = [
  { key: "apr", label: "April 2026" },
  { key: "may", label: "May 2026" },
  { key: "jun", label: "June 2026" },
  { key: "jul", label: "July 2026" },
  { key: "aug", label: "August 2026" },
  { key: "sep", label: "September 2026" },
  { key: "oct", label: "October 2026" },
  { key: "nov", label: "November 2026" },
  { key: "dec", label: "December 2026" },
  { key: "jan", label: "January 2027" },
  { key: "feb", label: "February 2027" },
  { key: "mar", label: "March 2027" },
];

const rawRows: { sellerName: string; apr: number }[] = [
  { sellerName: "Sai Feeds Pvt Ltd - Mumbai", apr: 130 },
  { sellerName: "Ankur Animal Feeds - Ahmedabad", apr: 120 },
  { sellerName: "Blue Aqua Farms - Kochi", apr: 110 },
  { sellerName: "Green Valley Dairy - Pune", apr: 140 },
  { sellerName: "FairSquare Trading Pvt Ltd - Pune", apr: 125 },
  { sellerName: "Shubham Pvt Ltd - Vijayawada", apr: 130 },
  { sellerName: "Sunrise Agro - Hyderabad", apr: 115 },
  { sellerName: "Royal Feeds - Chennai", apr: 105 },
  { sellerName: "AgroStar Enterprises - Delhi", apr: 100 },
  { sellerName: "Farm Fresh Ltd - Kolkata", apr: 98 },
  { sellerName: "Krishna Feeds - Nagpur", apr: 95 },
  { sellerName: "Golden Grain Traders - Indore", apr: 92 },
  { sellerName: "Vasavi Agro - Guntur", apr: 88 },
  { sellerName: "Shree Balaji Feeds - Rajkot", apr: 85 },
  { sellerName: "Om Sai Traders - Nashik", apr: 82 },
  { sellerName: "Deccan Agro Mills - Solapur", apr: 80 },
  { sellerName: "Vijaya Feeds - Vizag", apr: 78 },
  { sellerName: "Ananya Traders - Bhopal", apr: 75 },
  { sellerName: "Sri Ram Agro - Coimbatore", apr: 70 },
  { sellerName: "Trimurti Feeds - Aurangabad", apr: 93 },
];

export const sellerRows: SellerRow[] = rawRows.map((row, index) => {
  const values: SellerMonthlyValues = {
    apr: row.apr,
    may: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
    jan: 0,
    feb: 0,
    mar: 0,
  };
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);
  return {
    id: `seller-${index + 1}`,
    sellerName: row.sellerName,
    values,
    total,
  };
});

export function getMonthlyTotal(monthKey: MonthKey): number {
  return sellerRows.reduce((sum, row) => sum + row.values[monthKey], 0);
}
