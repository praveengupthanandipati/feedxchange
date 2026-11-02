import { formatRupees } from "../contracts/dashboard/contractsDashboard.utils";
import { useHomeLive } from "./homeLive";

/** Theme chart colours, in fixed order. */
const COLORS = ["var(--fx-chart-1)", "var(--fx-chart-2)", "var(--fx-chart-3)", "var(--fx-chart-4)", "var(--fx-chart-5)"];

/** Top five products by invoice amount in the chosen period. */
const TopSellingProducts = () => {
  const live = useHomeLive();
  const products = live?.topProducts ?? null;
  const status = !live || (!products && !live.invoicesFailed) ? "Loading…" : live.invoicesFailed ? "Not available." : products?.length === 0 ? "No invoices in this period." : "";

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Top Selling Products</h2>
        <span className="dashboard-card__sort">
          <strong>{live?.periodLabel}</strong>
        </span>
      </div>

      {status ? (
        <p className="dashboard-card__empty">{status}</p>
      ) : (
        <ul className="dashboard-products">
          {products?.map((product, index) => (
            <li key={product.name} className="dashboard-products__item" title={`${product.name}: ${formatRupees(product.amount)}`}>
              <span className="dashboard-products__dot" style={{ backgroundColor: COLORS[index] }} />
              <span className="dashboard-products__name">{product.name}</span>
              <span className="dashboard-products__bar">
                <span className="dashboard-products__bar-fill" style={{ width: `${product.percent}%`, backgroundColor: COLORS[index] }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopSellingProducts;
