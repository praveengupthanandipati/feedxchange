import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import type { Promoter } from "./promoters.data";

const StatusBadge = ({ status }: { status: Promoter["status"] }) => (
  <span className={`promoters__status promoters__status--${status.toLowerCase()}`}>{status}</span>
);

interface ColumnHandlers {
  onEdit: (promoter: Promoter) => void;
  onView: (promoter: Promoter) => void;
  onDelete: (promoter: Promoter) => void;
}

export function buildPromoterColumns({ onEdit, onView, onDelete }: ColumnHandlers): TableColumn<Promoter>[] {
  return [
    {
      key: "promoterName",
      header: "Promoter Name",
      sortable: true,
      render: (row) => (
        <span className="promoters__cell-with-tooltip">
          <Link to={`/promoters/${row.id}`} className="promoters__link">
            {row.promoterName}
          </Link>
          <InfoTooltip text="Referral partner registered under the promoters program." />
        </span>
      ),
      exportValue: (row) => row.promoterName,
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
      key: "referralCode",
      header: "Referral Code",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "noOfRef",
      header: "No.of Ref",
      sortable: true,
      align: "center",
      sortValue: (row) => row.noOfRef,
      exportValue: (row) => String(row.noOfRef),
    },
    {
      key: "phone",
      header: "Phone Number",
      sortable: true,
      render: (row) => (
        <a href={`tel:${row.phone}`} className="promoters__link">
          {row.phone}
        </a>
      ),
      exportValue: (row) => row.phone,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (row) => (
        <a href={`mailto:${row.email}`} className="promoters__link">
          {row.email}
        </a>
      ),
      exportValue: (row) => row.email,
    },
  ];
}
