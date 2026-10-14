import { useMemo, useState } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  EMPTY_BULK,
  EMPTY_FILTERS,
  estimationContracts,
  type BulkCommission,
  type EstimationContract,
  type EstimationFilters as Filters,
} from "./commissionEstimation.data";
import {
  estimatedQuantities,
  exportEstimations,
  formatInr,
  isTicked,
  summariseByRate,
  uniqueOptions,
  type Selection,
} from "./commissionEstimation.utils";
import BulkCommissionBar from "./components/BulkCommissionBar";
import ContractCards from "./components/ContractCards";
import ContractsTable from "./components/ContractsTable";
import EstimationFilters from "./components/EstimationFilters";
import EstimationFooter from "./components/EstimationFooter";
import EstimationHeader from "./components/EstimationHeader";
import EstimationPagination from "./components/EstimationPagination";
import EstimationSummary from "./components/EstimationSummary";
import SummaryCards from "./components/SummaryCards";
import "./CommissionEstimations.scss";

const PAGE_SIZE = 10;
const EMPTY_MESSAGE = "No contracts match the current filters.";

/** `saved` adds a link to View Estimations after a successful Save. */
type Message = { type: "success" | "error"; text: string; saved?: boolean };

const allInvoiceIds = (row: EstimationContract) => row.invoices.map((invoice) => invoice.id);

const withoutKey = (selection: Selection, id: string) => {
  const next = { ...selection };
  delete next[id];
  return next;
};

