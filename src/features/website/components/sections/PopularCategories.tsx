import { type IconComponent, ArrowUpRightIcon, PackageIcon } from "../../../../shared/components/icon";
import { GiBeanstalk, GiBowlOfRice, GiChemicalTank, GiCorn, GiGrain, GiOilDrum } from "react-icons/gi";
import { Link } from "react-router-dom";
import { navItems, products } from "../../data/content";
import SectionHead from "../common/SectionHead";

/** Icon per category, keyed by the last part of its URL (the product slug). */
const ICONS: Record<string, IconComponent> = {
  "distilled-products": GiChemicalTank,
  "crude-oil": GiOilDrum,
  doc: GiGrain,
  "maize-ddgs": GiCorn,
  dorb: GiBowlOfRice,
  "soya-doc": GiBeanstalk,
};

const slugOf = (to: string) => to.split("/").pop() ?? "";

/**
 * Popular Categories. The names and links come from the header's Products dropdown, so the two always
 * match; each tile opens that category's product page.
 */
const PopularCategories = () => {
  const categories = navItems.find((item) => item.children)?.children ?? [];

  return (
    <section className="section site-categories" aria-labelledby="categories-title">
      <div className="site-container">
        <SectionHead id="categories-title" eyebrow="Shop by category" title="Popular Categories" text="Browse the feed ingredients our buyers trade most." />
        <ul className="site-categories__grid">
          {categories.map((category, index) => {
            const slug = slugOf(category.to);
            const Icon = ICONS[slug] ?? PackageIcon;
            const summary = products.find((product) => product.slug === slug)?.summary;
            return (
              <li key={category.to} data-reveal data-reveal-delay={(index % 3) * 90}>
                <Link to={category.to} className={`category-tile category-tile--${index % 6}`}>
                  <span className="category-tile__icon">
                    <Icon aria-hidden />
                  </span>
                  <span className="category-tile__text">
                    <strong>{category.label}</strong>
                    {summary && <small>{summary}</small>}
                  </span>
                  <ArrowUpRightIcon aria-hidden className="category-tile__go" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default PopularCategories;
