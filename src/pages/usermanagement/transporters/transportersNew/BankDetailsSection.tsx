import { useState } from "react";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { accountTypeOptions, ifscLookup } from "./newTransporter.data";

interface BankEntry {
  id: string;
  accountType: string;
  payeeName: string;
  payeeAccountNumber: string;
  ifscCode: string;
  bankName: string;
  cityBranch: string;
  ifscError: string;
}

let seq = 0;
const nextId = () => `bank-${Date.now()}-${seq++}`;

const emptyEntry = (): BankEntry => ({
  id: nextId(),
  accountType: "",
  payeeName: "",
  payeeAccountNumber: "",
  ifscCode: "",
  bankName: "",
  cityBranch: "",
  ifscError: "",
});

const BankDetailsSection = () => {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addEntry = () => {
    const entry = emptyEntry();
    setEntries((prev) => [...prev, entry]);
    if (entries.length === 0) setPrimaryId(entry.id);
  };

  const confirmRemoveEntry = () => {
    setEntries((prev) => prev.filter((entry) => entry.id !== pendingDeleteId));
    setPrimaryId((prev) => (prev === pendingDeleteId ? null : prev));
    setPendingDeleteId(null);
  };

  const updateEntry = (id: string, patch: Partial<BankEntry>) =>
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const lookupIfsc = (id: string, ifscCode: string) => {
    const match = ifscLookup[ifscCode.trim().toUpperCase()];
    if (match) {
      updateEntry(id, { bankName: match.bankName, cityBranch: match.branch, ifscError: "" });
    } else {
      updateEntry(id, { ifscError: "IFSC code not found" });
    }
  };

  return (
    <div>
      <h3 className="form-subheading">Bank Account Details</h3>

      {entries.length === 0 ? (
        <EmptyRowsState onAdd={addEntry} message="No Data available" />
      ) : (
        <>
          <div className="repeatable-entries">
            {entries.map((entry) => (
              <div className="repeatable-entry" key={entry.id}>
                <div className="new-contract__grid">
                  <div className="form-field">
                    <span className="form-field__label">Select Account Type</span>
                    <SearchableSelect
                      options={accountTypeOptions}
                      value={entry.accountType}
                      onChange={(value) => updateEntry(entry.id, { accountType: value })}
                      ariaLabel="Select Account Type"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Payee Name</label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Payee Name"
                      value={entry.payeeName}
                      onChange={(event) => updateEntry(entry.id, { payeeName: event.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Payee Account Number</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-field__control"
                      placeholder="Payee Account Number"
                      value={entry.payeeAccountNumber}
                      onChange={(event) =>
                        updateEntry(entry.id, { payeeAccountNumber: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">IFSC Code</label>
                    <div className="form-field__with-action">
                      <input
                        type="text"
                        className="form-field__control"
                        value={entry.ifscCode}
                        onChange={(event) =>
                          updateEntry(entry.id, {
                            ifscCode: event.target.value.toUpperCase(),
                            ifscError: "",
                          })
                        }
                      />
                      <button
                        type="button"
                        className="form-field__action"
                        onClick={() => lookupIfsc(entry.id, entry.ifscCode)}
                        aria-label="Look up IFSC code"
                        title="Look up bank details for this IFSC code"
                      >
                        <FiSearch aria-hidden />
                      </button>
                    </div>
                    {entry.ifscError && (
                      <p className="form-field__error">{entry.ifscError}</p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Bank Name</label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Bank Name"
                      value={entry.bankName}
                      onChange={(event) => updateEntry(entry.id, { bankName: event.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">City / Branch</label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Branch Address"
                      value={entry.cityBranch}
                      onChange={(event) => updateEntry(entry.id, { cityBranch: event.target.value })}
                    />
                  </div>

                  <button
                    type="button"
                    className="repeatable-entry__delete repeatable-entry__delete--inline"
                    onClick={() => setPendingDeleteId(entry.id)}
                    aria-label="Remove bank account"
                  >
                    <FiTrash2 aria-hidden />
                  </button>
                </div>

                <label className="repeatable-entry__radio">
                  <span className="repeatable-entry__radio-label">Set As:</span>
                  <input
                    type="radio"
                    name="primary-bank-account"
                    checked={primaryId === entry.id}
                    onChange={() => setPrimaryId(entry.id)}
                  />
                  Primary
                </label>
              </div>
            ))}
          </div>

          <button type="button" className="repeatable-entries__add" onClick={addEntry}>
            + Add
          </button>
        </>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this bank account?"
        message="This will remove this bank account entry. This cannot be undone."
        onConfirm={confirmRemoveEntry}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default BankDetailsSection;
