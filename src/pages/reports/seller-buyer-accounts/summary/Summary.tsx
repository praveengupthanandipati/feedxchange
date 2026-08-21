import { useMemo, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import { buildSummaryColumns } from "./summary.columns";
import { summaryRows, summaryTotals } from "./summary.data";
import "./Summary.scss";

const PAGE_SIZE = 10;

function formatMoney(value: number): string {
  return value.toLocaleString("en-IN");
}

const Summary = () => {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildSummaryColumns(), []);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return summaryRows;
    return summaryRows.filter((row) => row.buyerName.toLowerCase().includes(q));
  }, [keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  return (
    <>
      <div className="summary-search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={`${summaryRows.length} records...`}
        />
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No buyers match the current search."
        minHeight
      />

      <div className="summary-pagination">
        <p>
          {filteredRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${filteredRows.length} Results`}
        </p>
        <div className="summary-pagination__controls">
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

      <div className="summary-totals">
        <span>
          Total Due:<strong>{formatMoney(summaryTotals.totalDue)}</strong>
        </span>
        <span>
          Total Overdue:<strong>{formatMoney(summaryTotals.totalOverdue)}</strong>
        </span>
        <span>
          0-30 days:<strong>{formatMoney(summaryTotals.bucket0to30.amount)} ({summaryTotals.bucket0to30.count})</strong>
        </span>
        <span>
          31-45 days:<strong>{formatMoney(summaryTotals.bucket31to45.amount)} ({summaryTotals.bucket31to45.count})</strong>
        </span>
        <span>
          46-60 days:<strong>{formatMoney(summaryTotals.bucket46to60.amount)} ({summaryTotals.bucket46to60.count})</strong>
        </span>
        <span>
          &gt; 60 days:<strong>{formatMoney(summaryTotals.bucketOver60.amount)} ({summaryTotals.bucketOver60.count})</strong>
        </span>
      </div>
    </>
  );
};

export default Summary;
