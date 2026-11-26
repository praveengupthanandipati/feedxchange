import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PrinterIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import { buildSellerWiseColumns } from "./sellerWise.columns";
import { getMonthlyTotal, monthlyStats, sellerRows } from "./sellerWise.data";
import "./SellerWise.scss";

const PAGE_SIZE = 10;

const SellerWise = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildSellerWiseColumns(), []);

  const totalPages = Math.max(1, Math.ceil(sellerRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = sellerRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handlePrint = () => window.print();

  return (
    <div className="seller-wise">
      <div className="seller-wise__header">
        <h2>Seller Wise Report</h2>
        <button type="button" className="seller-wise__print" onClick={handlePrint}>
          <PrinterIcon aria-hidden /> Print
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
        exportName="Seller Wise Report"
        exportData={sellerRows}
        columnToggle
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

export default SellerWise;
