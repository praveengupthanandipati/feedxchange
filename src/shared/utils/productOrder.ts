/**
 * Product order, as in "Product Descriptions.docx" (by SEO name; the API has no product priority). Used by the website
 * catalogue and the admin product lists / dropdowns. Products not listed here come after these, by name.
 */
const PRODUCT_ORDER = [
  // De-Oiled Cakes (DOC)
  "soya-doc", "groundnut-doc", "mustard-doc", "de-oiled-rice-bran-dorb", "cotton-doc", "sunflower-doc", "sunflower-pellets",
  "palm-doc", "sal-doc", "shea-doc", "gingelly-doc",
  // Oil Cakes
  "groundnut-oil-cake", "mustard-oil-cake", "cotton-oil-cake", "sunflower-oil-cake", "gingelly-oil-cake",
  // Crude Oil
  "soya-crude-oil", "groundnut-crude-oil", "rice-bran-crude-oil", "other-refined-oils",
  // Distilled Products
  "rice-ddgs", "maize-ddgs", "rice-ddg-hipro", "maize-ddgs-doc",
  // Grains
  "rice-for-animal-feed", "maize", "bajra", "jowar", "wheat",
  // Others
  "soya-hulls", "cotton-hulls", "guar-korma", "chittu-bran", "soya-lecithin", "soya-flour", "soya-chunks",
];

const RANK = new Map(PRODUCT_ORDER.map((slug, index) => [slug, index]));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Position of a product in the list (by SEO name, else its name made URL-friendly); unlisted ones get Infinity. */
export const productRank = (seoName: string | null | undefined, name: string | null | undefined) =>
  RANK.get(seoName?.trim() || "") ?? RANK.get(slugify(name ?? "")) ?? Number.POSITIVE_INFINITY;

/** Sort comparator: the document's order, then by name. */
export const compareProducts = <T extends { seoName?: string | null; name?: string | null }>(a: T, b: T) =>
  productRank(a.seoName, a.name) - productRank(b.seoName, b.name) || (a.name ?? "").localeCompare(b.name ?? "");
