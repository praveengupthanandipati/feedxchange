import { useEffect, useMemo } from "react";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import { getPreviousFinancialYear } from "../monthlyReports.data";
import { buildMonthlyWiseColumns } from "./monthlyWise.columns";
import { monthlyRows, totalCurrentYearQty, type MonthlyRow } from "./monthlyWise.data";
import "./MonthlyWise.scss";

function getExportCellValue(row: MonthlyRow, column: TableColumn<MonthlyRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface MonthlyWiseProps {
  financialYear: string;
  onRegisterExport: (handler: (() => void) | null) => void;
}

const MonthlyWise = ({ financialYear, onRegisterExport }: MonthlyWiseProps) => {
  const previousYear = getPreviousFinancialYear(financialYear);
  const columns = useMemo(
    () => buildMonthlyWiseColumns(financialYear, previousYear),
    [financialYear, previousYear],
  );

  useEffect(() => {
    const handleExport = () => {
      const headerRow = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
      const bodyRows = monthlyRows
        .map((row) => {
          const cells = columns.map((column) => `<td>${escapeHtml(getExportCellValue(row, column))}</td>`).join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
      const blob = new Blob([html], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "monthly-wise.xls";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };

    onRegisterExport(handleExport);
    return () => onRegisterExport(null);
  }, [columns, onRegisterExport]);

  return (
    <div className="monthly-wise">
      <div className="monthly-wise__stat">
        <p className="monthly-wise__stat-label">Total</p>
        <p className="monthly-wise__stat-value">{totalCurrentYearQty}</p>
      </div>

      <Table
        columns={columns}
        data={monthlyRows}
        rowKey={(row) => row.id}
        emptyMessage="No monthly data available."
        minHeight
        className="monthly-wise-table"
      />
    </div>
  );
};

export default MonthlyWise;
