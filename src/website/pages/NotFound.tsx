import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { sitePaths } from "../routes/paths";

const NotFound = () => {
  usePageTitle("Page not found");

  return (
    <section className="section not-found">
      <div className="site-container">
        <p className="not-found__code">404</p>
        <h1>We couldn't find that page</h1>
        <p>The page may have moved, or the link may be mistyped.</p>
        <Link to={sitePaths.home} className="btn-site btn-site--dark">
          <FiArrowLeft aria-hidden /> Back to home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
