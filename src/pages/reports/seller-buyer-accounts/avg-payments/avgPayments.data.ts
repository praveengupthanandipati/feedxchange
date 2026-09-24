// TODO: replace with real data once the reports API is wired up.

export interface AvgPaymentRow {
  id: string;
  sNo: number;
  buyer: string;
  paymentCondition: string;
  payment0to25: number;
  payment25to50: number;
  payment50to75: number;
  payment75to100: number;
}

const rawRows = [
  { buyer: "Sai Feeds Pvt Ltd", paymentCondition: "Advance", payment0to25: 100000, payment25to50: 120000, payment50to75: 90000, payment75to100: 104410 },
  { buyer: "Ankur Animal Feeds", paymentCondition: "Credit 30 Days", payment0to25: 80000, payment25to50: 100000, payment50to75: 90000, payment75to100: 130000 },
  { buyer: "Blue Aqua Farms", paymentCondition: "Credit 15 Days", payment0to25: 120000, payment25to50: 110000, payment50to75: 40000, payment75to100: 30000 },
  { buyer: "Green Valley Dairy", paymentCondition: "Advance", payment0to25: 70000, payment25to50: 80000, payment50to75: 50000, payment75to100: 100000 },
  { buyer: "Shree Animal Nutrition", paymentCondition: "Credit 45 Days", payment0to25: 90000, payment25to50: 70000, payment50to75: 40000, payment75to100: 50000 },
  { buyer: "Farm Fresh Feeds", paymentCondition: "Credit 30 Days", payment0to25: 85000, payment25to50: 95000, payment50to75: 60000, payment75to100: 80000 },
  { buyer: "FairSquare Trading Pvt Ltd", paymentCondition: "Advance", payment0to25: 110000, payment25to50: 90000, payment50to75: 70000, payment75to100: 90000 },
  { buyer: "Srinivasa Traders", paymentCondition: "Credit 15 Days", payment0to25: 60000, payment25to50: 75000, payment50to75: 55000, payment75to100: 60000 },
  { buyer: "AgroStar Enterprises", paymentCondition: "Credit 45 Days", payment0to25: 130000, payment25to50: 105000, payment50to75: 80000, payment75to100: 95000 },
  { buyer: "Sunrise Agro Solutions", paymentCondition: "Advance", payment0to25: 75000, payment25to50: 85000, payment50to75: 65000, payment75to100: 70000 },
];

export const avgPaymentRows: AvgPaymentRow[] = rawRows.map((row, index) => ({
  id: `avg-${index + 1}`,
  sNo: index + 1,
  ...row,
}));
