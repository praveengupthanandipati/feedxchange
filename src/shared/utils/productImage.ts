import type { Product } from "../../core/store/productsApi";
import { API_URL } from "../../core/api/api";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^|-)deoiled(?=-|$)/g, "$1de-oiled")
    .replace(/^-+|-+$/g, "");

const PRODUCT_IMAGE_BY_NAME: Record<string, string> = {
  "sunflower-doc": "sunflower-meal.jpg",
  "sunflower-meal": "sunflower-meal.jpg",
  "sunflower-de-oiled-cake": "sunflower-meal.jpg",
  "cotton-doc": "cotton-doc.webp",
  "cottonseed-doc": "cotton-doc.webp",
  "cottonseed-cake": "cotton-doc.webp",
  "cottonseed-de-oiled-cake": "cotton-doc.webp",
  "cotton-de-oiled-cake": "cotton-doc.webp",
  dorb: "dorb.jpeg",
  "de-oiled-rice-bran-dorb": "dorb.jpeg",
  "de-oiled-rice-bran": "dorb.jpeg",
  "deoiled-rice-bran": "dorb.jpeg",
  "groundnut-doc": "gn-doc.webp",
  "gn-doc": "gn-doc.webp",
  "groundnut-de-oiled-cake": "gn-doc.webp",
  "groundnut-oil-cake": "gn-oil-cake.jpeg",
  "gn-oil-cake": "gn-oil-cake.jpeg",
  "groundnut-oil": "groundnut-oil.png",
  "groundnut-crude-oil": "groundnut-oil.png",
  "mustard-doc": "mustard-de-oiled-cake.webp",
  "mustard-de-oiled-cake": "mustard-de-oiled-cake.webp",
  "mustard-cake": "mustard-de-oiled-cake.webp",
  "refined-oil": "refined-oils.webp",
  "refined-oils": "refined-oils.webp",
  "other-refined-oils": "refined-oils.webp",
  "refined-groundnut-oil": "refined-oils.webp",
  "refined-sunflower-oil": "refined-oils.webp",
  "refined-soya-oil": "refined-oils.webp",
  "rice-bran-crude-oil": "rice-bran-crude-oil.jpg",
  "rice-ddgs": "rice-ddgs.webp",
  "soya-crude-oil": "soya-crude-oil.webp",
  "soya-doc": "soya-de-oiled-cake.webp",
  "soya-de-oiled-cake": "soya-de-oiled-cake.webp",
};

const RELATED_PRODUCT_IMAGE_BY_NAME: Record<string, string> = {
  "sunflower-pellets": "sunflower-meal.jpg",
  "palm-doc": "gn-doc.webp",
  "sal-doc": "gn-doc.webp",
  "shea-doc": "gn-doc.webp",
  "gingelly-doc": "gn-doc.webp",
  "mustard-oil-cake": "mustard-de-oiled-cake.webp",
  "cotton-oil-cake": "cotton-doc.webp",
  "sunflower-oil-cake": "sunflower-meal.jpg",
  "gingelly-oil-cake": "gn-oil-cake.jpeg",
  "maize-ddgs": "rice-ddgs.webp",
  "rice-ddg-hipro": "rice-ddgs.webp",
  "maize-ddgs-doc": "rice-ddgs.webp",
  "rice-for-animal-feed": "rice-ddgs.webp",
  maize: "rice-ddgs.webp",
  "yellow-maize": "rice-ddgs.webp",
  bajra: "rice-ddgs.webp",
  jowar: "rice-ddgs.webp",
  wheat: "rice-ddgs.webp",
  "wheat-bran": "dorb.jpeg",
  "broiler-starter-feed": "rice-ddgs.webp",
  "layer-mash": "rice-ddgs.webp",
  "rice-bran-full-fat": "dorb.jpeg",
  "toor-chunni": "gn-doc.webp",
  "soya-hulls": "soya-de-oiled-cake.webp",
  "cotton-hulls": "cotton-doc.webp",
  "guar-korma": "gn-doc.webp",
  "chittu-bran": "dorb.jpeg",
  "soya-lecithin": "soya-crude-oil.webp",
  "soya-flour": "soya-de-oiled-cake.webp",
  "soya-chunks": "soya-de-oiled-cake.webp",
};

const getProvidedProductImage = (value: string, imageMap: Record<string, string>): string | undefined => {
  const slug = slugify(value);
  const exactMatch = imageMap[slug];
  if (exactMatch) return exactMatch;

  const matchingName = Object.keys(imageMap)
    .filter((name) => slug.startsWith(`${name}-`))
    .sort((a, b) => b.length - a.length)[0];
  return matchingName ? imageMap[matchingName] : undefined;
};

export function getProductImageUrl(product: Pick<Product, "name" | "seoName" | "fileName">): string {
  const productNames = [product.seoName, product.name].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  const providedImage = productNames
    .map((name) => getProvidedProductImage(name, PRODUCT_IMAGE_BY_NAME))
    .find((fileName): fileName is string => Boolean(fileName));
  if (providedImage) return `${import.meta.env.BASE_URL}products/${providedImage}`;

  if (product.fileName) return `${API_URL}${product.fileName}`;

  const relatedImage = productNames
    .map((name) => getProvidedProductImage(name, RELATED_PRODUCT_IMAGE_BY_NAME))
    .find((fileName): fileName is string => Boolean(fileName));
  if (relatedImage) return `${import.meta.env.BASE_URL}products/${relatedImage}`;

  return "";
}

export function getRelatedProductImageUrl(product: Pick<Product, "name" | "seoName">): string {
  const productNames = [product.seoName, product.name].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  const relatedImage = productNames
    .map((name) => getProvidedProductImage(name, RELATED_PRODUCT_IMAGE_BY_NAME))
    .find((fileName): fileName is string => Boolean(fileName));
  return relatedImage ? `${import.meta.env.BASE_URL}products/${relatedImage}` : "";
}
