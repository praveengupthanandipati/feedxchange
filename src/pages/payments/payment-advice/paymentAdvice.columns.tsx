import { FiEdit, FiTrash2 } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import { money, paymentModeLabels, type PaymentAdviceViewRow } from "./paymentAdvice.data";

interface ColumnHandlers {
  onAllocate: (row: PaymentAdviceViewRow) => void;
  onEdit: (row: PaymentAdviceViewRow) => void;
  onDelete: (row: PaymentAdviceViewRow) => void;
}

const dash = (value: string) => value || "-";

export function buildPaymentAdviceColumns({
  onAllocate,
  onEdit,
  onDelete,
}: ColumnHandlers): TableColumn<PaymentAdviceViewRow>[] {
  return [
    { key: "date", header: "Date", sortable: true },
    {
      key: "mode",
      header: "Payment Mode",
      sortable: true,
      render: (row) => paymentModeLabels[row.mode],
    },
    {
      key: "reference",
      header: "Cheque / UTR / Online Ref ID",
      sortable: true,
      render: (row) => dash(row.reference),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (row) => money(row.amount),
    },
    {
      key: "unAccountBalance",
      header: "Un Account Balance",
      sortable: true,
      render: (row) => money(row.unAccountBalance),
    },
    {
      key: "bankName",
      header: "Bank Name",
      sortable: true,
      render: (row) => dash(row.bankName),
    },
    { key: "towards", header: "Towards", sortable: true, render: (row) => dash(row.towards) },
    { key: "remarks", header: "Remarks", sortable: true, render: (row) => dash(row.remarks) },
    {
      key: "allocate",
      header: "Allocate",
      render: (row) => (
        <button type="button" className="payment-advice-table__allocate-btn" onClick={() => onAllocate(row)}>
          Add
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="payment-advice-table__actions">
          <button
            type="button"
            className="payment-advice-table__icon-btn payment-advice-table__icon-btn--edit"
            onClick={() => onEdit(row)}
            aria-label="Edit payment"
            title="Edit"
          >
            <FiEdit aria-hidden />
          </button>
          <button
            type="button"
            className="payment-advice-table__icon-btn payment-advice-table__icon-btn--delete"
            onClick={() => onDelete(row)}
            aria-label="Delete payment"
            title="Delete"
          >
            <FiTrash2 aria-hidden />
          </button>
        </div>
      ),
    },
  ];
}
