import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

/** Header + page + footer for every website route. The .fx-site root scopes all website styles. */
const WebsiteLayout = () => {
  const { pathname } = useLocation();

  // New page → start at the top, like a normal multi-page site.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="fx-site">
      <a href="#site-main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="site-main" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
