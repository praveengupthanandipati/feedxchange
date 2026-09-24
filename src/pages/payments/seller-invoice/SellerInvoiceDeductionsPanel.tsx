import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { deductionsTotal, formatTodayInput, nextDeductionId, type DeductionEntry } from "./sellerInvoice.data";
import "./SellerInvoiceDeductionsPanel.scss";

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

interface SellerInvoiceDeductionsPanelProps {
  deductions: DeductionEntry[];
  onSubmit: (deductions: DeductionEntry[]) => void;
  onCancel: () => void;
}

const emptyDraft = () => ({
  date: formatTodayInput(),
  amount: "",
  tdsTcs: false,
  remarks: "",
});

const SellerInvoiceDeductionsPanel = ({ deductions, onSubmit, onCancel }: SellerInvoiceDeductionsPanelProps) => {
  const [entries, setEntries] = useState<DeductionEntry[]>(deductions);
  const [draft, setDraft] = useState(emptyDraft);

  const handleAdd = () => {
    if (!draft.amount.trim()) return;
    setEntries((prev) => [...prev, { id: nextDeductionId(), ...draft }]);
    setDraft(emptyDraft());
  };

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <div className="seller-invoice-deductions-panel">
      <h3 className="seller-invoice-deductions-panel__heading">Deductions for this invoice</h3>

      {entries.length > 0 && (
        <div className="seller-invoice-deductions-panel__list">
          {entries.map((entry) => (
            <div className="seller-invoice-deductions-panel__list-row" key={entry.id}>
              <span>{entry.date}</span>
              <span className="seller-invoice-deductions-panel__list-amount">
                {money(Number(entry.amount) || 0)}
                {entry.tdsTcs && <span className="seller-invoice-deductions-panel__list-badge">TDS/TCS</span>}
              </span>
              <span className="seller-invoice-deductions-panel__list-remarks">{entry.remarks || "—"}</span>
              <button
                type="button"
                className="seller-invoice-deductions-panel__list-remove"
                onClick={() => handleRemove(entry.id)}
                aria-label="Remove deduction"
              >
                <FiTrash2 aria-hidden />
              </button>
            </div>
          ))}
          <div className="seller-invoice-deductions-panel__list-total">
            Total Deductions: <strong>{money(deductionsTotal(entries))}</strong>
          </div>
        </div>
      )}

      <div className="seller-invoice-deductions-panel__fields">
        <div className="seller-invoice-deductions-panel__field">
          <label htmlFor="deduction-date">Date of Deduction</label>
          <input
            id="deduction-date"
            type="date"
            value={draft.date}
            onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
          />
        </div>

        <div className="seller-invoice-deductions-panel__field">
          <label htmlFor="deduction-amount">Deduction Amount</label>
          <input
            id="deduction-amount"
            type="text"
            inputMode="decimal"
            placeholder="Enter amount"
            value={draft.amount}
            onChange={(event) => setDraft((prev) => ({ ...prev, amount: event.target.value }))}
          />
        </div>

        <div className="seller-invoice-deductions-panel__field">
          <label htmlFor="deduction-remarks">Remarks</label>
          <input
            id="deduction-remarks"
            type="text"
            placeholder="Enter remarks"
            value={draft.remarks}
            onChange={(event) => setDraft((prev) => ({ ...prev, remarks: event.target.value }))}
          />
        </div>

        <button type="button" className="seller-invoice-deductions-panel__add-btn" onClick={handleAdd}>
          <FiPlus aria-hidden /> Add
        </button>
      </div>

      <label className="seller-invoice-deductions-panel__tds-toggle">
        <input
          type="checkbox"
          checked={draft.tdsTcs}
          onChange={(event) => setDraft((prev) => ({ ...prev, tdsTcs: event.target.checked }))}
        />
        <span className="seller-invoice-deductions-panel__tds-switch" aria-hidden />
        Add TDS/TCS
      </label>

      <div className="seller-invoice-deductions-panel__actions">
        <button
          type="button"
          className="seller-invoice-deductions-panel__submit"
          onClick={() => onSubmit(entries)}
        >
          Submit Deductions
        </button>
        <button type="button" className="seller-invoice-deductions-panel__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SellerInvoiceDeductionsPanel;
