import { ChevronUpIcon, CircleCheckBigIcon, CircleXIcon, TruckIcon } from "../../../../../shared/components/icon";
import RowActionsMenu from "../../../../../shared/components/table/RowActionsMenu";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";

interface ColumnHandlers {
  onEdit: (row: ScheduleTruckRow) => void;
  onDelete: (row: ScheduleTruckRow) => void;
  expandedRowId: string | null;
  onToggleTrucks: (row: ScheduleTruckRow) => void;
}

export function buildScheduleTruckColumns({
  onEdit,
  onDelete,
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
          <CircleCheckBigIcon className="schedule-truck-table__auto-approve schedule-truck-table__auto-approve--on" aria-label="Auto approve enabled" />
        ) : (
          <CircleXIcon className="schedule-truck-table__auto-approve schedule-truck-table__auto-approve--off" aria-label="Auto approve disabled" />
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
            {isExpanded ? <ChevronUpIcon aria-hidden /> : <TruckIcon aria-hidden />}
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
  ];
}
