/** The website owns the root of the domain; the signed-in application lives under /admin. */
export const sitePaths = {
  home: "/",
  about: "/about",
  products: "/products",
  faqs: "/faqs",
  blogs: "/blogs",
  contact: "/contact",
  join: "/join",
  privacy: "/privacy",
  terms: "/terms",
} as const;

/** One product's page, e.g. /products/maize-ddgs. */
export const productPath = (slug: string) => `${sitePaths.products}/${slug}`;
