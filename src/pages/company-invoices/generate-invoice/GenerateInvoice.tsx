import { useMemo, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiSave,
  FiX,
} from "react-icons/fi";
import { formatDisplayDate } from "../../../components/dropdown/Calendar";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { commissionContracts, type CommissionContract } from "../companyInvoice.data";
import "./GenerateInvoice.scss";

interface Filters {
  company: string;
  party: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { company: "", party: "", from: "", to: "" };

const formatNumber = (value: number) => value.toLocaleString("en-IN");
const formatInr = (value: number) => `₹${formatNumber(value)}`;
const options = (values: string[]) => Array.from(new Set(values)).map((value) => ({ value, label: value }));
const totalCommission = (row: CommissionContract) => row.quantityMt * row.commissionPerMt;
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const GenerateInvoice = () => {
  const [contracts, setContracts] = useState<CommissionContract[]>(commissionContracts);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulk, setBulk] = useState({ commodity: "", party: "", commission: "" });
  const [difference, setDifference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const companyOptions = useMemo(() => options(commissionContracts.map((row) => row.company)), []);
  const partyOptions = useMemo(() => options(commissionContracts.map((row) => row.partyName)), []);

  const rows = useMemo(
    () =>
      contracts.filter((row) => {
        if (applied.company && row.company !== applied.company) return false;
        if (applied.party && row.partyName !== applied.party) return false;
        if (applied.from && row.contractDate < applied.from) return false;
        if (applied.to && row.contractDate > applied.to) return false;
        return true;
      }),
    [contracts, applied],
  );

  const commodityOptions = options(rows.map((row) => row.commodity));
  const visiblePartyOptions = options(rows.map((row) => row.partyName));

  // The invoice covers the ticked contracts, or every listed one when nothing is ticked.
  const visibleSelected = rows.filter((row) => selectedIds.includes(row.id));
  const invoiceRows = visibleSelected.length > 0 ? visibleSelected : rows;
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  // Summary: quantity and amount per commission rate.
  const summary = useMemo(() => {
    const byRate = new Map<number, { qty: number; amount: number }>();
    for (const row of invoiceRows) {
      const entry = byRate.get(row.commissionPerMt) ?? { qty: 0, amount: 0 };
      entry.qty += row.quantityMt;
      entry.amount += totalCommission(row);
      byRate.set(row.commissionPerMt, entry);
    }
    return Array.from(byRate, ([commission, entry]) => ({ commission, ...entry })).sort((a, b) => b.commission - a.commission);
  }, [invoiceRows]);

  const subtotal = summary.reduce((sum, line) => sum + line.amount, 0);
  const totalAmount = subtotal + (Number(difference) || 0);

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const toggleAll = (checked: boolean) => {
    const ids = rows.map((row) => row.id);
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id))));
  };

  const setCommission = (ids: string[], value: number) =>
    setContracts((prev) => prev.map((row) => (ids.includes(row.id) ? { ...row, commissionPerMt: value } : row)));

  const handleApplyFilters = () => {
    setApplied(draft);
    setMessage(null);
  };

  const handleResetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setMessage(null);
  };

  const handleApplyBulk = () => {
    const value = Number(bulk.commission);
    if (bulk.commission === "" || !(value >= 0)) {
      setMessage({ type: "error", text: "Enter the commission per MT to apply (e.g. 50)." });
      return;
    }
    const targets = invoiceRows.filter(
      (row) => (!bulk.commodity || row.commodity === bulk.commodity) && (!bulk.party || row.partyName === bulk.party),
    );
    setCommission(targets.map((row) => row.id), value);
    setMessage({ type: "success", text: `Commission of ₹${value}/MT applied to ${targets.length} contract(s).` });
  };

  const handleExport = () => {
    const head = ["Contract Dt", "Contract No", "Party Name", "Action Type", "Commodity", "Contract Rate", "No of MT", "Commission / MT", "Total Commission"];
    const body = rows
      .map((row) =>
        [
          formatDisplayDate(row.contractDate),
          row.contractNo,
          row.partyName,
          row.actionType,
          row.commodity,
          row.contractRate === null ? "-" : formatInr(row.contractRate),
          String(row.quantityMt),
          String(row.commissionPerMt),
          formatInr(totalCommission(row)),
        ]
          .map((cell) => `<td>${escapeHtml(cell)}</td>`)
          .join(""),
      )
      .map((cells) => `<tr>${cells}</tr>`)
      .join("");
    const html = `<meta charset="utf-8"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
    const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "company-invoice-contracts.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (invoiceRows.length === 0) {
      setMessage({ type: "error", text: "There are no contracts to invoice." });
      return;
    }
    if (difference !== "" && Number.isNaN(Number(difference))) {
      setMessage({ type: "error", text: "Difference must be a number (use a minus sign for a deduction)." });
      return;
    }
    // TODO: post the invoice to the API once the endpoint is available.
    setMessage({ type: "success", text: `Invoice of ${formatInr(totalAmount)} generated for ${invoiceRows.length} contract(s).` });
  };

  const handleCancel = () => {
    setContracts(commissionContracts);
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setSelectedIds([]);
    setBulk({ commodity: "", party: "", commission: "" });
    setDifference("");
    setRemarks("");
    setMessage(null);
  };

  const commissionInput = (row: CommissionContract) => (
    <input
      type="number"
      min={0}
      inputMode="decimal"
      className="generate-invoice__commission"
      value={row.commissionPerMt}
      onChange={(event) => setCommission([row.id], Math.max(0, Number(event.target.value) || 0))}
      aria-label={`Commission per MT for ${row.contractNo}`}
    />
  );

  const columns: TableColumn<CommissionContract>[] = [
    { key: "contractDate", header: "Contract Dt", sortable: true, render: (row) => formatDisplayDate(row.contractDate) },
    { key: "contractNo", header: "Contract No", sortable: true },
    { key: "partyName", header: "Party Name", sortable: true, render: (row) => <span className="generate-invoice__party">{row.partyName}</span> },
    { key: "actionType", header: "Action Type", sortable: true, render: (row) => <span className={`generate-invoice__action generate-invoice__action--${row.actionType.toLowerCase()}`}>{row.actionType}</span> },
    { key: "commodity", header: "Commodity", sortable: true },
    { key: "contractRate", header: "Contract Rate", sortable: true, sortValue: (row) => row.contractRate ?? 0, render: (row) => (row.contractRate === null ? "-" : formatInr(row.contractRate)) },
    { key: "quantityMt", header: "No of MT", sortable: true },
    { key: "commissionPerMt", header: "Commission / MT", sortable: true, render: commissionInput },
    { key: "total", header: "Total Commission", sortable: true, sortValue: totalCommission, render: (row) => <strong>{formatNumber(totalCommission(row))}</strong> },
  ];

  return (
    <div className="generate-invoice">
      <div className="generate-invoice__header">
        <h1>Generate Company Invoice</h1>
        <div className="generate-invoice__header-actions">
          <button
            type="button"
            className="generate-invoice__btn generate-invoice__btn--info"
            onClick={() => setFiltersVisible((prev) => !prev)}
            aria-expanded={filtersVisible}
            aria-controls="generate-invoice-filters"
          >
            {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {filtersVisible ? "Hide" : "Show"}
          </button>
          <button type="button" className="generate-invoice__btn generate-invoice__btn--warning" onClick={handleExport} disabled={rows.length === 0}>
            <FiDownload aria-hidden /> Export
          </button>
          <button type="button" className="generate-invoice__btn generate-invoice__btn--warning" onClick={() => toggleAll(!allSelected)} disabled={rows.length === 0}>
            {allSelected ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
            {allSelected ? "Clear All" : "Toggle All"}
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div id="generate-invoice-filters" className="generate-invoice__filters">
          <SearchableSelect options={companyOptions} value={draft.company} onChange={(company) => setDraft({ ...draft, company })} placeholder="Select Company" ariaLabel="Select Company" clearable />
          <DateRangeInput from={draft.from} to={draft.to} onChange={(from, to) => setDraft({ ...draft, from, to })} placeholder="Select Date Range" ariaLabel="Contract date range" />
          <SearchableSelect options={partyOptions} value={draft.party} onChange={(party) => setDraft({ ...draft, party })} placeholder="Select Party" ariaLabel="Select Party" clearable />
          <div className="generate-invoice__filter-actions">
            <button type="button" className="generate-invoice__btn generate-invoice__btn--navy" onClick={handleApplyFilters}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="generate-invoice__btn generate-invoice__btn--danger" onClick={handleResetFilters}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        </div>
      )}

      <div className="generate-invoice__bulk">
        <SearchableSelect options={commodityOptions} value={bulk.commodity} onChange={(commodity) => setBulk({ ...bulk, commodity })} placeholder="Select Commodity" ariaLabel="Apply commission to commodity" clearable />
        <SearchableSelect options={visiblePartyOptions} value={bulk.party} onChange={(party) => setBulk({ ...bulk, party })} placeholder="Select Party" ariaLabel="Apply commission to party" clearable />
        <input
          type="number"
          min={0}
          inputMode="decimal"
          className="generate-invoice__input"
          placeholder="Ex:50"
          aria-label="Commission per MT to apply"
          value={bulk.commission}
          onChange={(event) => setBulk({ ...bulk, commission: event.target.value })}
        />
        <button type="button" className="generate-invoice__btn generate-invoice__btn--navy" onClick={handleApplyBulk}>
          Apply
        </button>
      </div>

      {message && (
        <p className={`generate-invoice__message generate-invoice__message--${message.type}`} role={message.type === "error" ? "alert" : "status"}>
          {message.type === "success" ? <FiCheckCircle aria-hidden /> : <FiX aria-hidden />} {message.text}
        </p>
      )}

      <div className="generate-invoice__table-view">
        <Table
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedIds}
          onSelectRow={toggleRow}
          onSelectAll={toggleAll}
          className="generate-invoice__table"
          emptyMessage="No contracts match the current filters."
        />
      </div>

      <ul className="generate-invoice__cards">
        {rows.length === 0 && <li className="generate-invoice__cards-empty">No contracts match the current filters.</li>}
        {rows.map((row) => (
          <li key={row.id} className={`generate-invoice__card ${selectedIds.includes(row.id) ? "is-selected" : ""}`}>
            <label className="generate-invoice__card-top">
              <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} />
              <strong>{row.contractNo}</strong>
              <span>{formatDisplayDate(row.contractDate)}</span>
            </label>
            <dl>
              <div className="generate-invoice__card-full"><dt>Party Name</dt><dd>{row.partyName}</dd></div>
              <div><dt>Action Type</dt><dd>{row.actionType}</dd></div>
              <div><dt>Commodity</dt><dd>{row.commodity}</dd></div>
              <div><dt>Contract Rate</dt><dd>{row.contractRate === null ? "-" : formatInr(row.contractRate)}</dd></div>
              <div><dt>No of MT</dt><dd>{row.quantityMt}</dd></div>
              <div><dt>Commission / MT</dt><dd>{commissionInput(row)}</dd></div>
              <div><dt>Total Commission</dt><dd className="generate-invoice__card-total">{formatInr(totalCommission(row))}</dd></div>
            </dl>
          </li>
        ))}
      </ul>

      <section className="generate-invoice__summary" aria-labelledby="generate-invoice-summary-title">
        <h2 id="generate-invoice-summary-title">Summary Of Quantity &amp; Commission</h2>
        <p className="generate-invoice__summary-note">
          {visibleSelected.length > 0 ? `${visibleSelected.length} selected contract(s)` : `All ${rows.length} listed contract(s) — tick rows to invoice only some`}
        </p>
        <div className="generate-invoice__summary-scroll">
          <table className="generate-invoice__summary-table">
            <thead>
              <tr>
                <th scope="col">Qty</th>
                <th scope="col">Commission</th>
                <th scope="col" className="is-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={3} className="generate-invoice__summary-empty">No contracts to summarise.</td>
                </tr>
              ) : (
                summary.map((line) => (
                  <tr key={line.commission}>
                    <td>{formatNumber(line.qty)}</td>
                    <td>{line.commission}</td>
                    <td className="is-amount">{formatNumber(line.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="generate-invoice__totals">
          <div className="generate-invoice__field">
            <label htmlFor="invoice-difference">Difference</label>
            <input
              id="invoice-difference"
              type="number"
              inputMode="decimal"
              className="generate-invoice__input"
              placeholder="Enter Difference"
              value={difference}
              onChange={(event) => setDifference(event.target.value)}
            />
          </div>
          <div className="generate-invoice__field">
            <label htmlFor="invoice-remarks">Remarks</label>
            <input
              id="invoice-remarks"
              type="text"
              className="generate-invoice__input"
              placeholder="Enter Remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          </div>
          <div className="generate-invoice__field">
            <label htmlFor="invoice-total">Total Amount</label>
            <input id="invoice-total" type="text" className="generate-invoice__input generate-invoice__input--readonly" value={formatNumber(totalAmount)} readOnly />
          </div>
        </div>
      </section>

      <div className="generate-invoice__footer">
        <button type="button" className="generate-invoice__btn generate-invoice__btn--navy generate-invoice__btn--wide" onClick={handleSave}>
          <FiSave aria-hidden /> Save
        </button>
        <button type="button" className="generate-invoice__btn generate-invoice__btn--warning generate-invoice__btn--wide" onClick={handleCancel}>
          <FiX aria-hidden /> Cancel
        </button>
      </div>
    </div>
  );
};

export default GenerateInvoice;
