import type { TableColumn } from "../../../../components/table/table.types";
import type { OverDuePayRow } from "./overDuePay.data";

export function buildOverDuePayColumns(): TableColumn<OverDuePayRow>[] {
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
      render: (row) => <span className="seller-buyer-accounts-table__invoice-num">{row.invoiceNum}</span>,
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
      render: (row) => row.paid.toLocaleString("en-IN"),
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
            row.overDueDays > 0 ? "seller-buyer-accounts-table__overdue seller-buyer-accounts-table__overdue--due" : ""
          }
        >
          {row.overDueDays}
        </span>
      ),
    },
  ];
}
