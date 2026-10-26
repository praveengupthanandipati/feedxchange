import { FiChevronDown } from "react-icons/fi";
import { topSellingProducts } from "./dashboard.data";

const TopSellingProducts = () => {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Top Selling Products</h2>
        <button type="button" className="dashboard-card__sort">
          Sort By: <strong>Yearly</strong> <FiChevronDown aria-hidden />
        </button>
      </div>

      <ul className="dashboard-products">
        {topSellingProducts.map((product) => (
          <li key={product.id} className="dashboard-products__item">
            <span className="dashboard-products__dot" style={{ backgroundColor: product.color }} />
            <span className="dashboard-products__name">{product.name}</span>
            <span className="dashboard-products__bar">
              <span
                className="dashboard-products__bar-fill"
                style={{ width: `${product.percent}%`, backgroundColor: product.color }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopSellingProducts;
