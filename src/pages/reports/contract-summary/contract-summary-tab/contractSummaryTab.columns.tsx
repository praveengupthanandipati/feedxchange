import type { TableColumn } from "../../../../components/table/table.types";
import { money, type ContractSummaryRow } from "./contractSummaryTab.data";

export function buildContractSummaryColumns(): TableColumn<ContractSummaryRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "contractDt",
      header: "Contract Dt",
      sortable: true,
      sortValue: (row) => row.contractDtValue,
    },
    {
      key: "contractNumber",
      header: "Contract #",
      sortable: true,
      render: (row) => <span className="contract-summary-tab-table__contract">{row.contractNumber}</span>,
    },
    {
      key: "seller",
      header: "Seller",
      sortable: true,
    },
    {
      key: "buyer",
      header: "Buyer",
      sortable: true,
    },
    {
      key: "commodity",
      header: "Commodity",
      sortable: true,
    },
    {
      key: "qty",
      header: "Qty",
      sortable: true,
      sortValue: (row) => row.qtyValue,
    },
    {
      key: "rate",
      header: "Rate",
      sortable: true,
      render: (row) => money(row.rate),
    },
    {
      key: "gstPercent",
      header: "GST %",
      sortable: true,
      render: (row) => `${row.gstPercent}%`,
    },
    {
      key: "netRate",
      header: "Net Rate",
      sortable: true,
      render: (row) => money(row.netRate),
    },
    {
      key: "deliveryType",
      header: "Delivery Type",
    },
    {
      key: "packing",
      header: "Packing",
    },
  ];
}
