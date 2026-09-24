import type { TableColumn } from "../../../../components/table/table.types";
import type { AvgPaymentRow } from "./avgPayments.data";

export function buildAvgPaymentsColumns(): TableColumn<AvgPaymentRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "buyer",
      header: "Buyer",
      sortable: true,
      render: (row) => <span className="avg-payments-table__buyer">{row.buyer}</span>,
    },
    {
      key: "paymentCondition",
      header: "Payment Condition",
      sortable: true,
    },
    {
      key: "payment0to25",
      header: "0-25% Payment",
      sortable: true,
    },
    {
      key: "payment25to50",
      header: "25-50% Payment",
      sortable: true,
    },
    {
      key: "payment50to75",
      header: "50-75% Payment",
      sortable: true,
    },
    {
      key: "payment75to100",
      header: "75-100% Payment",
      sortable: true,
    },
  ];
}
