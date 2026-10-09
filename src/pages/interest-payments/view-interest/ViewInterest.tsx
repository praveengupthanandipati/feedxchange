import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiPrinter,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import { formatDisplayDate } from "../../../components/dropdown/Calendar";
import DatePickerInput from "../../../components/dropdown/DatePickerInput";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import RowActionsMenu from "../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../components/table/table.types";
import {
  deleteInterestRecord,
  formatInr,
  getInterestRecords,
  interestDays,
  updateInterestRecord,
  type InterestRecord,
  type InterestUpdate,
} from "../interest.data";
import "../Interest.scss";
import "./ViewInterest.scss";

const PAGE_SIZE = 10;

interface Filters {
  seller: string;
  buyer: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { seller: "", buyer: "", from: "", to: "" };

const uniqueOptions = (values: string[]) => Array.from(new Set(values)).map((value) => ({ value, label: value }));

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function printRecord(record: InterestRecord) {
  const line = (label: string, value: string) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Interest ${escapeHtml(record.id)}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1d24}h1{font-size:18px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px 10px;text-align:left;font-size:13px}th{width:35%;background:#f2f4f6}</style>
</head><body><h1>Interest of Payment – ${escapeHtml(record.id)}</h1><table>
${line("Seller", record.seller)}${line("Buyer", record.buyer)}${line("Date of Entry", formatDisplayDate(record.createdOn))}
${line("Period", `${formatDisplayDate(record.fromDate)} to ${formatDisplayDate(record.toDate)} (${interestDays(record.fromDate, record.toDate)} days)`)}
${line("Contract / Invoice", `${record.contractNo} / ${record.invoiceNo}`)}${line("Percentage", `${record.ratePercent}% p.a.`)}
${line("Interest Amount", formatInr(record.interestAmount))}${line("Status", record.status)}${line("Remarks", record.remarks || "—")}
</table></body></html>`;
  // A same-origin blob page prints in every browser without the deprecated document.write.
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const win = window.open(url, "_blank", "width=800,height=600");
  if (!win) {
    URL.revokeObjectURL(url);
    return;
  }
  win.addEventListener("load", () => {
    win.focus();
    win.print();
  });
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ---------- Edit popup ----------

interface EditModalProps {
  record: InterestRecord;
  onSave: (changes: InterestUpdate) => void;
  onClose: () => void;
}

const EditInterestModal = ({ record, onSave, onClose }: EditModalProps) => {
  const [form, setForm] = useState({
    fromDate: record.fromDate,
    toDate: record.toDate,
    ratePercent: String(record.ratePercent),
    interestAmount: String(record.interestAmount),
    remarks: record.remarks,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fromDate || !form.toDate) return setError("Select the From and To dates.");
    if (form.toDate < form.fromDate) return setError("To Date cannot be before From Date.");
    if (!(Number(form.ratePercent) > 0)) return setError("Percentage must be greater than 0.");
    if (!(Number(form.interestAmount) >= 0) || form.interestAmount === "") return setError("Enter a valid Interest Amount.");
    onSave({
      fromDate: form.fromDate,
      toDate: form.toDate,
      ratePercent: Number(form.ratePercent),
      interestAmount: Math.round(Number(form.interestAmount)),
      remarks: form.remarks.trim(),
    });
  };

  return createPortal(
    <div className="view-interest-modal" role="presentation" onClick={onClose}>
      <form
        className="view-interest-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-interest-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <header>
          <h2 id="edit-interest-title">Edit {record.id}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </header>
        <p className="view-interest-modal__parties">
          {record.seller} → {record.buyer}
        </p>
        <div className="view-interest-modal__grid">
          <div className="view-interest-modal__field">
            <label htmlFor="edit-from">From Date</label>
            <DatePickerInput id="edit-from" value={form.fromDate} onChange={(fromDate) => setForm({ ...form, fromDate })} ariaLabel="From Date" />
          </div>
          <div className="view-interest-modal__field">
            <label htmlFor="edit-to">To Date</label>
            <DatePickerInput id="edit-to" value={form.toDate} onChange={(toDate) => setForm({ ...form, toDate })} min={form.fromDate || undefined} ariaLabel="To Date" />
          </div>
          <div className="view-interest-modal__field">
            <label htmlFor="edit-rate">Percentage (%)</label>
            <input id="edit-rate" type="number" min={0} step="any" inputMode="decimal" value={form.ratePercent} onChange={(event) => setForm({ ...form, ratePercent: event.target.value })} />
          </div>
          <div className="view-interest-modal__field">
            <label htmlFor="edit-amount">Interest Amount (₹)</label>
            <input id="edit-amount" type="number" min={0} inputMode="numeric" value={form.interestAmount} onChange={(event) => setForm({ ...form, interestAmount: event.target.value })} />
          </div>
          <div className="view-interest-modal__field view-interest-modal__field--wide">
            <label htmlFor="edit-remarks">Remarks</label>
            <textarea id="edit-remarks" rows={2} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
          </div>
        </div>
        {error && (
          <p className="view-interest-modal__error" role="alert">
            {error}
          </p>
        )}
        <div className="view-interest-modal__actions">
          <button type="button" className="interest-btn interest-btn--ghost" onClick={onClose}>
            <FiX aria-hidden /> Cancel
          </button>
          <button type="submit" className="interest-btn interest-btn--primary">
            <FiSave aria-hidden /> Save
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

// ---------- Page ----------

const ViewInterest = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<InterestRecord[]>(getInterestRecords);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<InterestRecord | null>(null);
  const [deleting, setDeleting] = useState<InterestRecord | null>(null);
  const [message, setMessage] = useState("");

  const sellerOptions = useMemo(() => uniqueOptions(records.map((record) => record.seller)), [records]);
  const buyerOptions = useMemo(() => uniqueOptions(records.map((record) => record.buyer)), [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((record) => {
      if (applied.seller && record.seller !== applied.seller) return false;
      if (applied.buyer && record.buyer !== applied.buyer) return false;
      if (applied.from && record.createdOn < applied.from) return false;
      if (applied.to && record.createdOn > applied.to) return false;
      if (q && ![record.id, record.seller, record.buyer, record.contractNo, record.invoiceNo, `${record.ratePercent}%`].join(" ").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [records, applied, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE).map((record, index) => ({ ...record, sNo: start + index + 1 }));
  const totalInterest = filtered.reduce((sum, record) => sum + record.interestAmount, 0);

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setSearch("");
    setPage(1);
  };

  const viewDetail = (record: InterestRecord) => navigate(`/interest-payments/detail?id=${encodeURIComponent(record.id)}`);

  const actionButtons = (record: InterestRecord) => (
    <div className="view-interest__actions">
      <button type="button" className="view-interest__icon-btn view-interest__icon-btn--view" onClick={() => viewDetail(record)} aria-label={`View ${record.id}`} title="View">
        <FiEye aria-hidden />
      </button>
      <button type="button" className="view-interest__icon-btn view-interest__icon-btn--print" onClick={() => printRecord(record)} aria-label={`Print ${record.id}`} title="Print">
        <FiPrinter aria-hidden />
      </button>
      <button type="button" className="view-interest__icon-btn view-interest__icon-btn--edit" onClick={() => setEditing(record)} aria-label={`Edit ${record.id}`} title="Edit">
        <FiEdit2 aria-hidden />
      </button>
      <button type="button" className="view-interest__icon-btn view-interest__icon-btn--delete" onClick={() => setDeleting(record)} aria-label={`Delete ${record.id}`} title="Delete">
        <FiTrash2 aria-hidden />
      </button>
    </div>
  );

  type Row = InterestRecord & { sNo: number };
  const columns: TableColumn<Row>[] = [
    { key: "sNo", header: "S.No", sortable: true },
    {
      key: "menu",
      header: "Actions",
      width: "6rem",
      align: "center",
      render: (row) => (
        <RowActionsMenu
          menuAlign="left"
          actions={[
            { key: "view", label: "View", icon: FiEye, onClick: () => viewDetail(row) },
            { key: "print", label: "Print", icon: FiPrinter, onClick: () => printRecord(row) },
            { key: "edit", label: "Edit", icon: FiEdit2, onClick: () => setEditing(row) },
            { key: "delete", label: "Delete", icon: FiTrash2, onClick: () => setDeleting(row), danger: true, dividerBefore: true },
          ]}
        />
      ),
    },
    { key: "createdOn", header: "Date of Entry", sortable: true, render: (row) => formatDisplayDate(row.createdOn) },
    { key: "id", header: "Interest No", sortable: true },
    { key: "fromDate", header: "From Date", sortable: true, render: (row) => formatDisplayDate(row.fromDate) },
    { key: "toDate", header: "To Date", sortable: true, render: (row) => formatDisplayDate(row.toDate) },
    { key: "ratePercent", header: "Percentage (%)", sortable: true, render: (row) => `${row.ratePercent}%` },
    { key: "interestAmount", header: "Interest Amount", sortable: true, render: (row) => formatInr(row.interestAmount) },
  ];

  return (
    <div className="interest-page view-interest">
      <div className="interest-page__header">
        <h1>View Interest of Payments</h1>
        <button
          type="button"
          className="interest-btn interest-btn--info"
          onClick={() => setFiltersVisible((prev) => !prev)}
          aria-expanded={filtersVisible}
          aria-controls="view-interest-filters"
        >
          {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
          {filtersVisible ? "Hide" : "Show"}
        </button>
      </div>

      {filtersVisible && (
        <div id="view-interest-filters" className="view-interest__filters">
          <SearchableSelect options={sellerOptions} value={draft.seller} onChange={(seller) => setDraft({ ...draft, seller })} placeholder="Select Seller" ariaLabel="Select Seller" clearable />
          <SearchableSelect options={buyerOptions} value={draft.buyer} onChange={(buyer) => setDraft({ ...draft, buyer })} placeholder="Select Buyer" ariaLabel="Select Buyer" clearable />
          <DateRangeInput from={draft.from} to={draft.to} onChange={(from, to) => setDraft({ ...draft, from, to })} placeholder="Select Date Range" ariaLabel="Date of entry range" />
          <div className="view-interest__filter-actions">
            <button type="button" className="interest-btn interest-btn--primary" onClick={applyFilters}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="interest-btn interest-btn--danger" onClick={resetFilters}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        </div>
      )}

      <div className="view-interest__parties">
        <span>Seller: <strong>{applied.seller || "All Sellers"}</strong></span>
        <span>Buyer: <strong>{applied.buyer || "All Buyers"}</strong></span>
        <span className="view-interest__parties-total">Total Interest: <strong>{formatInr(totalInterest)}</strong></span>
      </div>

      <div className="view-interest__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={`Search ${filtered.length} records...`}
          aria-label="Search interest records"
        />
      </div>

      {message && (
        <p className="view-interest__message" role="status">
          <FiCheck aria-hidden /> {message}
        </p>
      )}

      <div className="interest-table-view">
        <Table
          columns={columns}
          data={paged}
          rowKey={(row) => row.id}
          className="view-interest__table"
          emptyMessage="No interest records match the current filters."
        />
      </div>

      <ul className="interest-cards">
        {paged.length === 0 && (
          <li className="interest-cards__empty">
            <FiAlertCircle aria-hidden /> No interest records match the current filters.
          </li>
        )}
        {paged.map((row) => (
          <li key={row.id} className="interest-card">
            <div className="interest-card__top">
              <strong className="view-interest__card-title">{row.sNo}. {row.id}</strong>
              <span className="view-interest__card-amount">{formatInr(row.interestAmount)}</span>
            </div>
            <dl>
              <div className="interest-card__full"><dt>Seller → Buyer</dt><dd>{row.seller} → {row.buyer}</dd></div>
              <div><dt>Date of Entry</dt><dd>{formatDisplayDate(row.createdOn)}</dd></div>
              <div><dt>Percentage</dt><dd>{row.ratePercent}%</dd></div>
              <div><dt>From Date</dt><dd>{formatDisplayDate(row.fromDate)}</dd></div>
              <div><dt>To Date</dt><dd>{formatDisplayDate(row.toDate)}</dd></div>
            </dl>
            <div className="view-interest__card-actions">{actionButtons(row)}</div>
          </li>
        ))}
      </ul>

      <div className="interest-pagination">
        <p>
          {filtered.length === 0
            ? "Showing 0 Results"
            : `Showing ${start + 1}-${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} Results`}
        </p>
        <div className="interest-pagination__pages">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
            <FiChevronLeft aria-hidden />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              type="button"
              className={number === currentPage ? "is-active" : ""}
              onClick={() => setPage(number)}
              aria-current={number === currentPage ? "page" : undefined}
            >
              {number}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
            <FiChevronRight aria-hidden />
          </button>
        </div>
      </div>

      {editing && (
        <EditInterestModal
          record={editing}
          onClose={() => setEditing(null)}
          onSave={(changes) => {
            // TODO: send the update to the API once the endpoint is available.
            updateInterestRecord(editing.id, changes);
            setRecords(getInterestRecords());
            setMessage(`${editing.id} updated.`);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete interest"
        message={deleting ? `Delete ${deleting.id} (${formatInr(deleting.interestAmount)})? This cannot be undone.` : ""}
        onConfirm={() => {
          if (deleting) {
            // TODO: delete through the API once the endpoint is available.
            deleteInterestRecord(deleting.id);
            setRecords(getInterestRecords());
            setMessage(`${deleting.id} deleted.`);
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default ViewInterest;
