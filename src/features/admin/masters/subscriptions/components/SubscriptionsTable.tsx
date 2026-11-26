import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import type { Subscription } from "../subscriptions.data";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

export interface SubscriptionListProps {
  rows: Subscription[];
  /** Every filtered row (the page passes only the current page as rows), for the row count and CSV / PDF export. */
  exportRows?: Subscription[];
  emptyMessage: string;
}

const columns: TableColumn<Subscription>[] = [
  { key: "email", header: "Email Address", sortable: true, render: (row) => <span className="subscriptions__email">{row.email}</span> },
  { key: "status", header: "Status", sortable: true, render: (row) => <SubscriptionStatusBadge status={row.status} /> },
  { key: "subscribedOn", header: "Date of Subscription", sortable: true },
];

/** Tablet, laptop and desktop view. */
const SubscriptionsTable = ({ rows, exportRows, emptyMessage }: SubscriptionListProps) => (
  <div className="subscriptions__table-view">
    <Table exportName="Subscriptions" exportData={exportRows} columnToggle columns={columns} data={rows} rowKey={(row) => row.id} className="subscriptions__table" emptyMessage={emptyMessage} />
  </div>
);

export default SubscriptionsTable;
