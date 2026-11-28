import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../../features/website/styles/styles.scss";
import { heroImage } from "../../features/website/assets/images/hero/heroImage";
import BackToTop from "../../features/website/components/common/BackToTop";
import SiteLoader from "../../features/website/components/common/SiteLoader";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import { usePageReady } from "../../features/website/hooks/usePageReady";
import { useReducedMotion } from "../../features/website/hooks/useReducedMotion";
import { useScrollReveal } from "../../features/website/hooks/useScrollReveal";
import { useSiteSchema } from "../../features/website/seo/useSiteSchema";

/** Time the loader takes to fade out (matches .fx-loader's transition). */
const LOADER_FADE = 450;

/** Header + page + footer for every website route. The .fx-site root scopes all website styles. */
const WebsiteLayout = () => {
  const { pathname } = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  // Show the loader until the hero photo and fonts are in, then fade it out and remove it.
  const ready = usePageReady([heroImage()]);
  // A prerendered page is already on screen (main.tsx keeps it there while the app starts): no loading screen over it.
  const [prerendered] = useState(() => Boolean((window as Window & { __fxPrerendered?: boolean }).__fxPrerendered));
  const [loaderGone, setLoaderGone] = useState(prerendered);
  const firstPath = useRef(pathname);
  useSiteSchema();

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setLoaderGone(true), LOADER_FADE);
    return () => window.clearTimeout(timer);
  }, [ready]);

  // New page → start at the top, like a normal multi-page site. Not on the first page: the visitor may already have scrolled the
  // prerendered copy of it.
  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = "";
    window.scrollTo(0, 0);
  }, [pathname]);

  // Start the scroll animations once the loader has gone, so the first ones are actually seen.
  useScrollReveal(rootRef, reducedMotion || !ready);

  return (
    <div className="fx-site" ref={rootRef} aria-busy={!ready}>
      {!loaderGone && <SiteLoader leaving={ready} />}
      <a href="#site-main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="site-main" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop reducedMotion={reducedMotion} />
    </div>
  );
};

export default WebsiteLayout;
