import { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiDownload, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { buildSellerInvoiceColumns } from "./sellerInvoiceReports.columns";
import {
  sellerInvoiceRows,
  sellerOptions,
  buyerOptions,
  financialYearOptions,
  contractOptions,
  reportPartySummary,
  type SellerInvoiceRow,
} from "./sellerInvoiceReports.data";
import "./SellerInvoiceReports.scss";

const PAGE_SIZE = 10;

function getExportCellValue(row: SellerInvoiceRow, column: TableColumn<SellerInvoiceRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const SellerInvoiceReports = () => {
  const [sellerFilter, setSellerFilter] = useState("Sai Feeds Pvt Ltd - Mumbai");
  const [buyerFilter, setBuyerFilter] = useState("Venkatesh Iyer Krishnamurthy - Chennai");
  const [financialYearFilter, setFinancialYearFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // TODO: wire up to the reports API once available.
  const handleView = () => undefined;
  const handleEdit = () => undefined;
  const handleEmail = () => undefined;
  const handleSms = () => undefined;
  const handleDelete = () => undefined;
  const handleDeductions = () => undefined;

  const columns = useMemo(
    () =>
      buildSellerInvoiceColumns({
        onView: handleView,
        onEdit: handleEdit,
        onEmail: handleEmail,
        onSms: handleSms,
        onDelete: handleDelete,
        onDeductions: handleDeductions,
      }),
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [contractFilter, dateFrom, dateTo]);

  const filteredRows = useMemo(() => {
    return sellerInvoiceRows.filter((row) => {
      if (contractFilter && row.contractNumber !== contractFilter) return false;
      if (dateFrom && row.invDateValue < new Date(dateFrom).getTime()) return false;
      if (dateTo && row.invDateValue > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
      return true;
    });
  }, [contractFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleClearFilters = () => {
    setSellerFilter("");
    setBuyerFilter("");
    setFinancialYearFilter("");
    setContractFilter("");
    setDateFrom("");
    setDateTo("");
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
    link.download = "seller-invoice-report.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="seller-invoice-report-page">
      <div className="seller-invoice-report-card">
        <div className="seller-invoice-report-card__header">
          <h1>Seller Invoice Report</h1>
          <div className="seller-invoice-report-card__actions">
            <button
              type="button"
              className="seller-invoice-report-btn seller-invoice-report-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="seller-invoice-report-btn seller-invoice-report-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="seller-invoice-report-filters">
            <div className="seller-invoice-report-filters__parties">
              <SearchableSelect
                options={sellerOptions}
                value={sellerFilter}
                onChange={setSellerFilter}
                placeholder="Select Seller"
                ariaLabel="Select Seller"
                clearable
              />
              <SearchableSelect
                options={buyerOptions}
                value={buyerFilter}
                onChange={setBuyerFilter}
                placeholder="Select Buyer"
                ariaLabel="Select Buyer"
                clearable
              />
            </div>

            <div className="seller-invoice-report-filters__row">
              <SearchableSelect
                options={financialYearOptions}
                value={financialYearFilter}
                onChange={setFinancialYearFilter}
                placeholder="Select Financial Year"
                ariaLabel="Select Financial Year"
              />
              <SearchableSelect
                options={contractOptions}
                value={contractFilter}
                onChange={setContractFilter}
                placeholder="Select Contract"
                ariaLabel="Select Contract"
              />
              <div className="seller-invoice-report-filters__date-range">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  aria-label="Invoice date range from"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  aria-label="Invoice date range to"
                />
              </div>
            </div>

            <div className="seller-invoice-report-filters__clear-row">
              <button
                type="button"
                className="seller-invoice-report-filters__clear"
                onClick={handleClearFilters}
              >
                <FiX aria-hidden /> Clear
              </button>
            </div>
          </div>
        )}

        <div className="seller-invoice-report-summary">
          <span>
            Seller: <strong>{reportPartySummary.sellerName}</strong>
          </span>
          <span>
            Buyer: <strong>{reportPartySummary.buyerName}</strong>
          </span>
        </div>

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No invoices match the current filters."
          minHeight
        />

        <div className="seller-invoice-report-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  filteredRows.length,
                )} of ${filteredRows.length} Results`}
          </p>
          <div className="seller-invoice-report-pagination__controls">
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

export default SellerInvoiceReports;
