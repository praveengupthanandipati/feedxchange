import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import type { Promoter } from "../../../../store/promotersApi";

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
      key: "legalName",
      header: "Promoter Name",
      sortable: true,
      render: (row) => (
        <span className="promoters__cell-with-tooltip">
          <Link to={`/promoters/${row.profileId}`} className="promoters__link">
            {row.legalName}
          </Link>
          <InfoTooltip text="Referral partner registered under the promoters program." />
        </span>
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
      key: "commissionStructure",
      header: "Commission Structure",
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
      key: "totalReferrals",
      header: "Total Referrals",
      sortable: true,
      align: "center",
      sortValue: (row) => row.totalReferrals,
      exportValue: (row) => String(row.totalReferrals),
    },
    {
      key: "mobileNumber",
      header: "Phone Number",
      sortable: true,
      render: (row) => (
        <a href={`tel:${row.mobileNumber}`} className="promoters__link">
          {row.mobileNumber}
        </a>
      ),
      exportValue: (row) => row.mobileNumber,
    },
    {
      key: "emailId",
      header: "Email",
      sortable: true,
      render: (row) => (
        <a href={`mailto:${row.emailId}`} className="promoters__link">
          {row.emailId}
        </a>
      ),
      exportValue: (row) => row.emailId,
    },
  ];
}
