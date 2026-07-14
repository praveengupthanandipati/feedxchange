import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { contactTypeOptions, designationOptions } from "./newBusiness.data";

interface ContactEntry {
  id: string;
  contactType: string;
  contactPersonName: string;
  designation: string;
  mobileNumber: string;
  alternativeContact: string;
  email: string;
}

let seq = 0;
const nextId = () => `contact-${Date.now()}-${seq++}`;

const emptyEntry = (): ContactEntry => ({
  id: nextId(),
  contactType: "",
  contactPersonName: "",
  designation: "",
  mobileNumber: "",
  alternativeContact: "",
  email: "",
});

const AdditionalContactsSection = () => {
  const [entries, setEntries] = useState<ContactEntry[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addEntry = () => setEntries((prev) => [...prev, emptyEntry()]);
  const confirmRemoveEntry = () => {
    setEntries((prev) => prev.filter((entry) => entry.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };
  const updateEntry = (id: string, patch: Partial<ContactEntry>) =>
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  return (
    <div>
      <h3 className="form-subheading">Additional Contacts</h3>

      {entries.length === 0 ? (
        <EmptyRowsState onAdd={addEntry} message="No Data available" />
      ) : (
        <>
          <div className="repeatable-entries">
            {entries.map((entry) => (
              <div className="repeatable-entry" key={entry.id}>
                <div className="new-contract__grid">
                  <div className="form-field">
                    <span className="form-field__label">
                      Contact Type <span className="form-field__required">*</span>
                    </span>
                    <SearchableSelect
                      options={contactTypeOptions}
                      value={entry.contactType}
                      onChange={(value) => updateEntry(entry.id, { contactType: value })}
                      placeholder="Select Contact Type"
                      ariaLabel="Contact Type"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">
                      Contact Person Name <span className="form-field__required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Point of Contact"
                      value={entry.contactPersonName}
                      onChange={(event) =>
                        updateEntry(entry.id, { contactPersonName: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">
                      Designation <span className="form-field__required">*</span>
                    </span>
                    <SearchableSelect
                      options={designationOptions}
                      value={entry.designation}
                      onChange={(value) => updateEntry(entry.id, { designation: value })}
                      placeholder="Select or type..."
                      ariaLabel="Designation"
                      allowCustom
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">
                      Mobile Number <span className="form-field__required">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-field__control"
                      placeholder="Valid Mobile Number"
                      value={entry.mobileNumber}
                      onChange={(event) =>
                        updateEntry(entry.id, { mobileNumber: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Alternative Contact</label>
                    <input
                      type="tel"
                      className="form-field__control"
                      placeholder="10-digit Mobile Number (Optional)"
                      value={entry.alternativeContact}
                      onChange={(event) =>
                        updateEntry(entry.id, { alternativeContact: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Email</label>
                    <input
                      type="email"
                      className="form-field__control"
                      placeholder="Ex: example@example.com"
                      value={entry.email}
                      onChange={(event) => updateEntry(entry.id, { email: event.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="repeatable-entry__delete"
                  onClick={() => setPendingDeleteId(entry.id)}
                  aria-label="Remove contact"
                >
                  <FiTrash2 aria-hidden />
                </button>
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
        title="Remove this contact?"
        message="This will remove this contact entry. This cannot be undone."
        onConfirm={confirmRemoveEntry}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default AdditionalContactsSection;
