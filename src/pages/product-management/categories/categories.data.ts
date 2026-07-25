export interface Category {
  id: string;
  categoryName: string;
  seoName: string;
  status: "Active" | "Inactive";
  priority: number;
  description: string;
  imageUrl: string;
}

export const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const MAX_CATEGORY_IMAGE_SIZE_MB = 2;
export const ALLOWED_CATEGORY_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

let categorySeq = 0;
export const nextCategoryId = () => `category-${Date.now()}-${categorySeq++}`;

export const categories: Category[] = [
  { id: nextCategoryId(), categoryName: "Seeds", seoName: "seeds", status: "Active", priority: 42, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Edible Oils", seoName: "edible-oils", status: "Active", priority: 43, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Poultry Products", seoName: "poultry-products", status: "Active", priority: 44, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Grains & Cereals", seoName: "grains-cereals", status: "Active", priority: 45, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Fertilizers", seoName: "fertilizers", status: "Active", priority: 46, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Spices", seoName: "spices", status: "Active", priority: 47, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Oils", seoName: "oils", status: "Active", priority: 48, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Test2", seoName: "test2", status: "Active", priority: 49, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "Testing", seoName: "testing", status: "Active", priority: 50, description: "", imageUrl: "" },
  { id: nextCategoryId(), categoryName: "TestFishFoods", seoName: "test-fish-foods", status: "Active", priority: 51, description: "", imageUrl: "" },
];
