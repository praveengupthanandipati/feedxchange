import { categories } from "../../categories/categories.data";

export const categoryOptions = categories.map((category) => ({
  value: category.categoryName,
  label: category.categoryName,
}));

export const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const weightClauseOptions = [
  { value: "mt", label: "MT (Metric Ton)" },
  { value: "kg", label: "KG (Kilogram)" },
  { value: "quintal", label: "Quintal (100 Kg)" },
  { value: "ton", label: "Ton (Imperial)" },
];

export const nutritionalParameterOptions = [
  { value: "crude-protein", label: "Crude Protein" },
  { value: "moisture", label: "Moisture" },
  { value: "crude-fat", label: "Crude Fat" },
  { value: "crude-fiber", label: "Crude Fiber" },
  { value: "total-ash", label: "Total Ash" },
  { value: "calcium", label: "Calcium" },
  { value: "phosphorus", label: "Phosphorus" },
  { value: "salt", label: "Salt" },
  { value: "energy-kcal-kg", label: "Energy (Kcal/kg)" },
];

export const MAX_PRODUCT_IMAGE_SIZE_MB = 2;
export const ALLOWED_PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface NutritionalSpecRow {
  id: string;
  parameter: string;
  min: string;
  max: string;
  showInWebsite: boolean;
}

export interface NutritionalValueRow {
  id: string;
  value: string;
  description: string;
}

let specRowSeq = 0;
export const nextSpecRowId = () => `spec-${Date.now()}-${specRowSeq++}`;

let valueRowSeq = 0;
export const nextValueRowId = () => `value-${Date.now()}-${valueRowSeq++}`;

export const emptySpecRow = (): NutritionalSpecRow => ({
  id: nextSpecRowId(),
  parameter: "",
  min: "",
  max: "",
  showInWebsite: true,
});

export const emptyValueRow = (): NutritionalValueRow => ({
  id: nextValueRowId(),
  value: "",
  description: "",
});
