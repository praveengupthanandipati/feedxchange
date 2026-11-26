import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import { buildContractSummaryColumns } from "./contractSummaryTab.columns";
import { contractSummaryRows } from "./contractSummaryTab.data";
import "./ContractSummaryTab.scss";

const PAGE_SIZE = 5;

interface ContractSummaryTabProps {
  filterValue: string;
  dateFrom: string;
  dateTo: string;
}

const ContractSummaryTab = ({ filterValue, dateFrom, dateTo }: ContractSummaryTabProps) => {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => buildContractSummaryColumns(), []);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return contractSummaryRows.filter((row) => {
      if (dateFrom && row.contractDtValue < new Date(dateFrom).getTime()) return false;
      if (dateTo && row.contractDtValue > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
      if (q && ![row.contractNumber, row.seller, row.buyer, row.commodity].join(" ").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [keyword, filterValue, dateFrom, dateTo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, filterValue, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  return (
    <div className="contract-summary-tab">
      <div className="contract-summary-tab__search">
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={`${contractSummaryRows.length} records...`}
        />
      </div>

      <Table
        exportName="Contract Summary"
        exportData={filteredRows}
        columnToggle
        columns={columns}
        data={pagedRows}
        rowKey={(row) => row.id}
        emptyMessage="No contracts match the current filters."
        minHeight
        className="contract-summary-tab-table"
      />

      <div className="contract-summary-tab__pagination">
        <p>
          {filteredRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${pagedRows.length} of ${filteredRows.length} Results`}
        </p>
        <div className="contract-summary-tab__pagination-controls">
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

export default ContractSummaryTab;
