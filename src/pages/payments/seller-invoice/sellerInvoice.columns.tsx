import { FiLink, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import type { TableColumn } from "../../../components/table/table.types";
import type { SellerInvoiceRow } from "./sellerInvoice.data";

interface ColumnHandlers {
  onFieldChange: <K extends keyof SellerInvoiceRow>(id: string, field: K, value: SellerInvoiceRow[K]) => void;
  /** Link icon — opens the "Select Parties" offcanvas (seller/buyer search). */
  onOpenSelectParties: (row: SellerInvoiceRow) => void;
  /** Search icon — opens the read-only "Contract Details" offcanvas for the row's linked contract. */
  onOpenContractDetails: (row: SellerInvoiceRow) => void;
  /** Toggles the inline "Deductions for this invoice" panel expanded below the row. */
  onToggleDeductions: (row: SellerInvoiceRow) => void;
  onDeleteRow: (row: SellerInvoiceRow) => void;
  onAddRow: () => void;
  /** Only the last row shows the "+" button, so there's a single, unambiguous way to add a row. */
  lastRowId: string | null;
  /** Whether the delete button should be disabled — e.g. when it's the only row left. */
  deleteDisabled: boolean;
  /** Id of the row whose deductions panel is currently expanded, if any. */
  expandedDeductionsRowId: string | null;
  /** Field keys still missing a value per row id, set after a failed Save. */
  invalidFields: Record<string, Set<keyof SellerInvoiceRow>>;
}

function controlClass(row: SellerInvoiceRow, field: keyof SellerInvoiceRow, invalidFields: ColumnHandlers["invalidFields"]) {
  const hasError = invalidFields[row.id]?.has(field);
  return `seller-invoice-table__control${hasError ? " has-error" : ""}`;
}

function textColumn(
  key: keyof SellerInvoiceRow,
  header: string,
  { onFieldChange, invalidFields }: ColumnHandlers,
  options: { placeholder: string; inputMode?: "text" | "numeric" | "decimal"; narrow?: boolean } = {
    placeholder: header,
  },
): TableColumn<SellerInvoiceRow> {
  return {
    key,
    header,
    render: (row) => (
      <input
        type="text"
        inputMode={options.inputMode ?? "text"}
        className={`${controlClass(row, key, invalidFields)}${options.narrow ? " seller-invoice-table__control--narrow" : ""}`}
        placeholder={options.placeholder}
        value={row[key] as string}
        onChange={(event) => onFieldChange(row.id, key, event.target.value)}
      />
    ),
  };
}

export function buildSellerInvoiceColumns(handlers: ColumnHandlers): TableColumn<SellerInvoiceRow>[] {
  const {
    onFieldChange,
    onOpenSelectParties,
    onOpenContractDetails,
    onToggleDeductions,
    onDeleteRow,
    onAddRow,
    lastRowId,
    deleteDisabled,
    expandedDeductionsRowId,
    invalidFields,
  } = handlers;

  return [
    {
      key: "contractNumber",
      header: "Contract #",
      width: "13rem",
      render: (row) => (
        <div className="seller-invoice-table__contract-cell">
          <input
            type="text"
            className={controlClass(row, "contractNumber", invalidFields)}
            placeholder="Contract #"
            value={row.contractNumber}
            onChange={(event) => onFieldChange(row.id, "contractNumber", event.target.value)}
          />
          <button
            type="button"
            className="seller-invoice-table__icon-btn seller-invoice-table__icon-btn--link"
            onClick={() => onOpenSelectParties(row)}
            aria-label="Link contract"
            title="Link Contract"
          >
            <FiLink aria-hidden />
          </button>
          <button
            type="button"
            className="seller-invoice-table__icon-btn seller-invoice-table__icon-btn--search"
            onClick={() => onOpenContractDetails(row)}
            aria-label="Find contract details"
            title={row.contractNumber ? "Find Contract Details" : "Select a contract first"}
            disabled={!row.contractNumber}
          >
            <FiSearch aria-hidden />
          </button>
        </div>
      ),
    },
    {
      key: "deductions",
      header: "Deductions",
      width: "9rem",
      render: (row) => (
        <button
          type="button"
          className="seller-invoice-table__deductions-btn"
          onClick={() => onToggleDeductions(row)}
        >
          {expandedDeductionsRowId === row.id ? "Hide" : "Add"}
        </button>
      ),
    },
    textColumn("invoiceNumber", "Invoice Number", handlers, { placeholder: "Invoice #" }),
    textColumn("truckNumber", "Truck Number", handlers, { placeholder: "Truck #" }),
    textColumn("bags", "No. of Bags", handlers, { placeholder: "Bags", inputMode: "numeric", narrow: true }),
    textColumn("invoiceQty", "Invoice Qty", handlers, { placeholder: "Qty", inputMode: "decimal", narrow: true }),
    textColumn("totalMts", "Total MTs", handlers, { placeholder: "Total MTs", inputMode: "decimal", narrow: true }),
    textColumn("freight", "Freight", handlers, { placeholder: "Freight", inputMode: "decimal", narrow: true }),
    textColumn("invoiceAmount", "Invoice Amount", handlers, { placeholder: "Amount", inputMode: "decimal" }),
    textColumn("remarks", "Remarks", handlers, { placeholder: "Remarks" }),
    {
      key: "actions",
      header: "Actions",
      width: "6.5rem",
      render: (row) => (
        <div className="seller-invoice-table__row-actions">
          <button
            type="button"
            className="seller-invoice-table__icon-btn seller-invoice-table__icon-btn--delete"
            onClick={() => onDeleteRow(row)}
            aria-label="Remove row"
            title="Remove row"
            disabled={deleteDisabled}
          >
            <FiTrash2 aria-hidden />
          </button>
          {row.id === lastRowId && (
            <button
              type="button"
              className="seller-invoice-table__icon-btn seller-invoice-table__icon-btn--add"
              onClick={onAddRow}
              aria-label="Add new row"
              title="Add row"
            >
              <FiPlus aria-hidden />
            </button>
          )}
        </div>
      ),
    },
  ];
}
