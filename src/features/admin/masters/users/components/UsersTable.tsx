import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import type { MasterUser } from "../users.data";
import { fullName } from "../users.utils";
import { UserActions, UserEmail, UserPhone, UserStatusBadge, type UserActionHandlers } from "./UserBits";

export interface UserListProps extends UserActionHandlers {
  rows: MasterUser[];
  /** Every filtered row (the page passes only the current page as rows), for the row count and CSV / PDF export. */
  exportRows?: MasterUser[];
  emptyMessage: string;
}

/** Laptop and desktop view. */
const UsersTable = ({ rows, exportRows, emptyMessage, onEdit, onDelete }: UserListProps) => {
  const columns: TableColumn<MasterUser>[] = [
    { key: "name", header: "Name", sortable: true, sortValue: fullName, render: (row) => <span className="users__wrap">{fullName(row)}</span> },
    { key: "actions", header: "Actions", width: "5.5rem", align: "center", render: (row) => <UserActions user={row} onEdit={onEdit} onDelete={onDelete} /> },
    { key: "phone", header: "Phone Number", sortable: true, render: (row) => <UserPhone phone={row.phone} /> },
    { key: "email", header: "Email", sortable: true, render: (row) => <UserEmail email={row.email} /> },
    { key: "role", header: "Role", sortable: true, render: (row) => <span className="users__wrap">{row.role}</span> },
    { key: "business", header: "Business", sortable: true, render: (row) => <span className="users__wrap">{row.business}</span> },
    { key: "status", header: "Status", sortable: true, render: (row) => <UserStatusBadge status={row.status} /> },
  ];

  return (
    <div className="users__table-view">
      <Table exportName="Users" exportData={exportRows} columnToggle columns={columns} data={rows} rowKey={(row) => row.id} className="users__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default UsersTable;
