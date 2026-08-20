import { useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiCopy } from "react-icons/fi";
import type { TableColumn } from "../../components/table/table.types";
import InfoTooltip from "../../components/tooltip/InfoTooltip";
import RowActionsMenu from "../../components/table/RowActionsMenu";
import type { Contract } from "./contracts.data";

const parseQtyOrNA = (value: string) => (value === "N/A" ? -1 : parseFloat(value));

const ContractIdCell = ({ id, contractId }: { id: string; contractId: number }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (event: MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  };

  return (
    <span className="contracts-table__id">
      <Link to={`/contracts/${contractId}`} className="contracts-table__id-link">
        {id}
      </Link>
      <button
        type="button"
        className="contracts-table__copy"
        onClick={handleCopy}
        aria-label={`Copy contract ${id}`}
        title="Copy contract number"
      >
        {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
      </button>
    </span>
  );
};

const TruncatedName = ({ value }: { value: string }) => (
  <span className="contracts-table__name">
    <span className="contracts-table__name-text">{value}</span>
    <InfoTooltip text={value} />
  </span>
);



const StatusBadge = ({ status }: { status: Contract["status"] }) => {
  const safeStatus = status ?? "";
  const normalizedStatus = safeStatus.toLowerCase();

  return (
    <span
      className={`contracts-table__status contracts-table__status--${normalizedStatus}`}
    >
      {safeStatus === "In-transit" ? "In-Transit" : safeStatus || "N/A"}
    </span>
  );
};
interface ColumnHandlers {
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}

export function buildContractColumns({ onEdit, onDelete }: ColumnHandlers): TableColumn<Contract>[] {
  return [
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (row) => row.dateValue,
    },
    {
      key: "id",
      header: "Contract",
      sortable: true,
      render: (row) => <ContractIdCell id={row.id} contractId={row.contractId} />,
      exportValue: (row) => row.id,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <RowActionsMenu onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "seller",
      header: "Seller",
      sortable: true,
      render: (row) => <TruncatedName value={row.seller} />,
      exportValue: (row) => row.seller,
    },
    {
      key: "buyer",
      header: "Buyer",
      sortable: true,
      render: (row) => <TruncatedName value={row.buyer} />,
      exportValue: (row) => row.buyer,
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
      key: "aQty",
      header: "A.Qty",
      headerTooltip: "Arranged Qty",
      sortable: true,
      sortValue: (row) => parseQtyOrNA(row.aQty),
    },
    {
      key: "pQty",
      header: "P.Qty",
      headerTooltip: "Pending Quantity",
      sortable: true,
      sortValue: (row) => parseQtyOrNA(row.pQty),
    },
    {
      key: "dQty",
      header: "D.Qty",
      headerTooltip: "Dispatched Qty",
      sortable: true,
      sortValue: (row) => parseQtyOrNA(row.dQty),
    },
    {
      key: "cRate",
      header: "C.Rate",
      headerTooltip: "Contract Rate",
      sortable: true,
      sortValue: (row) => row.cRateValue,
    },
    {
      key: "gst",
      header: "GST %",
      sortable: true,
    },
    {
      key: "netRate",
      header: "Net Rate",
      sortable: true,
      sortValue: (row) => row.netRateValue,
    },
    {
      key: "deliveryType",
      header: "Delivery Type",
      sortable: true,
    },
    // {
    //   key: "paymentTerms",
    //   header: "Payment Terms",
    //   sortable: true,
    // },
    // {
    //   key: "iFreight",
    //   header: "I.Freight",
    //   sortable: true,
    //   sortValue: (row) => row.iFreightValue,
    // },
  ];
}