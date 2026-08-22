import type { TableColumn } from "../../../components/table/table.types";
import { money, type StatementRow } from "./accountStatement.data";

export function buildAccountStatementColumns(): TableColumn<StatementRow>[] {
  return [
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (row) => row.dateValue,
    },
    {
      key: "narration",
      header: "Narration",
      width: "26rem",
    },
    {
      key: "qtyRateFreight",
      header: "Qty*Rate*Freight",
    },
    {
      key: "purchase",
      header: "Purchases",
      sortable: true,
      sortValue: (row) => row.purchase ?? 0,
      render: (row) => (row.purchase === null ? "-" : money(row.purchase)),
    },
    {
      key: "payment",
      header: "Payments",
      sortable: true,
      sortValue: (row) => row.payment ?? 0,
      render: (row) => (row.payment === null ? "-" : money(row.payment)),
    },
    {
      key: "balance",
      header: "Balance",
      sortable: true,
      render: (row) => money(row.balance),
    },
  ];
}
