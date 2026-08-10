import { FiEdit2, FiTrash2, FiPhone, FiExternalLink, FiFile } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import type { TruckDetailRow } from "./reviewAndAssignTrucks.data";

interface ColumnHandlers {
  onEdit: (row: TruckDetailRow) => void;
  onDelete: (row: TruckDetailRow) => void;
}

export function buildTruckDetailColumns({ onEdit, onDelete }: ColumnHandlers): TableColumn<TruckDetailRow>[] {
  return [
    {
      key: "truckNo",
      header: "Truck No",
      render: (row) => row.truckNo || "-",
    },
    {
      key: "truckCapacity",
      header: "Truck Capacity",
      render: (row) => row.truckCapacity || "-",
    },
    {
      key: "driverName",
      header: "Driver Name",
      render: (row) => row.driverName || "-",
    },
    {
      key: "driverPhone",
      header: "Driver Phone",
      render: (row) => (
        <span className="review-assign-trucks-table__phone">
          <FiPhone aria-hidden /> {row.driverPhone || "-"}
        </span>
      ),
    },
    {
      key: "freightPerMt",
      header: "Freight / MT",
      render: (row) => row.freightPerMt || "—",
    },
    {
      key: "trackUrl",
      header: "Track URL",
      render: (row) =>
        row.trackUrl ? (
          <a
            className="review-assign-trucks-table__track-link"
            href={row.trackUrl}
            target="_blank"
            rel="noreferrer"
          >
            <FiExternalLink aria-hidden /> Track
          </a>
        ) : (
          <span>—</span>
        ),
    },
    {
      key: "documents",
      header: "Documents",
      render: (row) =>
        row.documents.length === 0 ? (
          <span>—</span>
        ) : (
          <span className="review-assign-trucks-table__docs">
            <FiFile aria-hidden /> {row.documents.length} file{row.documents.length > 1 ? "s" : ""}
          </span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="review-assign-trucks-table__row-actions">
          <button
            type="button"
            className="review-assign-trucks-table__icon-btn review-assign-trucks-table__icon-btn--edit"
            onClick={() => onEdit(row)}
            aria-label="Edit truck"
            title="Edit"
          >
            <FiEdit2 aria-hidden />
          </button>
          <button
            type="button"
            className="review-assign-trucks-table__icon-btn review-assign-trucks-table__icon-btn--delete"
            onClick={() => onDelete(row)}
            aria-label="Delete truck"
            title="Delete"
          >
            <FiTrash2 aria-hidden />
          </button>
        </div>
      ),
    },
  ];
}
