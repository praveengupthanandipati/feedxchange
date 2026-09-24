import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiCheckCircle, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import ContractDetailsOffcanvas from "./ContractDetailsOffcanvas";
import SelectPartiesOffcanvas from "./SelectPartiesOffcanvas";
import SellerInvoiceDeductionsPanel from "./SellerInvoiceDeductionsPanel";
import { buildSellerInvoiceColumns } from "./sellerInvoice.columns";
import {
  createEmptySellerInvoiceRow,
  financialYearOptions,
  formatTodayInput,
  getMissingSellerInvoiceFields,
  type ContractLookupRow,
  type DeductionEntry,
  type SellerInvoiceRow,
} from "./sellerInvoice.data";
import "./SellerInvoice.scss";

const PAGE_SIZE = 8;

const SellerInvoice = () => {
  const [invoiceDate, setInvoiceDate] = useState(formatTodayInput());
  const [financialYear, setFinancialYear] = useState("");
  const [rows, setRows] = useState<SellerInvoiceRow[]>([createEmptySellerInvoiceRow()]);
  const [currentPage, setCurrentPage] = useState(1);
  const [invalidFields, setInvalidFields] = useState<Record<string, Set<keyof SellerInvoiceRow>>>({});

  const [contractDetailsRowId, setContractDetailsRowId] = useState<string | null>(null);
  const [selectPartiesRowId, setSelectPartiesRowId] = useState<string | null>(null);
  const [expandedDeductionsRowId, setExpandedDeductionsRowId] = useState<string | null>(null);
  const [rowPendingDelete, setRowPendingDelete] = useState<SellerInvoiceRow | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (!saveToast) return;
    const timer = setTimeout(() => setSaveToast(false), 3000);
    return () => clearTimeout(timer);
  }, [saveToast]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = rows.slice((currentPageClamped - 1) * PAGE_SIZE, currentPageClamped * PAGE_SIZE);

  const handleFieldChange: <K extends keyof SellerInvoiceRow>(
    id: string,
    field: K,
    value: SellerInvoiceRow[K],
  ) => void = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    setInvalidFields((prev) => {
      const rowInvalid = prev[id];
      if (!rowInvalid?.has(field)) return prev;
      const next = new Set(rowInvalid);
      next.delete(field);
      return { ...prev, [id]: next };
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptySellerInvoiceRow()]);
    setCurrentPage(Math.max(1, Math.ceil((rows.length + 1) / PAGE_SIZE)));
  };

  const handleConfirmDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((row) => row.id !== rowPendingDelete.id));
    setInvalidFields((prev) => {
      const { [rowPendingDelete.id]: _removed, ...rest } = prev;
      return rest;
    });
    setExpandedDeductionsRowId((prev) => (prev === rowPendingDelete.id ? null : prev));
    setRowPendingDelete(null);
  };

  const applyContractToRow = (rowId: string, contract: ContractLookupRow) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              contractNumber: contract.contractNumber,
              invoiceQty: row.invoiceQty || String(contract.balanceQty),
              totalMts: row.totalMts || String(contract.balanceQty),
            }
          : row,
      ),
    );
    setInvalidFields((prev) => {
      const rowInvalid = prev[rowId];
      if (!rowInvalid?.has("contractNumber")) return prev;
      const next = new Set(rowInvalid);
      next.delete("contractNumber");
      return { ...prev, [rowId]: next };
    });
  };

  const handleSelectPartiesSelect = (contract: ContractLookupRow) => {
    if (!selectPartiesRowId) return;
    applyContractToRow(selectPartiesRowId, contract);
    setSelectPartiesRowId(null);
  };

  const handleToggleDeductions = (row: SellerInvoiceRow) => {
    setExpandedDeductionsRowId((prev) => (prev === row.id ? null : row.id));
  };

  const handleDeductionsSubmit = (rowId: string, deductions: DeductionEntry[]) => {
    // Keep the panel open on submit so the saved list stays visible — closing
    // it here would hide the very list the user just submitted.
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, deductions } : row)));
  };

  const handleCancel = () => {
    setInvoiceDate(formatTodayInput());
    setFinancialYear("");
    setRows([createEmptySellerInvoiceRow()]);
    setInvalidFields({});
    setCurrentPage(1);
  };

  const handleSaveInvoices = () => {
    const nextInvalid: Record<string, Set<keyof SellerInvoiceRow>> = {};
    let allValid = true;

    rows.forEach((row) => {
      const missing = getMissingSellerInvoiceFields(row);
      nextInvalid[row.id] = missing;
      if (missing.size > 0) allValid = false;
    });

    setInvalidFields(nextInvalid);
    if (!allValid) return;

    // TODO: wire up to the payments API once available.
    setSaveToast(true);
  };

  const columns = useMemo(
    () =>
      buildSellerInvoiceColumns({
        onFieldChange: handleFieldChange,
        onOpenSelectParties: (row) => setSelectPartiesRowId(row.id),
        onOpenContractDetails: (row) => setContractDetailsRowId(row.id),
        onToggleDeductions: handleToggleDeductions,
        onDeleteRow: setRowPendingDelete,
        onAddRow: handleAddRow,
        lastRowId: rows.length > 0 ? rows[rows.length - 1].id : null,
        deleteDisabled: rows.length === 1,
        expandedDeductionsRowId,
        invalidFields,
      }),
    [rows, invalidFields, expandedDeductionsRowId],
  );

  return (
    <div className="seller-invoice-page">
      {saveToast && (
        <div className="seller-invoice-page__toast" role="status">
          <FiCheckCircle aria-hidden />
          Invoices saved successfully.
        </div>
      )}

      <div className="seller-invoice-card">
        <div className="seller-invoice-card__header">
          <h1>Seller Invoices</h1>
        </div>

        <div className="seller-invoice-card__top-fields">
          <div className="form-field">
            {/* <label className="form-field__label" htmlFor="seller-invoice-date">
              Invoice Date
            </label> */}
            <input
              id="seller-invoice-date"
              type="date"
              className="form-field__control"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
            />
          </div>

          <div className="form-field">
            {/* <span className="form-field__label">Financial Year</span> */}
            <SearchableSelect
              options={financialYearOptions}
              value={financialYear}
              onChange={setFinancialYear}
              placeholder="Select financial year"
              ariaLabel="Select financial year"
              clearable
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No invoice rows yet. Use the + button to add one."
          className="seller-invoice-table"
          expandedRowKey={expandedDeductionsRowId}
          renderExpandedRow={(row) => (
            <SellerInvoiceDeductionsPanel
              deductions={row.deductions}
              onSubmit={(entries) => handleDeductionsSubmit(row.id, entries)}
              onCancel={() => setExpandedDeductionsRowId(null)}
            />
          )}
        />

        <div className="seller-invoice-pagination">
          <p>
            {rows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  rows.length,
                )} of ${rows.length} Results`}
          </p>
          <div className="seller-invoice-pagination__controls">
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
      </div>

      <div className="seller-invoice-actions">
        <button type="button" className="seller-invoice-actions__cancel" onClick={handleCancel}>
          <FiX aria-hidden /> Cancel
        </button>
        <button type="button" className="seller-invoice-actions__save" onClick={handleSaveInvoices}>
          <FiCheck aria-hidden /> Save Invoices
        </button>
      </div>

      <ContractDetailsOffcanvas
        open={contractDetailsRowId !== null}
        contractNumber={rows.find((row) => row.id === contractDetailsRowId)?.contractNumber ?? ""}
        onClose={() => setContractDetailsRowId(null)}
      />

      <SelectPartiesOffcanvas
        open={selectPartiesRowId !== null}
        onClose={() => setSelectPartiesRowId(null)}
        onSelect={handleSelectPartiesSelect}
      />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove this invoice row?"
        message="This will remove the invoice row and any deductions added to it. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default SellerInvoice;
