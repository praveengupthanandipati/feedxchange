import { useMemo } from "react";
import { API_URL } from "../../../core/api/api";
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
  /** URL-friendly category name, used as ?category= on the Products page. */
  id: string;
  name: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function toCatalogueProduct(product: Product): CatalogueProduct {
  const name = product.name?.trim() || "Product";
  const categoryName = product.categoryName?.trim() || "Other";
  const features = parseProductFeatures(product.productFeatures);
  return {
    id: product.id,
    slug: product.seoName?.trim() || slugify(name) || String(product.id),
    name,
    categoryId: slugify(categoryName),
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
 * The website's product catalogue from GetAllProducts (public): active products sorted by name, and their categories
 * in name order. Every component calling this shares one request (RTK Query caches it).
 */
export function useCatalogue() {
  const { data, isLoading, isError } = useGetAllProductsQuery();

  return useMemo(() => {
    const products = (data ?? [])
      .filter((product) => product.isActive && !product.isDeleted)
      .map(toCatalogueProduct)
      .sort((a, b) => a.name.localeCompare(b.name));

    const categories: CatalogueCategory[] = [];
    for (const product of products) {
      if (!categories.some((category) => category.id === product.categoryId)) categories.push({ id: product.categoryId, name: product.categoryName });
    }
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return {
      products,
      categories,
      isLoading,
      isError,
      productsIn: (categoryId: string) => products.filter((product) => product.categoryId === categoryId),
      findBySlug: (slug: string | undefined) => products.find((product) => product.slug === slug),
    };
  }, [data, isLoading, isError]);
}
