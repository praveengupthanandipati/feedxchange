import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import { money, type RefundRow } from "./refunds.data";

interface ColumnHandlers {
  onView: (row: RefundRow) => void;
  onEdit: (row: RefundRow) => void;
  onDelete: (row: RefundRow) => void;
}

function differenceCell(row: RefundRow) {
  if (row.difference === 0) return <span className="refunds-table__difference">{money(0)}</span>;
  const excess = row.difference < 0;
  return (
    <span className={`refunds-table__difference refunds-table__difference--${excess ? "excess" : "due"}`}>
      {money(Math.abs(row.difference))}
      <span className="refunds-table__sr-only">{excess ? " (excess refunded)" : " (balance to refund)"}</span>
    </span>
  );
}

export function buildRefundColumns({ onView, onEdit, onDelete }: ColumnHandlers): TableColumn<RefundRow>[] {
  return [
    { key: "date", header: "Payment Date", sortable: true },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="refunds-table__actions">
          <button
            type="button"
            className="refunds-table__icon-btn refunds-table__icon-btn--view"
            onClick={() => onView(row)}
            aria-label={`View refund ${row.refNumber}`}
            title="View"
          >
            <FiEye aria-hidden />
          </button>
          <button
            type="button"
            className="refunds-table__icon-btn refunds-table__icon-btn--edit"
            onClick={() => onEdit(row)}
            aria-label={`Edit refund ${row.refNumber}`}
            title="Edit"
          >
            <FiEdit aria-hidden />
          </button>
          <button
            type="button"
            className="refunds-table__icon-btn refunds-table__icon-btn--delete"
            onClick={() => onDelete(row)}
            aria-label={`Delete refund ${row.refNumber}`}
            title="Delete"
          >
            <FiTrash2 aria-hidden />
          </button>
        </div>
      ),
    },
    { key: "refNumber", header: "Ref Number", sortable: true },
    { key: "payType", header: "Pay Type", sortable: true },
    {
      key: "amountPaid",
      header: "Amount Paid",
      sortable: true,
      render: (row) => <span className="refunds-table__amount">{money(row.amountPaid)}</span>,
    },
    { key: "difference", header: "Difference", sortable: true, render: differenceCell },
    { key: "remarks", header: "Remarks", sortable: true },
  ];
}
