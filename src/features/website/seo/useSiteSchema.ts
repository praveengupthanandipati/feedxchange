import { useEffect } from "react";
import { graph, localBusinessSchema, organizationSchema, websiteSchema } from "./schema";

/**
 * Who publishes the website, on every website page: the organisation, its Vijayawada office and the website itself (schema.org
 * JSON-LD). Each page's own data (useSeo) refers to these by @id.
 */
export const useSiteSchema = () => {
  useEffect(() => {
    let script = document.head.querySelector<HTMLScriptElement>('script[data-fx-seo="site"]');
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.fxSeo = "site";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(graph([organizationSchema(), localBusinessSchema(), websiteSchema()])).replace(/</g, "\\u003c");
    const added = script;
    return () => added.remove();
  }, []);
};
