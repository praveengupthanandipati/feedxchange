import { useRef, useState } from "react";
import { SearchIcon, Trash2Icon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../../shared/components/dialog/ConfirmDialog";
import { fetchBankFromIfsc, isValidIfsc } from "../../../../../shared/utils/ifscLookup";
import EmptyRowsState from "./EmptyRowsState";
import { accountTypeOptions } from "./newTransporter.data";

export interface BankEntry {
  id: string;
  accountType: string;
  payeeName: string;
  payeeAccountNumber: string;
  ifscCode: string;
  bankName: string;
  cityBranch: string;
  ifscError: string;
  // Present only for rows loaded from an existing profile — tells the save
  // step to call UpdateProfileBankAccount instead of bundling this row into
  // the next CreateProfileBankAccount call.
  meta?: { bankAccountId: number; createdBy: number; createdOn: string };
}

let seq = 0;
export const nextBankEntryId = () => `bank-${Date.now()}-${seq++}`;

const emptyEntry = (): BankEntry => ({
  id: nextBankEntryId(),
  accountType: "",
  payeeName: "",
  payeeAccountNumber: "",
  ifscCode: "",
  bankName: "",
  cityBranch: "",
  ifscError: "",
});

interface BankDetailsSectionProps {
  entries: BankEntry[];
  onEntriesChange: (entries: BankEntry[]) => void;
  primaryId: string | null;
  onPrimaryIdChange: (id: string | null) => void;
}

const BankDetailsSection = ({
  entries,
  onEntriesChange,
  primaryId,
  onPrimaryIdChange,
}: BankDetailsSectionProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addEntry = () => {
    const entry = emptyEntry();
    onEntriesChange([...entries, entry]);
    if (entries.length === 0) onPrimaryIdChange(entry.id);
  };

  const confirmRemoveEntry = () => {
    onEntriesChange(entries.filter((entry) => entry.id !== pendingDeleteId));
    if (primaryId === pendingDeleteId) onPrimaryIdChange(null);
    setPendingDeleteId(null);
  };

  // Always the latest rows: an IFSC lookup finishes later, and must not undo what was typed meanwhile.
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const updateEntry = (id: string, patch: Partial<BankEntry>) => {
    entriesRef.current = entriesRef.current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
    onEntriesChange(entriesRef.current);
  };

  const [lookingUpId, setLookingUpId] = useState<string | null>(null);

  const lookupIfsc = async (id: string, ifscCode: string) => {
    if (!isValidIfsc(ifscCode)) {
      updateEntry(id, { ifscError: "Enter the 11-character IFSC code, e.g. SBIN0000691." });
      return;
    }
    setLookingUpId(id);
    try {
      const match = await fetchBankFromIfsc(ifscCode);
      // Typed on since: this answer is for an older code.
      if (entriesRef.current.find((entry) => entry.id === id)?.ifscCode !== ifscCode) return;
      if (match) {
        updateEntry(id, { bankName: match.bankName, cityBranch: match.branch, ifscError: "" });
      } else {
        updateEntry(id, { ifscError: "IFSC code not found. Check the code, or type the bank and branch." });
      }
    } catch {
      updateEntry(id, { ifscError: "Couldn't reach the IFSC lookup. Check your connection, or type the bank and branch." });
    } finally {
      setLookingUpId(null);
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
                        onChange={(event) => {
                          const ifscCode = event.target.value.toUpperCase().replace(/\s/g, "").slice(0, 11);
                          updateEntry(entry.id, { ifscCode, ifscError: "" });
                          // A complete code looks itself up, like the pincode.
                          if (isValidIfsc(ifscCode)) void lookupIfsc(entry.id, ifscCode);
                        }}
                        placeholder="e.g. SBIN0000691"
                        maxLength={11}
                        aria-busy={lookingUpId === entry.id}
                      />
                      <button
                        type="button"
                        className="form-field__action"
                        onClick={() => lookupIfsc(entry.id, entry.ifscCode)}
                        disabled={lookingUpId === entry.id}
                        aria-label="Look up IFSC code"
                        title="Look up bank details for this IFSC code"
                      >
                        <SearchIcon aria-hidden />
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
                    <Trash2Icon aria-hidden />
                  </button>
                </div>

                <label className="repeatable-entry__radio">
                  <span className="repeatable-entry__radio-label">Set As:</span>
                  <input
                    type="radio"
                    name="primary-bank-account"
                    checked={primaryId === entry.id}
                    onChange={() => onPrimaryIdChange(entry.id)}
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
