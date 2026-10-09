import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiMinus,
  FiPlus,
  FiPrinter,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import {
  DEFAULT_INTEREST_RATE,
  PAYMENT_DUE_DAY_OPTIONS,
  interestInvoices,
  type InterestInvoice,
} from "./interestCalculation.data";
import PaymentsPanel from "../PaymentsPanel";
import { calculateInvoice, formatDate, formatInr, type CalculatedRow } from "../interestCalc";
import "./CreateInterest.scss";

interface Filters {
  seller: string;
  buyer: string;
  from: string;
  to: string;
  dueDays: string;
  rate: string;
  grace: string;
}

const EMPTY_FILTERS: Filters = { seller: "", buyer: "", from: "", to: "", dueDays: "", rate: "", grace: "" };

const uniqueOptions = (values: string[]) => Array.from(new Set(values)).map((value) => ({ value, label: value }));

// ---------- Small pieces ----------

const RowDetailsModal = ({ row, rate, onClose }: { row: CalculatedRow; rate: number; onClose: () => void }) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className="interest-calc-modal" role="presentation" onClick={onClose}>
      <div
        className="interest-calc-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="interest-calc-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h2 id="interest-calc-modal-title">
            {row.invoiceNo} · {row.contractNo}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </header>
        <dl>
          <div><dt>Seller</dt><dd>{row.seller}</dd></div>
          <div><dt>Buyer</dt><dd>{row.buyer}</dd></div>
          <div><dt>Invoice Dt</dt><dd>{formatDate(row.invoiceDate)}</dd></div>
          <div><dt>Payment Due Date</dt><dd>{formatDate(row.dueDate)}</dd></div>
          <div><dt>Invoice Amt</dt><dd>{formatInr(row.invoiceAmount)}</dd></div>
          <div><dt>Paid Amount</dt><dd>{formatInr(row.paidAmount)}</dd></div>
          <div><dt>Total Days</dt><dd>{row.totalDays} Days</dd></div>
          <div><dt>Grace</dt><dd>{row.grace} Days</dd></div>
        </dl>
        <p className="interest-calc-modal__formula">
          Over Due = {row.totalDays} − {row.grace} = <strong>{row.overDueDays} Days</strong>
          <br />
          Interest = {formatInr(row.paidAmount)} × {rate}% × {row.overDueDays} ÷ 365 = <strong>{formatInr(row.interest)}</strong>
        </p>
        <PaymentsPanel payments={row.payments} />
      </div>
    </div>,
    document.body,
  );
};

