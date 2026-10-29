import { type IconComponent, ArrowUpRightIcon, PackageIcon } from "../../../../shared/components/icon";
import { GiBeanstalk, GiBowlOfRice, GiChemicalTank, GiCorn, GiGrain, GiOilDrum } from "react-icons/gi";
import { Link } from "react-router-dom";
import { useCatalogue } from "../../hooks/useCatalogue";
import { sitePaths } from "../../routes/paths";
import SectionHead from "../common/SectionHead";

/** Icon per category, picked by a word in its name (categories come from the admin, so there is no fixed list). */
const ICONS: [RegExp, IconComponent][] = [
  [/oil\b(?!.*cake)/i, GiOilDrum],
  [/cake|doc\b|meal/i, GiGrain],
  [/grain|cereal|maize|corn/i, GiCorn],
  [/bran|rice/i, GiBowlOfRice],
  [/pulse|legume|bean/i, GiBeanstalk],
  [/feed|distill|ddgs/i, GiChemicalTank],
];

const iconFor = (name: string) => ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? PackageIcon;

/**
 * Popular Categories: the active categories from GetAllCategories, in their admin priority order, each with its description
 * (or its first products when it has none); each tile opens the Products page on that category.
 */
const PopularCategories = () => {
  const { categories, productsIn } = useCatalogue();

  // Nothing to show until the catalogue has loaded (or if it fails); the rest of the home page carries on.
  if (categories.length === 0) return null;

  return (
    <section className="section site-categories" aria-labelledby="categories-title">
      <div className="site-container">
        <SectionHead id="categories-title" eyebrow="Shop by category" title="Popular Categories" text="Browse the feed ingredients our buyers trade most." />
        <ul className="site-categories__grid">
          {categories.map((category, index) => {
            const Icon = iconFor(category.name);
            const items = productsIn(category.id);
            return (
              <li key={category.id} data-reveal data-reveal-delay={(index % 3) * 90}>
                <Link to={`${sitePaths.products}?category=${category.id}`} className={`category-tile category-tile--${index % 6}`}>
                  <span className="category-tile__icon">
                    <Icon aria-hidden />
                  </span>
                  <span className="category-tile__text">
                    <strong>{category.name}</strong>
                    <small>
                      {category.description ||
                        `${items
                          .slice(0, 3)
                          .map((product) => product.name)
                          .join(", ")}${items.length > 3 ? ` and ${items.length - 3} more` : ""}`}
                    </small>
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
