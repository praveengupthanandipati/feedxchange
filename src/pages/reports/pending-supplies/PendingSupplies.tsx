import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiDownload,
  FiPrinter,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { buildPendingSuppliesColumns } from "./pendingSupplies.columns";
import {
  commodityOptions,
  formatTodayLabel,
  pendingSupplyRows,
  type PendingSupplyRow,
} from "./pendingSupplies.data";
import "./PendingSupplies.scss";

const PAGE_SIZE = 8;

function getExportCellValue(row: PendingSupplyRow, column: TableColumn<PendingSupplyRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const PendingSupplies = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedCommodity, setAppliedCommodity] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  const columns = useMemo(() => buildPendingSuppliesColumns(), []);

  const filteredRows = useMemo(() => {
    return pendingSupplyRows.filter((row) => {
      if (appliedCommodity && row.commodity !== appliedCommodity) return false;
      if (appliedDateFrom && row.contractDtValue < new Date(appliedDateFrom).getTime()) return false;
      if (appliedDateTo && row.contractDtValue > new Date(appliedDateTo).getTime() + 24 * 60 * 60 * 1000 - 1)
        return false;
      return true;
    });
  }, [appliedCommodity, appliedDateFrom, appliedDateTo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedCommodity, appliedDateFrom, appliedDateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleShowFilters = () => {
    setAppliedCommodity(selectedCommodity);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const handleReset = () => {
    setSelectedCommodity("");
    setDateFrom("");
    setDateTo("");
    setAppliedCommodity("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
  };

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
    link.download = "pending-supplies.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="pending-supplies-page">
      <div className="pending-supplies-card">
        <div className="pending-supplies-card__header">
          <div className="pending-supplies-card__title">
            <h1>Pending Supplies</h1>
            <span className="pending-supplies-card__subtitle">Data Showing: Today: {formatTodayLabel()}</span>
          </div>
          <div className="pending-supplies-card__actions">
            <button
              type="button"
              className="pending-supplies-btn pending-supplies-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="pending-supplies-btn pending-supplies-btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
            <button type="button" className="pending-supplies-btn pending-supplies-btn--warning" onClick={handlePrint}>
              <FiPrinter aria-hidden /> Print
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="pending-supplies-filters">
            <div className="pending-supplies-filters__field">
              <SearchableSelect
                options={commodityOptions}
                value={selectedCommodity}
                onChange={setSelectedCommodity}
                placeholder="Select"
                ariaLabel="Select Commodity"
                clearable
              />
            </div>

            <div className="pending-supplies-filters__field">
              <input
                type="date"
                className="pending-supplies-filters__date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                aria-label="From Date"
              />
            </div>

            <div className="pending-supplies-filters__field">
              <input
                type="date"
                className="pending-supplies-filters__date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                aria-label="To Date"
              />
            </div>

            <button type="button" className="pending-supplies-filters__show" onClick={handleShowFilters}>
              <FiSearch aria-hidden /> Show
            </button>
            <button type="button" className="pending-supplies-filters__reset" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No pending supplies match the current filters."
          minHeight
          className="pending-supplies-table"
        />

        <div className="pending-supplies-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${pagedRows.length} of ${filteredRows.length} Results`}
          </p>
          <div className="pending-supplies-pagination__controls">
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
    </div>
  );
};

export default PendingSupplies;
