import { useEffect, useMemo, useState } from "react";
import { FiPrinter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import { buildSellerWiseColumns } from "./sellerWise.columns";
import { getMonthlyTotal, monthlyStats, sellerRows, type SellerRow } from "./sellerWise.data";
import "./SellerWise.scss";

const PAGE_SIZE = 10;

function getExportCellValue(row: SellerRow, column: TableColumn<SellerRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface SellerWiseProps {
  onRegisterExport: (handler: (() => void) | null) => void;
}

const SellerWise = ({ onRegisterExport }: SellerWiseProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildSellerWiseColumns(), []);

  const totalPages = Math.max(1, Math.ceil(sellerRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = sellerRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  useEffect(() => {
    const handleExport = () => {
      const headerRow = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
      const bodyRows = sellerRows
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
      link.download = "seller-wise.xls";
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
    <div className="seller-wise">
      <div className="seller-wise__header">
        <h2>Seller Wise Report</h2>
        <button type="button" className="seller-wise__print" onClick={handlePrint}>
          <FiPrinter aria-hidden /> Print
        </button>
      </div>

      <div className="seller-wise__stats">
        {monthlyStats.map((month) => (
          <div className="seller-wise__stat" key={month.key}>
            <p className="seller-wise__stat-label">{month.label}</p>
            <p className="seller-wise__stat-value">{getMonthlyTotal(month.key)}</p>
          </div>
        ))}
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No seller data available."
        minHeight
        className="seller-wise-table"
      />

      <div className="seller-wise__pagination">
        <p>
          {sellerRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${sellerRows.length} Results`}
        </p>
        <div className="seller-wise__pagination-controls">
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

export default SellerWise;
