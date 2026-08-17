import { FiUnlock } from "react-icons/fi";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { DriverTruckMapping } from "../../../../store/driverTruckMappingApi";

export interface DriverTruckMappingRow extends DriverTruckMapping {
  driverPhone: string;
}

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

interface ColumnHandlers {
  onView: (row: DriverTruckMappingRow) => void;
  onDelete: (row: DriverTruckMappingRow) => void;
}

export function buildDriverTruckMappingColumns({
  onView,
  onDelete,
}: ColumnHandlers): TableColumn<DriverTruckMappingRow>[] {
  return [
    {
      key: "truckNumber",
      header: "Truck Number",
      sortable: true,
      render: (row) => (
        <button type="button" className="driver-truck-mapping__link" onClick={() => onView(row)}>
          {row.truckNumber}
        </button>
      ),
      exportValue: (row) => row.truckNumber,
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (row) => (
        <RowActionsMenu
          onView={() => onView(row)}
          onDelete={() => onDelete(row)}
          deleteIcon={FiUnlock}
          deleteLabel="Release"
        />
      ),
    },
    {
      key: "driverName",
      header: "Driver Name",
      sortable: true,
      render: (row) => (
        <button type="button" className="driver-truck-mapping__link" onClick={() => onView(row)}>
          {row.driverName}
        </button>
      ),
      exportValue: (row) => row.driverName,
    },
    {
      key: "driverPhone",
      header: "Driver Phone Number",
      render: (row) => (
        <a href={`tel:${row.driverPhone}`} className="driver-truck-mapping__link">
          {row.driverPhone}
        </a>
      ),
      exportValue: (row) => row.driverPhone,
    },
    {
      key: "assignedFrom",
      header: "Assigned Date",
      sortable: true,
      sortValue: (row) => row.assignedFrom,
      render: (row) => formatDisplayDate(row.assignedFrom),
      exportValue: (row) => formatDisplayDate(row.assignedFrom),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
    },
  ];
}
