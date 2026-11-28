import { about, company } from "../data/content";
import type { Faq } from "../data/content";

/** The public address of the site, used for canonical, Open Graph and structured data links. Set VITE_SITE_URL at build time for other environments. */
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://feedxchange.in").replace(/\/$/, "");

/** An absolute address on this site ("/about" -> "https://feedxchange.in/about"). */
export const absoluteUrl = (path: string) => (/^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`);

/** The picture link previews and search results use when a page has none of its own (1200 x 630, public/og-image.jpg). */
export const DEFAULT_IMAGE = absoluteUrl("/og-image.jpg");
const LOGO = absoluteUrl("/brand/logo.png");

const ORG_ID = `${SITE_URL}/#organization`;
const BUSINESS_ID = `${SITE_URL}/#localbusiness`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** "174, 1st floor, ..., Vijayawada, Andhra Pradesh - 521225" in schema.org form. */
const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: "174, 1st floor, Mahatma Gandhi Wholesale Commercial Complex, Mahendra Nagar, Gollapudi",
  addressLocality: "Vijayawada",
  addressRegion: "Andhra Pradesh",
  postalCode: "521225",
  addressCountry: "IN",
};

/** What FeedXchange trades: used as "knowsAbout" so search and AI answer engines connect the brand to these topics. */
export const TOPICS = [
  "Animal feed ingredients",
  "Feed raw materials",
  "De-oiled cakes (DOC)",
  "Soybean meal",
  "De-oiled rice bran (DORB)",
  "DDGS (Distillers Dried Grains with Solubles)",
  "Maize and feed-quality grains",
  "Poultry feed raw materials",
  "Aqua feed (fish and prawn) ingredients",
  "Cattle feed ingredients",
  "Feed ingredient prices in India",
  "Truck logistics for feed ingredients",
];

type Json = Record<string, unknown>;

/** The business behind the website: shown on every page (with the WebSite), so every page says who publishes it. */
export const organizationSchema = (): Json => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: company.name,
  alternateName: ["FeedXchange.in", "Feed Xchange"],
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: LOGO, width: 592, height: 97 },
  image: DEFAULT_IMAGE,
  description: `${company.name} is India's first dedicated B2B digital marketplace for animal feed ingredients: live indicative prices, KYC-verified sellers and buyers, contract tracking and truck logistics for de-oiled cakes, grains, DDGS, rice bran and edible oils.`,
  slogan: company.tagline,
  email: company.email,
  telephone: company.phone.replace(/\s/g, ""),
  address: postalAddress,
  areaServed: { "@type": "Country", name: "India" },
  knowsAbout: TOPICS,
  parentOrganization: { "@type": "Organization", name: about.parent, foundingDate: String(about.founded), address: postalAddress },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: company.phone.replace(/\s/g, ""),
      email: company.email,
      areaServed: "IN",
      availableLanguage: ["English"],
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    },
  ],
});

/** The office in Vijayawada, for local results ("feed ingredient suppliers near Vijayawada"). */
export const localBusinessSchema = (): Json => ({
  "@type": "ProfessionalService",
  "@id": BUSINESS_ID,
  name: company.name,
  url: `${SITE_URL}/`,
  image: DEFAULT_IMAGE,
  logo: LOGO,
  telephone: company.phone.replace(/\s/g, ""),
  email: company.email,
  address: postalAddress,
  areaServed: { "@type": "Country", name: "India" },
  priceRange: "Free to register",
  parentOrganization: { "@id": ORG_ID },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
});

export const websiteSchema = (): Json => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: company.name,
  alternateName: "FeedXchange.in",
  description: "B2B marketplace for animal feed ingredients in India",
  inLanguage: "en-IN",
  publisher: { "@id": ORG_ID },
});

/** The page itself, tied to the website and the publisher. */
export const webPageSchema = (opts: { type?: string; path: string; name: string; description: string; image?: string; breadcrumbId?: boolean }): Json => ({
  "@type": opts.type ?? "WebPage",
  "@id": `${absoluteUrl(opts.path)}#webpage`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  description: opts.description,
  inLanguage: "en-IN",
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORG_ID },
  publisher: { "@id": ORG_ID },
  primaryImageOfPage: { "@type": "ImageObject", url: opts.image ?? DEFAULT_IMAGE },
  ...(opts.breadcrumbId ? { breadcrumb: { "@id": `${absoluteUrl(opts.path)}#breadcrumb` } } : {}),
});

export interface Crumb {
  name: string;
  path: string;
}

/** Home > ... > this page. */
export const breadcrumbSchema = (path: string, crumbs: Crumb[]): Json => ({
  "@type": "BreadcrumbList",
  "@id": `${absoluteUrl(path)}#breadcrumb`,
  itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

/** Questions and answers shown on the page (answer engines quote these directly). */
export const faqPageSchema = (path: string, faqs: Faq[]): Json => ({
  "@type": "FAQPage",
  "@id": `${absoluteUrl(path)}#faq`,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

export interface SchemaProduct {
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  image: string | null;
  /** Indicative price in ₹, per weightClause (e.g. "per kg"). 0 = not shown. */
  price: number;
  weightClause: string;
  nutrients?: { label: string; value: string }[];
}

/** A feed ingredient sold through the marketplace. The price is indicative (confirmed on the contract), so it is an AggregateOffer-free single offer. */
export const productSchema = (product: SchemaProduct, path: string): Json => {
  const perKg = /kg/i.test(product.weightClause);
  return {
    "@type": "Product",
    "@id": `${absoluteUrl(path)}#product`,
    name: product.name,
    description: product.description,
    category: product.categoryName,
    image: product.image ? [product.image] : [DEFAULT_IMAGE],
    url: absoluteUrl(path),
    brand: { "@type": "Brand", name: company.name },
    ...(product.nutrients?.length
      ? { additionalProperty: product.nutrients.map((n) => ({ "@type": "PropertyValue", name: n.label, value: n.value })) }
      : {}),
    ...(product.price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl(path),
            priceCurrency: "INR",
            price: product.price,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: product.price,
              priceCurrency: "INR",
              unitCode: perKg ? "KGM" : "TNE",
              valueAddedTaxIncluded: false,
            },
            availability: "https://schema.org/InStock",
            businessFunction: "http://purl.org/goodrelations/v1#Sell",
            seller: { "@id": ORG_ID },
          },
        }
      : {}),
  };
};

/** The product list of the Products page. */
export const itemListSchema = (path: string, items: { name: string; path: string }[]): Json => ({
  "@type": "ItemList",
  "@id": `${absoluteUrl(path)}#itemlist`,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: absoluteUrl(item.path) })),
});

/** Wraps nodes into one JSON-LD document (one <script> per page). */
export const graph = (nodes: Json[]) => ({ "@context": "https://schema.org", "@graph": nodes });
