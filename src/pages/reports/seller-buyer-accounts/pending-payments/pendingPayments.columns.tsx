import { FiSearch } from "react-icons/fi";
import type { TableColumn } from "../../../../components/table/table.types";
import type { PendingPaymentRow } from "./pendingPayments.data";

interface ColumnHandlers {
  onViewPaymentDetails: (row: PendingPaymentRow) => void;
}

export function buildPendingPaymentsColumns({ onViewPaymentDetails }: ColumnHandlers): TableColumn<PendingPaymentRow>[] {
  return [
    {
      key: "invoiceDate",
      header: "Invoice Dt",
      sortable: true,
      sortValue: (row) => row.invoiceDateValue,
    },
    {
      key: "invoiceNum",
      header: "Invoice Num",
      sortable: true,
      render: (row) => <span className="pending-payments-table__invoice-num">{row.invoiceNum}</span>,
    },
    {
      key: "buyerName",
      header: "Buyer Name",
      sortable: true,
    },
    {
      key: "invoiceQty",
      header: "Invoice Qty",
      sortable: true,
    },
    {
      key: "freight",
      header: "Freight",
      sortable: true,
    },
    {
      key: "invoiceAmount",
      header: "Invoice Amount",
      sortable: true,
    },
    {
      key: "paid",
      header: "Paid",
      sortable: true,
      render: (row) => (
        <span className="pending-payments-table__paid">
          {row.paid.toLocaleString("en-IN")}
          <button
            type="button"
            className="pending-payments-table__view-btn"
            onClick={() => onViewPaymentDetails(row)}
            aria-label={`View payment details for ${row.invoiceNum}`}
            title="View Payment Details"
          >
            <FiSearch aria-hidden />
          </button>
        </span>
      ),
      exportValue: (row) => row.paid.toLocaleString("en-IN"),
    },
    {
      key: "pendingAmount",
      header: "Pending Amount",
      sortable: true,
    },
    {
      key: "sellerwiseTotalDue",
      header: "Sellerwise Total Due",
      sortable: true,
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      sortValue: (row) => row.dueDateValue,
    },
    {
      key: "overDueDays",
      header: "Over Due Days",
      sortable: true,
      render: (row) => (
        <span
          className={
            row.overDueDays > 0
              ? "pending-payments-table__overdue pending-payments-table__overdue--due"
              : ""
          }
        >
          {row.overDueDays}
        </span>
      ),
    },
  ];
}
