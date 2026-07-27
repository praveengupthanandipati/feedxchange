import type { ChangeEvent } from "react";
import { FiEye } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import RowActionsMenu from "../../../components/table/RowActionsMenu";
import type { PriceTrackingRow } from "./priceTracking.data";

type PriceField = "originalPrice" | "offerPrice" | "resalePrice";

interface ColumnHandlers {
  selectedIds: Set<string>;
  onPriceChange: (id: string, field: PriceField, value: string) => void;
  onView: (row: PriceTrackingRow) => void;
}

const StatusBadge = ({ status }: { status: PriceTrackingRow["status"] }) => (
  <span
    className={`price-tracking__status price-tracking__status--${status
      .toLowerCase()
      .replace(" ", "-")}`}
  >
    {status}
  </span>
);

function buildPriceInputColumn(
  field: PriceField,
  header: string,
  handlers: ColumnHandlers,
): TableColumn<PriceTrackingRow> {
  return {
    key: field,
    header,
    sortable: true,
    sortValue: (row) => Number(row[field]) || 0,
    render: (row) => {
      const active = handlers.selectedIds.has(row.id);
      return (
        <input
          type="number"
          min="0"
          className="price-tracking__price-input"
          placeholder="Enter price"
          value={row[field]}
          disabled={!active}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handlers.onPriceChange(row.id, field, event.target.value)
          }
        />
      );
    },
    exportValue: (row) => row[field],
  };
}

export function buildPriceTrackingColumns(
  handlers: ColumnHandlers,
): TableColumn<PriceTrackingRow>[] {
  return [
    {
      key: "productName",
      header: "Product Name",
      sortable: true,
      render: (row) => (
        <div className="price-tracking__product-cell">
          <div className="price-tracking__product-info">
            <span className="price-tracking__product-name">{row.productName}</span>
            <span className="price-tracking__product-category">{row.category}</span>
          </div>
          <RowActionsMenu onView={() => handlers.onView(row)} />
        </div>
      ),
      exportValue: (row) => row.productName,
    },
    {
      key: "sellerName",
      header: "Seller Name",
      sortable: true,
      render: (row) => (
        <div className="price-tracking__seller-cell">
          <span className="price-tracking__seller-name">{row.sellerName}</span>
          <span className="price-tracking__seller-city">{row.sellerCity}</span>
        </div>
      ),
      exportValue: (row) => row.sellerName,
    },
    buildPriceInputColumn("originalPrice", "Original Price", handlers),
    buildPriceInputColumn("offerPrice", "Offer Price", handlers),
    buildPriceInputColumn("resalePrice", "Resale Price", handlers),
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="price-tracking__actions-cell">
          <button
            type="button"
            className="price-tracking__view-btn"
            onClick={() => handlers.onView(row)}
            aria-label={`View ${row.productName}`}
          >
            <FiEye aria-hidden />
          </button>
          <StatusBadge status={row.status} />
        </div>
      ),
    },
  ];
}
