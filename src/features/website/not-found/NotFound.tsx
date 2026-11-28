import { useEffect } from "react";
import { ArrowLeftIcon } from "../../../shared/components/icon";
import { Link } from "react-router-dom";
import { useSeo } from "../seo/useSeo";
import { sitePaths } from "../routes/paths";

const NotFound = () => {
  useSeo({ title: "Page not found", description: "This page does not exist. Browse feed ingredients, prices and FAQs on feedXchange.", noindex: true });

  // The server answers 200 for unknown addresses (it serves the app), so tell search engines this is not a real page.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <section className="section not-found">
      <div className="site-container">
        <p className="not-found__code">404</p>
        <h1>We couldn't find that page</h1>
        <p>The page may have moved, or the link may be mistyped.</p>
        <Link to={sitePaths.home} className="btn-site btn-site--dark">
          <ArrowLeftIcon aria-hidden /> Back to home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
