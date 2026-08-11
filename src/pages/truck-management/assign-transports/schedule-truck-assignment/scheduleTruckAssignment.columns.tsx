import { FiEdit2, FiCheckCircle, FiXCircle, FiTruck, FiChevronUp } from "react-icons/fi";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../../components/table/table.types";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";

interface ColumnHandlers {
  onEdit: (row: ScheduleTruckRow) => void;
  onDelete: (row: ScheduleTruckRow) => void;
  onUpdate: (row: ScheduleTruckRow) => void;
  expandedRowId: string | null;
  onToggleTrucks: (row: ScheduleTruckRow) => void;
}

export function buildScheduleTruckColumns({
  onEdit,
  onDelete,
  onUpdate,
  expandedRowId,
  onToggleTrucks,
}: ColumnHandlers): TableColumn<ScheduleTruckRow>[] {
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
        <span className={`schedule-truck-table__status schedule-truck-table__status--${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
      exportValue: (row) => row.status,
    },
    {
      key: "autoApprove",
      header: "Auto Approve",
      align: "center",
      render: (row) =>
        row.autoApprove ? (
          <FiCheckCircle className="schedule-truck-table__auto-approve schedule-truck-table__auto-approve--on" aria-label="Auto approve enabled" />
        ) : (
          <FiXCircle className="schedule-truck-table__auto-approve schedule-truck-table__auto-approve--off" aria-label="Auto approve disabled" />
        ),
      exportValue: (row) => (row.autoApprove ? "Yes" : "No"),
    },
    {
      key: "trucks",
      header: "Trucks",
      render: (row) => {
        const isExpanded = expandedRowId === row.id;
        return (
          <button
            type="button"
            className={`schedule-truck-table__trucks-btn ${isExpanded ? "is-active" : ""}`}
            title={isExpanded ? "Hide Trucks" : "Add / View Trucks"}
            onClick={() => onToggleTrucks(row)}
          >
            {isExpanded ? <FiChevronUp aria-hidden /> : <FiTruck aria-hidden />}
            {isExpanded ? "Hide" : "Add/View"}
          </button>
        );
      },
      exportValue: (row) => String(row.trucksAssigned),
    },
    {
      key: "scheduleDateTime",
      header: "Schedule",
      sortable: true,
      sortValue: (row) => row.scheduleValue,
    },
    {
      key: "loadingAddress",
      header: "Loading Address",
      render: (row) => <span className="schedule-truck-table__address">{row.loadingAddress}</span>,
    },
    {
      key: "deliveryAddress",
      header: "Delivery Address",
      render: (row) => <span className="schedule-truck-table__address">{row.deliveryAddress}</span>,
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
      key: "update",
      header: "Update",
      render: (row) => (
        <button type="button" className="schedule-truck-table__update-btn" onClick={() => onUpdate(row)}>
          <FiEdit2 aria-hidden /> Update
        </button>
      ),
    },
  ];
}
