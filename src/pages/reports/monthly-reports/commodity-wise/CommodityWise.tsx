import { useEffect, useMemo, useState } from "react";
import { FiPrinter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import { buildCommodityWiseColumns } from "./commodityWise.columns";
import { commodityRows, getMonthlyTotal, monthlyStats, type CommodityRow } from "./commodityWise.data";
import "./CommodityWise.scss";

const PAGE_SIZE = 10;

function getExportCellValue(row: CommodityRow, column: TableColumn<CommodityRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface CommodityWiseProps {
  onRegisterExport: (handler: (() => void) | null) => void;
}

const CommodityWise = ({ onRegisterExport }: CommodityWiseProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildCommodityWiseColumns(), []);

  const totalPages = Math.max(1, Math.ceil(commodityRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = commodityRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  useEffect(() => {
    const handleExport = () => {
      const headerRow = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
      const bodyRows = commodityRows
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
      link.download = "commodity-wise.xls";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };

    onRegisterExport(handleExport);
    return () => onRegisterExport(null);
  }, [columns, onRegisterExport]);

  const handlePrint = () => window.print();

  return (
    <div className="commodity-wise">
      <div className="commodity-wise__header">
        <h2>Commodity Wise Report</h2>
        <button type="button" className="commodity-wise__print" onClick={handlePrint}>
          <FiPrinter aria-hidden /> Print
        </button>
      </div>

      <div className="commodity-wise__stats">
        {monthlyStats.map((month) => (
          <div className="commodity-wise__stat" key={month.key}>
            <p className="commodity-wise__stat-label">{month.label}</p>
            <p className="commodity-wise__stat-value">{getMonthlyTotal(month.key)}</p>
          </div>
        ))}
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No commodity data available."
        minHeight
        className="commodity-wise-table"
      />

      <div className="commodity-wise__pagination">
        <p>
          {commodityRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${commodityRows.length} Results`}
        </p>
        <div className="commodity-wise__pagination-controls">
          <button
            type="button"
            disabled={currentPageClamped === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            aria-label="Previous page"
          >
            <FiChevronLeft aria-hidden />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={page === currentPageClamped ? "is-active" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPageClamped === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            aria-label="Next page"
          >
            <FiChevronRight aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommodityWise;
