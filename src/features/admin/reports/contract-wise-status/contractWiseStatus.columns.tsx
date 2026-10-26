import { ChevronDownIcon, ChevronRightIcon } from "../../../../shared/components/icon";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { money, type ContractStatusRow } from "./contractWiseStatus.data";

interface ContractStatusColumnHandlers {
  onToggleExpand: (row: ContractStatusRow) => void;
  expandedRowKey: string | null;
}

export function buildContractStatusColumns({
  onToggleExpand,
  expandedRowKey,
}: ContractStatusColumnHandlers): TableColumn<ContractStatusRow>[] {
  return [
    {
      key: "contractDt",
      header: "Contract Dt",
      sortable: true,
      sortValue: (row) => row.contractDtValue,
    },
    {
      key: "contractNumber",
      header: "Contract#",
      sortable: true,
      render: (row) => (
        <span className="contract-wise-status-table__contract">
          <button
            type="button"
            className="contract-wise-status-table__contract-link"
            onClick={() => onToggleExpand(row)}
            aria-expanded={expandedRowKey === row.id}
          >
            {row.contractNumber}
          </button>
          <button
            type="button"
            className="contract-wise-status-table__expand-btn"
            onClick={() => onToggleExpand(row)}
            aria-label={expandedRowKey === row.id ? "Collapse supply details" : "Expand supply details"}
            title={expandedRowKey === row.id ? "Collapse" : "Expand"}
          >
            {expandedRowKey === row.id ? <ChevronDownIcon aria-hidden /> : <ChevronRightIcon aria-hidden />}
          </button>
        </span>
      ),
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
      key: "product",
      header: "Product",
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
      key: "balQty",
      header: "Bal Qty",
    },
    {
      key: "deliveryType",
      header: "Delivery Type",
    },
    {
      key: "contractType",
      header: "Contract Type",
    },
  ];
}
