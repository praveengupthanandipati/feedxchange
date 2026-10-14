import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { EstimationLine } from "../estimationDetail.data";
import { formatInr, lineCommission } from "../estimationDetail.utils";
import ActionTypeBadge from "./ActionTypeBadge";

export type DetailLineRow = EstimationLine & { sNo: number };

export interface DetailLinesProps {
  rows: DetailLineRow[];
  emptyMessage: string;
}

const columns: TableColumn<DetailLineRow>[] = [
  { key: "sNo", header: "S.No", sortable: true, width: "4.5rem" },
  { key: "contractDate", header: "Contract Date", sortable: true, render: (row) => formatDisplayDate(row.contractDate) },
  { key: "contractNo", header: "Contract #", sortable: true },
  { key: "partyName", header: "Buyer / Seller Name", sortable: true, render: (row) => <span className="estimation-detail__wrap">{row.partyName}</span> },
  { key: "actionType", header: "Action Type", sortable: true, render: (row) => <ActionTypeBadge type={row.actionType} /> },
  { key: "commodity", header: "Commodity", sortable: true },
  { key: "quantityMt", header: "No. of MT", sortable: true },
  { key: "commissionPerMt", header: "Commission Per MT", sortable: true, render: (row) => formatInr(row.commissionPerMt) },
  { key: "total", header: "Total Commission", sortable: true, sortValue: lineCommission, render: (row) => formatInr(lineCommission(row)) },
];

/** Laptop and desktop view. */
const DetailLinesTable = ({ rows, emptyMessage }: DetailLinesProps) => (
  <div className="estimation-detail__table-view">
    <Table columns={columns} data={rows} rowKey={(row) => row.id} className="estimation-detail__table" emptyMessage={emptyMessage} />
  </div>
);

export default DetailLinesTable;
