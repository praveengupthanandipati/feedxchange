import { useEffect, useMemo, useState } from "react";
import DatePickerInput from "../../../../shared/components/dropdown/DatePickerInput";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, EyeOffIcon, XIcon } from "../../../../shared/components/icon";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import Table from "../../../../shared/components/table/Table";
import { buildSellerInvoiceColumns } from "./sellerInvoiceReports.columns";
import {
  sellerInvoiceRows,
  sellerOptions,
  buyerOptions,
  financialYearOptions,
  contractOptions,
  reportPartySummary,
} from "./sellerInvoiceReports.data";
import "./SellerInvoiceReports.scss";

const PAGE_SIZE = 10;



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
              {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
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
                <DatePickerInput
                  value={dateFrom}
                  onChange={(value) => setDateFrom(value)}
                  ariaLabel="Invoice date range from"
                  clearable
                />
                <span>to</span>
                <DatePickerInput
                  value={dateTo}
                  onChange={(value) => setDateTo(value)}
                  ariaLabel="Invoice date range to"
                  clearable
                />
              </div>
            </div>

            <div className="seller-invoice-report-filters__clear-row">
              <button
                type="button"
                className="seller-invoice-report-filters__clear"
                onClick={handleClearFilters}
              >
                <XIcon aria-hidden /> Clear
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
          exportName="Seller Invoice Report"
          exportData={filteredRows}
          columnToggle
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
    </div>
  );
};

export default SellerInvoiceReports;
