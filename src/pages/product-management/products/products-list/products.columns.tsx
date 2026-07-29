import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { Product } from "./products.data";

const StatusBadge = ({ status }: { status: Product["status"] }) => (
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
      key: "category",
      header: "Category",
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <RowActionsMenu onView={() => onView(row)} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
      ),
    },
    {
      key: "productName",
      header: "Product Name",
      sortable: true,
      render: (row) => (
        <Link to={`/products/${row.id}`} className="products-list__link">
          {row.productName}
        </Link>
      ),
      exportValue: (row) => row.productName,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
  ];
}
