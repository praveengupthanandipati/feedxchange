import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPackage } from "react-icons/fi";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Table from "../../../../components/table/Table";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import type { TableColumn } from "../../../../components/table/table.types";
import { API_URL } from "../../../../api/api";
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
  parseProductFeatures,
  type ProductPriceHistoryEntry,
  type ProductNutritionalSpec,
} from "../../../../store/productsApi";
import { getProductStatus } from "../products-list/products.columns";
import "./Productview.scss";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const priceHistoryColumns: TableColumn<ProductPriceHistoryEntry>[] = [
  {
    key: "insertedTime",
    header: "Date",
    render: (row) => dateTimeFormatter.format(new Date(row.insertedTime)),
  },
  {
    key: "price",
    header: "Price",
    align: "right",
    render: (row) => `₹${row.price.toLocaleString("en-IN")}`,
  },
  { key: "reason", header: "Reason" },
];

const specColumns: TableColumn<ProductNutritionalSpec>[] = [
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
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id ?? "", { skip: !id });
  const [deleteProduct] = useDeleteProductMutation();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const priceHistory = useMemo(
    () =>
      [...(product?.productPriceHistoryResponse ?? [])].sort(
        (a, b) => new Date(a.insertedTime).getTime() - new Date(b.insertedTime).getTime(),
      ),
    [product],
  );

  const features = useMemo(
    () => (product ? parseProductFeatures(product.productFeatures) : {}),
    [product],
  );

  if (isLoading) {
    return (
      <div className="product-view">
        <Link to="/products" className="product-view__back">
          <FiArrowLeft aria-hidden /> Products
        </Link>
        <div className="product-view-card">
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
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

  const status = getProductStatus(product);
  const latestPrice = priceHistory[priceHistory.length - 1]?.price ?? product.price;
  const firstPrice = priceHistory[0]?.price ?? product.price;
  const change = latestPrice - firstPrice;
  const changePercent = firstPrice ? Math.abs((change / firstPrice) * 100).toFixed(1) : "0.0";

  return (
    <div className="product-view">
      <div className="product-view__topbar">
        <h1>{product.name}</h1>
        <Link to="/products" className="product-view__back">
          <FiArrowLeft aria-hidden /> Products
        </Link>
      </div>

      <div className="product-view__layout">
        <div className="product-view-card product-view-profile">
          <div className="product-view-profile__menu">
            <RowActionsMenu
              onEdit={() => navigate(`/products/new?id=${product.id}`)}
              onDelete={() => {
                setDeleteError(null);
                setPendingDelete(true);
              }}
            />
          </div>

          <div className="product-view-profile__image">
            {product.fileName ? (
              <img
                src={`${API_URL}${product.fileName}`}
                alt={product.name ?? ""}
                onError={(event) => {
                  (event.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <FiPackage aria-hidden />
            )}
          </div>
          <h2 className="product-view-profile__name">{product.name}</h2>

          <h3 className="product-view__section-title">Product Information</h3>
          <div className="product-view-profile__grid">
            <div className="product-view-field">
              <span className="product-view-field__label">Category</span>
              <p className="product-view-field__value">{product.categoryName || "—"}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">SKU</span>
              <p className="product-view-field__value">{product.sku || "—"}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">Weight Clause</span>
              <p className="product-view-field__value">{product.weightClause || "—"}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">SEO Name</span>
              <p className="product-view-field__value">{product.seoName || "—"}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">Stock</span>
              <p className="product-view-field__value">{product.stock ?? "—"}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">Min / Max Quantity</span>
              <p className="product-view-field__value">
                {product.minimumQuantity ?? "—"} / {product.maximumQuantity ?? "—"}
              </p>
            </div>
          </div>

          <div className="product-view-field">
            <span className="product-view-field__label">Status</span>
            <span className={`product-view__status product-view__status--${status.toLowerCase()}`}>
              {status}
            </span>
          </div>

          <div className="product-view-field">
            <span className="product-view-field__label">Description</span>
            <p className="product-view-field__value">{product.description || "—"}</p>
          </div>

          <div className="product-view-profile__grid">
            <div className="product-view-field">
              <span className="product-view-field__label">Created By</span>
              <p className="product-view-field__value">{product.createdByName || "—"}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">Created On</span>
              <p className="product-view-field__value">
                {product.createdAt ? dateTimeFormatter.format(new Date(product.createdAt)) : "—"}
              </p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">Updated By</span>
              <p className="product-view-field__value">{product.updatedByName || "—"}</p>
            </div>
            <div className="product-view-field">
              <span className="product-view-field__label">Updated On</span>
              <p className="product-view-field__value">
                {product.updatedAt ? dateTimeFormatter.format(new Date(product.updatedAt)) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="product-view-card product-view-main">
          <div className="product-view-main__section">
            <div className="product-view-main__section-header">
              <h3 className="product-view__section-title">Price History</h3>
            </div>

            <div className="product-view-price">
              <div className="product-view-price__summary">
                <p className="product-view-price__figure">₹{latestPrice.toLocaleString("en-IN")}</p>
                {priceHistory.length > 1 && (
                  <span className={`product-view-price__delta ${change >= 0 ? "is-up" : "is-down"}`}>
                    {change >= 0 ? "▲" : "▼"} {changePercent}%
                  </span>
                )}
              </div>

              {priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={priceHistory.map((entry) => ({
                      label: dateFormatter.format(new Date(entry.insertedTime)),
                      price: entry.price,
                    }))}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
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
              ) : (
                <p className="product-view-field__value">No price history available.</p>
              )}
            </div>
          </div>

          <div className="product-view-main__section">
            <h3 className="product-view__section-title">Price Change Log</h3>
            <Table
              columns={priceHistoryColumns}
              data={priceHistory}
              rowKey={(row) => String(row.id)}
              emptyMessage="No price changes recorded."
            />
          </div>

          <div className="product-view-main__section">
            <h3 className="product-view__section-title">Nutritional Specifications</h3>
            <Table
              columns={specColumns}
              data={features.nutritionalSpecifications ?? []}
              rowKey={(row) => row.parameter}
              emptyMessage="No nutritional specifications available."
            />
          </div>

          <div className="product-view-main__section">
            <h3 className="product-view__section-title">Nutritional Value and Uses</h3>
            {features.nutritionalValueAndUses?.length ? (
              <ul className="product-view-values">
                {features.nutritionalValueAndUses.map((row) => (
                  <li key={row.title} className="product-view-values__item">
                    <p className="product-view-values__title">{row.title}</p>
                    <p className="product-view-values__description">{row.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="product-view-field__value">No nutritional value details available.</p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete}
        title="Remove this product?"
        message={
          deleteError || `This will permanently delete "${product.name ?? ""}". This cannot be undone.`
        }
        onConfirm={async () => {
          const actionPerformedBy = Number(localStorage.getItem("userId")) || 0;

          try {
            await deleteProduct({ productId: product.id, actionPerformedBy }).unwrap();
            navigate("/products");
          } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Failed to delete product.");
          }
        }}
        onCancel={() => setPendingDelete(false)}
      />
    </div>
  );
};

export default Productview;
