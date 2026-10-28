import { ArrowRightIcon, PackageIcon } from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import type { Product } from "../../data/content";
import { productPath } from "../../routes/paths";

/** Whole card is one link to the product page. */
const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => (
  <li className="feature-card product-card" data-reveal data-reveal-delay={(index % 3) * 100}>
    <Link to={productPath(product.slug)} className="product-card__link">
      <span className="feature-card__icon">
        <PackageIcon aria-hidden />
      </span>
      <h3>{product.name}</h3>
      <p>{product.summary}</p>
      <span className="product-card__more">
        View details <ArrowRightIcon aria-hidden />
      </span>
    </Link>
  </li>
);

export default ProductCard;
