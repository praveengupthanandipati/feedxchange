import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import type { TableColumn } from "../../../../components/table/table.types";
import type { PaymentRow } from "./payments.data";

interface ColumnHandlers {
  expandedRowKey: string | null;
}

export function buildPaymentsColumns({ expandedRowKey }: ColumnHandlers): TableColumn<PaymentRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "entryDate",
      header: "Entry Date",
      sortable: true,
      sortValue: (row) => row.entryDateValue,
    },
    {
      key: "refNo",
      header: "Ref No",
      sortable: true,
      render: (row) => <span className="payments-table__ref">{row.refNo}</span>,
    },
    {
      key: "buyer",
      header: "Buyer",
      sortable: true,
      render: (row) => <span className="payments-table__buyer">{row.buyer}</span>,
    },
    {
      key: "payDate",
      header: "Pay Date",
      sortable: true,
    },
    {
      key: "payType",
      header: "Pay Type",
      sortable: true,
    },
    {
      key: "bankName",
      header: "Bank Name",
      sortable: true,
    },
    {
      key: "chequeNo",
      header: "Cheque No",
    },
    {
      key: "amountPaid",
      header: "Amount Paid",
      sortable: true,
    },
    {
      key: "refund",
      header: "Refund",
      sortable: true,
    },
    {
      key: "usage",
      header: "Usage",
    },
    {
      key: "unAccount",
      header: "Un-Account",
      sortable: true,
    },
    {
      key: "expand",
      header: "",
      align: "center",
      render: (row) => (expandedRowKey === row.id ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />),
    },
  ];
}
