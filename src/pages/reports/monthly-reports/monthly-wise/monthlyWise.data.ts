// TODO: replace with real data once the reports API is wired up.

export interface MonthlyRow {
  id: string;
  sNo: number;
  month: string;
  currentYearQty: number;
  previousYearQty: number;
}

const rawRows = [
  { month: "April", currentYearQty: 120, previousYearQty: 105 },
  { month: "May", currentYearQty: 135, previousYearQty: 118 },
  { month: "June", currentYearQty: 110, previousYearQty: 122 },
  { month: "July", currentYearQty: 140, previousYearQty: 130 },
  { month: "August", currentYearQty: 125, previousYearQty: 115 },
  { month: "September", currentYearQty: 130, previousYearQty: 128 },
  { month: "October", currentYearQty: 145, previousYearQty: 140 },
  { month: "November", currentYearQty: 120, previousYearQty: 135 },
  { month: "December", currentYearQty: 150, previousYearQty: 142 },
  { month: "January", currentYearQty: 138, previousYearQty: 120 },
  { month: "February", currentYearQty: 128, previousYearQty: 118 },
  { month: "March", currentYearQty: 155, previousYearQty: 145 },
];

export const monthlyRows: MonthlyRow[] = rawRows.map((row, index) => ({
  id: row.month,
  sNo: index + 1,
  ...row,
}));

export function variationPercent(row: MonthlyRow): number {
  if (row.previousYearQty === 0) return 0;
  return ((row.currentYearQty - row.previousYearQty) / row.previousYearQty) * 100;
}

export const totalCurrentYearQty = monthlyRows.reduce((sum, row) => sum + row.currentYearQty, 0);
