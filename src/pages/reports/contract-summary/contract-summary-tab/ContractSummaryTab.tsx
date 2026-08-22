import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import { buildContractSummaryColumns } from "./contractSummaryTab.columns";
import { contractSummaryRows, type ContractSummaryRow } from "./contractSummaryTab.data";
import "./ContractSummaryTab.scss";

const PAGE_SIZE = 5;

function getExportCellValue(row: ContractSummaryRow, column: TableColumn<ContractSummaryRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface ContractSummaryTabProps {
  filterValue: string;
  dateFrom: string;
  dateTo: string;
  onRegisterExport: (handler: (() => void) | null) => void;
}

const ContractSummaryTab = ({ filterValue, dateFrom, dateTo, onRegisterExport }: ContractSummaryTabProps) => {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildContractSummaryColumns(), []);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return contractSummaryRows.filter((row) => {
      if (dateFrom && row.contractDtValue < new Date(dateFrom).getTime()) return false;
      if (dateTo && row.contractDtValue > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
      if (q && ![row.contractNumber, row.seller, row.buyer, row.commodity].join(" ").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [keyword, filterValue, dateFrom, dateTo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, filterValue, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  useEffect(() => {
    const handleExport = () => {
      const headerRow = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
      const bodyRows = filteredRows
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
      link.download = "contract-summary.xls";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };

    onRegisterExport(handleExport);
    return () => onRegisterExport(null);
  }, [columns, filteredRows, onRegisterExport]);

  return (
    <div className="contract-summary-tab">
      <div className="contract-summary-tab__search">
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={`${contractSummaryRows.length} records...`}
        />
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No contracts match the current filters."
        minHeight
        className="contract-summary-tab-table"
      />

      <div className="contract-summary-tab__pagination">
        <p>
          {filteredRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${filteredRows.length} Results`}
        </p>
        <div className="contract-summary-tab__pagination-controls">
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

export default ContractSummaryTab;
