// TODO: replace with real data once the price-history API is wired up.

export interface PriceHistoryPoint {
  label: string;
  dateValue: number;
  originalPrice: number;
  offerPrice: number;
  resalePrice: number;
}

export interface Seller {
  id: string;
  name: string;
  city: string;
  initials: string;
}

export const sellers: Seller[] = [
  { id: "sai-feeds", name: "Sai Feeds Pvt Ltd", city: "Pune", initials: "SL" },
  { id: "ankur-animal-feeds", name: "Ankur Animal Feeds", city: "Mumbai", initials: "AF" },
  { id: "blue-aqua-farms", name: "Blue Aqua Farms", city: "Bangalore", initials: "BF" },
  { id: "green-valley-dairy", name: "Green Valley Dairy", city: "Hyderabad", initials: "GD" },
  { id: "shree-animal-nutrition", name: "Shree Animal Nutrition", city: "Chennai", initials: "SN" },
  { id: "farm-fresh-feeds", name: "Farm Fresh Feeds", city: "Delhi", initials: "FF" },
  { id: "oceanic-feeds", name: "Oceanic Feeds", city: "Kolkata", initials: "OF" },
  { id: "riverdale-nutrition", name: "Riverdale Nutrition", city: "Ahmedabad", initials: "RN" },
  { id: "aquamax", name: "AquaMax", city: "Surat", initials: "AM" },
  { id: "feedworks", name: "FeedWorks", city: "Jaipur", initials: "FW" },
];

export const productOptions = [
  { value: "Premium Floating Feed", label: "Premium Floating Feed" },
  { value: "Classic Sinking Feed", label: "Classic Sinking Feed" },
  { value: "Cattle Growth Feed", label: "Cattle Growth Feed" },
  { value: "Starter Max Feed", label: "Starter Max Feed" },
];

export type FilterPeriod = "Daywise" | "Weekly" | "Monthly";

export const filterPeriodOptions: { value: FilterPeriod; label: string }[] = [
  { value: "Daywise", label: "Daywise" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

const HISTORY_DAYS = 90;

function seedFor(productName: string, sellerId: string): number {
  const key = `${productName}-${sellerId}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 100000;
  }
  return hash;
}

function buildDailyPoints(seed: number, days: number): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const today = new Date();
  const basePrice = 950 + (seed % 400);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const wave = Math.sin((seed + i) * 0.35) * 45;
    const noise = ((seed * 7 + i * 53) % 25) - 12;
    const original = Math.max(50, Math.round(basePrice + wave + noise));
    const offer = Math.round(original * 0.965);
    const resale = Math.round(original * 0.93);

    points.push({
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dateValue: date.getTime(),
      originalPrice: original,
      offerPrice: offer,
      resalePrice: resale,
    });
  }

  return points;
}

export function getSellerPriceHistory(productName: string, sellerId: string): PriceHistoryPoint[] {
  return buildDailyPoints(seedFor(productName, sellerId), HISTORY_DAYS);
}

export function aggregatePoints(
  points: PriceHistoryPoint[],
  period: FilterPeriod,
): PriceHistoryPoint[] {
  if (period === "Daywise") return points.slice(-14);

  const bucketSize = period === "Weekly" ? 7 : 30;
  const buckets: PriceHistoryPoint[][] = [];
  for (let i = 0; i < points.length; i += bucketSize) {
    buckets.push(points.slice(i, i + bucketSize));
  }

  const average = (bucket: PriceHistoryPoint[], key: keyof PriceHistoryPoint) =>
    Math.round(bucket.reduce((sum, point) => sum + (point[key] as number), 0) / bucket.length);

  return buckets.map((bucket) => ({
    label: bucket[0].label,
    dateValue: bucket[0].dateValue,
    originalPrice: average(bucket, "originalPrice"),
    offerPrice: average(bucket, "offerPrice"),
    resalePrice: average(bucket, "resalePrice"),
  }));
}
