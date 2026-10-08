import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiRotateCcw,
  FiSearch,
} from "react-icons/fi";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import { formatDisplayDate } from "../../../components/dropdown/Calendar";
import { sellerDispatchRows, type SellerDispatchRow } from "./sellerDispatch.data";
import "./Sellerdispatch.scss";

const PAGE_SIZE = 10;

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Default range: the 1st of this month last year through today. */
function defaultDateRange() {
  const today = new Date();
  return {
    from: toIso(new Date(today.getFullYear() - 1, today.getMonth(), 1)),
    to: toIso(today),
  };
}

const uniqueOptions = (values: string[], allLabel: string) => [
  { value: "All", label: allLabel },
  ...Array.from(new Set(values.filter(Boolean))).map((value) => ({ value, label: value })),
];

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TruncatedName = ({ value }: { value: string }) => (
  <span className="seller-dispatch-table__name">
    <span className="seller-dispatch-table__name-text">{value}</span>
    <InfoTooltip text={value} />
  </span>
);

const columns: TableColumn<SellerDispatchRow>[] = [
  {
    key: "contractNo",
    header: "Contract #",
    sortable: true,
    render: (row) => (
      <Link to={`/contracts/${row.contractId ?? row.contractNo}`} className="seller-dispatch-table__contract">
        {row.contractNo}
      </Link>
    ),
    exportValue: (row) => row.contractNo,
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    render: (row) => formatDisplayDate(row.date),
    exportValue: (row) => formatDisplayDate(row.date),
  },
  {
    key: "seller",
    header: "Seller",
    sortable: true,
    render: (row) => <TruncatedName value={row.seller} />,
    exportValue: (row) => row.seller,
  },
  {
    key: "buyer",
    header: "Buyer",
    sortable: true,
    render: (row) => <TruncatedName value={row.buyer} />,
    exportValue: (row) => row.buyer,
  },
  { key: "truckNumber", header: "Truck Number", sortable: true },
  { key: "product", header: "Product", sortable: true },
  {
    key: "qty",
    header: "Qty",
    sortable: true,
    render: (row) => (
      <span className="seller-dispatch-table__qty">
        {row.qty} {row.qtyUnit}
      </span>
    ),
    exportValue: (row) => `${row.qty} ${row.qtyUnit}`,
  },
  { key: "deliverySchedule", header: "Delivery Schedule", sortable: true },
  { key: "status", header: "Status", sortable: true },
];

const Sellerdispatch = () => {
  const rows = sellerDispatchRows;

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sellerFilter, setSellerFilter] = useState("All");
  const [buyerFilter, setBuyerFilter] = useState("All");
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [statusFilter, setStatusFilter] = useState("All");
  const [scheduleFilter, setScheduleFilter] = useState("All");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const sellerOptions = useMemo(() => uniqueOptions(rows.map((row) => row.seller), "All Sellers"), [rows]);
  const buyerOptions = useMemo(() => uniqueOptions(rows.map((row) => row.buyer), "All Buyers"), [rows]);
  const statusOptions = useMemo(() => uniqueOptions(rows.map((row) => row.status), "All Status"), [rows]);
  const scheduleOptions = useMemo(
    () => uniqueOptions(rows.map((row) => row.deliverySchedule), "All Schedules"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sellerFilter, buyerFilter, dateRange, statusFilter, scheduleFilter, keyword]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (sellerFilter !== "All" && row.seller !== sellerFilter) return false;
      if (buyerFilter !== "All" && row.buyer !== buyerFilter) return false;
      if (statusFilter !== "All" && row.status !== statusFilter) return false;
      if (scheduleFilter !== "All" && row.deliverySchedule !== scheduleFilter) return false;
      // ISO dates compare correctly as strings.
      if (dateRange.from && row.date < dateRange.from) return false;
      if (dateRange.to && row.date > dateRange.to) return false;
      if (q) {
        const haystack = [row.contractNo, row.seller, row.buyer, row.product].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, sellerFilter, buyerFilter, statusFilter, scheduleFilter, dateRange, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleResetFilters = () => {
    setSellerFilter("All");
    setBuyerFilter("All");
    setDateRange(defaultDateRange());
    setStatusFilter("All");
    setScheduleFilter("All");
    setKeyword("");
  };

  const handleExportToExcel = () => {
    const headerRow = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = columns
          .map((column) => {
            const value = column.exportValue
              ? column.exportValue(row)
              : String((row as unknown as Record<string, unknown>)[column.key] ?? "");
            return `<td>${escapeHtml(value)}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<meta charset="utf-8"><table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pending-seller-trucks-dispatch.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="seller-dispatch-page">
      <div className="seller-dispatch-card">
        <div className="seller-dispatch-card__header">
          <h1>Pending Seller Trucks Dispatch / Invoice</h1>
          <div className="seller-dispatch-card__actions">
            <button
              type="button"
              className={`seller-dispatch-btn seller-dispatch-btn--info ${filtersVisible ? "is-active" : ""}`}
              onClick={() => setFiltersVisible((prev) => !prev)}
              aria-expanded={filtersVisible}
              aria-controls="seller-dispatch-filters"
            >
              <FiFilter aria-hidden />
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              type="button"
              className="seller-dispatch-btn seller-dispatch-btn--warning"
              onClick={handleExportToExcel}
              disabled={filteredRows.length === 0}
            >
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div id="seller-dispatch-filters" className="seller-dispatch-filters">
            <SearchableSelect
              options={sellerOptions}
              value={sellerFilter}
              onChange={setSellerFilter}
              placeholder="All Sellers"
              ariaLabel="Filter by seller"
            />
            <SearchableSelect
              options={buyerOptions}
              value={buyerFilter}
              onChange={setBuyerFilter}
              placeholder="All Buyers"
              ariaLabel="Filter by buyer"
            />
            <DateRangeInput
              from={dateRange.from}
              to={dateRange.to}
              onChange={(from, to) => setDateRange({ from, to })}
              ariaLabel="Filter by date range"
            />
            <SearchableSelect
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
              ariaLabel="Filter by status"
            />
            <SearchableSelect
              options={scheduleOptions}
              value={scheduleFilter}
              onChange={setScheduleFilter}
              placeholder="All Schedules"
              ariaLabel="Filter by delivery schedule"
            />
            <div className="seller-dispatch-filters__search">
              <FiSearch aria-hidden />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search by Contract No, Seller, Buyer, Product Name"
                aria-label="Search seller trucks"
              />
            </div>
            <button type="button" className="seller-dispatch-filters__reset" onClick={handleResetFilters}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        )}

        {filteredRows.length === 0 ? (
          <div className="seller-dispatch-empty" role="status">
            <FiSearch aria-hidden className="seller-dispatch-empty__icon" />
            <h2>No Data Available</h2>
            <p>No seller trucks found based on your search. Try adjusting your search.</p>
            <button type="button" className="seller-dispatch-empty__clear" onClick={handleResetFilters}>
              <FiRotateCcw aria-hidden /> Clear Filters
            </button>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={pagedRows}
              rowKey={(row) => row.id}
              className="seller-dispatch-table"
            />

            <div className="seller-dispatch-pagination">
              <p>
                Showing {(currentPageClamped - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPageClamped * PAGE_SIZE, filteredRows.length)} of {filteredRows.length} Results
              </p>
              <div className="seller-dispatch-pagination__controls">
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
                    aria-current={page === currentPageClamped ? "page" : undefined}
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
        )}
      </div>
    </div>
  );
};

export default Sellerdispatch;
