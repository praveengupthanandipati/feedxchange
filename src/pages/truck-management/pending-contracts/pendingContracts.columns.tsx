import { Link } from "react-router-dom";
import { FiTruck } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import type { PendingContractRow } from "./pendingContracts.data";

const TruncatedName = ({ value }: { value: string }) => (
  <span className="pending-contracts-table__name">
    <span className="pending-contracts-table__name-text">{value}</span>
    <InfoTooltip text={value} />
  </span>
);

interface ColumnHandlers {
  onOpenTruckDetails: (row: PendingContractRow) => void;
}

export function buildPendingContractColumns({
  onOpenTruckDetails,
}: ColumnHandlers): TableColumn<PendingContractRow>[] {
  return [
  {
    key: "id",
    header: "Contract",
    sortable: true,
    sortValue: (row) => row.dateValue,
    render: (row) => (
      <span className="pending-contracts-table__id">
        <button
          type="button"
          className="pending-contracts-table__id-badge"
          onClick={() => onOpenTruckDetails(row)}
          aria-label={`View truck tracking details for ${row.id}`}
          title="View Truck Tracking Details"
        >
          <FiTruck aria-hidden />
        </button>
        <Link to={`/contracts/${row.id}`} className="pending-contracts-table__id-text">
          {row.id}
        </Link>
      </span>
    ),
    exportValue: (row) => row.id,
  },
  {
    key: "date",
    header: "C. Date",
    sortable: true,
    sortValue: (row) => row.dateValue,
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
    key: "cRate",
    header: "C. Rate",
    headerTooltip: "Contract Rate",
    sortable: true,
    sortValue: (row) => row.cRateValue,
  },
  {
    key: "cQty",
    header: "C. Qty",
    headerTooltip: "Contract Quantity",
    sortable: true,
    sortValue: (row) => row.cQtyValue,
  },
  {
    key: "dQty",
    header: "D. Qty",
    headerTooltip: "Dispatched Quantity",
    sortable: true,
    sortValue: (row) => row.dQtyValue,
  },
  {
    key: "aQty",
    header: "A. Qty",
    headerTooltip: "Arranged Quantity",
    sortable: true,
    sortValue: (row) => row.aQtyValue,
    render: (row) => (
      <span className={row.aQtyValue > 0 ? "pending-contracts-table__qty--arranged" : ""}>
        {row.aQty}
      </span>
    ),
  },
  {
    key: "pQty",
    header: "P. Qty",
    headerTooltip: "Pending Quantity",
    sortable: true,
    sortValue: (row) => row.pQtyValue,
    render: (row) => <span className="pending-contracts-table__qty--pending">{row.pQty}</span>,
  },
  {
    key: "product",
    header: "Product",
  },
  {
    key: "fromDate",
    header: "From Date",
  },
  {
    key: "toDate",
    header: "To Date",
  },
  {
    key: "deliveryType",
    header: "D. Type",
    headerTooltip: "Delivery Type",
    sortable: true,
  },
  {
    key: "deliverySchedule",
    header: "D. Schedule",
    headerTooltip: "Delivery Schedule",
    sortable: true,
  },
  {
    key: "paymentType",
    header: "Pay. Type",
    headerTooltip: "Payment Type",
    sortable: true,
    render: (row) => (
      <span className="pending-contracts-table__pay-type">{row.paymentType}</span>
    ),
    exportValue: (row) => row.paymentType,
  },
  ];
}
