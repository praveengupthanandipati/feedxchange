import { useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import RefundDialog, { type RefundDialogMode } from "./RefundDialog";
import { buildRefundColumns } from "./refunds.columns";
import {
  buyerOptions,
  defaultBuyer,
  defaultSeller,
  emptyRefundForm,
  nextRefundId,
  refundToForm,
  seedRefundRows,
  sellerOptions,
  type RefundFormValues,
  type RefundRow,
} from "./refunds.data";
import "./Refunds.scss";

const PAGE_SIZE = 10;

interface Filters {
  seller: string;
  buyer: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: Filters = { seller: defaultSeller, buyer: defaultBuyer, dateFrom: "", dateTo: "" };
const clearedFilters: Filters = { seller: "", buyer: "", dateFrom: "", dateTo: "" };

interface DialogState {
  mode: RefundDialogMode;
  row: RefundRow | null;
  initialValues: RefundFormValues;
}

const Refunds = () => {
  const [rows, setRows] = useState<RefundRow[]>(seedRefundRows);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<Filters>(defaultFilters);
  const [applied, setApplied] = useState<Filters>(defaultFilters);
  const [filterError, setFilterError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [rowPendingDelete, setRowPendingDelete] = useState<RefundRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [applied]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (applied.seller && row.seller !== applied.seller) return false;
        if (applied.buyer && row.buyer !== applied.buyer) return false;
        if (applied.dateFrom && row.date < applied.dateFrom) return false;
        if (applied.dateTo && row.date > applied.dateTo) return false;
        return true;
      }),
    [rows, applied],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pageStart = (currentPageClamped - 1) * PAGE_SIZE;
  const pagedRows = filteredRows.slice(pageStart, pageStart + PAGE_SIZE);

  const setDraftField = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setFilterError("");
  };

  const handleApply = () => {
    if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
      setFilterError("The From date must be on or before the To date.");
      return;
    }
    setApplied(draft);
    setNotice("");
  };

  const handleReset = () => {
    setDraft(clearedFilters);
    setApplied(clearedFilters);
    setFilterError("");
    setNotice("");
  };

  const handleNew = () => {
    if (!applied.seller || !applied.buyer) {
      setFiltersVisible(true);
      setNotice("Select a seller and a buyer and click Apply before adding a refund.");
      return;
    }
    setNotice("");
    setDialog({ mode: "new", row: null, initialValues: emptyRefundForm() });
  };

  const handleSubmitDialog = (values: RefundFormValues) => {
    if (!dialog) return;
    const base = {
      date: values.date,
      refNumber: values.refNumber.trim(),
      payType: values.payType,
      amountPaid: Number(values.amountPaid),
      difference: Number(values.difference) || 0,
      remarks: values.remarks.trim(),
    };

    // TODO: wire up to the payments API once available.
    if (dialog.mode === "edit" && dialog.row) {
      const target = dialog.row;
      setRows((prev) => prev.map((row) => (row.id === target.id ? { ...row, ...base } : row)));
      setToast("Refund updated successfully.");
    } else {
      setRows((prev) => [{ id: nextRefundId(), seller: applied.seller, buyer: applied.buyer, ...base }, ...prev]);
      setToast("Refund added successfully.");
    }
    setDialog(null);
  };

  const handleConfirmDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((row) => row.id !== rowPendingDelete.id));
    setRowPendingDelete(null);
    setToast("Refund deleted.");
  };

  const columns = useMemo(
    () =>
      buildRefundColumns({
        onView: (row) => setDialog({ mode: "view", row, initialValues: refundToForm(row) }),
        onEdit: (row) => setDialog({ mode: "edit", row, initialValues: refundToForm(row) }),
        onDelete: setRowPendingDelete,
      }),
    [],
  );

  return (
    <div className="refunds-page">
      {toast && (
        <div className="refunds-page__toast" role="status">
          <FiCheckCircle aria-hidden />
          {toast}
        </div>
      )}

      <section className="refunds-card" aria-labelledby="refunds-title">
        <div className="refunds-card__header">
          <h1 id="refunds-title">Credit Balance Refund</h1>
          <div className="refunds-card__actions">
            <button
              type="button"
              className="refunds-btn refunds-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
              aria-expanded={filtersVisible}
              aria-controls="refunds-filters"
            >
              <FiFilter aria-hidden /> Filters
            </button>
            <button type="button" className="refunds-btn refunds-btn--primary" onClick={handleNew}>
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="refunds-filters" id="refunds-filters">
            <div className="refunds-filters__field">
              <SearchableSelect
                options={sellerOptions}
                value={draft.seller}
                onChange={(value) => setDraftField("seller", value)}
                placeholder="Select Seller"
                ariaLabel="Select Seller"
                clearable
              />
            </div>
            <div className="refunds-filters__field">
              <SearchableSelect
                options={buyerOptions}
                value={draft.buyer}
                onChange={(value) => setDraftField("buyer", value)}
                placeholder="Select Buyer"
                ariaLabel="Select Buyer"
                clearable
              />
            </div>
            <div className="refunds-filters__dates" role="group" aria-label="Payment date range">
              <input
                type="date"
                value={draft.dateFrom}
                onChange={(event) => setDraftField("dateFrom", event.target.value)}
                aria-label="From date"
              />
              <span aria-hidden>to</span>
              <input
                type="date"
                value={draft.dateTo}
                onChange={(event) => setDraftField("dateTo", event.target.value)}
                aria-label="To date"
              />
            </div>
            <div className="refunds-filters__buttons">
              <button type="button" className="refunds-btn refunds-btn--primary" onClick={handleApply}>
                <FiCheck aria-hidden /> Apply
              </button>
              <button type="button" className="refunds-btn refunds-btn--danger" onClick={handleReset}>
                <FiRefreshCw aria-hidden /> Reset
              </button>
            </div>
            {filterError && (
              <p className="refunds-filters__error" role="alert">
                {filterError}
              </p>
            )}
          </div>
        )}

        <dl className="refunds-summary">
          <div>
            <dt>Seller:</dt>
            <dd>{applied.seller || "All"}</dd>
          </div>
          <div>
            <dt>Buyer:</dt>
            <dd>{applied.buyer || "All"}</dd>
          </div>
        </dl>

        {notice && (
          <p className="refunds-card__notice" role="alert">
            {notice}
          </p>
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No refunds match the current filters."
          className="refunds-table"
        />

        <div className="refunds-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredRows.length)} of ${
                  filteredRows.length
                } Results`}
          </p>
          <div className="refunds-pagination__controls">
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
      </section>

      <RefundDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "new"}
        initialValues={dialog?.initialValues ?? emptyRefundForm()}
        seller={dialog?.row?.seller ?? applied.seller}
        buyer={dialog?.row?.buyer ?? applied.buyer}
        onSubmit={handleSubmitDialog}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Delete this refund?"
        message={`This will remove refund ${rowPendingDelete?.refNumber ?? ""}. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default Refunds;
