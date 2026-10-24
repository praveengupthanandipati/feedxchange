import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import heroBg from "../assets/images/herobg.jpg";
import BackToTop from "../components/common/BackToTop";
import SiteLoader from "../components/common/SiteLoader";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import { usePageReady } from "../hooks/usePageReady";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollReveal } from "../hooks/useScrollReveal";

/** Time the loader takes to fade out (matches .fx-loader's transition). */
const LOADER_FADE = 450;

/** Header + page + footer for every website route. The .fx-site root scopes all website styles. */
const WebsiteLayout = () => {
  const { pathname } = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  // Show the loader until the hero photo and fonts are in, then fade it out and remove it.
  const ready = usePageReady([heroBg]);
  const [loaderGone, setLoaderGone] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setLoaderGone(true), LOADER_FADE);
    return () => window.clearTimeout(timer);
  }, [ready]);

  // New page → start at the top, like a normal multi-page site.
  useEffect(() => {
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
