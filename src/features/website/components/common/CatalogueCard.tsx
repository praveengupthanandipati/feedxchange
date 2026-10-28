import { ArrowRightIcon } from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import placeholderImage from "../../assets/images/product-placeholder.svg";
import { categoryOf, type CatalogueItem } from "../../data/content";
import { productPath } from "../../routes/paths";

/**
 * Product tile: image, category tag and name; the whole card links to the product page.
 * Fades in with a CSS animation (not data-reveal), so it also shows when a filter swaps the list.
 */
const CatalogueCard = ({ item, index = 0 }: { item: CatalogueItem; index?: number }) => (
  <li className="catalogue-card" style={{ animationDelay: `${(index % 5) * 60}ms` }}>
    <Link to={productPath(item.slug)} className="catalogue-card__link">
      <div className="catalogue-card__image">
        <img src={placeholderImage} alt="" width={320} height={240} loading="lazy" decoding="async" />
        <span className="catalogue-card__tag">{categoryOf(item)?.name}</span>
      </div>
      <h3>{item.name}</h3>
      <span className="catalogue-card__more">
        View details <ArrowRightIcon aria-hidden />
      </span>
    </Link>
  </li>
);

export default CatalogueCard;
