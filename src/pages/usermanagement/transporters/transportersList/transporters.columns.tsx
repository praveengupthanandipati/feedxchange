import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { Transporter } from "../../../../store/transportersApi";

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
      key: "legalName",
      header: "Transporter Name",
      sortable: true,
      render: (row) => (
        <Link to={`/transporters/${row.profileId}`} className="transporters__link">
          {row.legalName}
        </Link>
      ),
      exportValue: (row) => row.legalName,
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (row) => (
        <RowActionsMenu onView={() => onView(row)} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
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
      key: "transporterTypeName",
      header: "Transporter Type",
      sortable: true,
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
    },
    {
      key: "mobileNumber",
      header: "Mobile Number",
      sortable: true,
      render: (row) => (
        <a href={`tel:${row.mobileNumber}`} className="transporters__link">
          {row.mobileNumber}
        </a>
      ),
      exportValue: (row) => row.mobileNumber,
    },
    {
      key: "stateName",
      header: "State",
      sortable: true,
    },
  ];
}
