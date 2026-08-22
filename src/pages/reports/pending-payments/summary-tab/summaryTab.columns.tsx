import type { TableColumn } from "../../../../components/table/table.types";
import { money, type BuyerSummaryRow } from "../pendingPayments.data";

export function buildSummaryColumns(): TableColumn<BuyerSummaryRow>[] {
  return [
    {
      key: "buyerName",
      header: "Buyer Name",
      sortable: true,
    },
    {
      key: "balanceAmount",
      header: "Balance Amount",
      sortable: true,
      render: (row) => money(row.balanceAmount),
      exportValue: (row) => String(row.balanceAmount),
    },
    {
      key: "invoiceCount",
      header: "Invoice Count",
      sortable: true,
    },
  ];
}
