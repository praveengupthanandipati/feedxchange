import type { TableColumn } from "../../../../components/table/table.types";
import type { UnaccountBalanceRow } from "./unaccountBalance.data";

export function buildUnaccountBalanceColumns(): TableColumn<UnaccountBalanceRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "seller",
      header: "Seller",
      sortable: true,
      render: (row) => <span className="unaccount-balance-table__seller">{row.seller}</span>,
    },
    {
      key: "paymentDate",
      header: "Payment Dt",
      sortable: true,
      sortValue: (row) => row.paymentDateValue,
    },
    {
      key: "mode",
      header: "Mode",
      sortable: true,
      render: (row) => <span className="unaccount-balance-table__mode">{row.mode}</span>,
    },
    {
      key: "paymentAmount",
      header: "Payment Amount",
      sortable: true,
    },
    {
      key: "adjustedAmount",
      header: "Ajusted Amount",
      sortable: true,
    },
    {
      key: "pendingAmount",
      header: "Pending Amount",
      sortable: true,
    },
    {
      key: "totalUnaccountBalToSeller",
      header: "Total Un Account Bal to Seller",
      sortable: true,
    },
  ];
}
