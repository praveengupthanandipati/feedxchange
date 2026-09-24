// TODO: replace with real data once the reports API is wired up.

export interface BuyerMonthlyValues {
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

export type MonthKey = keyof BuyerMonthlyValues;

export interface BuyerRow {
  id: string;
  buyerName: string;
  values: BuyerMonthlyValues;
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

const rawRows: { buyerName: string; apr: number }[] = [
  { buyerName: "ABC Poultech Pvt Ltd - Katakoteswaram", apr: 130 },
  { buyerName: "Amalgam Nutrients and Feeds Limited - Karumancherry", apr: 120 },
  { buyerName: "Arjun Poultry Farm - Karimnagar", apr: 110 },
  { buyerName: "Bhaskar Poultries - Kondupalem", apr: 140 },
  { buyerName: "Bhindu Shree Poultry Farms - Addanki", apr: 125 },
  { buyerName: "BNR Egg Farms - Pusapatirega", apr: 130 },
  { buyerName: "Cargill India Pvt Ltd - Bangalore", apr: 115 },
  { buyerName: "Cargill India Pvt Ltd - Sangli", apr: 105 },
  { buyerName: "Chandu Probiotics - Vijayawada", apr: 100 },
  { buyerName: "Dama Srinivasa Rao - Addanki", apr: 98 },
  { buyerName: "Eswari Feeds Pvt Ltd - Ongole", apr: 95 },
  { buyerName: "Fortune Aqua Farms - Bhimavaram", apr: 92 },
  { buyerName: "Ganesh Poultry Traders - Nellore", apr: 88 },
  { buyerName: "Hari Priya Feeds - Guntur", apr: 85 },
  { buyerName: "Indus Valley Poultry - Warangal", apr: 82 },
  { buyerName: "Jyothi Egg Farms - Kadapa", apr: 80 },
  { buyerName: "Kranthi Poultry Pvt Ltd - Khammam", apr: 78 },
  { buyerName: "Lakshmi Aqua Traders - Kakinada", apr: 75 },
  { buyerName: "Mahalakshmi Poultry Farm - Anantapur", apr: 70 },
  { buyerName: "Narayana Feeds - Rajahmundry", apr: 93 },
];

export const buyerRows: BuyerRow[] = rawRows.map((row, index) => {
  const values: BuyerMonthlyValues = {
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
    id: `buyer-${index + 1}`,
    buyerName: row.buyerName,
    values,
    total,
  };
});

export function getMonthlyTotal(monthKey: MonthKey): number {
  return buyerRows.reduce((sum, row) => sum + row.values[monthKey], 0);
}
