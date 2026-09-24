import { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiDownload, FiPrinter, FiCheck, FiRefreshCw, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { buildAccountStatementColumns } from "./accountStatement.columns";
import {
  accountSummaryTotals,
  buyerOptions,
  money,
  sellerOptions,
  statementRows,
  type StatementRow,
} from "./accountStatement.data";
import "./AccountStatement.scss";

const PAGE_SIZE = 5;

function getExportCellValue(row: StatementRow, column: TableColumn<StatementRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "-" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const AccountStatement = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState("Ankur Animal Feeds, Ahmedabad");
  const [selectedBuyer, setSelectedBuyer] = useState("Green Valley Dairy, Pune");
  const [appliedSeller, setAppliedSeller] = useState("Ankur Animal Feeds, Ahmedabad");
  const [appliedBuyer, setAppliedBuyer] = useState("Green Valley Dairy, Pune");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildAccountStatementColumns(), []);

  const filteredRows = useMemo(() => {
    return statementRows.filter((row) => {
      if (appliedDateFrom && row.dateValue < new Date(appliedDateFrom).getTime()) return false;
      if (appliedDateTo && row.dateValue > new Date(appliedDateTo).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
      return true;
    });
  }, [appliedDateFrom, appliedDateTo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSeller, appliedBuyer, appliedDateFrom, appliedDateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleApply = () => {
    setAppliedSeller(selectedSeller);
    setAppliedBuyer(selectedBuyer);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const handleReset = () => {
    setSelectedSeller("");
    setSelectedBuyer("");
    setAppliedSeller("");
    setAppliedBuyer("");
    setDateFrom("");
    setDateTo("");
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
    link.download = "account-statement.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="account-statement-page">
      <div className="account-statement-stats">
        <div className="account-statement-stat">
          <p className="account-statement-stat__label">Total Purchase</p>
          <p className="account-statement-stat__value">{money(accountSummaryTotals.totalPurchase)}</p>
        </div>
        <div className="account-statement-stat">
          <p className="account-statement-stat__label">Payments</p>
          <p className="account-statement-stat__value account-statement-stat__value--success">
            {money(accountSummaryTotals.payments)}
          </p>
        </div>
        <div className="account-statement-stat">
          <p className="account-statement-stat__label">Balance</p>
          <p className="account-statement-stat__value account-statement-stat__value--danger">
            {money(accountSummaryTotals.balance)}
          </p>
        </div>
      </div>

      <div className="account-statement-card">
        <div className="account-statement-card__header">
          <h1>Account Statement</h1>
          <div className="account-statement-card__actions">
            <button
              type="button"
              className="account-statement-btn account-statement-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="account-statement-btn account-statement-btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
            <button type="button" className="account-statement-btn account-statement-btn--warning" onClick={handlePrint}>
              <FiPrinter aria-hidden /> Print
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="account-statement-filters">
            <div className="account-statement-filters__field">
              <SearchableSelect
                options={sellerOptions}
                value={selectedSeller}
                onChange={setSelectedSeller}
                placeholder="Select Seller"
                ariaLabel="Select Seller"
                clearable
              />
            </div>

            <div className="account-statement-filters__field">
              <SearchableSelect
                options={buyerOptions}
                value={selectedBuyer}
                onChange={setSelectedBuyer}
                placeholder="Select Buyer"
                ariaLabel="Select Buyer"
                clearable
              />
            </div>

            <div className="account-statement-filters__field">
              <DateRangeInput
                from={dateFrom}
                to={dateTo}
                onChange={(from, to) => {
                  setDateFrom(from);
                  setDateTo(to);
                }}
                ariaLabel="Select date range"
              />
            </div>

            <button type="button" className="account-statement-filters__apply" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="account-statement-filters__reset" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        )}

        {(appliedSeller || appliedBuyer) && (
          <div className="account-statement-parties">
            {appliedSeller && (
              <span>
                Seller: <strong>{appliedSeller}</strong>
              </span>
            )}
            {appliedBuyer && (
              <span>
                Buyer: <strong>{appliedBuyer}</strong>
              </span>
            )}
          </div>
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No transactions match the current filters."
          minHeight
          className="account-statement-table"
        />

        <div className="account-statement-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${pagedRows.length} of ${filteredRows.length} Results`}
          </p>
          <div className="account-statement-pagination__controls">
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

export default AccountStatement;
