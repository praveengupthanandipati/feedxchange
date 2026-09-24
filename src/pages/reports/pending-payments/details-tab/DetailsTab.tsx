import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import { buildDetailsColumns } from "./detailsTab.columns";
import InvoiceDetailsOffcanvas from "./InvoiceDetailsOffcanvas";
import type { PendingPaymentRow } from "../pendingPayments.data";
import "./DetailsTab.scss";

const PAGE_SIZE = 10;

interface DetailsTabProps {
  rows: PendingPaymentRow[];
}

const DetailsTab = ({ rows }: DetailsTabProps) => {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewRow, setViewRow] = useState<PendingPaymentRow | null>(null);

  const columns = useMemo(
    () => buildDetailsColumns({ onViewInvoice: (row) => setViewRow(row) }),
    [],
  );

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => [row.invoiceNum, row.buyerName].join(" ").toLowerCase().includes(q));
  }, [rows, keyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  return (
    <div className="details-tab">
      <div className="details-tab__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={`${rows.length} records...`}
        />
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No invoices match the current filters."
        minHeight
        className="details-tab-table"
      />

      <div className="details-tab__pagination">
        <p>
          {filteredRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${filteredRows.length} Results`}
        </p>
        <div className="details-tab__pagination-controls">
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

      <InvoiceDetailsOffcanvas open={viewRow !== null} row={viewRow} onClose={() => setViewRow(null)} />
    </div>
  );
};

export default DetailsTab;