const CommissionEstimations = () => {
  const [contracts, setContracts] = useState<EstimationContract[]>(estimationContracts);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [selection, setSelection] = useState<Selection>({});
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [bulk, setBulk] = useState<BulkCommission>(EMPTY_BULK);
  const [difference, setDifference] = useState("0");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState<Message | null>(null);

  const partyOptions = useMemo(() => uniqueOptions(estimationContracts.map((row) => row.partyName)), []);

  const rows = useMemo(
    () =>
      contracts.filter((row) => {
        if (applied.party && row.partyName !== applied.party) return false;
        if (applied.actionType && row.actionType !== applied.actionType) return false;
        if (applied.from && row.contractDate < applied.from) return false;
        if (applied.to && row.contractDate > applied.to) return false;
        return true;
      }),
    [contracts, applied],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allExpanded = paged.length > 0 && paged.every((row) => expandedIds.includes(row.id));

  // The estimate covers the ticked contracts (by their ticked invoices), or every listed one when nothing is ticked.
  const estimate = useMemo(() => estimatedQuantities(rows, selection), [rows, selection]);
  const summary = useMemo(() => summariseByRate(estimate), [estimate]);
  const totalQty = summary.reduce((sum, line) => sum + line.qty, 0);
  const amount = summary.reduce((sum, line) => sum + line.amount, 0);
  const averageCommission = totalQty > 0 ? Math.round((amount / totalQty) * 100) / 100 : 0;
  const totalAmount = amount + (Number(difference) || 0);
  const tickedCount = rows.filter((row) => isTicked(selection, row.id)).length;

  // ---------- Selection ----------

  const toggleContract = (id: string) => {
    const row = contracts.find((item) => item.id === id);
    if (!row) return;
    setSelection((prev) => (isTicked(prev, id) ? withoutKey(prev, id) : { ...prev, [id]: allInvoiceIds(row) }));
  };

  const toggleAllContracts = (checked: boolean) =>
    setSelection((prev) => {
      let next = { ...prev };
      for (const row of paged) next = checked ? { ...next, [row.id]: next[row.id] ?? allInvoiceIds(row) } : withoutKey(next, row.id);
      return next;
    });

  // Unticking a contract's last invoice unticks the contract; ticking one ticks it.
  const toggleInvoice = (contractId: string, invoiceId: string) =>
    setSelection((prev) => {
      const current = prev[contractId] ?? [];
      const next = current.includes(invoiceId) ? current.filter((id) => id !== invoiceId) : [...current, invoiceId];
      return next.length === 0 ? withoutKey(prev, contractId) : { ...prev, [contractId]: next };
    });

  const toggleAllInvoices = (contractId: string, checked: boolean) => {
    const row = contracts.find((item) => item.id === contractId);
    if (!row) return;
    setSelection((prev) => (checked ? { ...prev, [contractId]: allInvoiceIds(row) } : withoutKey(prev, contractId)));
  };

  const toggleExpanded = (id: string) => setExpandedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  // ---------- Commission ----------

  const setCommission = (ids: string[], value: number) =>
    setContracts((prev) => prev.map((row) => (ids.includes(row.id) ? { ...row, commissionPerMt: value } : row)));

  const handleApplyBulk = () => {
    const value = Number(bulk.commission);
    if (bulk.commission === "" || !(value >= 0)) {
      setMessage({ type: "error", text: "Enter the commission per MT to apply (e.g. 50)." });
      return;
    }
    const scope = tickedCount > 0 ? rows.filter((row) => isTicked(selection, row.id)) : rows;
    const targets = scope.filter((row) => (!bulk.commodity || row.commodity === bulk.commodity) && (!bulk.party || row.partyName === bulk.party));
    setCommission(targets.map((row) => row.id), value);
    setMessage({ type: "success", text: `Commission of ₹${value}/MT applied to ${targets.length} contract(s).` });
  };

  // ---------- Filters, save, cancel ----------

  const handleApplyFilters = () => {
    setApplied(draft);
    setPage(1);
    setMessage(null);
  };

  const handleResetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
    setMessage(null);
  };

  const handleSave = () => {
    if (totalQty === 0) {
      setMessage({ type: "error", text: "There is no quantity to estimate — tick at least one contract or invoice." });
      return;
    }
    if (difference !== "" && Number.isNaN(Number(difference))) {
      setMessage({ type: "error", text: "Difference must be a number (use a minus sign for a deduction)." });
      return;
    }
    // TODO: post the estimation to the API once the endpoint is available.
    setMessage({ type: "success", text: `Estimation of ${formatInr(totalAmount)} saved for ${estimate.length} contract(s).`, saved: true });
  };

  const handleCancel = () => {
    setContracts(estimationContracts);
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setSelection({});
    setExpandedIds([]);
    setPage(1);
    setBulk(EMPTY_BULK);
    setDifference("0");
    setRemarks("");
    setMessage(null);
  };

  const listProps = {
    rows: paged,
    selection,
    expandedIds,
    emptyMessage: EMPTY_MESSAGE,
    onToggleContract: toggleContract,
    onToggleExpanded: toggleExpanded,
    onToggleInvoice: toggleInvoice,
    onCommissionChange: (id: string, value: number) => setCommission([id], value),
  };

  return (
    <div className="commission-estimations">
      <EstimationHeader
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible((prev) => !prev)}
        onExport={() => exportEstimations(rows)}
        canExport={rows.length > 0}
        allExpanded={allExpanded}
        onToggleAll={() => setExpandedIds(allExpanded ? [] : paged.map((row) => row.id))}
        canToggle={paged.length > 0}
      />

      {filtersVisible && <EstimationFilters value={draft} partyOptions={partyOptions} onChange={setDraft} onApply={handleApplyFilters} onReset={handleResetFilters} />}

      <div className="commission-estimations__panel">
        <BulkCommissionBar
          value={bulk}
          commodityOptions={uniqueOptions(rows.map((row) => row.commodity))}
          partyOptions={uniqueOptions(rows.map((row) => row.partyName))}
          onChange={setBulk}
          onApply={handleApplyBulk}
        />
        <SummaryCards totalQty={totalQty} averageCommission={averageCommission} amount={amount} />
      </div>

      {message && (
        <p className={`commission-estimations__message commission-estimations__message--${message.type}`} role={message.type === "error" ? "alert" : "status"}>
          {message.type === "success" ? <FiCheckCircle aria-hidden /> : <FiX aria-hidden />} {message.text}
          {message.saved && (
            <Link to="/estimations/view" className="commission-estimations__message-link">
              View Estimations
            </Link>
          )}
        </p>
      )}

      <ContractsTable {...listProps} onToggleAllContracts={toggleAllContracts} onToggleAllInvoices={toggleAllInvoices} />
      <ContractCards {...listProps} />

      <EstimationPagination page={currentPage} pageSize={PAGE_SIZE} total={rows.length} onPageChange={setPage} />

      <EstimationSummary
        lines={summary}
        note={tickedCount > 0 ? `${tickedCount} ticked contract(s), by their ticked invoices` : `All ${rows.length} listed contract(s) — tick rows to estimate only some`}
        difference={difference}
        remarks={remarks}
        totalAmount={totalAmount}
        onDifferenceChange={setDifference}
        onRemarksChange={setRemarks}
      />

      <EstimationFooter onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default CommissionEstimations;
