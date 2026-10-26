import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { company } from "../data/content";

/** The public address of the site, used for canonical and Open Graph links. Set VITE_SITE_URL at build time for other environments. */
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://feedxchange.in").replace(/\/$/, "");

const DEFAULT_DESCRIPTION = `${company.tagline} Live prices, verified sellers and tracked deliveries on one platform.`;

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

/**
 * Sets what a search engine or a shared link shows for a website page: the tab title, description, canonical address and Open Graph
 * tags. Everything is put back when the page is left. The prerender step saves this into each page's HTML.
 */
export const usePageTitle = (title: string, description: string = DEFAULT_DESCRIPTION) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const full = `${title} | ${company.name}`;
    const url = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
    const previousTitle = document.title;
    document.title = full;

    const byName = meta("name");
    const byProperty = meta("property");
    const undo = [
      byName("description", description),
      byName("twitter:card", "summary_large_image"),
      byProperty("og:type", "website"),
      byProperty("og:site_name", company.name),
      byProperty("og:title", full),
      byProperty("og:description", description),
      byProperty("og:url", url),
      setHead('link[rel="canonical"]', () => { const l = document.createElement("link"); l.setAttribute("rel", "canonical"); return l; }, "href", url),
    ];
    return () => {
      document.title = previousTitle;
      undo.forEach((fn) => fn());
    };
  }, [title, description, pathname]);
};
