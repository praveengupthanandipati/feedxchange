import { useEffect, useMemo, useState } from "react";
import DatePickerInput from "../../../components/dropdown/DatePickerInput";
import { FiCheck, FiCheckCircle, FiPlus, FiX } from "react-icons/fi";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import ContractDetailsOffcanvas from "./ContractDetailsOffcanvas";
import SelectPartiesOffcanvas from "./SelectPartiesOffcanvas";
import InvoiceBlock from "./InvoiceBlock";
import {
  calculateRow,
  createEmptySellerInvoiceRow,
  financialYearOf,
  formatTodayInput,
  hasErrors,
  money,
  problemMessages,
  toRowInput,
  validateRow,
  type SellerInvoiceRow,
} from "./sellerInvoice.data";
import { apiErrorMessage, useLazyGetInvoiceContractDetailsQuery, useSaveInvoicesMutation } from "../../../store/sellerInvoiceApi";
import type { InvoiceContract } from "../../../store/sellerInvoiceApi";
import "./SellerInvoice.scss";

const SellerInvoice = () => {
  const [invoiceDate, setInvoiceDate] = useState(formatTodayInput());
  const [rows, setRows] = useState<SellerInvoiceRow[]>([createEmptySellerInvoiceRow()]);
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState("");

  const [contractDetailsRowId, setContractDetailsRowId] = useState<string | null>(null);
  const [selectPartiesRowId, setSelectPartiesRowId] = useState<string | null>(null);
  const [rowPendingDelete, setRowPendingDelete] = useState<SellerInvoiceRow | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const [lookupContract] = useLazyGetInvoiceContractDetailsQuery();
  const [saveInvoices, { isLoading: saving }] = useSaveInvoicesMutation();

  // The financial year is not chosen: it follows from the invoice date.
  const financialYear = financialYearOf(invoiceDate);

  useEffect(() => {
    if (!saveToast) return;
    const timer = setTimeout(() => setSaveToast(null), 4000);
    return () => clearTimeout(timer);
  }, [saveToast]);

  const patchRow = (id: string, patch: Partial<SellerInvoiceRow>) => setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  /** Typing the invoice quantity fills Total MTs (still editable) until the user types a Total MTs of their own. */
  const handleInvoiceQtyChange = (id: string, value: string) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, invoiceQty: value, totalMts: row.totalMtsEdited ? row.totalMts : value } : row)));

  // a different contract number means the linked contract is no longer known until it is looked up again
  const handleContractNumberChange = (id: string, value: string) => patchRow(id, { contractNumber: value, contract: null, contractError: "" });

  /** The row with a contract linked: the quantity is pre-filled with what is still to be invoiced, and Total MTs follows it. */
  const withContract = (row: SellerInvoiceRow, contract: InvoiceContract): SellerInvoiceRow => {
    const suggested = String(Math.min(contract.pendingQtyMT, contract.maxAllowedQtyMT));
    const qty = row.invoiceQty || suggested;
    return { ...row, contractNumber: contract.contractNumber, contract, contractError: "", invoiceQty: qty, totalMts: row.totalMtsEdited && row.totalMts ? row.totalMts : qty };
  };

  const needsLookup = (row: SellerInvoiceRow) =>
    row.contractNumber.trim() !== "" && !(row.contract && row.contract.contractNumber.toLowerCase() === row.contractNumber.trim().toLowerCase());

  /** Looks a typed contract number up (the rate and GST are needed to calculate the invoice). */
  const resolveContract = async (row: SellerInvoiceRow): Promise<void> => {
    if (!needsLookup(row)) return;
    const number = row.contractNumber.trim();
    try {
      const contract = await lookupContract(number).unwrap();
      setRows((prev) => prev.map((r) => (r.id === row.id ? withContract(r, contract) : r)));
    } catch {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, contract: null, contractError: `Contract ${number} was not found.` } : r)));
    }
  };

  /** Before saving, every typed contract number is looked up; returns the rows as they are afterwards. */
  const resolveAllContracts = async (): Promise<SellerInvoiceRow[]> => {
    const updated = await Promise.all(
      rows.map(async (row) => {
        if (!needsLookup(row)) return row;
        try {
          return withContract(row, await lookupContract(row.contractNumber.trim()).unwrap());
        } catch {
          return { ...row, contract: null, contractError: `Contract ${row.contractNumber.trim()} was not found.` };
        }
      }),
    );
    setRows(updated);
    return updated;
  };

  const handleSelectPartiesSelect = (contract: InvoiceContract) => {
    if (!selectPartiesRowId) return;
    setRows((prev) => prev.map((row) => (row.id === selectPartiesRowId ? withContract(row, contract) : row)));
    setSelectPartiesRowId(null);
  };

  const resetForm = () => {
    setInvoiceDate(formatTodayInput());
    setRows([createEmptySellerInvoiceRow()]);
    setShowErrors(false);
    setServerError("");
  };

  const handleSaveInvoices = async () => {
    setServerError("");
    const latest = await resolveAllContracts();
    if (latest.some((row) => hasErrors(validateRow(row)))) {
      setShowErrors(true);
      return;
    }

    try {
      const result = await saveInvoices({ invoiceDate, rows: latest.map(toRowInput) }).unwrap();
      setSaveToast(`${result.invoices.length} invoice${result.invoices.length === 1 ? "" : "s"} saved successfully.`);
      resetForm();
    } catch (error) {
      setServerError(apiErrorMessage(error, "The invoices could not be saved."));
    }
  };

  const totals = useMemo(() => {
    const all = rows.map(calculateRow).filter((x): x is NonNullable<ReturnType<typeof calculateRow>> => x !== null);
    return { count: rows.length, payable: all.reduce((sum, a) => sum + a.payable, 0) };
  }, [rows]);

  const problems = showErrors ? problemMessages(rows) : [];

  return (
    <div className="seller-invoice-page">
      {saveToast && (
        <div className="seller-invoice-page__toast" role="status">
          <FiCheckCircle aria-hidden />
          {saveToast}
        </div>
      )}

      <div className="si-page-header">
        <div>
          <h1>Seller Invoices</h1>
          <p className="si-muted">Enter the invoices raised by the seller. Amounts, GST and the financial year are worked out for you.</p>
        </div>
        <div className="si-page-header__date">
          <label htmlFor="seller-invoice-date">Invoice date</label>
          <DatePickerInput id="seller-invoice-date" value={invoiceDate} onChange={(value) => setInvoiceDate(value)} />
          <span className="si-muted" title="Worked out from the invoice date (April to March)">
            Financial year: <strong>{financialYear || "—"}</strong>
          </span>
        </div>
      </div>

      <div className="si-invoices">
        {rows.map((row, index) => (
          <InvoiceBlock
            key={row.id}
            index={index + 1}
            row={row}
            invoiceDate={invoiceDate}
            showErrors={showErrors}
            canRemove={rows.length > 1}
            onChange={patchRow}
            onInvoiceQtyChange={handleInvoiceQtyChange}
            onContractNumberChange={handleContractNumberChange}
            onContractLeave={(r) => void resolveContract(r)}
            onFindContract={(r) => setSelectPartiesRowId(r.id)}
            onContractDetails={(r) => setContractDetailsRowId(r.id)}
            onRemove={setRowPendingDelete}
          />
        ))}
      </div>

      <button type="button" className="si-add-invoice" onClick={() => setRows((prev) => [...prev, createEmptySellerInvoiceRow()])}>
        <FiPlus aria-hidden /> Add another invoice
      </button>

      {(serverError || problems.length > 0) && (
        <div className="si-banner si-banner--error" role="alert">
          {serverError ? (
            <p>{serverError}</p>
          ) : (
            <>
              <p>Please fix the highlighted fields:</p>
              <ul>
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="si-footer">
        <p>
          <strong>{totals.count}</strong> invoice{totals.count === 1 ? "" : "s"} · Payable <strong>{money(totals.payable)}</strong>
        </p>
        <div className="si-footer__actions">
          <button type="button" className="si-btn si-btn--secondary" onClick={resetForm} disabled={saving}>
            <FiX aria-hidden /> Cancel
          </button>
          <button type="button" className="si-btn si-btn--primary" onClick={() => void handleSaveInvoices()} disabled={saving}>
            <FiCheck aria-hidden /> {saving ? "Saving…" : "Save Invoices"}
          </button>
        </div>
      </div>

      <ContractDetailsOffcanvas
        open={contractDetailsRowId !== null}
        contractNumber={rows.find((row) => row.id === contractDetailsRowId)?.contractNumber ?? ""}
        onClose={() => setContractDetailsRowId(null)}
      />

      <SelectPartiesOffcanvas open={selectPartiesRowId !== null} onClose={() => setSelectPartiesRowId(null)} onSelect={handleSelectPartiesSelect} />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove this invoice?"
        message="This will remove the invoice and its deductions from the form. This cannot be undone."
        confirmLabel="Remove"
        onConfirm={() => {
          if (rowPendingDelete) setRows((prev) => prev.filter((row) => row.id !== rowPendingDelete.id));
          setRowPendingDelete(null);
        }}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default SellerInvoice;
