import { useState } from "react";
import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActivityIcon, CheckIcon, CircleCheckBigIcon, CopyIcon, PenIcon, Trash2Icon } from "../../../shared/components/icon";
import { useAuth } from "../../../core/auth/AuthContext";
import type { TableColumn } from "../../../shared/components/table/table.types";
import InfoTooltip from "../../../shared/components/tooltip/InfoTooltip";
import RowActionsMenu, { type RowAction } from "../../../shared/components/table/RowActionsMenu";
import type { Contract } from "./contracts.data";

const parseQtyOrNA = (value: string) => (value === "N/A" ? -1 : parseFloat(value));

const ContractIdCell = ({ id }: { id: string }) => {
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
      <Link to={`/admin/contracts/${encodeURIComponent(id)}`} className="contracts-table__id-link">
        {id}
      </Link>
      <button
        type="button"
        className="contracts-table__copy"
        onClick={handleCopy}
        aria-label={`Copy contract ${id}`}
        title="Copy contract number"
      >
        {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
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
/** Statuses that mean the contract is waiting for approval. */
const AWAITING_APPROVAL = new Set(["pending", "pendingforapproval"]);

/**
 * Row menu: Edit and Delete (contracts.manage), plus Approve (contracts waiting for approval) and Change status, which open the
 * Contract Status screen with this contract picked (contract-status).
 */
const ContractRowActions = ({ row, onEdit, onDelete }: { row: Contract; onEdit: () => void; onDelete: () => void }) => {
  const { can } = useAuth();
  const navigate = useNavigate();
  const canManage = can("contracts.manage");
  const canChangeStatus = can("contract-status");
  const statusPage = (status?: string) =>
    navigate(`/admin/contract-status?contract=${encodeURIComponent(row.contractNumber)}${status ? `&status=${status}` : ""}`);
  const awaitingApproval = AWAITING_APPROVAL.has((row.status ?? "").toLowerCase().replace(/[^a-z0-9]/g, ""));

  const actions: RowAction[] = [
    ...(canManage ? [{ key: "edit", label: "Edit", icon: PenIcon, onClick: onEdit }] : []),
    ...(canChangeStatus && awaitingApproval ? [{ key: "approve", label: "Approve", icon: CircleCheckBigIcon, onClick: () => statusPage("Open") }] : []),
    ...(canChangeStatus ? [{ key: "status", label: "Change status", icon: ActivityIcon, onClick: () => statusPage() }] : []),
    ...(canManage ? [{ key: "delete", label: "Delete", icon: Trash2Icon, onClick: onDelete, danger: true, dividerBefore: true }] : []),
  ];
  return actions.length ? <RowActionsMenu actions={actions} /> : null;
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
      render: (row) => <ContractIdCell id={row.id} />,
      exportValue: (row) => row.id,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <ContractRowActions row={row} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
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