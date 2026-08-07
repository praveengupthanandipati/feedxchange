import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import type { TruckTrip } from "./truckTrip.types";

const TruncatedAddress = ({ value }: { value: string }) => (
  <span className="truck-trip-table__address">
    <span className="truck-trip-table__address-text">{value}</span>
    <InfoTooltip text={value} />
  </span>
);

function formatDisplayDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}-${month}-${date.getFullYear()} ${hours}:${minutes} ${meridiem}`;
}

interface ColumnHandlers {
  onView: (row: TruckTrip) => void;
  onEdit: (row: TruckTrip) => void;
  onDelete: (row: TruckTrip) => void;
}

export function buildTruckTripColumns({ onView, onEdit, onDelete }: ColumnHandlers): TableColumn<TruckTrip>[] {
  return [
    {
      key: "truckNumber",
      header: "Truck Number",
      sortable: true,
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (row) => (
        <RowActionsMenu
          menuAlign="left"
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
    {
      key: "driverName",
      header: "Driver Name",
      sortable: true,
    },
    {
      key: "productType",
      header: "Product",
      sortable: true,
    },
    {
      key: "fromAddress",
      header: "From Address",
      render: (row) => <TruncatedAddress value={row.fromAddress} />,
      exportValue: (row) => row.fromAddress,
    },
    {
      key: "toAddress",
      header: "To Address",
      render: (row) => <TruncatedAddress value={row.toAddress} />,
      exportValue: (row) => row.toAddress,
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      sortValue: (row) => row.startDate,
      render: (row) => formatDisplayDateTime(row.startDate),
      exportValue: (row) => formatDisplayDateTime(row.startDate),
    },
    {
      key: "expectedEndDate",
      header: "End Date",
      sortable: true,
      sortValue: (row) => row.expectedEndDate,
      render: (row) => formatDisplayDateTime(row.expectedEndDate),
      exportValue: (row) => formatDisplayDateTime(row.expectedEndDate),
    },
  ];
}
