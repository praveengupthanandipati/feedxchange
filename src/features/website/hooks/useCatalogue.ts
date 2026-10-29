import { useMemo } from "react";
import { API_URL } from "../../../core/api/api";
import { useGetAllCategoriesQuery, type Category } from "../../../core/store/categoryApi";
import { parseProductFeatures, useGetAllProductsQuery, type Product } from "../../../core/store/productsApi";

export interface Nutrient {
  name: string;
  min: string;
  max: string;
}

/** A product as the website shows it, built from GetAllProducts. */
export interface CatalogueProduct {
  id: number;
  /** URL part of /products/:slug (the product's SEO name). */
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  /** Full image URL, or null to use the placeholder. */
  image: string | null;
  price: number;
  /** e.g. "per kg". */
  weightClause: string;
  /** Nutritional specifications the admin marked "show in website". */
  nutrition: Nutrient[];
  /** "Nutritional Value and Uses": a bold value with its meaning under it. */
  uses: { value: string; label: string }[];
}

export interface CatalogueCategory {
  /** The category's SEO name (URL-friendly), used as ?category= on the Products page. */
  id: string;
  name: string;
  description: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** URL id of a category: its SEO name, else its name made URL-friendly. */
const categoryKey = (category: Category) => category.seoName?.trim() || slugify(category.categoryName ?? "") || category.id;

function toCatalogueProduct(product: Product, categoriesById: Map<string, Category>): CatalogueProduct {
  const name = product.name?.trim() || "Product";
  const category = product.categoryId != null ? categoriesById.get(String(product.categoryId)) : undefined;
  const categoryName = category?.categoryName?.trim() || product.categoryName?.trim() || "Other";
  const features = parseProductFeatures(product.productFeatures);
  return {
    id: product.id,
    slug: product.seoName?.trim() || slugify(name) || String(product.id),
    name,
    categoryId: category ? categoryKey(category) : slugify(categoryName),
    categoryName,
    description: product.description?.trim() ?? "",
    image: product.fileName ? `${API_URL}${product.fileName}` : null,
    price: product.price,
    weightClause: product.weightClause?.trim() ?? "",
    nutrition: (features.nutritionalSpecifications ?? [])
      .filter((spec) => spec.showInWebsite)
      .map((spec) => ({ name: spec.parameter, min: spec.min, max: spec.max })),
    uses: (features.nutritionalValueAndUses ?? []).map((use) => ({ value: use.title, label: use.description })),
  };
}

/**
 * The website's product catalogue, both lists public: active products from GetAllProducts sorted by name, and the
 * active categories from GetAllCategories in their admin priority order (only those with products). Every component
 * calling this shares the same two requests (RTK Query caches them).
 */
export function useCatalogue() {
  const { data, isLoading: productsLoading, isError: productsError } = useGetAllProductsQuery();
  // Categories are extra detail (order, SEO names, descriptions): if they fail, the products still show, grouped by name.
  const { data: categoryData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const isLoading = productsLoading || categoriesLoading;
  const isError = productsError;

  return useMemo(() => {
    const activeCategories = (categoryData ?? []).filter((category) => category.status === "Active");
    const categoriesById = new Map(activeCategories.map((category) => [category.id, category]));

    const products = (data ?? [])
      .filter((product) => product.isActive && !product.isDeleted)
      .map((product) => toCatalogueProduct(product, categoriesById))
      .sort((a, b) => a.name.localeCompare(b.name));

    const categories: CatalogueCategory[] = [...activeCategories]
      .sort((a, b) => a.priority - b.priority)
      .map((category) => ({ id: categoryKey(category), name: category.categoryName?.trim() || "Other", description: category.description?.trim() ?? "" }));
    // Products whose category is missing from GetAllCategories (or inactive there) still get a tab, after the others.
    for (const product of products) {
      if (!categories.some((category) => category.id === product.categoryId)) categories.push({ id: product.categoryId, name: product.categoryName, description: "" });
    }
    const withProducts = categories.filter((category) => products.some((product) => product.categoryId === category.id));

    return {
      products,
      categories: withProducts,
      isLoading,
      isError,
      productsIn: (categoryId: string) => products.filter((product) => product.categoryId === categoryId),
      findBySlug: (slug: string | undefined) => products.find((product) => product.slug === slug),
    };
  }, [data, categoryData, isLoading, isError]);
}
