import type { TableColumn } from "../../../../components/table/table.types";
import type { BuyerRow, MonthKey } from "./buyerWise.data";

const monthColumns: { key: MonthKey; header: string }[] = [
  { key: "apr", header: "April 26" },
  { key: "may", header: "May 26" },
  { key: "jun", header: "June 26" },
  { key: "jul", header: "Jul 26" },
  { key: "aug", header: "Aug 26" },
  { key: "sep", header: "Sep 26" },
  { key: "oct", header: "Oct 26" },
  { key: "nov", header: "Nov 26" },
  { key: "dec", header: "Dec 26" },
  { key: "jan", header: "Jan 27" },
  { key: "feb", header: "Feb 27" },
  { key: "mar", header: "Mar 27" },
];

export function buildBuyerWiseColumns(): TableColumn<BuyerRow>[] {
  return [
    {
      key: "buyerName",
      header: "Buyer Name",
      sortable: true,
      render: (row) => <span className="buyer-wise-table__buyer">{row.buyerName}</span>,
    },
    ...monthColumns.map(
      (month): TableColumn<BuyerRow> => ({
        key: month.key,
        header: month.header,
        sortable: true,
        sortValue: (row) => row.values[month.key],
        render: (row) => row.values[month.key],
        exportValue: (row) => String(row.values[month.key]),
      }),
    ),
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (row) => <span className="buyer-wise-table__total">{row.total}</span>,
      exportValue: (row) => String(row.total),
    },
  ];
}
