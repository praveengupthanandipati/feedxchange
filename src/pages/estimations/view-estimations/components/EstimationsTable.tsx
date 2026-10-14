import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { Estimation } from "../viewEstimation.data";
import { displayAmount, displayDate, EMPTY_VALUE } from "../viewEstimation.utils";
import EstimationActions, { type EstimationActionHandlers } from "./EstimationActions";

export type EstimationRow = Estimation & { sNo: number };

export interface EstimationListProps extends EstimationActionHandlers {
  rows: EstimationRow[];
  emptyMessage: string;
}

/** Laptop and desktop view. */
const EstimationsTable = ({ rows, emptyMessage, ...handlers }: EstimationListProps) => {
  const columns: TableColumn<EstimationRow>[] = [
    { key: "sNo", header: "S.No", sortable: true, width: "4.5rem" },
    { key: "estimateNo", header: "Estimate No", sortable: true },
    { key: "actions", header: "Actions", render: (row) => <EstimationActions estimation={row} {...handlers} /> },
    { key: "fromDate", header: "From Date", sortable: true, render: (row) => displayDate(row.fromDate) },
    { key: "toDate", header: "To Date", sortable: true, render: (row) => displayDate(row.toDate) },
    {
      key: "partyName",
      header: "Party Name",
      sortable: true,
      render: (row) => <span className="view-estimations__wrap">{row.partyName || EMPTY_VALUE}</span>,
    },
    { key: "qty", header: "Qty", sortable: true, render: (row) => `${row.qty} MT` },
    { key: "netAmount", header: "Net Amount", sortable: true, sortValue: (row) => row.netAmount ?? -1, render: (row) => displayAmount(row.netAmount) },
  ];

  return (
    <div className="view-estimations__table-view">
      <Table columns={columns} data={rows} rowKey={(row) => row.id} className="view-estimations__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default EstimationsTable;
