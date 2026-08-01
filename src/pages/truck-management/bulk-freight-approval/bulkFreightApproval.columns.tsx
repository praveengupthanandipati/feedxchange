import { FiExternalLink } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import type { BulkFreightRow } from "./bulkFreightApproval.data";

const TruncatedText = ({ value }: { value: string }) => (
  <span className="bulk-freight-table__truncated">
    <span className="bulk-freight-table__truncated-text">{value}</span>
    <InfoTooltip text={value} />
  </span>
);

export function buildBulkFreightColumns(): TableColumn<BulkFreightRow>[] {
  return [
    {
      key: "contractNumber",
      header: "Contract #",
      sortable: true,
      render: (row) => (
        <span className="bulk-freight-table__contract">
          {/* TODO: wire up the Assign link once the destination route is ready. */}
          <span className="bulk-freight-table__contract-badge">
            <FiExternalLink aria-hidden />
          </span>
          <span className="bulk-freight-table__contract-text">{row.contractNumber}</span>
        </span>
      ),
      exportValue: (row) => row.contractNumber,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <span className={`bulk-freight-table__status bulk-freight-table__status--${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
      exportValue: (row) => row.status,
    },
    {
      key: "qty",
      header: "Qty (MT)",
      sortable: true,
      sortValue: (row) => row.qtyValue,
      render: (row) => (
        <span className="bulk-freight-table__change">
          {row.qtyOriginal && (
            <span className="bulk-freight-table__change-original">{row.qtyOriginal}</span>
          )}
          <span className={row.qtyOriginal ? "bulk-freight-table__change-current" : ""}>
            {row.qtyCurrent}
          </span>
        </span>
      ),
      exportValue: (row) => row.qtyCurrent,
    },
    {
      key: "freight",
      header: "Freight",
      sortable: true,
      sortValue: (row) => row.freightValue,
      render: (row) => (
        <span className="bulk-freight-table__change">
          {row.freightOriginal && (
            <span className="bulk-freight-table__change-original">{row.freightOriginal}</span>
          )}
          <span className={row.freightOriginal ? "bulk-freight-table__change-current" : ""}>
            {row.freightCurrent}
          </span>
        </span>
      ),
      exportValue: (row) => row.freightCurrent,
    },
    {
      key: "seller",
      header: "Seller",
      sortable: true,
      render: (row) => <TruncatedText value={row.seller} />,
      exportValue: (row) => row.seller,
    },
    {
      key: "buyer",
      header: "Buyer",
      sortable: true,
      render: (row) => <TruncatedText value={row.buyer} />,
      exportValue: (row) => row.buyer,
    },
    {
      key: "loadingAddress",
      header: "Loading Address",
      render: (row) => <TruncatedText value={row.loadingAddress} />,
      exportValue: (row) => row.loadingAddress,
    },
    {
      key: "deliveryAddress",
      header: "Delivery Address",
      render: (row) => <TruncatedText value={row.deliveryAddress} />,
      exportValue: (row) => row.deliveryAddress,
    },
    {
      key: "transporter",
      header: "Transporter",
      sortable: true,
      render: (row) => <TruncatedText value={row.transporter} />,
      exportValue: (row) => row.transporter,
    },
    {
      key: "assignedDate",
      header: "Ass. Date",
      headerTooltip: "Assigned Date",
      sortable: true,
      sortValue: (row) => row.assignedDateValue,
    },
    {
      key: "assignedBy",
      header: "Assigned By",
      sortable: true,
    },
  ];
}
