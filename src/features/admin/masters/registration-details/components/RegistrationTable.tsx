import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import type { Registration } from "../registrationDetails.data";
import { formatRegistrationDate } from "../registrationDetails.utils";
import { RegistrationActions, RegistrationEmail, RegistrationPhone, RegistrationStatusBadge } from "./RegistrationBits";

export interface RegistrationListProps {
  rows: Registration[];
  emptyMessage: string;
  onUpdateStatus: (registration: Registration) => void;
}

/** Laptop and desktop view. */
const RegistrationTable = ({ rows, emptyMessage, onUpdateStatus }: RegistrationListProps) => {
  const columns: TableColumn<Registration>[] = [
    { key: "name", header: "Name", sortable: true, render: (row) => <span className="registrations__wrap">{row.name}</span> },
    { key: "actions", header: "Actions", width: "5.5rem", align: "center", render: (row) => <RegistrationActions registration={row} onUpdateStatus={onUpdateStatus} /> },
    { key: "phone", header: "Phone", sortable: true, render: (row) => <RegistrationPhone phone={row.phone} /> },
    { key: "email", header: "Email", sortable: true, render: (row) => <RegistrationEmail email={row.email} /> },
    {
      key: "registrationDate",
      header: "Registration Date",
      sortable: true,
      render: (row) => <span className="registrations__nowrap">{formatRegistrationDate(row.registrationDate)}</span>,
    },
    { key: "businessName", header: "Business Name", sortable: true, render: (row) => <span className="registrations__wrap">{row.businessName}</span> },
    { key: "lineOfBusiness", header: "Line of Business", sortable: true, render: (row) => <span className="registrations__wrap">{row.lineOfBusiness}</span> },
    { key: "referralCode", header: "Referral Code", sortable: true, render: (row) => row.referralCode || <span className="registrations__muted">—</span> },
    { key: "status", header: "Status", sortable: true, render: (row) => <RegistrationStatusBadge status={row.status} /> },
  ];

  return (
    <div className="registrations__table-view">
      <Table columns={columns} data={rows} rowKey={(row) => row.id} className="registrations__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default RegistrationTable;
