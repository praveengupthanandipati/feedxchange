import type { TableColumn } from "../../../../components/table/table.types";
import { variationPercent, type MonthlyRow } from "./monthlyWise.data";

export function buildMonthlyWiseColumns(
  currentYearLabel: string,
  previousYearLabel: string,
): TableColumn<MonthlyRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "3.5rem",
    },
    {
      key: "month",
      header: "Month",
      sortable: true,
    },
    {
      key: "currentYearQty",
      header: `${currentYearLabel} Qty`,
      sortable: true,
      render: (row) => `${row.currentYearQty} MT`,
      exportValue: (row) => `${row.currentYearQty} MT`,
    },
    {
      key: "previousYearQty",
      header: `${previousYearLabel} Qty`,
      sortable: true,
      render: (row) => `${row.previousYearQty} MT`,
      exportValue: (row) => `${row.previousYearQty} MT`,
    },
    {
      key: "variation",
      header: "Variation in %",
      sortable: true,
      sortValue: (row) => variationPercent(row),
      render: (row) => {
        const value = variationPercent(row);
        const isUp = value >= 0;
        return (
          <span
            className={
              isUp
                ? "monthly-wise-table__variation monthly-wise-table__variation--up"
                : "monthly-wise-table__variation monthly-wise-table__variation--down"
            }
          >
            {isUp ? "+" : ""}
            {value.toFixed(1)}%
          </span>
        );
      },
      exportValue: (row) => {
        const value = variationPercent(row);
        return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
      },
    },
  ];
}
