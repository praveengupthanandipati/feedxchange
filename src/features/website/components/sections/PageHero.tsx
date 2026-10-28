import { ChevronRightIcon } from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import type { NavLinkItem } from "../../data/content";
import { sitePaths } from "../../routes/paths";

interface PageHeroProps {
  title: string;
  text: string;
  /** Extra breadcrumb level between Home and this page, e.g. Products on a product page. */
  parent?: NavLinkItem;
}

/** Compact banner with breadcrumb for the inner pages. */
const PageHero = ({ title, text, parent }: PageHeroProps) => (
  <section className="page-hero" aria-labelledby="page-title">
    <div className="site-container">
      <nav aria-label="Breadcrumb">
        <ol className="page-hero__crumbs">
          <li>
            <Link to={sitePaths.home}>Home</Link>
          </li>
          {parent && (
            <li>
              <ChevronRightIcon aria-hidden /> <Link to={parent.to}>{parent.label}</Link>
            </li>
          )}
          <li aria-current="page">
            <ChevronRightIcon aria-hidden /> {title}
          </li>
        </ol>
      </nav>
      <h1 id="page-title">{title}</h1>
      <p>{text}</p>
    </div>
  </section>
);

export default PageHero;
