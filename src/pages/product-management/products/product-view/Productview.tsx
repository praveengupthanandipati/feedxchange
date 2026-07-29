import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPackage } from "react-icons/fi";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import Table from "../../../../components/table/Table";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import type { TableColumn } from "../../../../components/table/table.types";
import { products } from "../products-list/products.data";
import {
  getProductDetail,
  priceHistoryPeriodOptions,
  type NutritionalSpecDetail,
  type PriceHistoryPeriod,
} from "./productDetail.data";
import "./Productview.scss";

const specColumns: TableColumn<NutritionalSpecDetail>[] = [
  { key: "parameter", header: "Parameter" },
  { key: "min", header: "Min", align: "center" },
  { key: "max", header: "Max", align: "center" },
  {
    key: "showInWebsite",
    header: "Show in Web",
    align: "center",
    render: (row) =>
      row.showInWebsite ? (
        <span className="product-view__check">✓</span>
      ) : (
        <span className="product-view__dash">—</span>
      ),
  },
];

const Productview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((row) => row.id === id);
  const detail = useMemo(() => (product ? getProductDetail(product) : null), [product]);
  const [period, setPeriod] = useState<PriceHistoryPeriod>("week");
  const [pendingDelete, setPendingDelete] = useState(false);

  if (!product || !detail) {
    return (
      <div className="product-view">
        <Link to="/products" className="product-view__back">
          <FiArrowLeft aria-hidden /> Products
        </Link>
        <div className="product-view-card">
          <p>No product found for id "{id}".</p>
        </div>
      </div>
    );
  }

  const priceData = detail.priceHistory[period];
  const latestPrice = priceData[priceData.length - 1]?.price ?? 0;
  const firstPrice = priceData[0]?.price ?? 0;
  const change = latestPrice - firstPrice;
  const changePercent = firstPrice ? Math.abs((change / firstPrice) * 100).toFixed(1) : "0.0";

  return (
    <div className="product-view">
      <div className="product-view__topbar">
        <h1>{product.productName}</h1>
        <Link to="/products" className="product-view__back">
          <FiArrowLeft aria-hidden /> Products
        </Link>
      </div>

      <div className="product-view__layout">
        <div className="product-view-card product-view-profile">
          <div className="product-view-profile__menu">
            <RowActionsMenu
              onEdit={() => navigate(`/products/edit/${product.id}`)}
              onDelete={() => setPendingDelete(true)}
            />
          </div>

          <div className="product-view-profile__image" style={{ backgroundColor: detail.imageColor }}>
            <FiPackage aria-hidden />
          </div>
          <h2 className="product-view-profile__name">{product.productName}</h2>

          <h3 className="product-view__section-title">Product Information</h3>
          <div className="product-view-profile__grid">
            <div className="product-view-field">
              <span className="product-view-field__label">Category</span>
              <p className="product-view-field__value">{product.category}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">Weight Clause</span>
              <p className="product-view-field__value">{detail.weightClauseLabel}</p>
            </div>
          </div>

          <div className="product-view-field">
            <span className="product-view-field__label">Status</span>
            <span
              className={`product-view__status product-view__status--${product.status.toLowerCase()}`}
            >
              {product.status}
            </span>
          </div>

          <div className="product-view-field">
            <span className="product-view-field__label">Description</span>
            <p className="product-view-field__value">{detail.description}</p>
          </div>
        </div>

        <div className="product-view-card product-view-main">
          <div className="product-view-main__section">
            <div className="product-view-main__section-header">
              <h3 className="product-view__section-title">Price History</h3>
              <SearchableSelect
                options={priceHistoryPeriodOptions}
                value={period}
                onChange={(value) => setPeriod(value as PriceHistoryPeriod)}
                ariaLabel="Price history period"
              />
            </div>

            <div className="product-view-price">
              <div className="product-view-price__summary">
                <p className="product-view-price__figure">₹{latestPrice.toLocaleString("en-IN")}</p>
                <span className={`product-view-price__delta ${change >= 0 ? "is-up" : "is-down"}`}>
                  {change >= 0 ? "▲" : "▼"} {changePercent}%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={priceData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eef0f3" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ea4ad", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ea4ad", fontSize: 12 }}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e1e4e8", fontSize: 13 }}
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Price"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1b3664"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="product-view-main__section">
            <h3 className="product-view__section-title">Nutritional Specifications</h3>
            <Table
              columns={specColumns}
              data={detail.specs}
              rowKey={(row) => row.id}
              emptyMessage="No nutritional specifications available."
            />
          </div>

          <div className="product-view-main__section">
            <h3 className="product-view__section-title">Nutritional Value and Uses</h3>
            <ul className="product-view-values">
              {detail.values.map((row) => (
                <li key={row.id} className="product-view-values__item">
                  <p className="product-view-values__title">{row.value}</p>
                  <p className="product-view-values__description">{row.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete}
        title="Remove this product?"
        message={`This will permanently delete "${product.productName}". This cannot be undone.`}
        onConfirm={() => navigate("/products")}
        onCancel={() => setPendingDelete(false)}
      />
    </div>
  );
};

export default Productview;
