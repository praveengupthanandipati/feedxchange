import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { Subscription } from "../subscriptions.data";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

export interface SubscriptionListProps {
  rows: Subscription[];
  emptyMessage: string;
}

const columns: TableColumn<Subscription>[] = [
  { key: "email", header: "Email Address", sortable: true, render: (row) => <span className="subscriptions__email">{row.email}</span> },
  { key: "status", header: "Status", sortable: true, render: (row) => <SubscriptionStatusBadge status={row.status} /> },
  { key: "subscribedOn", header: "Date of Subscription", sortable: true },
];

/** Tablet, laptop and desktop view. */
const SubscriptionsTable = ({ rows, emptyMessage }: SubscriptionListProps) => (
  <div className="subscriptions__table-view">
    <Table columns={columns} data={rows} rowKey={(row) => row.id} className="subscriptions__table" emptyMessage={emptyMessage} />
  </div>
);

export default SubscriptionsTable;
