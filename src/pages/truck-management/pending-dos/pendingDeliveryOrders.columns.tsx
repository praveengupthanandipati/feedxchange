import { Link } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import type { PendingDeliveryOrderRow } from "./pendingDeliveryOrders.data";

export const formatInr = (value: number) => value.toLocaleString("en-IN");

export const contractPath = (row: PendingDeliveryOrderRow) =>
  `/contracts/${row.contractId ?? row.contractNo}`;

export const TruncatedName = ({ value }: { value: string }) => (
  <span className="pending-dos-table__name">
    <span className="pending-dos-table__name-text">{value}</span>
    <InfoTooltip text={value} />
  </span>
);

export const Amount = ({ value, className = "" }: { value: number; className?: string }) => (
  <span className={`pending-dos-table__amount ${className}`}>
    <FaRupeeSign aria-hidden className="pending-dos-table__rupee" />
    {formatInr(value)}
  </span>
);

export const ContractRate = ({ row }: { row: PendingDeliveryOrderRow }) => (
  <span className="pending-dos-table__rate">
    <Amount value={row.contractRate} />
    <span className="pending-dos-table__gst">({row.gstType})</span>
  </span>
);

interface DoNumberCellProps {
  row: PendingDeliveryOrderRow;
  onAddDo: (row: PendingDeliveryOrderRow) => void;
}

export const DoNumberCell = ({ row, onAddDo }: DoNumberCellProps) =>
  row.doNumber ? (
    <Link to={contractPath(row)} className="pending-dos-table__do-link">
      {row.doNumber}, {row.doDate}
    </Link>
  ) : (
    <button
      type="button"
      className="pending-dos-table__add-do"
      onClick={() => onAddDo(row)}
      aria-label={`Add DO or reassign truck ${row.truckNumber}`}
    >
      <FiPlus aria-hidden /> Add DO / Reassign
    </button>
  );

interface ColumnHandlers {
  onAddDo: (row: PendingDeliveryOrderRow) => void;
}

export function buildPendingDeliveryOrderColumns({
  onAddDo,
}: ColumnHandlers): TableColumn<PendingDeliveryOrderRow>[] {
  return [
    {
      key: "contractNo",
      header: "Contract #",
      sortable: true,
      render: (row) => (
        <Link to={contractPath(row)} className="pending-dos-table__contract">
          {row.contractNo}
        </Link>
      ),
      exportValue: (row) => row.contractNo,
    },
    {
      key: "doNumber",
      header: "Do Number",
      sortable: true,
      sortValue: (row) => row.doNumber ?? "",
      render: (row) => <DoNumberCell row={row} onAddDo={onAddDo} />,
      exportValue: (row) => (row.doNumber ? `${row.doNumber}, ${row.doDate}` : ""),
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
      key: "truckNumber",
      header: "Truck Number",
      sortable: true,
    },
    {
      key: "product",
      header: "Product",
      sortable: true,
    },
    {
      key: "contractRate",
      header: "Contract Rate",
      sortable: true,
      render: (row) => <ContractRate row={row} />,
      exportValue: (row) => `₹${formatInr(row.contractRate)} (${row.gstType})`,
    },
    {
      key: "qty",
      header: "Qty",
      sortable: true,
      render: (row) => (
        <span className="pending-dos-table__qty">
          {row.qty} {row.qtyUnit}
        </span>
      ),
      exportValue: (row) => `${row.qty} ${row.qtyUnit}`,
    },
    {
      key: "freight",
      header: "Freight",
      sortable: true,
      render: (row) => <Amount value={row.freight} className="pending-dos-table__amount--strong" />,
      exportValue: (row) => `₹${formatInr(row.freight)}`,
    },
    {
      key: "deliveryType",
      header: "Delivery type",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
    },
  ];
}
