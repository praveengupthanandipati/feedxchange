/** Every website URL lives under this prefix, so it never collides with the admin app's routes. */
export const WEBSITE_BASE = "/website";

export const sitePaths = {
  home: WEBSITE_BASE,
  about: `${WEBSITE_BASE}/about`,
  products: `${WEBSITE_BASE}/products`,
  faqs: `${WEBSITE_BASE}/faqs`,
  blogs: `${WEBSITE_BASE}/blogs`,
  contact: `${WEBSITE_BASE}/contact`,
  join: `${WEBSITE_BASE}/join`,
  privacy: `${WEBSITE_BASE}/privacy`,
  terms: `${WEBSITE_BASE}/terms`,
} as const;

/** One product's page, e.g. /website/products/maize-ddgs. */
export const productPath = (slug: string) => `${sitePaths.products}/${slug}`;
