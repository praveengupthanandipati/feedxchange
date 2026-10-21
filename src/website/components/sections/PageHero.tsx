import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { sitePaths } from "../../routes/paths";

interface PageHeroProps {
  title: string;
  text: string;
}

/** Compact banner with breadcrumb for the inner pages. */
const PageHero = ({ title, text }: PageHeroProps) => (
  <section className="page-hero" aria-labelledby="page-title">
    <div className="site-container">
      <nav aria-label="Breadcrumb">
        <ol className="page-hero__crumbs">
          <li>
            <Link to={sitePaths.home}>Home</Link>
          </li>
          <li aria-current="page">
            <FiChevronRight aria-hidden /> {title}
          </li>
        </ol>
      </nav>
      <h1 id="page-title">{title}</h1>
      <p>{text}</p>
    </div>
  </section>
);

export default PageHero;
