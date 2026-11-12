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

// Same product, different wording: "Groundnut Deoiled Cake" is Groundnut DOC, "Cottonseed Cake" is Cotton Oil Cake.
const SYNONYMS: [RegExp, string][] = [
  [/\bde-?oiled-cake\b/g, "doc"],
  [/\bcottonseed\b/g, "cotton"],
  [/\bground-?nut\b/g, "groundnut"],
  // Any refined oil ("Refined Groundnut Oil", "Refined Sunflower Oil") sits with the document's "Other Refined Oils".
  [/^refined-[a-z-]+-oils?$/g, "other-refined-oils"],
];
const STOP_WORDS = new Set(["and", "for", "the", "of", "protein", "grade", "premium", "quality"]);
const tokensOf = (slug: string) => slug.split("-").filter((token) => token && !STOP_WORDS.has(token) && !/^\d+$/.test(token));
const ORDER_TOKENS = PRODUCT_ORDER.map((slug) => tokensOf(slug));

/**
 * Nearest entry in the document's list for a product whose name isn't an exact match (e.g. "Soya DOC (44% Protein)",
 * "Yellow Maize"): first a list entry whose words all appear in the product's name (the most specific one wins),
 * else a list entry that contains all of the product's words. No match: undefined (the product goes last).
 */
const nearestRank = (slug: string): number | undefined => {
  let normalized = slug;
  for (const [pattern, replacement] of SYNONYMS) normalized = normalized.replace(pattern, replacement);
  const exact = RANK.get(normalized);
  if (exact !== undefined) return exact;
  const words = tokensOf(normalized);
  if (words.length === 0) return undefined;

  let best: { index: number; size: number } | undefined;
  ORDER_TOKENS.forEach((orderWords, index) => {
    if (orderWords.length > 0 && orderWords.every((word) => words.includes(word)) && (!best || orderWords.length > best.size)) {
      best = { index, size: orderWords.length };
    }
  });
  if (best) return best.index;

  const contained = ORDER_TOKENS.findIndex((orderWords) => words.every((word) => orderWords.includes(word)));
  return contained >= 0 ? contained : undefined;
};

/**
 * Position of a product in the list: by SEO name, else its name made URL-friendly, else the nearest entry
 * (so renamed / sample products still follow the document's priority); unlisted ones get Infinity.
 */
export const productRank = (seoName: string | null | undefined, name: string | null | undefined) => {
  const seo = seoName?.trim() || "";
  const nameSlug = slugify(name ?? "");
  return (
    RANK.get(seo) ??
    RANK.get(nameSlug) ??
    (seo ? nearestRank(seo) : undefined) ??
    (nameSlug ? nearestRank(nameSlug) : undefined) ??
    Number.POSITIVE_INFINITY
  );
};

/** Sort comparator: the document's order, then by name. */
export const compareProducts = <T extends { seoName?: string | null; name?: string | null }>(a: T, b: T) =>
  productRank(a.seoName, a.name) - productRank(b.seoName, b.name) || (a.name ?? "").localeCompare(b.name ?? "");
