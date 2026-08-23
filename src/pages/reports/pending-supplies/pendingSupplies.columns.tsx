import type { TableColumn } from "../../../components/table/table.types";
import { formatDate, money, type PendingSupplyRow } from "./pendingSupplies.data";

export function buildPendingSuppliesColumns(): TableColumn<PendingSupplyRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "3.5rem",
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (row) => (
        <span
          className={
            row.type === "Credits"
              ? "pending-supplies-table__type pending-supplies-table__type--credits"
              : "pending-supplies-table__type"
          }
        >
          {row.type}
        </span>
      ),
    },
    {
      key: "contractDt",
      header: "Contract Dt",
      sortable: true,
      sortValue: (row) => row.contractDtValue,
      render: (row) => formatDate(row.contractDt),
      exportValue: (row) => formatDate(row.contractDt),
    },
    {
      key: "contractNumber",
      header: "Contract #",
      sortable: true,
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
      render: (row) => `${row.qty} MT`,
      exportValue: (row) => `${row.qty} MT`,
    },
    {
      key: "rate",
      header: "Rate",
      sortable: true,
      render: (row) => money(row.rate),
      exportValue: (row) => String(row.rate),
    },
    {
      key: "gstPercent",
      header: "GST%",
      render: (row) => `${row.gstPercent}%`,
      exportValue: (row) => `${row.gstPercent}%`,
    },
    {
      key: "netRate",
      header: "Net Rate",
      sortable: true,
      render: (row) => money(row.netRate),
      exportValue: (row) => String(row.netRate),
    },
    {
      key: "supplied",
      header: "Supplied",
      sortable: true,
      render: (row) => `${row.supplied} MT`,
      exportValue: (row) => `${row.supplied} MT`,
    },
    {
      key: "pending",
      header: "Pending",
      sortable: true,
      render: (row) => `${row.pending} MT`,
      exportValue: (row) => `${row.pending} MT`,
    },
    {
      key: "deliverySchedule",
      header: "Delivery Schedule",
    },
    {
      key: "deliveryType",
      header: "Delivery Type",
      sortable: true,
    },
  ];
}
