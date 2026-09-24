import type { TableColumn } from "../../../../components/table/table.types";
import type { AgingBucket, SummaryRow } from "./summary.data";

function formatMoney(value: number): string {
  return value.toLocaleString("en-IN");
}

function formatBucket(bucket: AgingBucket): string {
  return `${formatMoney(bucket.amount)} (${bucket.count})`;
}

export function buildSummaryColumns(): TableColumn<SummaryRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "buyerName",
      header: "Buyer Name",
      sortable: true,
      render: (row) => <span className="summary-table__buyer">{row.buyerName}</span>,
    },
    {
      key: "totalDue",
      header: "Total Due",
      sortable: true,
      render: (row) => formatMoney(row.totalDue),
    },
    {
      key: "totalOverdue",
      header: "Total Overdue",
      sortable: true,
      render: (row) => formatMoney(row.totalOverdue),
    },
    {
      key: "bucket0to30",
      header: "0-30 days",
      sortable: true,
      sortValue: (row) => row.bucket0to30.amount,
      render: (row) => formatBucket(row.bucket0to30),
    },
    {
      key: "bucket31to45",
      header: "31-45 days",
      sortable: true,
      sortValue: (row) => row.bucket31to45.amount,
      render: (row) => formatBucket(row.bucket31to45),
    },
    {
      key: "bucket46to60",
      header: "46-60 days",
      sortable: true,
      sortValue: (row) => row.bucket46to60.amount,
      render: (row) => formatBucket(row.bucket46to60),
    },
    {
      key: "bucketOver60",
      header: "> 60 days",
      sortable: true,
      sortValue: (row) => row.bucketOver60.amount,
      render: (row) => (
        <span className={row.bucketOver60.amount > 0 ? "summary-table__overdue--severe" : ""}>
          {formatBucket(row.bucketOver60)}
        </span>
      ),
    },
  ];
}
