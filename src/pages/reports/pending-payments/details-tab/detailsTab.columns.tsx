import { FiSearch } from "react-icons/fi";
import type { TableColumn } from "../../../../components/table/table.types";
import { money, type PendingPaymentRow } from "../pendingPayments.data";

interface ColumnHandlers {
  onViewInvoice: (row: PendingPaymentRow) => void;
}

export function buildDetailsColumns({ onViewInvoice }: ColumnHandlers): TableColumn<PendingPaymentRow>[] {
  return [
    {
      key: "invoiceNum",
      header: "Invoice #",
      sortable: true,
      render: (row) => (
        <span className="details-tab-table__invoice-num">
          {row.invoiceNum}
          <button
            type="button"
            className="details-tab-table__view-btn"
            onClick={() => onViewInvoice(row)}
            aria-label={`View invoice details for ${row.invoiceNum}`}
            title="View Invoice Details"
          >
            <FiSearch aria-hidden />
          </button>
        </span>
      ),
      exportValue: (row) => row.invoiceNum,
    },
    {
      key: "invoiceDate",
      header: "Invoice Dt",
      sortable: true,
      sortValue: (row) => row.invoiceDateValue,
    },
    {
      key: "buyerName",
      header: "Buyer",
      sortable: true,
    },
    {
      key: "invoiceAmount",
      header: "Invoice Amount",
      sortable: true,
      render: (row) => money(row.invoiceAmount),
      exportValue: (row) => String(row.invoiceAmount),
    },
    {
      key: "paidAmount",
      header: "Paid Amount",
      sortable: true,
      render: (row) => money(row.paidAmount),
      exportValue: (row) => String(row.paidAmount),
    },
    {
      key: "balance",
      header: "Balance",
      sortable: true,
      render: (row) => money(row.balance),
      exportValue: (row) => String(row.balance),
    },
    {
      key: "overDueDays",
      header: "Over Due",
      sortable: true,
      render: (row) => (
        <span className={row.overDueDays > 0 ? "details-tab-table__overdue" : ""}>
          {row.overDueDays === 1 ? "1 day" : `${row.overDueDays} days`}
        </span>
      ),
      exportValue: (row) => `${row.overDueDays} days`,
    },
  ];
}
