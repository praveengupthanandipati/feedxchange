export type MonthlyReportsTabId = "month" | "commodity" | "seller" | "buyer";

export interface MonthlyReportsTab {
  id: MonthlyReportsTabId;
  label: string;
}

export const monthlyReportsTabs: MonthlyReportsTab[] = [
  { id: "month", label: "Month Wise" },
  { id: "commodity", label: "Commodity Wise" },
  { id: "seller", label: "Seller Wise" },
  { id: "buyer", label: "Buyer Wise" },
];

export const financialYearOptions = [
  { value: "2026-2027", label: "2026-2027" },
  { value: "2025-2026", label: "2025-2026" },
  { value: "2024-2025", label: "2024-2025" },
];

export const defaultFinancialYear = "2026-2027";

export function getPreviousFinancialYear(financialYear: string): string {
  const [start, end] = financialYear.split("-").map(Number);
  if (Number.isNaN(start) || Number.isNaN(end)) return financialYear;
  return `${start - 1}-${end - 1}`;
}
