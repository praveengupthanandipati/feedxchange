// TODO: replace with real data once the reporting API is wired up.

export interface StatCard {
  id: string;
  label: string;
  value: string;
  deltaPercent: number;
  deltaDirection: "up" | "down";
  visual: "bars" | "ring";
  color: string;
  sparkline?: number[];
  ringPercent?: number;
}

export const statCards: StatCard[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "₹34,152",
    deltaPercent: 2.65,
    deltaDirection: "up",
    visual: "bars",
    color: "#6366f1",
    sparkline: [14, 22, 10, 18, 26, 16, 24, 30, 20, 28],
  },
  {
    id: "orders",
    label: "Orders",
    value: "5,643",
    deltaPercent: 0.82,
    deltaDirection: "down",
    visual: "ring",
    color: "#22c55e",
    ringPercent: 68,
  },
  {
    id: "customers",
    label: "Customers",
    value: "45,254",
    deltaPercent: 6.24,
    deltaDirection: "down",
    visual: "ring",
    color: "#6366f1",
    ringPercent: 42,
  },
  {
    id: "growth",
    label: "Growth",
    value: "+12.58%",
    deltaPercent: 10.51,
    deltaDirection: "up",
    visual: "bars",
    color: "#f59e0b",
    sparkline: [10, 14, 12, 20, 16, 24, 18, 28, 22, 32],
  },
];

export interface SalesPoint {
  month: string;
  cattleFeed: number;
  soyabeanDeoiled: number;
  granulesGroundnut: number;
}

export const salesAnalytics = {
  income: "₹2,371",
  sales: 258,
  conversionRatio: "3.6%",
  data: [
    { month: "Jan", cattleFeed: 22, soyabeanDeoiled: 38, granulesGroundnut: 30 },
    { month: "Feb", cattleFeed: 14, soyabeanDeoiled: 46, granulesGroundnut: 34 },
    { month: "Mar", cattleFeed: 24, soyabeanDeoiled: 30, granulesGroundnut: 40 },
    { month: "Apr", cattleFeed: 28, soyabeanDeoiled: 44, granulesGroundnut: 35 },
    { month: "May", cattleFeed: 16, soyabeanDeoiled: 28, granulesGroundnut: 46 },
    { month: "Jun", cattleFeed: 20, soyabeanDeoiled: 34, granulesGroundnut: 42 },
    { month: "Jul", cattleFeed: 22, soyabeanDeoiled: 40, granulesGroundnut: 58 },
    { month: "Aug", cattleFeed: 18, soyabeanDeoiled: 50, granulesGroundnut: 54 },
    { month: "Sep", cattleFeed: 42, soyabeanDeoiled: 36, granulesGroundnut: 56 },
    { month: "Oct", cattleFeed: 20, soyabeanDeoiled: 32, granulesGroundnut: 44 },
    { month: "Nov", cattleFeed: 26, soyabeanDeoiled: 26, granulesGroundnut: 50 },
  ] satisfies SalesPoint[],
};

export interface TopProduct {
  id: string;
  name: string;
  percent: number;
  color: string;
}

export const topSellingProducts: TopProduct[] = [
  { id: "soya-lecithin-1", name: "Soya Lecithin Cattle Feed", percent: 92, color: "#0f172a" },
  { id: "soya-lecithin-2", name: "Soya Lecithin Cattle Feed", percent: 78, color: "#38bdf8" },
  { id: "brown-soyabean", name: "Brown Soyabean Deoiled", percent: 66, color: "#22c55e" },
  { id: "granules-groundnut", name: "Granules Groundnut", percent: 84, color: "#f59e0b" },
  { id: "brown-groundnut-oil", name: "Brown Groundnut Oil", percent: 58, color: "#6366f1" },
];

export interface TopUser {
  id: string;
  name: string;
  location: string;
  status: "Success" | "Cancel";
  amount: string;
  trend: "up" | "down";
  initials: string;
  color: string;
}

export const topUsers: TopUser[] = [
  {
    id: "balaji-poultry",
    name: "Bala Balaji Poultry",
    location: "Achutapuram",
    status: "Cancel",
    amount: "₹250.00",
    trend: "up",
    initials: "BP",
    color: "#f59e0b",
  },
  {
    id: "tara-poultry",
    name: "Tara Poultry Farm",
    location: "Guntur",
    status: "Success",
    amount: "₹110.00",
    trend: "down",
    initials: "TP",
    color: "#22c55e",
  },
  {
    id: "sri-venkateswara",
    name: "Sri Venkateswara Feeds",
    location: "Vijayawada",
    status: "Success",
    amount: "₹480.00",
    trend: "up",
    initials: "SV",
    color: "#6366f1",
  },
  {
    id: "krishna-hatcheries",
    name: "Krishna Hatcheries",
    location: "Rajahmundry",
    status: "Cancel",
    amount: "₹320.00",
    trend: "down",
    initials: "KH",
    color: "#ef4444",
  },
];

export interface ActivityItem {
  id: string;
  time: string;
  text: string;
}

export const recentActivity: ActivityItem[] = [
  {
    id: "activity-1",
    time: "Today 12:20 pm",
    text: "Balaji Poultry Pvt Limited Transported Started the stock from Vijayawada",
  },
  {
    id: "activity-2",
    time: "Today 10:05 am",
    text: "Tara Poultry Farm placed a new order for Soya Lecithin Cattle Feed",
  },
  {
    id: "activity-3",
    time: "Yesterday 6:40 pm",
    text: "Sri Venkateswara Feeds payment of ₹480.00 was confirmed",
  },
  {
    id: "activity-4",
    time: "Yesterday 2:15 pm",
    text: "Krishna Hatcheries order #10229 was cancelled",
  },
];

export const socialSource = {
  platform: "Facebook",
  sales: 125,
  description:
    "SSRTS is a social media platform focused on short-form video content shared by farm suppliers.",
};
