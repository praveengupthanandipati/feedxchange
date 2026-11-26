import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PrinterIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import { buildBuyerWiseColumns } from "./buyerWise.columns";
import { buyerRows, getMonthlyTotal, monthlyStats } from "./buyerWise.data";
import "./BuyerWise.scss";

const PAGE_SIZE = 10;

const BuyerWise = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildBuyerWiseColumns(), []);

  const totalPages = Math.max(1, Math.ceil(buyerRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = buyerRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handlePrint = () => window.print();

  return (
    <div className="buyer-wise">
      <div className="buyer-wise__header">
        <h2>Buyer Wise Report</h2>
        <button type="button" className="buyer-wise__print" onClick={handlePrint}>
          <PrinterIcon aria-hidden /> Print
        </button>
      </div>

      <div className="buyer-wise__stats">
        {monthlyStats.map((month) => (
          <div className="buyer-wise__stat" key={month.key}>
            <p className="buyer-wise__stat-label">{month.label}</p>
            <p className="buyer-wise__stat-value">{getMonthlyTotal(month.key)}</p>
          </div>
        ))}
      </div>

      <Table
        exportName="Buyer Wise Report"
        exportData={buyerRows}
        columnToggle
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No buyer data available."
        minHeight
        className="buyer-wise-table"
      />

      <div className="buyer-wise__pagination">
        <p>
          {buyerRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${buyerRows.length} Results`}
        </p>
        <div className="buyer-wise__pagination-controls">
          <button
            type="button"
            disabled={currentPageClamped === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            aria-label="Previous page"
          >
            <ChevronLeftIcon aria-hidden />
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
            <ChevronRightIcon aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerWise;
