import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { IconType } from "react-icons";
import { FaRegBuilding, FaRegMoneyBillAlt } from "react-icons/fa";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiHash,
  FiMinus,
  FiPercent,
  FiPlus,
  FiPrinter,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import PaymentsPanel from "../PaymentsPanel";
import { formatDate, formatInr, type CalculatedRow } from "../interestCalc";
import { getInterestRecords, invoiceRowsFor, type InterestRecord } from "../interest.data";
import "../create-interest/CreateInterest.scss";
import "./InterestDetail.scss";

interface Filters {
  seller: string;
  buyer: string;
  interestNo: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { seller: "", buyer: "", interestNo: "", from: "", to: "" };

type Tone = "navy" | "green" | "blue" | "red" | "orange";

const SummaryTile = ({ icon: Icon, label, value, tone }: { icon: IconType; label: string; value: string; tone: Tone }) => (
  <div className={`detail-tile detail-tile--${tone}`}>
    <span className="detail-tile__icon">
      <Icon aria-hidden />
    </span>
    <div className="detail-tile__text">
      <span className="detail-tile__label">{label}</span>
      <strong className="detail-tile__value">{value}</strong>
    </div>
  </div>
);

const uniqueOptions = (values: string[]) => Array.from(new Set(values)).map((value) => ({ value, label: value }));

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function printDetail(record: InterestRecord, rows: CalculatedRow[], totalInterest: number, totalAmount: number) {
  const summary = [
    ["Interest No", record.id],
    ["From - To Date", `${formatDate(record.fromDate)} - ${formatDate(record.toDate)}`],
    ["Seller", record.seller],
    ["Buyer", record.buyer],
    ["Percentage", `${record.ratePercent}%`],
    ["Total Interest", formatInr(totalInterest)],
    ["Total Amount", formatInr(totalAmount)],
  ]
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");
  const invoices = rows
    .map((row) => {
      const payments = row.payments
        .map(
          (p, i) =>
            `<tr class="pay"><td></td><td colspan="3">${i + 1}. ${formatDate(p.date)} · ${p.paymentType}</td><td colspan="3">${escapeHtml(p.bankName)}${p.chequeNo ? ` · ${escapeHtml(p.chequeNo)}` : ""}</td><td colspan="2">${formatInr(p.amount)}</td></tr>`,
        )
        .join("");
      return `<tr><td>${row.sNo}</td><td>${row.contractNo}</td><td>${row.invoiceNo}</td><td>${formatDate(row.invoiceDate)}</td><td>${formatInr(row.invoiceAmount)}</td><td>${formatDate(row.paidDate)}</td><td>${formatInr(row.paidAmount)}</td><td>${row.overDueDays} Days</td><td>${formatInr(row.interest)}</td></tr>${payments}`;
    })
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Interest ${escapeHtml(record.id)}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1d24}h1{font-size:18px}table{border-collapse:collapse;width:100%;margin-bottom:18px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:12px}th{background:#f2f4f6}.pay td{background:#fafbfc;color:#555}</style>
</head><body><h1>Interest of Payments – ${escapeHtml(record.id)}</h1><table>${summary}</table>
<table><tr><th>S.No</th><th>Contract #</th><th>Invoice No</th><th>Invoice Dt</th><th>Invoice Amt</th><th>Paid Date</th><th>Paid Amount</th><th>Over Due</th><th>Interest</th></tr>${invoices}</table>
</body></html>`;
  // A same-origin blob page prints in every browser without the deprecated document.write.
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const win = window.open(url, "_blank", "width=900,height=700");
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

const InterestDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const records = useMemo(() => getInterestRecords(), []);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Opened from the menu without an id: show the first entry.
  const id = searchParams.get("id") ?? records[0]?.id ?? "";
  const record = records.find((item) => item.id === id) ?? null;
  const rows = useMemo(() => (record ? invoiceRowsFor(record) : []), [record]);

  // Entries without a linked invoice breakdown fall back to their stored figures.
  const totalInterest = rows.length > 0 ? rows.reduce((sum, row) => sum + row.interest, 0) : (record?.interestAmount ?? 0);
  const totalPaid = rows.length > 0 ? rows.reduce((sum, row) => sum + row.paidAmount, 0) : (record?.principal ?? 0);
  const totalAmount = totalPaid + totalInterest;
  const allExpanded = rows.length > 0 && rows.every((row) => expandedKeys.includes(row.id));

  const sellerOptions = uniqueOptions(records.map((item) => item.seller));
  const buyerOptions = uniqueOptions(records.map((item) => item.buyer));
  const matching = records.filter(
    (item) =>
      (!filters.seller || item.seller === filters.seller) &&
      (!filters.buyer || item.buyer === filters.buyer) &&
      (!filters.from || item.createdOn >= filters.from) &&
      (!filters.to || item.createdOn <= filters.to),
  );
  const interestNoOptions = matching.map((item) => ({ value: item.id, label: `${item.id} · ${formatDate(item.createdOn)}` }));

  const handleApply = () => {
    const target = matching.find((item) => item.id === filters.interestNo) ?? matching[0];
    if (!target) {
      setMessage("No interest entry matches these filters.");
      return;
    }
    setMessage("");
    setExpandedKeys([]);
    setSearchParams({ id: target.id });
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setMessage("");
  };

  const toggleExpanded = (key: string) =>
    setExpandedKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

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
    { key: "grace", header: "Grace", headerTooltip: "Grace days before interest starts", sortable: true },
    { key: "overDueDays", header: "Over Due", headerTooltip: "Total days minus grace", sortable: true, render: (row) => `${row.overDueDays} Days` },
    { key: "interest", header: "Interest", sortable: true, render: (row) => <strong>{formatInr(row.interest)}</strong> },
    { key: "expand", header: "", render: expandButton },
  ];

  return (
    <div className="interest-calc interest-detail-page">
      <div className="interest-calc__header">
        <h1>Interest of Payments</h1>
        <div className="interest-calc__header-actions">
          <Link to="/interest-payments/view" className="interest-detail-page__back">
            <FiArrowLeft aria-hidden /> Back
          </Link>
          <button
            type="button"
            className="interest-calc__btn interest-calc__btn--info"
            onClick={() => setFiltersVisible((prev) => !prev)}
            aria-expanded={filtersVisible}
            aria-controls="interest-detail-filters"
          >
            {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {filtersVisible ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            className="interest-calc__btn interest-calc__btn--navy"
            onClick={() => record && printDetail(record, rows, totalInterest, totalAmount)}
            disabled={!record}
          >
            <FiPrinter aria-hidden /> Print
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
        <div id="interest-detail-filters" className="interest-detail-page__filters">
          <SearchableSelect options={sellerOptions} value={filters.seller} onChange={(seller) => setFilters({ ...filters, seller, interestNo: "" })} placeholder="Select Seller" ariaLabel="Select Seller" clearable />
          <SearchableSelect options={buyerOptions} value={filters.buyer} onChange={(buyer) => setFilters({ ...filters, buyer, interestNo: "" })} placeholder="Select Buyer" ariaLabel="Select Buyer" clearable />
          <DateRangeInput from={filters.from} to={filters.to} onChange={(from, to) => setFilters({ ...filters, from, to, interestNo: "" })} placeholder="Select Date Range" ariaLabel="Date of entry range" />
          <SearchableSelect options={interestNoOptions} value={filters.interestNo} onChange={(interestNo) => setFilters({ ...filters, interestNo })} placeholder="Select Interest No" ariaLabel="Select Interest No" clearable />
          <div className="interest-calc__filter-actions">
            <button type="button" className="interest-calc__btn interest-calc__btn--navy" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="interest-calc__btn interest-calc__btn--danger" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="interest-detail-page__message" role="alert">
          <FiAlertCircle aria-hidden /> {message}
        </p>
      )}

      {!record ? (
        <p className="interest-detail-page__empty" role="status">
          <FiAlertCircle aria-hidden /> {id ? `Interest entry ${id} could not be found.` : "There are no interest entries yet."}
        </p>
      ) : (
        <>
          <div className="interest-detail-page__tiles">
            <SummaryTile icon={FiHash} label="Interest No" value={record.id} tone="navy" />
            <SummaryTile icon={FiCalendar} label="From - To Date" value={`${formatDate(record.fromDate)} - ${formatDate(record.toDate)}`} tone="green" />
            <SummaryTile icon={FiUser} label="Buyer" value={record.buyer} tone="blue" />
            <SummaryTile icon={FaRegBuilding} label="Seller" value={record.seller} tone="red" />
            <SummaryTile icon={FiPercent} label="Percentage" value={`${record.ratePercent}%`} tone="orange" />
            <SummaryTile icon={FaRegMoneyBillAlt} label="Total Interest" value={formatInr(totalInterest)} tone="green" />
            <SummaryTile icon={FaRegMoneyBillAlt} label="Total Amount" value={formatInr(totalAmount)} tone="green" />
          </div>

          {rows.length === 0 ? (
            <p className="interest-detail-page__empty" role="status">
              <FiAlertCircle aria-hidden /> No invoice breakdown is linked to {record.id}.
            </p>
          ) : (
            <>
              <div className="interest-calc__table-view">
                <Table
                  columns={columns}
                  data={rows}
                  rowKey={(row) => row.id}
                  expandedRowKeys={expandedKeys}
                  renderExpandedRow={(row) => <PaymentsPanel payments={row.payments} />}
                />
              </div>

              <ul className="interest-calc__cards">
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
                      <div><dt>Grace</dt><dd>{row.grace} Days</dd></div>
                      <div><dt>Over Due</dt><dd>{row.overDueDays} Days</dd></div>
                      <div className="interest-calc__card-full"><dt>Interest</dt><dd className="interest-calc__card-interest">{formatInr(row.interest)}</dd></div>
                    </dl>
                    <div className="interest-calc__card-footer">
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default InterestDetail;
