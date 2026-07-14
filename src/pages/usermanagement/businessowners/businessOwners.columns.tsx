import { Link } from "react-router-dom";
import type { TableColumn } from "../../../components/table/table.types";
import RowActionsMenu from "../../../components/table/RowActionsMenu";
import type { BusinessOwner } from "./businessOwners.data";

const StatusBadge = ({ status }: { status: BusinessOwner["status"] }) => (
  <span className={`business-owners__status business-owners__status--${status.toLowerCase()}`}>
    {status}
  </span>
);

interface ColumnHandlers {
  onEdit: (owner: BusinessOwner) => void;
  onDelete: (owner: BusinessOwner) => void;
}

export function buildBusinessOwnerColumns({
  onEdit,
  onDelete,
}: ColumnHandlers): TableColumn<BusinessOwner>[] {
  return [
    {
      key: "companyName",
      header: "Company Name",
      sortable: true,
      render: (row) => (
        <Link to={`/business-owners/${row.id}`} className="business-owners__link">
          {row.companyName}
        </Link>
      ),
      exportValue: (row) => row.companyName,
    },
    {
      key: "actions",
      header: "",
      render: (row) => <RowActionsMenu onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "businessType",
      header: "Business Type",
      sortable: true,
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
        <a href={`tel:${row.mobile}`} className="business-owners__link">
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
