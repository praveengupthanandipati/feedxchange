import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { Transporter } from "./transporters.data";

const StatusBadge = ({ status }: { status: Transporter["status"] }) => (
  <span className={`transporters__status transporters__status--${status.toLowerCase()}`}>
    {status}
  </span>
);

interface ColumnHandlers {
  onEdit: (transporter: Transporter) => void;
  onView: (transporter: Transporter) => void;
  onDelete: (transporter: Transporter) => void;
}

export function buildTransporterColumns({
  onEdit,
  onView,
  onDelete,
}: ColumnHandlers): TableColumn<Transporter>[] {
  return [
    {
      key: "companyName",
      header: "Company Name",
      sortable: true,
      render: (row) => (
        <Link to={`/transporters/${row.id}`} className="transporters__link">
          {row.companyName}
        </Link>
      ),
      exportValue: (row) => row.companyName,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <RowActionsMenu
          onEdit={() => onEdit(row)}
          onView={() => onView(row)}
          onDelete={() => onDelete(row)}
        />
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
      key: "transporterType",
      header: "Transporter Type",
      sortable: true,
    },
    {
      key: "truckCount",
      header: "No. of Trucks",
      sortable: true,
      align: "center",
      sortValue: (row) => row.truckCount,
      exportValue: (row) => String(row.truckCount),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
    },
    {
      key: "mobile",
      header: "Mobile Number",
      sortable: true,
      render: (row) => (
        <a href={`tel:${row.mobile}`} className="transporters__link">
          {row.mobile}
        </a>
      ),
      exportValue: (row) => row.mobile,
    },
    {
      key: "state",
      header: "State",
      sortable: true,
    },
  ];
}
