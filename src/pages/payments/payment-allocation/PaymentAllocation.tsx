import { useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiInfo,
  FiLayers,
  FiX,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import { buildContractColumns, buildInvoiceColumns } from "./paymentAllocation.columns";
import {
  allocationModes,
  buyerOptions,
  defaultBuyer,
  defaultSeller,
  seedContractRows,
  seedInvoiceRows,
  sellerOptions,
  validateEntries,
  type AllocationEntries,
  type AllocationMode,
  type AllocationRowErrors,
  type PendingContractRow,
  type PendingInvoiceRow,
} from "./paymentAllocation.data";
import ReceiptDetailsOffcanvas from "./ReceiptDetailsOffcanvas";
import "./PaymentAllocation.scss";

const PAGE_SIZE = 8;

const modeIcons: Record<AllocationMode, IconType> = {
  general: FiLayers,
  invoices: FiFileText,
  contracts: FiFileText,
};

const PaymentAllocation = () => {
  const [seller, setSeller] = useState(defaultSeller);
  const [buyer, setBuyer] = useState(defaultBuyer);
  const [mode, setMode] = useState<AllocationMode>("contracts");

  const [contractRows, setContractRows] = useState<PendingContractRow[]>(seedContractRows);
  const [invoiceRows, setInvoiceRows] = useState<PendingInvoiceRow[]>(seedInvoiceRows);

  const [entries, setEntries] = useState<AllocationEntries>({});
  const [errors, setErrors] = useState<Record<string, AllocationRowErrors>>({});
  const [formError, setFormError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptDetailsId, setReceiptDetailsId] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (!saveToast) return;
    const timer = setTimeout(() => setSaveToast(false), 3000);
    return () => clearTimeout(timer);
  }, [saveToast]);

  const clearEntries = () => {
    setEntries({});
    setErrors({});
    setFormError("");
  };

  useEffect(() => {
    setCurrentPage(1);
    clearEntries();
  }, [seller, buyer]);

  useEffect(() => {
    setCurrentPage(1);
    setFormError("");
  }, [mode]);

  const visibleContracts = useMemo(
    () => contractRows.filter((row) => row.seller === seller && row.buyer === buyer),
    [contractRows, seller, buyer],
  );
  const visibleInvoices = useMemo(
    () => invoiceRows.filter((row) => row.seller === seller && row.buyer === buyer),
    [invoiceRows, seller, buyer],
  );

  const activeCount = mode === "contracts" ? visibleContracts.length : visibleInvoices.length;
  const totalPages = Math.max(1, Math.ceil(activeCount / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pageStart = (currentPageClamped - 1) * PAGE_SIZE;
  const pagedContracts = visibleContracts.slice(pageStart, pageStart + PAGE_SIZE);
  const pagedInvoices = visibleInvoices.slice(pageStart, pageStart + PAGE_SIZE);

  const updateEntry = (rowId: string, patch: Partial<AllocationEntries[string]>) => {
    setEntries((prev) => {
      const current = prev[rowId] ?? { amount: "", receiptId: "" };
      return { ...prev, [rowId]: { ...current, ...patch } };
    });
    setErrors((prev) => {
      if (!prev[rowId]) return prev;
      const { [rowId]: _cleared, ...rest } = prev;
      return rest;
    });
    setFormError("");
  };

  const columnHandlers = {
    entries,
    errors,
    onAmountChange: (rowId: string, value: string) => updateEntry(rowId, { amount: value.replace(/[^0-9.]/g, "") }),
    onReceiptChange: (rowId: string, receiptId: string) => updateEntry(rowId, { receiptId }),
    onOpenReceipt: setReceiptDetailsId,
  };

  const contractColumns = buildContractColumns(columnHandlers);
  const invoiceColumns = buildInvoiceColumns(columnHandlers);

  const handleSave = () => {
    const rowIds = (mode === "contracts" ? visibleContracts : visibleInvoices).map((row) => row.id);
    const { errors: nextErrors, filledCount } = validateEntries(entries, rowIds);
    setErrors(nextErrors);

    if (filledCount === 0) {
      setFormError("Enter an amount and select a receipt for at least one row.");
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setFormError("Fix the highlighted rows before saving.");
      return;
    }

    // TODO: wire up to the payments API once available.
    const allocated = (id: string) => Number(entries[id]?.amount) || 0;
    if (mode === "contracts") {
      setContractRows((prev) => prev.map((row) => ({ ...row, paid: row.paid + allocated(row.id) })));
    } else {
      setInvoiceRows((prev) =>
        prev.map((row) => ({ ...row, paid: row.paid + allocated(row.id), balance: row.balance - allocated(row.id) })),
      );
    }
    clearEntries();
    setSaveToast(true);
  };

  const isGeneral = mode === "general";

  return (
    <div className="payment-allocation-page">
      {saveToast && (
        <div className="payment-allocation-page__toast" role="status">
          <FiCheckCircle aria-hidden />
          Payment allocation saved successfully.
        </div>
      )}

      <section className="payment-allocation-card" aria-labelledby="payment-allocation-title">
        <h1 id="payment-allocation-title" className="payment-allocation-card__title">
          Payment Allocations
        </h1>

        <div className="payment-allocation-parties">
          <SearchableSelect
            options={sellerOptions}
            value={seller}
            onChange={setSeller}
            placeholder="Select Seller"
            ariaLabel="Select Seller"
          />
          <SearchableSelect
            options={buyerOptions}
            value={buyer}
            onChange={setBuyer}
            placeholder="Select Buyer"
            ariaLabel="Select Buyer"
          />
        </div>

        <fieldset className="payment-allocation-mode">
          <legend className="payment-allocation-mode__legend">Payment Advice For</legend>
          <div className="payment-allocation-mode__options">
            {allocationModes.map((option) => {
              const Icon = modeIcons[option.value];
              return (
                <label className="payment-allocation-mode__option" key={option.value}>
                  <input
                    type="radio"
                    name="payment-allocation-mode"
                    value={option.value}
                    checked={mode === option.value}
                    onChange={() => setMode(option.value)}
                  />
                  <span className="payment-allocation-mode__pill">
                    <Icon aria-hidden />
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <dl className="payment-allocation-parties-summary">
          <div>
            <dt>Seller:</dt>
            <dd>{seller || "—"}</dd>
          </div>
          <div>
            <dt>Buyer:</dt>
            <dd>{buyer || "—"}</dd>
          </div>
        </dl>

        {isGeneral && (
          <p className="payment-allocation-card__hint" role="status">
            <FiInfo aria-hidden />
            General payments are not tied to a specific invoice or contract. Choose Pending Invoices or Pending
            Contracts to allocate a receipt.
          </p>
        )}

        {mode === "contracts" && (
          <Table
            columns={contractColumns}
            data={pagedContracts}
            rowKey={(row) => row.id}
            emptyMessage="No pending contracts for the selected seller and buyer."
            className="payment-allocation-table"
          />
        )}
        {mode === "invoices" && (
          <Table
            columns={invoiceColumns}
            data={pagedInvoices}
            rowKey={(row) => row.id}
            emptyMessage="No pending invoices for the selected seller and buyer."
            className="payment-allocation-table"
          />
        )}

        {formError && (
          <p className="payment-allocation-card__error" role="alert">
            {formError}
          </p>
        )}

        {!isGeneral && (
          <div className="payment-allocation-pagination">
            <p>
              {activeCount === 0
                ? "Showing 0 Results"
                : `Showing ${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, activeCount)} of ${activeCount} Results`}
            </p>
            <div className="payment-allocation-pagination__controls">
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
        )}
      </section>

      <div className="payment-allocation-actions">
        <button type="button" className="payment-allocation-actions__cancel" onClick={clearEntries}>
          <FiX aria-hidden /> Cancel
        </button>
        <button
          type="button"
          className="payment-allocation-actions__save"
          onClick={handleSave}
          disabled={isGeneral}
          title={isGeneral ? "Nothing to allocate for General payments" : undefined}
        >
          <FiCheck aria-hidden /> Save
        </button>
      </div>

      <ReceiptDetailsOffcanvas
        open={receiptDetailsId !== null}
        receiptId={receiptDetailsId ?? ""}
        onClose={() => setReceiptDetailsId(null)}
      />
    </div>
  );
};

export default PaymentAllocation;
