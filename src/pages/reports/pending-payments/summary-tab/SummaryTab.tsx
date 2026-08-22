import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import { buildSummaryColumns } from "./summaryTab.columns";
import { money, type BuyerSummaryRow } from "../pendingPayments.data";
import "./SummaryTab.scss";

const PAGE_SIZE = 10;

interface SummaryTabProps {
  rows: BuyerSummaryRow[];
}

const SummaryTab = ({ rows }: SummaryTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildSummaryColumns(), []);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = rows.slice((currentPageClamped - 1) * PAGE_SIZE, currentPageClamped * PAGE_SIZE);

  const totalBalance = useMemo(() => rows.reduce((sum, row) => sum + row.balanceAmount, 0), [rows]);
  const totalInvoices = useMemo(() => rows.reduce((sum, row) => sum + row.invoiceCount, 0), [rows]);

  return (
    <div className="summary-tab">
      <div className="summary-tab__stats">
        <div className="summary-tab__stat">
          <p className="summary-tab__stat-label">Total Buyers</p>
          <p className="summary-tab__stat-value">{rows.length}</p>
        </div>
        <div className="summary-tab__stat">
          <p className="summary-tab__stat-label">Balance Amount</p>
          <p className="summary-tab__stat-value summary-tab__stat-value--danger">{money(totalBalance)}</p>
        </div>
        <div className="summary-tab__stat">
          <p className="summary-tab__stat-label">Invoice Count</p>
          <p className="summary-tab__stat-value">{totalInvoices}</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No buyers match the current filters."
        minHeight
        className="summary-tab-table"
      />

      <div className="summary-tab__pagination">
        <p>
          {rows.length === 0 ? "Showing 0 Results" : `Showing ${pagedRows.length} of ${rows.length} Results`}
        </p>
        <div className="summary-tab__pagination-controls">
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

export default SummaryTab;
