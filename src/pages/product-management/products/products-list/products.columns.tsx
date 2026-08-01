import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { Product } from "../../../../store/productsApi";

export type ProductStatus = "Active" | "Inactive" | "Deleted";

export function getProductStatus(product: Product): ProductStatus {
  if (product.isDeleted) return "Deleted";
  return product.isActive ? "Active" : "Inactive";
}

const StatusBadge = ({ status }: { status: ProductStatus }) => (
  <span className={`products-list__status products-list__status--${status.toLowerCase()}`}>
    {status}
  </span>
);

interface ColumnHandlers {
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function buildProductColumns({ onView, onEdit, onDelete }: ColumnHandlers): TableColumn<Product>[] {
  return [
    {
      key: "name",
      header: "Product Name",
      sortable: true,
      render: (row) => (
        <Link to={`/products/${row.id}`} className="products-list__link">
          {row.name}
        </Link>
      ),
      exportValue: (row) => row.name ?? "",
    },
    {
      key: "categoryName",
      header: "Category",
      sortable: true,
    },
    /*{
      key: "sku",
      header: "SKU",
      sortable: true,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      sortable: true,
      render: (row) => row.price.toLocaleString("en-IN"),
      exportValue: (row) => String(row.price),
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      sortable: true,
    },*/
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={getProductStatus(row)} />,
      sortValue: (row) => getProductStatus(row),
      exportValue: (row) => getProductStatus(row),
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (row) => (
        <RowActionsMenu
          variant="inline"
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ];
}
