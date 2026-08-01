import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiUsers, FiMapPin, FiTag, FiTrendingUp, FiTrendingDown, FiBarChart2, FiActivity } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import {
  sellers,
  productOptions,
  filterPeriodOptions,
  getSellerPriceHistory,
  aggregatePoints,
  type FilterPeriod,
} from "./priceHistory.data";
import "./ProductPrieHistory.scss";

const todayISO = () => new Date().toISOString().slice(0, 10);

const SERIES_LABELS: Record<string, string> = {
  originalPrice: "Original Price",
  offerPrice: "Offer Price",
  resalePrice: "Resale Price",
};

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const ProductPrieHistory = () => {
  const [searchParams] = useSearchParams();
  const productParam = searchParams.get("product");
  const initialProduct = productOptions.some((option) => option.value === productParam)
    ? (productParam as string)
    : productOptions[2].value;

  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [appliedProduct, setAppliedProduct] = useState(initialProduct);
  const [dateValue, setDateValue] = useState(todayISO());
  const [selectedSellerId, setSelectedSellerId] = useState(sellers[0].id);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("Daywise");

  const selectedSeller = sellers.find((seller) => seller.id === selectedSellerId) ?? sellers[0];

  const fullHistory = useMemo(
    () => getSellerPriceHistory(appliedProduct, selectedSellerId),
    [appliedProduct, selectedSellerId],
  );

  const daywisePoints = useMemo(() => fullHistory.slice(-14), [fullHistory]);
  const chartPoints = useMemo(
    () => aggregatePoints(fullHistory, filterPeriod),
    [fullHistory, filterPeriod],
  );

  const latest = daywisePoints[daywisePoints.length - 1];
  const previous = daywisePoints[daywisePoints.length - 2];
  const currentPrice = latest?.originalPrice ?? 0;
  const dailyChangePercent = previous && previous.originalPrice
    ? ((latest.originalPrice - previous.originalPrice) / previous.originalPrice) * 100
    : 0;
  const avgPrice = daywisePoints.length
    ? Math.round(daywisePoints.reduce((sum, point) => sum + point.originalPrice, 0) / daywisePoints.length)
    : 0;

  const analyticsLatest = chartPoints[chartPoints.length - 1];
  const analyticsCurrentPrice = analyticsLatest?.originalPrice ?? 0;
  const analyticsAvgPrice = chartPoints.length
    ? Math.round(chartPoints.reduce((sum, point) => sum + point.originalPrice, 0) / chartPoints.length)
    : 0;
  const volatility = useMemo(() => {
    if (!chartPoints.length || !analyticsAvgPrice) return 0;
    const variance =
      chartPoints.reduce((sum, point) => sum + (point.originalPrice - analyticsAvgPrice) ** 2, 0) /
      chartPoints.length;
    return (Math.sqrt(variance) / analyticsAvgPrice) * 100;
  }, [chartPoints, analyticsAvgPrice]);

  const handleApply = () => {
    setAppliedProduct(selectedProduct);
  };

  return (
    <div className="price-history-page">
      <div className="price-history-filters">
        <h1>Price History</h1>
        <div className="price-history-filters__controls">
          <SearchableSelect
            options={productOptions}
            value={selectedProduct}
            onChange={setSelectedProduct}
            ariaLabel="Select product"
          />
          <input
            type="date"
            className="price-history-filters__date"
            value={dateValue}
            onChange={(event) => setDateValue(event.target.value)}
            aria-label="Select date"
          />
          <button type="button" className="price-history-filters__apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>

      <div className="price-history-layout">
        <aside className="price-history-sellers">
          <div className="price-history-sellers__header">
            <FiUsers aria-hidden /> Premium Sellers
          </div>
          <ul className="price-history-sellers__list">
            {sellers.map((seller) => (
              <li key={seller.id}>
                <button
                  type="button"
                  className={`price-history-sellers__item ${
                    seller.id === selectedSellerId ? "is-active" : ""
                  }`}
                  onClick={() => setSelectedSellerId(seller.id)}
                  aria-pressed={seller.id === selectedSellerId}
                >
                  <span className="price-history-sellers__avatar">{seller.initials}</span>
                  <span className="price-history-sellers__info">
                    <strong>{seller.name}</strong>
                    <span>
                      <FiMapPin aria-hidden /> {seller.city}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="price-history-main">
          <div className="price-history-stats">
            <div className="price-history-stat">
              <span className="price-history-stat__icon">
                <FiTag aria-hidden />
              </span>
              <strong>{formatINR(currentPrice)}</strong>
              <span>Current Price</span>
            </div>
            <div className="price-history-stat">
              <span className="price-history-stat__icon">
                {dailyChangePercent >= 0 ? <FiTrendingUp aria-hidden /> : <FiTrendingDown aria-hidden />}
              </span>
              <strong className={dailyChangePercent >= 0 ? "is-up" : "is-down"}>
                {dailyChangePercent >= 0 ? "+" : ""}
                {dailyChangePercent.toFixed(1)}%
              </strong>
              <span>Daily Change</span>
            </div>
            <div className="price-history-stat">
              <span className="price-history-stat__icon">
                <FiBarChart2 aria-hidden />
              </span>
              <strong>{formatINR(avgPrice)}</strong>
              <span>Avg. Price</span>
            </div>
          </div>

          <div className="price-history-analytics">
            <div className="price-history-analytics__header">
              <h2>
                <FiActivity aria-hidden /> Price Analytics
                <span className="price-history-analytics__seller"> — {selectedSeller.name}</span>
              </h2>
              <div className="price-history-analytics__filter">
                <span>Filter by:</span>
                <SearchableSelect
                  options={filterPeriodOptions}
                  value={filterPeriod}
                  onChange={(value) => setFilterPeriod(value as FilterPeriod)}
                  ariaLabel="Filter analytics period"
                />
              </div>
            </div>

            <div className="price-history-analytics__metrics">
              <div>
                <strong>{formatINR(analyticsCurrentPrice)}</strong>
                <span>Current Price</span>
              </div>
              <div>
                <strong>{formatINR(analyticsAvgPrice)}</strong>
                <span>Average Price ({filterPeriod})</span>
              </div>
              <div>
                <strong>{volatility.toFixed(1)}%</strong>
                <span>Price Volatility</span>
              </div>
            </div>

            <div className="price-history-analytics__legend">
              <span>
                <i className="price-history-analytics__dot price-history-analytics__dot--original" />
                Original Price
              </span>
              <span>
                <i className="price-history-analytics__dot price-history-analytics__dot--offer" />
                Offer Price
              </span>
              <span>
                <i className="price-history-analytics__dot price-history-analytics__dot--resale" />
                Resale Price
              </span>
            </div>

            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <ComposedChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ea4ad", fontSize: 12 }}
                  minTickGap={16}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ea4ad", fontSize: 12 }}
                  width={56}
                  tickFormatter={(value) => `₹${value}`}
                  label={{
                    value: "Price (₹)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#9ea4ad", fontSize: 12 },
                  }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e1e4e8", fontSize: 13 }}
                  formatter={(value, name) => [
                    formatINR(Number(value)),
                    SERIES_LABELS[String(name)] ?? String(name),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="offerPrice"
                  stroke="#2e9e5b"
                  fill="#2e9e5b"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="originalPrice"
                  stroke="#1b3664"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="resalePrice"
                  stroke="#faa41a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPrieHistory;