function printRow(row: CalculatedRow, rate: number) {
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const line = (label: string, value: string) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`;
  const payments = row.payments
    .map((p, i) => `<tr><td>${i + 1}</td><td>${formatDate(p.date)}</td><td>${p.paymentType}</td><td>${escape(p.bankName)}</td><td>${escape(p.chequeNo || "—")}</td><td>${formatInr(p.amount)}</td></tr>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Interest ${escape(row.invoiceNo)}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1d24}h1{font-size:18px}table{border-collapse:collapse;width:100%;margin-bottom:16px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:13px}th{background:#f2f4f6}</style>
</head><body><h1>Interest of Payment – ${escape(row.invoiceNo)}</h1><table>
${line("Seller", row.seller)}${line("Buyer", row.buyer)}${line("Contract #", `${row.contractNo} (${formatDate(row.contractDate)})`)}
${line("Invoice", `${row.invoiceNo} (${formatDate(row.invoiceDate)}) – ${formatInr(row.invoiceAmount)}`)}${line("Payment Due Date", formatDate(row.dueDate))}
${line("Paid", `${formatInr(row.paidAmount)} on ${formatDate(row.paidDate)}`)}${line("Total / Grace / Over Due", `${row.totalDays} / ${row.grace} / ${row.overDueDays} Days`)}
${line("Interest", `${formatInr(row.interest)} @ ${rate}% p.a.`)}</table>
<table><tr><th>S.No</th><th>Date</th><th>Payment Type</th><th>Bank Name</th><th>Cheque No</th><th>Amount</th></tr>${payments}</table>
</body></html>`;
  // A same-origin blob page works in every browser without the deprecated document.write.
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const win = window.open(url, "_blank", "width=800,height=700");
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

// ---------- Page ----------

const CreateInterest = () => {
  const [invoices, setInvoices] = useState<InterestInvoice[]>(interestInvoices);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  // Payment sub-tables start collapsed; the + button (or Expand All) opens them.
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [bulkGrace, setBulkGrace] = useState("");
  const [bulkCondition, setBulkCondition] = useState("All");
  const [viewing, setViewing] = useState<CalculatedRow | null>(null);
  const [deleting, setDeleting] = useState<CalculatedRow | null>(null);
  const [message, setMessage] = useState("");

  const updateDraft = (patch: Partial<Filters>) => setDraft((prev) => ({ ...prev, ...patch }));

  const rate = Number(applied.rate) > 0 ? Number(applied.rate) : DEFAULT_INTEREST_RATE;
  const dueDays = applied.dueDays ? Number(applied.dueDays) : null;

  const sellerOptions = useMemo(() => uniqueOptions(interestInvoices.map((invoice) => invoice.seller)), []);
  const buyerOptions = useMemo(() => uniqueOptions(interestInvoices.map((invoice) => invoice.buyer)), []);
  const dueDayOptions = PAYMENT_DUE_DAY_OPTIONS.map((days) => ({ value: String(days), label: `${days} Days` }));

  const rows = useMemo(
    () =>
      invoices
        .filter((invoice) => {
          if (applied.seller && invoice.seller !== applied.seller) return false;
          if (applied.buyer && invoice.buyer !== applied.buyer) return false;
          if (applied.from && invoice.invoiceDate < applied.from) return false;
          if (applied.to && invoice.invoiceDate > applied.to) return false;
          return true;
        })
        .map((invoice, index) => calculateInvoice(invoice, index + 1, dueDays, rate)),
    [invoices, applied, dueDays, rate],
  );

  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  const allExpanded = rows.length > 0 && rows.every((row) => expandedKeys.includes(row.id));
  const conditionOptions = [
    { value: "All", label: "All Conditions" },
    ...Array.from(new Set(rows.map((row) => row.conditionDays)))
      .sort((a, b) => a - b)
      .map((days) => ({ value: String(days), label: `${days} Days` })),
  ];

  const setGrace = (ids: string[], grace: number) =>
    setInvoices((prev) => prev.map((invoice) => (ids.includes(invoice.id) ? { ...invoice, grace } : invoice)));

  const toggleExpanded = (id: string) =>
    setExpandedKeys((prev) => (prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]));

  const handleApplyFilters = () => {
    setApplied(draft);
    // A Grace Period entered in the filters becomes every listed invoice's grace.
    if (draft.grace !== "" && Number(draft.grace) >= 0) setGrace(invoices.map((invoice) => invoice.id), Number(draft.grace));
    setMessage("");
  };

  const handleResetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setMessage("");
  };

  const handleApplyBulkGrace = () => {
    if (bulkGrace === "" || Number(bulkGrace) < 0) return;
    const targets = rows.filter((row) => bulkCondition === "All" || String(row.conditionDays) === bulkCondition);
    setGrace(targets.map((row) => row.id), Number(bulkGrace));
    setMessage(`Grace of ${bulkGrace} days applied to ${targets.length} invoice(s).`);
  };

  const handleSave = () => {
    // TODO: post the calculated interest to the API once the endpoint is available.
    setMessage(`Interest of ${formatInr(totalInterest)} saved for ${rows.length} invoice(s).`);
  };

  const handleCancel = () => {
    setInvoices(interestInvoices);
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setBulkGrace("");
    setBulkCondition("All");
    setExpandedKeys([]);
    setMessage("");
  };

  const graceInput = (row: CalculatedRow) => (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      className="interest-calc__grace"
      value={row.grace}
      onChange={(event) => setGrace([row.id], Math.max(0, Number(event.target.value) || 0))}
      aria-label={`Grace days for ${row.invoiceNo}`}
    />
  );

  const actionButtons = (row: CalculatedRow) => (
    <div className="interest-calc__actions">
      <button type="button" className="interest-calc__icon-btn interest-calc__icon-btn--view" onClick={() => setViewing(row)} aria-label={`View ${row.invoiceNo}`} title="View">
        <FiEye aria-hidden />
      </button>
      <button type="button" className="interest-calc__icon-btn interest-calc__icon-btn--print" onClick={() => printRow(row, rate)} aria-label={`Print ${row.invoiceNo}`} title="Print">
        <FiPrinter aria-hidden />
      </button>
      <button type="button" className="interest-calc__icon-btn interest-calc__icon-btn--delete" onClick={() => setDeleting(row)} aria-label={`Delete ${row.invoiceNo}`} title="Delete">
        <FiTrash2 aria-hidden />
      </button>
    </div>
  );

  const expandButton = (row: CalculatedRow) => {
    const open = expandedKeys.includes(row.id);
    return (
      <button
        type="button"
        className="interest-calc__expand"
        onClick={() => toggleExpanded(row.id)}
        aria-expanded={open}
        aria-label={open ? `Hide payments for ${row.invoiceNo}` : `Show payments for ${row.invoiceNo}`}
      >
        {open ? <FiMinus aria-hidden /> : <FiPlus aria-hidden />}
      </button>
    );
  };

  const columns: TableColumn<CalculatedRow>[] = [
    { key: "sNo", header: "S.No", sortable: true },
    { key: "contractDate", header: "Contract Dt", sortable: true, render: (row) => formatDate(row.contractDate) },
    { key: "contractNo", header: "Contract #", sortable: true },
    { key: "invoiceDate", header: "Invoice Dt", sortable: true, render: (row) => formatDate(row.invoiceDate) },
    { key: "invoiceNo", header: "Invoice No", sortable: true },
    { key: "invoiceAmount", header: "Invoice Amt", sortable: true, render: (row) => formatInr(row.invoiceAmount) },
    { key: "dueDate", header: "Payment Due Date", sortable: true, render: (row) => formatDate(row.dueDate) },
    { key: "paidDate", header: "Paid Date", sortable: true, render: (row) => formatDate(row.paidDate) },
    { key: "paidAmount", header: "Paid Amount", sortable: true, render: (row) => formatInr(row.paidAmount) },
    { key: "totalDays", header: "Total", headerTooltip: "Days from invoice to final payment", sortable: true, render: (row) => `${row.totalDays} Days` },
    { key: "conditionDays", header: "Condition", headerTooltip: "Agreed credit days (invoice to due date)", sortable: true, render: (row) => `${row.conditionDays} Days` },
    { key: "grace", header: "Grace", headerTooltip: "Grace days before interest starts", sortable: true, render: graceInput },
    { key: "overDueDays", header: "Over Due", headerTooltip: "Total days minus grace", sortable: true, render: (row) => `${row.overDueDays} Days` },
    { key: "interest", header: "Interest", sortable: true, render: (row) => <strong>{formatInr(row.interest)}</strong> },
    { key: "actions", header: "Action", render: actionButtons },
    { key: "expand", header: "", render: expandButton },
  ];

  return (
    <div className="interest-calc">
      <div className="interest-calc__header">
        <h1>Interest of Payments</h1>
        <div className="interest-calc__header-actions">
          <button
            type="button"
            className="interest-calc__btn interest-calc__btn--info"
            onClick={() => setFiltersVisible((prev) => !prev)}
            aria-expanded={filtersVisible}
            aria-controls="interest-calc-filters"
          >
            {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {filtersVisible ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            className="interest-calc__btn interest-calc__btn--warning"
            onClick={() => setExpandedKeys(allExpanded ? [] : rows.map((row) => row.id))}
            disabled={rows.length === 0}
          >
            {allExpanded ? <FiMinus aria-hidden /> : <FiPlus aria-hidden />}
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div id="interest-calc-filters" className="interest-calc__filters">
          <SearchableSelect options={sellerOptions} value={draft.seller} onChange={(seller) => updateDraft({ seller })} placeholder="Select Seller" ariaLabel="Select Seller" clearable />
          <SearchableSelect options={buyerOptions} value={draft.buyer} onChange={(buyer) => updateDraft({ buyer })} placeholder="Select Buyer" ariaLabel="Select Buyer" clearable />
          <DateRangeInput from={draft.from} to={draft.to} onChange={(from, to) => updateDraft({ from, to })} placeholder="Select Date Range" ariaLabel="Invoice date range" />
          <SearchableSelect options={dueDayOptions} value={draft.dueDays} onChange={(dueDays) => updateDraft({ dueDays })} placeholder="Select Payment Due Days" ariaLabel="Payment due days" clearable />
          <input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            className="interest-calc__input"
            placeholder={`Interest Rate (%) – default ${DEFAULT_INTEREST_RATE}`}
            aria-label="Interest Rate (%)"
            value={draft.rate}
            onChange={(event) => updateDraft({ rate: event.target.value })}
          />
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className="interest-calc__input"
            placeholder="Grace Period in Days"
            aria-label="Grace Period in Days"
            value={draft.grace}
            onChange={(event) => updateDraft({ grace: event.target.value })}
          />
          <div className="interest-calc__filter-actions">
            <button type="button" className="interest-calc__btn interest-calc__btn--navy" onClick={handleApplyFilters}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="interest-calc__btn interest-calc__btn--danger" onClick={handleResetFilters}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        </div>
      )}

      <div className="interest-calc__summary">
        <div className="interest-calc__parties">
          <span>Seller: <strong>{applied.seller || "All Sellers"}</strong></span>
          <span>Buyer: <strong>{applied.buyer || "All Buyers"}</strong></span>
          <span>Rate: <strong>{rate}% p.a.</strong></span>
        </div>
        <div className="interest-calc__total">
          <span>Total Interest:</span>
          <strong>{totalInterest.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="interest-calc__bulk">
        <input
          type="number"
          min={0}
          inputMode="numeric"
          className="interest-calc__input"
          placeholder="Apply Grace"
          aria-label="Grace days to apply"
          value={bulkGrace}
          onChange={(event) => setBulkGrace(event.target.value)}
        />
        <SearchableSelect options={conditionOptions} value={bulkCondition} onChange={setBulkCondition} placeholder="Select Condition Days" ariaLabel="Apply grace to invoices with condition days" />
        <button type="button" className="interest-calc__btn interest-calc__btn--navy" onClick={handleApplyBulkGrace} disabled={bulkGrace === ""}>
          <FiCheck aria-hidden /> Apply
        </button>
      </div>

      {message && (
        <p className="interest-calc__message" role="status">
          <FiCheckCircle aria-hidden /> {message}
        </p>
      )}

      <div className="interest-calc__table-view">
        <Table
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          expandedRowKeys={expandedKeys}
          renderExpandedRow={(row) => <PaymentsPanel payments={row.payments} />}
          emptyMessage="No invoices match the current filters."
        />
      </div>

      <ul className="interest-calc__cards">
        {rows.length === 0 && <li className="interest-calc__cards-empty">No invoices match the current filters.</li>}
        {rows.map((row) => (
          <li key={row.id} className="interest-calc__card">
            <div className="interest-calc__card-top">
              <strong>{row.sNo}. {row.invoiceNo}</strong>
              <span>{row.contractNo}</span>
            </div>
            <dl>
              <div><dt>Contract Dt</dt><dd>{formatDate(row.contractDate)}</dd></div>
              <div><dt>Invoice Dt</dt><dd>{formatDate(row.invoiceDate)}</dd></div>
              <div><dt>Invoice Amt</dt><dd>{formatInr(row.invoiceAmount)}</dd></div>
              <div><dt>Payment Due</dt><dd>{formatDate(row.dueDate)}</dd></div>
              <div><dt>Paid Date</dt><dd>{formatDate(row.paidDate)}</dd></div>
              <div><dt>Paid Amount</dt><dd>{formatInr(row.paidAmount)}</dd></div>
              <div><dt>Total</dt><dd>{row.totalDays} Days</dd></div>
              <div><dt>Condition</dt><dd>{row.conditionDays} Days</dd></div>
              <div><dt>Grace</dt><dd>{graceInput(row)}</dd></div>
              <div><dt>Over Due</dt><dd>{row.overDueDays} Days</dd></div>
              <div className="interest-calc__card-full"><dt>Interest</dt><dd className="interest-calc__card-interest">{formatInr(row.interest)}</dd></div>
            </dl>
            <div className="interest-calc__card-footer">
              {actionButtons(row)}
              <button type="button" className="interest-calc__link" onClick={() => toggleExpanded(row.id)} aria-expanded={expandedKeys.includes(row.id)}>
                {expandedKeys.includes(row.id) ? "Hide payments" : `Show payments (${row.payments.length})`}
              </button>
            </div>
            {expandedKeys.includes(row.id) && (
              <ul className="interest-calc__payment-list">
                {row.payments.map((payment, index) => (
                  <li key={index}>
                    <span>{index + 1}. {formatDate(payment.date)} · {payment.paymentType}</span>
                    <span>{payment.bankName}{payment.chequeNo ? ` · ${payment.chequeNo}` : ""}</span>
                    <strong>{formatInr(payment.amount)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div className="interest-calc__footer">
        <button type="button" className="interest-calc__btn interest-calc__btn--navy" onClick={handleSave} disabled={rows.length === 0}>
          <FiSave aria-hidden /> Save
        </button>
        <button type="button" className="interest-calc__btn interest-calc__btn--danger" onClick={handleCancel}>
          <FiX aria-hidden /> Cancel
        </button>
      </div>

      {viewing && <RowDetailsModal row={viewing} rate={rate} onClose={() => setViewing(null)} />}

      <ConfirmDialog
        open={deleting !== null}
        title="Remove invoice"
        message={deleting ? `Remove ${deleting.invoiceNo} (${deleting.contractNo}) from this interest calculation?` : ""}
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleting) setInvoices((prev) => prev.filter((invoice) => invoice.id !== deleting.id));
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default CreateInterest;
