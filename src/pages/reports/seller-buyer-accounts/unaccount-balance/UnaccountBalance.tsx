import { useMemo, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import { buildUnaccountBalanceColumns } from "./unaccountBalance.columns";
import { unaccountBalanceRows } from "./unaccountBalance.data";
import "./UnaccountBalance.scss";

const PAGE_SIZE = 10;

const UnaccountBalance = () => {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildUnaccountBalanceColumns(), []);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return unaccountBalanceRows;
    return unaccountBalanceRows.filter((row) =>
      [row.seller, row.mode].join(" ").toLowerCase().includes(q),
    );
  }, [keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  return (
    <>
      <div className="unaccount-balance-search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={`${unaccountBalanceRows.length} records...`}
        />
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No records match the current search."
        minHeight
      />

      <div className="unaccount-balance-pagination">
        <p>
          {filteredRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${filteredRows.length} Results`}
        </p>
        <div className="unaccount-balance-pagination__controls">
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
    </>
  );
};

export default UnaccountBalance;
