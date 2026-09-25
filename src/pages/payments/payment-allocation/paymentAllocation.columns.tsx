import { FiExternalLink } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import type { TableColumn } from "../../../components/table/table.types";
import {
  money,
  receiptOptions,
  type AllocationEntries,
  type AllocationRowErrors,
  type PendingContractRow,
  type PendingInvoiceRow,
} from "./paymentAllocation.data";

export interface ColumnHandlers {
  entries: AllocationEntries;
  errors: Record<string, AllocationRowErrors>;
  onAmountChange: (rowId: string, value: string) => void;
  onReceiptChange: (rowId: string, receiptId: string) => void;
  onOpenReceipt: (receiptId: string) => void;
}

/** The two editable columns every pending list ends with. */
function entryColumns<T extends { id: string }>({
  entries,
  errors,
  onAmountChange,
  onReceiptChange,
  onOpenReceipt,
}: ColumnHandlers): TableColumn<T>[] {
  return [
    {
      key: "amount",
      header: "Amount",
      render: (row) => {
        const error = errors[row.id]?.amount;
        return (
          <div className="payment-allocation-cell">
            <input
              type="text"
              inputMode="decimal"
              className={`payment-allocation-cell__input${error ? " has-error" : ""}`}
              placeholder="Enter Amount"
              value={entries[row.id]?.amount ?? ""}
              onChange={(event) => onAmountChange(row.id, event.target.value)}
              aria-label={`Amount for ${row.id}`}
              aria-invalid={error ? true : undefined}
            />
            {error && <span className="payment-allocation-cell__error">{error}</span>}
          </div>
        );
      },
    },
    {
      key: "receipt",
      header: "Select Receipt",
      render: (row) => {
        const receiptId = entries[row.id]?.receiptId ?? "";
        const error = errors[row.id]?.receipt;
        return (
          <div className="payment-allocation-cell">
            <div className="payment-allocation-cell__receipt">
              <div className={`payment-allocation-cell__select${error ? " has-error" : ""}`}>
                <SearchableSelect
                  options={receiptOptions}
                  value={receiptId}
                  onChange={(value) => onReceiptChange(row.id, value)}
                  placeholder="Select Receipt"
                  ariaLabel={`Select receipt for ${row.id}`}
                />
              </div>
              <button
                type="button"
                className="payment-allocation-cell__more"
                onClick={() => onOpenReceipt(receiptId)}
                disabled={!receiptId}
                aria-label="View receipt details"
                title={receiptId ? "View receipt details" : "Select a receipt first"}
              >
                <FiExternalLink aria-hidden />
              </button>
            </div>
            {error && <span className="payment-allocation-cell__error">{error}</span>}
          </div>
        );
      },
    },
  ];
}

export function buildContractColumns(handlers: ColumnHandlers): TableColumn<PendingContractRow>[] {
  return [
    { key: "contractNumber", header: "Contract #", sortable: true },
    { key: "contractValue", header: "Contract Value", sortable: true, render: (row) => money(row.contractValue) },
    {
      key: "immediateAdvance",
      header: "Immediate Advance",
      sortable: true,
      render: (row) => money(row.immediateAdvance),
    },
    { key: "balanceAdvance", header: "Balance Advance", sortable: true, render: (row) => money(row.balanceAdvance) },
    { key: "paid", header: "Paid", sortable: true, render: (row) => money(row.paid) },
    ...entryColumns<PendingContractRow>(handlers),
  ];
}

export function buildInvoiceColumns(handlers: ColumnHandlers): TableColumn<PendingInvoiceRow>[] {
  return [
    { key: "date", header: "Date", sortable: true, sortValue: (row) => row.date.split("-").reverse().join("") },
    { key: "contractNumber", header: "Contract #", sortable: true },
    { key: "invoiceNumber", header: "Invoice #", sortable: true },
    { key: "invoiceAmount", header: "Invoice Amount", sortable: true, render: (row) => money(row.invoiceAmount) },
    { key: "amountToPay", header: "Amount to Pay", sortable: true, render: (row) => money(row.amountToPay) },
    { key: "paid", header: "Paid", sortable: true, render: (row) => money(row.paid) },
    { key: "balance", header: "Balance", sortable: true, render: (row) => money(row.balance) },
    ...entryColumns<PendingInvoiceRow>(handlers),
  ];
}
