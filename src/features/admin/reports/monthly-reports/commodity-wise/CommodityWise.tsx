import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PrinterIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import { buildCommodityWiseColumns } from "./commodityWise.columns";
import { commodityRows, getMonthlyTotal, monthlyStats } from "./commodityWise.data";
import "./CommodityWise.scss";

const PAGE_SIZE = 10;

const CommodityWise = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildCommodityWiseColumns(), []);

  const totalPages = Math.max(1, Math.ceil(commodityRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = commodityRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handlePrint = () => window.print();

  return (
    <div className="commodity-wise">
      <div className="commodity-wise__header">
        <h2>Commodity Wise Report</h2>
        <button type="button" className="commodity-wise__print" onClick={handlePrint}>
          <PrinterIcon aria-hidden /> Print
        </button>
      </div>

      <div className="commodity-wise__stats">
        {monthlyStats.map((month) => (
          <div className="commodity-wise__stat" key={month.key}>
            <p className="commodity-wise__stat-label">{month.label}</p>
            <p className="commodity-wise__stat-value">{getMonthlyTotal(month.key)}</p>
          </div>
        ))}
      </div>

      <Table
        exportName="Commodity Wise Report"
        exportData={commodityRows}
        columnToggle
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No commodity data available."
        minHeight
        className="commodity-wise-table"
      />

      <div className="commodity-wise__pagination">
        <p>
          {commodityRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${commodityRows.length} Results`}
        </p>
        <div className="commodity-wise__pagination-controls">
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

export default CommodityWise;
