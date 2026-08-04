import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../../components/table/table.types";
import type { InstantTruckRow } from "./instantTruckAssignment.data";

interface ColumnHandlers {
  onEdit: (row: InstantTruckRow) => void;
  onDelete: (row: InstantTruckRow) => void;
}

export function buildInstantTruckColumns({
  onEdit,
  onDelete,
}: ColumnHandlers): TableColumn<InstantTruckRow>[] {
  return [
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <RowActionsMenu onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} menuAlign="left" />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <span className={`instant-truck-table__status instant-truck-table__status--${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
      exportValue: (row) => row.status,
    },
    {
      key: "scheduleDateTime",
      header: "Schedule Dt & Time",
      sortable: true,
      sortValue: (row) => row.scheduleValue,
    },
    {
      key: "transporterName",
      header: "Transporter Name",
      sortable: true,
    },
    {
      key: "truckNo",
      header: "Truck No",
      sortable: true,
    },
    {
      key: "driverName",
      header: "Driver Name",
    },
    {
      key: "driverPhone",
      header: "Driver Ph No",
    },
    {
      key: "loadingAddress",
      header: "Loading Address",
      render: (row) => <span className="instant-truck-table__address">{row.loadingAddress}</span>,
    },
    {
      key: "deliveryAddress",
      header: "Delivery Address",
      render: (row) => <span className="instant-truck-table__address">{row.deliveryAddress}</span>,
    },
    {
      key: "qty",
      header: "Qty",
      sortable: true,
    },
    {
      key: "freight",
      header: "Freight",
      sortable: true,
    },
    {
      key: "trackingUrl",
      header: "Tracking URL",
    },
  ];
}
