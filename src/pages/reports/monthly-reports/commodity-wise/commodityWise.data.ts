// TODO: replace with real data once the reports API is wired up.

export interface CommodityMonthlyValues {
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

export type MonthKey = keyof CommodityMonthlyValues;

export interface CommodityRow {
  id: string;
  productName: string;
  values: CommodityMonthlyValues;
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

const rawRows: { productName: string; apr: number }[] = [
  { productName: "Maize", apr: 130 },
  { productName: "Soybean Meal", apr: 90 },
  { productName: "Wheat Bran", apr: 70 },
  { productName: "Rice DDGS", apr: 60 },
  { productName: "Corn Gluten Meal", apr: 55 },
  { productName: "Sunflower DOC", apr: 50 },
  { productName: "Rapeseed Meal", apr: 48 },
  { productName: "Cottonseed Cake", apr: 45 },
  { productName: "Groundnut Cake", apr: 43 },
  { productName: "Fish Meal", apr: 40 },
  { productName: "Deoiled Rice Bran", apr: 38 },
  { productName: "Corn Cob Meal", apr: 35 },
  { productName: "Mustard Cake", apr: 33 },
];

export const commodityRows: CommodityRow[] = rawRows.map((row, index) => {
  const values: CommodityMonthlyValues = {
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
    id: `commodity-${index + 1}`,
    productName: row.productName,
    values,
    total,
  };
});

export function getMonthlyTotal(monthKey: MonthKey): number {
  return commodityRows.reduce((sum, row) => sum + row.values[monthKey], 0);
}
