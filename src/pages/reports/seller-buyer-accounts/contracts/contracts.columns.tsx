import { FiSearch, FiChevronRight, FiChevronDown } from "react-icons/fi";
import type { TableColumn } from "../../../../components/table/table.types";
import { money, type ContractRow } from "./contracts.data";

interface ContractColumnHandlers {
  onViewContract: (row: ContractRow) => void;
  onToggleExpand: (row: ContractRow) => void;
  expandedRowKey: string | null;
}

export function buildContractColumns({
  onViewContract,
  onToggleExpand,
  expandedRowKey,
}: ContractColumnHandlers): TableColumn<ContractRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "contDate",
      header: "Cont Dt",
      sortable: true,
      sortValue: (row) => row.contDateValue,
    },
    {
      key: "contractNumber",
      header: "Contract#",
      sortable: true,
      render: (row) => (
        <span className="seller-buyer-accounts-table__contract">
          <button
            type="button"
            className="seller-buyer-accounts-table__view-btn"
            onClick={() => onViewContract(row)}
            aria-label={`View contract ${row.contractNumber}`}
            title="View Contract"
          >
            <FiSearch aria-hidden />
          </button>
          <button
            type="button"
            className="seller-buyer-accounts-table__contract-link"
            onClick={() => onToggleExpand(row)}
            aria-expanded={expandedRowKey === row.id}
          >
            {row.contractNumber}
          </button>
        </span>
      ),
    },
    {
      key: "buyerName",
      header: "Buyer Name",
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
      header: "GST%",
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
      key: "packing",
      header: "Packing",
    },
    {
      key: "deliveryType",
      header: "Delivery Type",
    },
    {
      key: "dueDays",
      header: "Due Days",
      sortable: true,
    },
    {
      key: "contType",
      header: "Cont Type",
    },
    {
      key: "expand",
      header: "",
      align: "center",
      render: (row) => (
        <button
          type="button"
          className="seller-buyer-accounts-table__expand-btn"
          onClick={() => onToggleExpand(row)}
          aria-label={expandedRowKey === row.id ? "Collapse invoice details" : "Expand invoice details"}
          title={expandedRowKey === row.id ? "Collapse" : "Expand"}
        >
          {expandedRowKey === row.id ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
        </button>
      ),
    },
  ];
}
