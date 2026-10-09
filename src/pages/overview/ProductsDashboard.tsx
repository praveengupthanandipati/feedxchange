import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiBox, FiGrid, FiAlertTriangle, FiDollarSign } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../auth/AuthContext";
import { useGetProductsQuery } from "../../store/productsApi";
import { useGetAllActiveCategoriesQuery } from "../../store/categoryApi";
import DatePickerInput from "../../components/dropdown/DatePickerInput";
import SearchableSelect from "../../components/dropdown/SearchableSelect";
import "./ProductsDashboard.scss";

interface DashboardEntry {
  id: string;
  label: string;
  path: string;
}

interface ProductsDashboardProps {
  entries: DashboardEntry[];
}

const STOCK_COLORS = ["#2e9e5b", "#faa41a", "#9ea4ad"];

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const ProductsDashboard = ({ entries }: ProductsDashboardProps) => {
  const { can } = useAuth();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const canViewProducts = can("products.view", "products.manage");
  const canViewCategories = can("categories.view", "categories.manage");
  const canViewPrices = can("price.tracking", "price.history", "price.formula");

  const { data: products = [], isFetching: productsLoading, isError: productsError } = useGetProductsQuery(undefined, {
    skip: !canViewProducts,
    refetchOnMountOrArgChange: true,
  });
  const { data: categories = [], isFetching: categoriesLoading, isError: categoriesError } = useGetAllActiveCategoriesQuery(undefined, {
    skip: !canViewCategories,
    refetchOnMountOrArgChange: true,
  });

  const allActiveProducts = useMemo(
    () => products.filter((product) => product.isActive && !product.isDeleted),
    [products],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(allActiveProducts.map((product) => product.categoryName?.trim()).filter((name): name is string => Boolean(name))))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ value: name, label: name })),
    [allActiveProducts],
  );
  const activeProducts = useMemo(() => allActiveProducts.filter((product) => {
    const productDate = (product.createdAt || product.insertedTime || "").slice(0, 10);
    if (dateFrom && (!productDate || productDate < dateFrom)) return false;
    if (dateTo && (!productDate || productDate > dateTo)) return false;
    if (categoryFilter && product.categoryName?.trim() !== categoryFilter) return false;
    return true;
  }), [allActiveProducts, dateFrom, dateTo, categoryFilter]);
  const stockTrackedProducts = activeProducts.filter((product) => product.stock !== null);
  const lowStockCount = stockTrackedProducts.filter(
    (product) => product.stock !== null && product.minimumQuantity !== null && product.stock <= product.minimumQuantity,
  ).length;
  const averagePrice = activeProducts.length > 0
    ? activeProducts.reduce((sum, product) => sum + (Number(product.price) || 0), 0) / activeProducts.length
    : 0;

  const productsByCategory = useMemo(() => {
    const counts = activeProducts.reduce<Record<string, number>>((result, product) => {
      const name = product.categoryName?.trim() || "Uncategorized";
      result[name] = (result[name] ?? 0) + 1;
      return result;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([category, count]) => ({ category, count }));
  }, [activeProducts]);

  const stockStatus = useMemo(() => {
    const lowStock = stockTrackedProducts.filter(
      (product) => product.minimumQuantity !== null && product.stock !== null && product.stock <= product.minimumQuantity,
    ).length;
    const healthyStock = stockTrackedProducts.length - lowStock;
    const notTracked = activeProducts.length - stockTrackedProducts.length;
    return [
      { name: "Stock available", value: healthyStock },
      { name: "Low stock", value: lowStock },
      { name: "Not tracked", value: notTracked },
    ].filter((item) => item.value > 0);
  }, [activeProducts, stockTrackedProducts]);

  const quickLinks = entries;
  const categoriesWithProducts = new Set(activeProducts.map((product) => product.categoryName?.trim()).filter(Boolean)).size;
  const metrics = [
    ...(canViewProducts ? [{ label: "Active products", value: productsLoading ? "…" : activeProducts.length, icon: FiBox, color: "products-dashboard__card--navy", path: "/products" }] : []),
    ...(canViewCategories ? [{ label: canViewProducts ? "Categories with products" : "Active categories", value: productsLoading || categoriesLoading ? "…" : canViewProducts ? categoriesWithProducts : categories.length, icon: FiGrid, color: "products-dashboard__card--blue", path: "/categories" }] : []),
    ...(canViewProducts ? [{ label: "Low-stock products", value: productsLoading ? "…" : lowStockCount, icon: FiAlertTriangle, color: "products-dashboard__card--orange", path: "/products" }] : []),
    ...(canViewProducts && canViewPrices ? [{ label: "Average product price", value: productsLoading ? "…" : money(averagePrice), icon: FiDollarSign, color: "products-dashboard__card--green", path: "/products/price-tracking" }] : []),
  ];

  if (metrics.length === 0 && quickLinks.length === 0) return null;

  return (
    <section className="products-dashboard" aria-label="Products summary">
      <div className="products-dashboard__intro">
        <div>
          <p className="products-dashboard__eyebrow">PRODUCT OVERVIEW</p>
          <h2 className="products-dashboard__heading">Products dashboard</h2>
          <p className="products-dashboard__description">A quick look at your products, categories, stock, and prices.</p>
        </div>
      </div>

      {canViewProducts && (
        <div className="products-dashboard__filters" aria-label="Filter product dashboard">
          <label className="products-dashboard__filter">
            <span>Created from</span>
            <DatePickerInput value={dateFrom} onChange={setDateFrom} max={dateTo || undefined} ariaLabel="Filter products created from date" clearable />
          </label>
          <label className="products-dashboard__filter">
            <span>Created to</span>
            <DatePickerInput value={dateTo} onChange={setDateTo} min={dateFrom || undefined} ariaLabel="Filter products created to date" clearable />
          </label>
          <label className="products-dashboard__filter products-dashboard__filter--category">
            <span>Category</span>
            <SearchableSelect options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} placeholder="All categories" ariaLabel="Filter by product category" clearable />
          </label>
          {(dateFrom || dateTo || categoryFilter) && (
            <button type="button" className="products-dashboard__clear" onClick={() => { setDateFrom(""); setDateTo(""); setCategoryFilter(""); }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {metrics.length > 0 && (
        <div className="products-dashboard__grid">
          {metrics.map(({ label, value, icon: Icon, color, path }) => (
            <Link className={`products-dashboard__card ${color}`} to={path} key={label}>
              <span className="products-dashboard__icon"><Icon aria-hidden /></span>
              <span className="products-dashboard__content">
                <span className="products-dashboard__label">{label}</span>
                <strong className="products-dashboard__value">{value}</strong>
              </span>
            </Link>
          ))}
        </div>
      )}

      {canViewProducts && (
        <div className="products-dashboard__charts">
          <section className="products-dashboard__panel">
            <div className="products-dashboard__panel-heading">
              <span className="products-dashboard__panel-icon"><FiGrid aria-hidden /></span>
              <div>
                <h3>Products by category</h3>
                <p>Active products in each category</p>
              </div>
            </div>
            {productsError ? <p className="products-dashboard__muted">Could not load product data.</p> : productsLoading ? <p className="products-dashboard__muted">Loading products…</p> : productsByCategory.length === 0 ? <p className="products-dashboard__muted">No products match these filters.</p> : (
              <ResponsiveContainer width="100%" height={260} minWidth={0}>
                <BarChart data={productsByCategory} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Products" fill="#2f8fd6" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="products-dashboard__panel">
            <div className="products-dashboard__panel-heading">
              <span className="products-dashboard__panel-icon"><FiBox aria-hidden /></span>
              <div>
                <h3>Stock overview</h3>
                <p>Products grouped by stock level</p>
              </div>
            </div>
            {productsError ? <p className="products-dashboard__muted">Could not load stock data.</p> : productsLoading ? <p className="products-dashboard__muted">Loading stock…</p> : stockStatus.length === 0 ? <p className="products-dashboard__muted">No products match these filters.</p> : (
              <ResponsiveContainer width="100%" height={260} minWidth={0}>
                <PieChart>
                  <Pie data={stockStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="68%" label={({ name, value }) => `${name}: ${value}`}>
                    {stockStatus.map((item, index) => <Cell key={item.name} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>
      )}

      {canViewCategories && categoriesError && <p className="products-dashboard__muted">Could not load category totals.</p>}

      {quickLinks.length > 0 && (
        <section className="products-dashboard__quick-panel">
          <div>
            <h3>Product tools</h3>
            <p>Open a product management area</p>
          </div>
          <div className="products-dashboard__links">
            {quickLinks.map((entry) => (
              <Link to={entry.path} key={entry.id} className="products-dashboard__quick-link">
                <span>{entry.label}</span><FiArrowUpRight aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default ProductsDashboard;
