import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import DateRangeInput from "../../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import { sellerDispatchRows, type SellerDispatchRow } from "./sellerDispatches.data";
import "./SellerDispatches.scss";

const PAGE_SIZE = 10;

interface Filters {
  seller: string;
  buyer: string;
  status: string;
  from: string;
  to: string;
  search: string;
}

const EMPTY_FILTERS: Filters = { seller: "All", buyer: "All", status: "All", from: "", to: "", search: "" };

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const dateOrDash = (iso: string) => (iso ? formatDisplayDate(iso) : "--");
const slug = (value: string) => value.toLowerCase().replace(/[^a-z]+/g, "-");

const options = (values: string[], allLabel: string) => [
  { value: "All", label: allLabel },
  ...Array.from(new Set(values)).map((value) => ({ value, label: value })),
];

const Badge = ({ value }: { value: string }) => (
  <span className={`seller-dispatches__badge seller-dispatches__badge--${slug(value)}`}>{value}</span>
);

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const SellerDispatches = () => {
  const rows = sellerDispatchRows;

  const [filtersVisible, setFiltersVisible] = useState(false);
  // Filter edits stay in `draft` until Apply copies them into `applied`.
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const updateDraft = (patch: Partial<Filters>) => setDraft((prev) => ({ ...prev, ...patch }));

  const sellerOptions = useMemo(() => options(rows.map((row) => row.seller), "All Sellers"), [rows]);
  const buyerOptions = useMemo(() => options(rows.map((row) => row.buyer), "All Buyers"), [rows]);
  const statusOptions = useMemo(() => options(rows.map((row) => row.status), "All Status"), [rows]);

  const filteredRows = useMemo(() => {
    const q = applied.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (applied.seller !== "All" && row.seller !== applied.seller) return false;
      if (applied.buyer !== "All" && row.buyer !== applied.buyer) return false;
      if (applied.status !== "All" && row.status !== applied.status) return false;
      if (applied.from && row.doDate < applied.from) return false;
      if (applied.to && row.doDate > applied.to) return false;
      if (q && !Object.values(row).join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, applied]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApply = () => {
    setApplied(draft);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  const updateButton = (row: SellerDispatchRow) => (
    <Link
      to={`/truck-management/seller-dispatches-new/update/${encodeURIComponent(row.contractNo)}`}
      className="seller-dispatches__update-btn"
      aria-label={`Update dispatch for ${row.contractNo}`}
    >
      <FiEdit2 aria-hidden /> Update
    </Link>
  );

  const columns: TableColumn<SellerDispatchRow>[] = [
    {
      key: "contractNo",
      header: "Contract #",
      sortable: true,
      render: (row) => <strong className="seller-dispatches__contract">{row.contractNo}</strong>,
      exportValue: (row) => row.contractNo,
    },
    { key: "dispatch", header: "Dispatch", render: updateButton },
    { key: "seller", header: "Seller", sortable: true },
    { key: "buyer", header: "Buyer", sortable: true },
    { key: "truckNo", header: "Truck No", sortable: true },
    { key: "doNo", header: "DO No", sortable: true },
    { key: "doDate", header: "DO Dt", sortable: true, render: (row) => dateOrDash(row.doDate), exportValue: (row) => dateOrDash(row.doDate) },
    { key: "invNo", header: "Inv. No", sortable: true, render: (row) => row.invNo || "--", exportValue: (row) => row.invNo || "--" },
    { key: "invDate", header: "Inv. Dt", sortable: true, render: (row) => dateOrDash(row.invDate), exportValue: (row) => dateOrDash(row.invDate) },
    { key: "product", header: "Product", sortable: true },
    { key: "contractRate", header: "Contract Rate", sortable: true, render: (row) => rupees(row.contractRate), exportValue: (row) => rupees(row.contractRate) },
    { key: "qty", header: "Qty", sortable: true, render: (row) => `${row.qty} MT`, exportValue: (row) => `${row.qty} MT` },
    { key: "freight", header: "Freight", sortable: true, render: (row) => rupees(row.freight), exportValue: (row) => rupees(row.freight) },
    { key: "deliveryType", header: "Delivery Type", sortable: true, render: (row) => <Badge value={row.deliveryType} />, exportValue: (row) => row.deliveryType },
    { key: "status", header: "Status", sortable: true, render: (row) => <Badge value={row.status} />, exportValue: (row) => row.status },
  ];

  const handleExport = () => {
    const exportColumns = columns.filter((column) => column.key !== "dispatch");
    const head = exportColumns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const body = filteredRows
      .map((row) => {
        const cells = exportColumns.map((column) => {
          const value = column.exportValue
            ? column.exportValue(row)
            : String((row as unknown as Record<string, unknown>)[column.key] ?? "");
          return `<td>${escapeHtml(value)}</td>`;
        });
        return `<tr>${cells.join("")}</tr>`;
      })
      .join("");

    const html = `<meta charset="utf-8"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "seller-dispatches.xls";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="seller-dispatches">
      <div className="seller-dispatches__header">
        <h1>Seller Dispatches</h1>
        <div className="seller-dispatches__actions">
          <button
            type="button"
            className="seller-dispatches__btn seller-dispatches__btn--info"
            onClick={() => setFiltersVisible((prev) => !prev)}
            aria-expanded={filtersVisible}
            aria-controls="seller-dispatches-filters"
          >
            {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {filtersVisible ? "Hide" : "Show"}
          </button>
          <button type="button" className="seller-dispatches__btn seller-dispatches__btn--warning" onClick={handleExport}>
            <FiDownload aria-hidden /> Export
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div id="seller-dispatches-filters" className="seller-dispatches__filters">
          <SearchableSelect
            options={sellerOptions}
            value={draft.seller}
            onChange={(seller) => updateDraft({ seller })}
            placeholder="Select Seller"
            ariaLabel="Select Seller"
          />
          <SearchableSelect
            options={buyerOptions}
            value={draft.buyer}
            onChange={(buyer) => updateDraft({ buyer })}
            placeholder="Select Buyer"
            ariaLabel="Select Buyer"
          />
          <SearchableSelect
            options={statusOptions}
            value={draft.status}
            onChange={(status) => updateDraft({ status })}
            placeholder="Filter by Status"
            ariaLabel="Filter by Status"
          />
          <DateRangeInput
            from={draft.from}
            to={draft.to}
            onChange={(from, to) => updateDraft({ from, to })}
            placeholder="Select Date Range"
            ariaLabel="DO date range"
          />
          <div className="seller-dispatches__search">
            <FiSearch aria-hidden />
            <input
              type="text"
              placeholder="Global Search..."
              aria-label="Global search"
              value={draft.search}
              onChange={(event) => updateDraft({ search: event.target.value })}
              onKeyDown={(event) => event.key === "Enter" && handleApply()}
            />
          </div>
          <div className="seller-dispatches__filter-actions">
            <button type="button" className="seller-dispatches__btn seller-dispatches__btn--navy" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="seller-dispatches__btn seller-dispatches__btn--warning" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        </div>
      )}

      <div className="seller-dispatches__table-view">
        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.contractNo}
          emptyMessage="No seller dispatches match the current filters."
        />
      </div>

      <ul className="seller-dispatches__cards">
        {pagedRows.length === 0 && (
          <li className="seller-dispatches__cards-empty">
            <FiAlertCircle aria-hidden /> No seller dispatches match the current filters.
          </li>
        )}
        {pagedRows.map((row) => (
          <li key={row.contractNo} className="seller-dispatches__card">
            <div className="seller-dispatches__card-top">
              <strong className="seller-dispatches__contract">{row.contractNo}</strong>
              <Badge value={row.status} />
            </div>
            <dl>
              <div className="seller-dispatches__full"><dt>Seller</dt><dd>{row.seller}</dd></div>
              <div className="seller-dispatches__full"><dt>Buyer</dt><dd>{row.buyer}</dd></div>
              <div><dt>Truck No</dt><dd>{row.truckNo}</dd></div>
              <div><dt>Product</dt><dd>{row.product}</dd></div>
              <div><dt>DO No / Dt</dt><dd>{row.doNo}, {dateOrDash(row.doDate)}</dd></div>
              <div><dt>Inv. No / Dt</dt><dd>{row.invNo ? `${row.invNo}, ${dateOrDash(row.invDate)}` : "--"}</dd></div>
              <div><dt>Contract Rate</dt><dd>{rupees(row.contractRate)}</dd></div>
              <div><dt>Qty</dt><dd>{row.qty} MT</dd></div>
              <div><dt>Freight</dt><dd>{rupees(row.freight)}</dd></div>
              <div><dt>Delivery Type</dt><dd><Badge value={row.deliveryType} /></dd></div>
            </dl>
            <div className="seller-dispatches__card-action">{updateButton(row)}</div>
          </li>
        ))}
      </ul>

      <div className="seller-dispatches__pagination">
        <p>
          {filteredRows.length === 0
            ? "Showing 0 Results"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, filteredRows.length)} of ${filteredRows.length} Results`}
        </p>
        <div className="seller-dispatches__pages">
          <button type="button" disabled={page === 1} onClick={() => setCurrentPage(page - 1)} aria-label="Previous page">
            <FiChevronLeft aria-hidden />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              type="button"
              className={number === page ? "is-active" : ""}
              onClick={() => setCurrentPage(number)}
              aria-current={number === page ? "page" : undefined}
            >
              {number}
            </button>
          ))}
          <button type="button" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)} aria-label="Next page">
            <FiChevronRight aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDispatches;
