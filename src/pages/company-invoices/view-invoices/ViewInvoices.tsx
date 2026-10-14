import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiDownload,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiSave,
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
import { buildInvoicePdf, downloadBlob } from "../../truck-management/seller-dispatches-new/update-seller-dispatch/invoicePdf";
import { companyInvoices, invoiceNetAmount, invoiceQty, type CompanyInvoice } from "../companyInvoice.data";
import "./ViewInvoices.scss";

const PAGE_SIZE = 10;

interface Filters {
  company: string;
  /** One of PARTY_TYPES. */
  partyType: string;
  /** The area / collection area / group / city picked for the grouping party types. */
  partyValue: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { company: "", partyType: "", partyValue: "", from: "", to: "" };

type GroupField = "area" | "collectionArea" | "group" | "city";

/** "Select Party" choices. The grouping ones open a second dropdown listing that field's values. */
const PARTY_TYPES: { value: string; label: string; field?: GroupField; pickLabel?: string }[] = [
  { value: "Seller", label: "Seller" },
  { value: "Buyer", label: "Buyer" },
  { value: "Both", label: "Both" },
  { value: "Area wise", label: "Area wise", field: "area", pickLabel: "Select Area" },
  { value: "Collection Area wise", label: "Collection Area wise", field: "collectionArea", pickLabel: "Select Collection Area" },
  { value: "Group", label: "Group", field: "group", pickLabel: "Select Group" },
  { value: "City", label: "City", field: "city", pickLabel: "Select City" },
];

const partyTypeFor = (value: string) => PARTY_TYPES.find((type) => type.value === value);

function matchesParty(invoice: CompanyInvoice, filters: Filters) {
  if (!filters.partyType || filters.partyType === "Both") return true;
  if (filters.partyType === "Seller" || filters.partyType === "Buyer") return invoice.partyRole === filters.partyType;
  const field = partyTypeFor(filters.partyType)?.field;
  return !field || !filters.partyValue || invoice[field] === filters.partyValue;
}

const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const options = (values: string[]) => Array.from(new Set(values)).map((value) => ({ value, label: value }));
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function downloadInvoice(invoice: CompanyInvoice) {
  const lines = [
    { label: "Invoice #", value: invoice.invoiceNo },
    { label: "Company Name", value: invoice.company },
    { label: "Party Name", value: invoice.partyName },
    { label: "Period", value: `${formatDisplayDate(invoice.fromDate)} to ${formatDisplayDate(invoice.toDate)}` },
    ...invoice.lines.map((line) => ({
      label: line.contractNo,
      value: `${line.commodity} · ${line.quantityMt} MT × ${formatInr(line.commissionPerMt)} = ${formatInr(line.quantityMt * line.commissionPerMt)}`,
    })),
    ...(invoice.difference ? [{ label: "Difference", value: formatInr(invoice.difference) }] : []),
    { label: "Total Qty", value: `${invoiceQty(invoice)} MT` },
    { label: "Net Amount", value: formatInr(invoiceNetAmount(invoice)) },
    ...(invoice.remarks ? [{ label: "Remarks", value: invoice.remarks }] : []),
  ];
  downloadBlob(buildInvoicePdf(`Company Invoice ${invoice.invoiceNo}`, lines), `${invoice.invoiceNo}.pdf`);
}

// ---------- Invoice lines (expanded row and View popup) ----------

const InvoiceLines = ({ invoice }: { invoice: CompanyInvoice }) => (
  <div className="invoice-lines">
    <div className="invoice-lines__header">
      <span className="invoice-lines__title">Contracts on {invoice.invoiceNo}</span>
      <span className="invoice-lines__meta">
        {invoice.lines.length} contract{invoice.lines.length === 1 ? "" : "s"} · <strong>{formatInr(invoiceNetAmount(invoice))}</strong>
      </span>
    </div>
    <div className="invoice-lines__scroll">
      <table className="invoice-lines__table">
        <thead>
          <tr>
            <th scope="col">Contract No</th>
            <th scope="col">Contract Dt</th>
            <th scope="col">Commodity</th>
            <th scope="col" className="is-num">Qty (MT)</th>
            <th scope="col" className="is-num">Commission / MT</th>
            <th scope="col" className="is-num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.contractNo}>
              <td>{line.contractNo}</td>
              <td>{formatDisplayDate(line.contractDate)}</td>
              <td>{line.commodity}</td>
              <td className="is-num">{line.quantityMt}</td>
              <td className="is-num">{formatInr(line.commissionPerMt)}</td>
              <td className="is-num">{formatInr(line.quantityMt * line.commissionPerMt)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {invoice.difference !== 0 && (
            <tr>
              <td colSpan={5}>Difference</td>
              <td className="is-num">{formatInr(invoice.difference)}</td>
            </tr>
          )}
          <tr>
            <td colSpan={3}>Net Amount</td>
            <td className="is-num">{invoiceQty(invoice)}</td>
            <td />
            <td className="is-num">{formatInr(invoiceNetAmount(invoice))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

// ---------- Popups ----------

const useEscape = (onClose: () => void) =>
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

const ViewInvoiceModal = ({ invoice, onClose }: { invoice: CompanyInvoice; onClose: () => void }) => {
  useEscape(onClose);
  return createPortal(
    <div className="invoices-modal" role="presentation" onClick={onClose}>
      <div className="invoices-modal__dialog invoices-modal__dialog--wide" role="dialog" aria-modal="true" aria-labelledby="view-invoice-title" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2 id="view-invoice-title">{invoice.invoiceNo}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </header>
        <dl className="invoices-modal__facts">
          <div><dt>Company Name</dt><dd>{invoice.company}</dd></div>
          <div><dt>Party Name</dt><dd>{invoice.partyName}</dd></div>
          <div><dt>Period</dt><dd>{formatDisplayDate(invoice.fromDate)} – {formatDisplayDate(invoice.toDate)}</dd></div>
          <div><dt>Remarks</dt><dd>{invoice.remarks || "—"}</dd></div>
        </dl>
        <InvoiceLines invoice={invoice} />
      </div>
    </div>,
    document.body,
  );
};

type InvoiceEdit = Pick<CompanyInvoice, "fromDate" | "toDate" | "difference" | "remarks">;

const EditInvoiceModal = ({ invoice, onSave, onClose }: { invoice: CompanyInvoice; onSave: (changes: InvoiceEdit) => void; onClose: () => void }) => {
  useEscape(onClose);
  const [form, setForm] = useState({ fromDate: invoice.fromDate, toDate: invoice.toDate, difference: String(invoice.difference), remarks: invoice.remarks });
  const [error, setError] = useState("");

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fromDate || !form.toDate) return setError("Select the From and To dates.");
    if (form.toDate < form.fromDate) return setError("To Date cannot be before From Date.");
    if (form.difference !== "" && Number.isNaN(Number(form.difference))) return setError("Difference must be a number.");
    onSave({ fromDate: form.fromDate, toDate: form.toDate, difference: Number(form.difference) || 0, remarks: form.remarks.trim() });
  };

  const preview = invoiceNetAmount({ ...invoice, difference: Number(form.difference) || 0 });

  return createPortal(
    <div className="invoices-modal" role="presentation" onClick={onClose}>
      <form className="invoices-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="edit-invoice-title" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit} noValidate>
        <header>
          <h2 id="edit-invoice-title">Edit {invoice.invoiceNo}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </header>
        <p className="invoices-modal__sub">{invoice.company} · {invoice.partyName}</p>
        <div className="invoices-modal__grid">
          <div className="invoices-modal__field">
            <label htmlFor="edit-invoice-from">From Date</label>
            <DatePickerInput id="edit-invoice-from" value={form.fromDate} onChange={(fromDate) => setForm({ ...form, fromDate })} ariaLabel="From Date" />
          </div>
          <div className="invoices-modal__field">
            <label htmlFor="edit-invoice-to">To Date</label>
            <DatePickerInput id="edit-invoice-to" value={form.toDate} onChange={(toDate) => setForm({ ...form, toDate })} min={form.fromDate || undefined} ariaLabel="To Date" />
          </div>
          <div className="invoices-modal__field">
            <label htmlFor="edit-invoice-diff">Difference (₹)</label>
            <input id="edit-invoice-diff" type="number" inputMode="decimal" value={form.difference} onChange={(event) => setForm({ ...form, difference: event.target.value })} />
          </div>
          <div className="invoices-modal__field">
            <label htmlFor="edit-invoice-net">Net Amount</label>
            <input id="edit-invoice-net" type="text" value={formatInr(preview)} readOnly className="is-readonly" />
          </div>
          <div className="invoices-modal__field invoices-modal__field--wide">
            <label htmlFor="edit-invoice-remarks">Remarks</label>
            <textarea id="edit-invoice-remarks" rows={2} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
          </div>
        </div>
        {error && <p className="invoices-modal__error" role="alert">{error}</p>}
        <div className="invoices-modal__actions">
          <button type="button" className="view-invoices__btn view-invoices__btn--ghost" onClick={onClose}>
            <FiX aria-hidden /> Cancel
          </button>
          <button type="submit" className="view-invoices__btn view-invoices__btn--navy">
            <FiSave aria-hidden /> Update
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

// ---------- Page ----------

const ViewInvoices = () => {
  // Edits and deletes stay pending in `invoices` until Save; Cancel goes back to `saved`.
  const [saved, setSaved] = useState<CompanyInvoice[]>(companyInvoices);
  const [invoices, setInvoices] = useState<CompanyInvoice[]>(companyInvoices);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [viewing, setViewing] = useState<CompanyInvoice | null>(null);
  const [editing, setEditing] = useState<CompanyInvoice | null>(null);
  const [deleting, setDeleting] = useState<CompanyInvoice | null>(null);
  const [message, setMessage] = useState("");

  const hasChanges = invoices !== saved;

  const companyOptions = useMemo(() => options(saved.map((invoice) => invoice.company)), [saved]);
  const draftGroupField = partyTypeFor(draft.partyType)?.field;
  const partyValueOptions = useMemo(
    () => (draftGroupField ? options(saved.map((invoice) => invoice[draftGroupField])).sort((a, b) => a.label.localeCompare(b.label)) : []),
    [saved, draftGroupField],
  );

  const filtered = useMemo(
    () =>
      invoices.filter((invoice) => {
        if (applied.company && invoice.company !== applied.company) return false;
        if (!matchesParty(invoice, applied)) return false;
        // Keep invoices whose period overlaps the chosen range.
        if (applied.from && invoice.toDate < applied.from) return false;
        if (applied.to && invoice.fromDate > applied.to) return false;
        return true;
      }),
    [invoices, applied],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE).map((invoice, index) => ({ ...invoice, sNo: start + index + 1 }));
  const allExpanded = paged.length > 0 && paged.every((invoice) => expandedKeys.includes(invoice.id));

  const toggleExpanded = (key: string) =>
    setExpandedKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

  const handleApply = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const handleExport = () => {
    const head = ["S.No", "Invoice #", "Company Name", "From Date", "To Date", "Party Name", "Qty", "Net Amount"];
    const body = filtered
      .map((invoice, index) =>
        [String(index + 1), invoice.invoiceNo, invoice.company, formatDisplayDate(invoice.fromDate), formatDisplayDate(invoice.toDate), invoice.partyName, String(invoiceQty(invoice)), formatInr(invoiceNetAmount(invoice))]
          .map((cell) => `<td>${escapeHtml(cell)}</td>`)
          .join(""),
      )
      .map((cells) => `<tr>${cells}</tr>`)
      .join("");
    const html = `<meta charset="utf-8"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
    downloadBlob(new Blob([html], { type: "application/vnd.ms-excel" }), "company-invoices.xls");
  };

  const handleSave = () => {
    // TODO: send the edits and deletions to the API once the endpoint is available.
    setSaved(invoices);
    setMessage("Changes saved.");
  };

  const handleCancel = () => {
    setInvoices(saved);
    setMessage(hasChanges ? "Unsaved changes discarded." : "");
  };

  const actionButtons = (invoice: CompanyInvoice) => (
    <div className="view-invoices__actions">
      <button type="button" className="view-invoices__icon-btn view-invoices__icon-btn--download" onClick={() => downloadInvoice(invoice)} aria-label={`Download ${invoice.invoiceNo}`} title="Download PDF">
        <FiDownload aria-hidden />
      </button>
      <button type="button" className="view-invoices__icon-btn view-invoices__icon-btn--view" onClick={() => setViewing(invoice)} aria-label={`View ${invoice.invoiceNo}`} title="View">
        <FiEye aria-hidden />
      </button>
      <button type="button" className="view-invoices__icon-btn view-invoices__icon-btn--edit" onClick={() => setEditing(invoice)} aria-label={`Edit ${invoice.invoiceNo}`} title="Edit">
        <FiEdit aria-hidden />
      </button>
      <button type="button" className="view-invoices__icon-btn view-invoices__icon-btn--delete" onClick={() => setDeleting(invoice)} aria-label={`Delete ${invoice.invoiceNo}`} title="Delete">
        <FiTrash2 aria-hidden />
      </button>
    </div>
  );

  type Row = CompanyInvoice & { sNo: number };
  const columns: TableColumn<Row>[] = [
    { key: "sNo", header: "S.No", sortable: true },
    {
      key: "actions",
      header: "Actions",
      width: "6rem",
      align: "center",
      render: (row) => (
        <RowActionsMenu
          menuAlign="left"
          actions={[
            { key: "download", label: "Download", icon: FiDownload, onClick: () => downloadInvoice(row) },
            { key: "view", label: "View", icon: FiEye, onClick: () => setViewing(row) },
            { key: "edit", label: "Edit", icon: FiEdit, onClick: () => setEditing(row) },
            { key: "delete", label: "Delete", icon: FiTrash2, onClick: () => setDeleting(row), danger: true, dividerBefore: true },
          ]}
        />
      ),
    },
    { key: "invoiceNo", header: "Invoice #", sortable: true },
    { key: "company", header: "Company Name", sortable: true, render: (row) => <span className="view-invoices__wrap">{row.company}</span> },
    { key: "fromDate", header: "From Date", sortable: true, render: (row) => formatDisplayDate(row.fromDate) },
    { key: "toDate", header: "To Date", sortable: true, render: (row) => formatDisplayDate(row.toDate) },
    { key: "partyName", header: "Party Name", sortable: true, render: (row) => <span className="view-invoices__wrap">{row.partyName}</span> },
    { key: "qty", header: "Qty", sortable: true, sortValue: invoiceQty, render: (row) => invoiceQty(row) },
    { key: "netAmount", header: "Net Amount", sortable: true, sortValue: invoiceNetAmount, render: (row) => <strong>{formatInr(invoiceNetAmount(row))}</strong> },
    {
      key: "expand",
      header: "",
      render: (row) => (
        <button
          type="button"
          className="view-invoices__expand"
          onClick={() => toggleExpanded(row.id)}
          aria-expanded={expandedKeys.includes(row.id)}
          aria-label={expandedKeys.includes(row.id) ? `Hide contracts on ${row.invoiceNo}` : `Show contracts on ${row.invoiceNo}`}
        >
          {expandedKeys.includes(row.id) ? <FiMinus aria-hidden /> : <FiPlus aria-hidden />}
        </button>
      ),
    },
  ];

  return (
    <div className="view-invoices">
      <div className="view-invoices__header">
        <h1>View Invoices</h1>
        <div className="view-invoices__header-actions">
          <button type="button" className="view-invoices__btn view-invoices__btn--info" onClick={() => setFiltersVisible((prev) => !prev)} aria-expanded={filtersVisible} aria-controls="view-invoices-filters">
            {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {filtersVisible ? "Hide" : "Show"}
          </button>
          <button type="button" className="view-invoices__btn view-invoices__btn--warning" onClick={handleExport} disabled={filtered.length === 0}>
            <FiDownload aria-hidden /> Export
          </button>
          <button type="button" className="view-invoices__btn view-invoices__btn--warning" onClick={() => setExpandedKeys(allExpanded ? [] : paged.map((invoice) => invoice.id))} disabled={paged.length === 0}>
            {allExpanded ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
            {allExpanded ? "Collapse All" : "Toggle All"}
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div id="view-invoices-filters" className="view-invoices__filters">
          <SearchableSelect options={companyOptions} value={draft.company} onChange={(company) => setDraft({ ...draft, company })} placeholder="Select Company" ariaLabel="Select Company" clearable />
          <DateRangeInput from={draft.from} to={draft.to} onChange={(from, to) => setDraft({ ...draft, from, to })} placeholder="Select Date Range" ariaLabel="Invoice period" />
          <SearchableSelect
            options={PARTY_TYPES}
            value={draft.partyType}
            onChange={(partyType) => setDraft({ ...draft, partyType, partyValue: "" })}
            placeholder="Select Party"
            ariaLabel="Select Party"
            clearable
          />
          {draftGroupField && (
            <SearchableSelect
              options={partyValueOptions}
              value={draft.partyValue}
              onChange={(partyValue) => setDraft({ ...draft, partyValue })}
              placeholder={partyTypeFor(draft.partyType)?.pickLabel}
              ariaLabel={partyTypeFor(draft.partyType)?.pickLabel}
              clearable
            />
          )}
          <div className="view-invoices__filter-actions">
            <button type="button" className="view-invoices__btn view-invoices__btn--navy" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="view-invoices__btn view-invoices__btn--danger" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        </div>
      )}

      {(message || hasChanges) && (
        <p className={`view-invoices__message ${hasChanges ? "is-pending" : ""}`} role="status">
          {hasChanges ? <FiAlertCircle aria-hidden /> : <FiCheckCircle aria-hidden />}
          {hasChanges ? "You have unsaved changes — Save to keep them or Cancel to discard." : message}
        </p>
      )}

      <div className="view-invoices__table-view">
        <Table
          columns={columns}
          data={paged}
          rowKey={(row) => row.id}
          expandedRowKeys={expandedKeys}
          renderExpandedRow={(row) => <InvoiceLines invoice={row} />}
          className="view-invoices__table"
          emptyMessage="No invoices match the current filters."
        />
      </div>

      <ul className="view-invoices__cards">
        {paged.length === 0 && <li className="view-invoices__cards-empty">No invoices match the current filters.</li>}
        {paged.map((invoice) => (
          <li key={invoice.id} className="view-invoices__card">
            <div className="view-invoices__card-top">
              <strong>{invoice.sNo}. {invoice.invoiceNo}</strong>
              <span>{formatInr(invoiceNetAmount(invoice))}</span>
            </div>
            <dl>
              <div className="view-invoices__card-full"><dt>Company Name</dt><dd>{invoice.company}</dd></div>
              <div className="view-invoices__card-full"><dt>Party Name</dt><dd>{invoice.partyName}</dd></div>
              <div><dt>From Date</dt><dd>{formatDisplayDate(invoice.fromDate)}</dd></div>
              <div><dt>To Date</dt><dd>{formatDisplayDate(invoice.toDate)}</dd></div>
              <div><dt>Qty</dt><dd>{invoiceQty(invoice)} MT</dd></div>
              <div><dt>Contracts</dt><dd>{invoice.lines.length}</dd></div>
            </dl>
            <div className="view-invoices__card-actions">{actionButtons(invoice)}</div>
            {expandedKeys.includes(invoice.id) && <InvoiceLines invoice={invoice} />}
          </li>
        ))}
      </ul>

      <div className="view-invoices__pagination">
        <p>
          {filtered.length === 0 ? "Showing 0 Results" : `Showing ${start + 1}-${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} Results`}
        </p>
        <div className="view-invoices__pages">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
            <FiChevronLeft aria-hidden />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button key={number} type="button" className={number === currentPage ? "is-active" : ""} onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined}>
              {number}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
            <FiChevronRight aria-hidden />
          </button>
        </div>
      </div>

      <div className="view-invoices__footer">
        <button type="button" className="view-invoices__btn view-invoices__btn--navy view-invoices__btn--wide" onClick={handleSave} disabled={!hasChanges}>
          <FiSave aria-hidden /> Save
        </button>
        <button type="button" className="view-invoices__btn view-invoices__btn--warning view-invoices__btn--wide" onClick={handleCancel} disabled={!hasChanges}>
          <FiX aria-hidden /> Cancel
        </button>
      </div>

      {viewing && <ViewInvoiceModal invoice={viewing} onClose={() => setViewing(null)} />}

      {editing && (
        <EditInvoiceModal
          invoice={editing}
          onClose={() => setEditing(null)}
          onSave={(changes) => {
            setInvoices((prev) => prev.map((invoice) => (invoice.id === editing.id ? { ...invoice, ...changes } : invoice)));
            setMessage("");
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete invoice"
        message={deleting ? `Delete ${deleting.invoiceNo} (${formatInr(invoiceNetAmount(deleting))})? It is removed when you Save.` : ""}
        onConfirm={() => {
          if (deleting) setInvoices((prev) => prev.filter((invoice) => invoice.id !== deleting.id));
          setMessage("");
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default ViewInvoices;
