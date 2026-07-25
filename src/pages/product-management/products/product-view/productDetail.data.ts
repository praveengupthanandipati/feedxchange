// TODO: replace with real data once the product profile API is wired up.

import { weightClauseOptions, nutritionalParameterOptions } from "../product-new/productNew.data";
import type { Product } from "../products-list/products.data";

export type PriceHistoryPeriod = "week" | "month" | "year";

export const priceHistoryPeriodOptions = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

export interface PriceHistoryPoint {
  label: string;
  price: number;
}

export interface NutritionalSpecDetail {
  id: string;
  parameter: string;
  min: string;
  max: string;
  showInWebsite: boolean;
}

export interface NutritionalValueDetail {
  id: string;
  value: string;
  description: string;
}

export interface ProductDetail {
  imageColor: string;
  weightClauseLabel: string;
  gstPercent: string;
  description: string;
  specs: NutritionalSpecDetail[];
  values: NutritionalValueDetail[];
  priceHistory: Record<PriceHistoryPeriod, PriceHistoryPoint[]>;
}

const DESCRIPTIONS = [
  "Premium quality feed ingredient sourced from certified suppliers, ideal for poultry and livestock nutrition.",
  "High-energy supplement widely used in commercial feed formulations for improved growth performance.",
  "Rich in essential nutrients, sourced and processed to meet industry quality standards.",
  "Cost-effective feed ingredient known for consistent quality and nutritional value.",
];

const VALUE_POOL = [
  {
    value: "High Protein Content",
    description: "Supports muscle growth and development in poultry and livestock.",
  },
  {
    value: "Rich in Essential Fatty Acids",
    description: "Improves coat condition and supports cardiovascular health.",
  },
  {
    value: "Good Source of Fiber",
    description: "Aids digestion and promotes gut health in livestock.",
  },
  {
    value: "Low Moisture Content",
    description: "Ensures a longer shelf life and reduces spoilage risk during storage.",
  },
];

const IMAGE_COLORS = ["#1b3664", "#2c4d84", "#d98a12", "#2e9e5b"];
const GST_RATES = ["5", "12", "18"];
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

function seededPick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function buildPriceSeries(seed: number, count: number, step: number, labels: string[]): PriceHistoryPoint[] {
  let price = 2000 + (seed % 500);
  return Array.from({ length: count }, (_, i) => {
    price = Math.max(500, price + (((seed + i * 7) % step) - Math.floor(step / 2)));
    return { label: labels[i], price: Math.round(price) };
  });
}

export function getProductDetail(product: Product): ProductDetail {
  const seed = hashId(product.id);

  const specCount = 3 + (seed % 2);
  const specs: NutritionalSpecDetail[] = Array.from({ length: specCount }, (_, i) => {
    const parameter = seededPick(nutritionalParameterOptions, seed, i * 3);
    const min = 5 + ((seed + i * 13) % 40);
    const max = min + 3 + ((seed + i * 7) % 10);
    return {
      id: `${product.id}-spec-${i}`,
      parameter: parameter.label,
      min: `${min}%`,
      max: `${max}%`,
      showInWebsite: (seed + i) % 3 !== 0,
    };
  });

  const valueCount = 2 + (seed % 2);
  const values: NutritionalValueDetail[] = Array.from({ length: valueCount }, (_, i) => {
    const pick = seededPick(VALUE_POOL, seed, i);
    return { id: `${product.id}-value-${i}`, value: pick.value, description: pick.description };
  });

  return {
    imageColor: seededPick(IMAGE_COLORS, seed),
    weightClauseLabel: seededPick(weightClauseOptions, seed).label,
    gstPercent: seededPick(GST_RATES, seed),
    description: seededPick(DESCRIPTIONS, seed),
    specs,
    values,
    priceHistory: {
      week: buildPriceSeries(seed, 7, 80, WEEKDAY_LABELS),
      month: buildPriceSeries(seed, 4, 150, ["Week 1", "Week 2", "Week 3", "Week 4"]),
      year: buildPriceSeries(seed, 12, 250, MONTH_LABELS),
    },
  };
}
