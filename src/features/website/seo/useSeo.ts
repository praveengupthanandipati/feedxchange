import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { company } from "../data/content";
import { DEFAULT_IMAGE, SITE_URL, absoluteUrl, breadcrumbSchema, graph, webPageSchema, type Crumb } from "./schema";

export interface SeoOptions {
  /** The page's own title, e.g. "Feed Ingredient Prices". " | FeedXchange" is added unless fullTitle is set. */
  title: string;
  /** The whole <title> as is (the home page puts its keyword first and the brand last itself). */
  fullTitle?: string;
  /** 120-160 characters: what the page answers, with its main keywords. */
  description: string;
  keywords?: string[];
  /** Absolute or root-relative picture for link previews (1200 x 630 works best). */
  image?: string;
  imageAlt?: string;
  /** Open Graph type: "website" (default), "article", "product". */
  ogType?: string;
  /** schema.org type of the page: WebPage (default), AboutPage, ContactPage, CollectionPage, FAQPage, ... */
  pageType?: string;
  /** Pages between Home and this one (the page itself is added last), for the breadcrumb trail. Omit on the home page. */
  breadcrumbs?: Crumb[];
  /** Extra structured data for this page (Product, FAQPage, ItemList, ...), added to the page's JSON-LD graph. */
  schema?: Record<string, unknown>[];
  /** Keep the page out of search results (404, thank-you pages). */
  noindex?: boolean;
  /** False while the page still waits for its data: a prerendered copy stays on screen until then (default true). */
  ready?: boolean;
}

const DEFAULT_KEYWORDS = [
  "animal feed ingredients",
  "feed raw materials",
  "B2B feed ingredient marketplace India",
  "poultry feed raw materials",
  "cattle feed ingredients",
  "aqua feed ingredients",
  "de-oiled cake",
  "soybean meal",
  "DDGS",
  "de-oiled rice bran",
  "feed ingredient prices",
  "FeedXchange",
];

/** Creates or updates one <meta>/<link> in <head> and returns how to put it back. */
const setHead = (selector: string, create: () => HTMLElement, attribute: string, value: string) => {
  let element = document.head.querySelector<HTMLElement>(selector);
  const created = !element;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  const previous = element.getAttribute(attribute);
  element.setAttribute(attribute, value);
  return () => {
    if (created) element?.remove();
    else if (previous !== null) element?.setAttribute(attribute, previous);
  };
};

const meta = (key: "name" | "property") => (name: string, content: string) =>
  setHead(`meta[${key}="${name}"]`, () => { const m = document.createElement("meta"); m.setAttribute(key, name); return m; }, "content", content);

/** The page's JSON-LD (one <script>, replaced on every page). JSON-LD is data, not code: the Content-Security-Policy does not apply to it. */
const setJsonLd = (data: unknown) => {
  let script = document.head.querySelector<HTMLScriptElement>('script[data-fx-seo="page"]');
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.fxSeo = "page";
    document.head.appendChild(script);
  }
  // "<" escaped so a product text can never close the script element
  script.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
  return () => script?.remove();
};

/**
 * Everything search engines, answer engines (AI overviews, chat assistants) and link previews read from a website page: the title,
 * description, keywords, canonical address, robots, Open Graph / Twitter cards and the page's schema.org JSON-LD (the page, its
 * breadcrumb trail and whatever the page adds). Put back when the page is left. The prerender step saves all of it into the HTML.
 */
export const useSeo = (options: SeoOptions) => {
  const { pathname } = useLocation();
  const { title, fullTitle, description, keywords, image, imageAlt, ogType, pageType, breadcrumbs, schema, noindex, ready = true } = options;
  // Objects are compared by content: a page passes new arrays on every render.
  const key = JSON.stringify(options);

  useEffect(() => {
    const full = fullTitle ?? `${title} | ${company.name}`;
    const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const url = `${SITE_URL}${path}`;
    const picture = image ? absoluteUrl(image) : DEFAULT_IMAGE;
    const previousTitle = document.title;
    document.title = full;

    const byName = meta("name");
    const byProperty = meta("property");
    const crumbs = breadcrumbs ? [...breadcrumbs, { name: title, path }] : null;
    const undo = [
      byName("description", description),
      byName("keywords", [...(keywords ?? []), ...DEFAULT_KEYWORDS].filter((k, i, all) => all.indexOf(k) === i).join(", ")),
      byName("robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"),
      byName("twitter:card", "summary_large_image"),
      byName("twitter:title", full),
      byName("twitter:description", description),
      byName("twitter:image", picture),
      byName("twitter:image:alt", imageAlt ?? full),
      byProperty("og:type", ogType ?? "website"),
      byProperty("og:site_name", company.name),
      byProperty("og:locale", "en_IN"),
      byProperty("og:title", full),
      byProperty("og:description", description),
      byProperty("og:url", url),
      byProperty("og:image", picture),
      byProperty("og:image:alt", imageAlt ?? full),
      setHead('link[rel="canonical"]', () => { const l = document.createElement("link"); l.setAttribute("rel", "canonical"); return l; }, "href", url),
      setJsonLd(
        graph([
          webPageSchema({ type: pageType, path, name: full, description, image: picture, breadcrumbId: Boolean(crumbs) }),
          ...(crumbs ? [breadcrumbSchema(path, crumbs)] : []),
          ...(schema ?? []),
        ]),
      ),
    ];
    // A prerendered page stays on screen while the app starts in the background; now that this page has rendered, show the app.
    if (ready) (window as Window & { __fxShowApp?: () => void }).__fxShowApp?.();
    return () => {
      document.title = previousTitle;
      undo.forEach((fn) => fn());
    };
    // `key` stands for all the options
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pathname]);
};
