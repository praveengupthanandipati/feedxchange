import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { cityOptions, districtOptions, stateOptions } from "./newBusiness.data";

interface AddressEntry {
  id: string;
  officeName: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  googleLocation: string;
}

let seq = 0;
const nextId = () => `address-${Date.now()}-${seq++}`;

const emptyEntry = (): AddressEntry => ({
  id: nextId(),
  officeName: "",
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  city: "",
  district: "",
  state: "",
  googleLocation: "",
});

const AdditionalAddressSection = () => {
  const [entries, setEntries] = useState<AddressEntry[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addEntry = () => setEntries((prev) => [...prev, emptyEntry()]);
  const confirmRemoveEntry = () => {
    setEntries((prev) => prev.filter((entry) => entry.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };
  const updateEntry = (id: string, patch: Partial<AddressEntry>) =>
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  return (
    <div>
      <h3 className="form-subheading">Additional Address</h3>

      {entries.length === 0 ? (
        <EmptyRowsState onAdd={addEntry} message="No Data available" />
      ) : (
        <>
          <div className="repeatable-entries">
            {entries.map((entry) => (
              <div className="repeatable-entry" key={entry.id}>
                <div className="new-contract__grid">
                  <div className="form-field">
                    <label className="form-field__label">
                      Office Name <span className="form-field__required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Ex: Head Office"
                      value={entry.officeName}
                      onChange={(event) => updateEntry(entry.id, { officeName: event.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">
                      Address Line 1 <span className="form-field__required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Ex: 123 Main St, Suite 100"
                      value={entry.addressLine1}
                      onChange={(event) =>
                        updateEntry(entry.id, { addressLine1: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Address Line 2</label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Street and Colony"
                      value={entry.addressLine2}
                      onChange={(event) =>
                        updateEntry(entry.id, { addressLine2: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">
                      Pincode <span className="form-field__required">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-field__control"
                      placeholder="Ex: 502325"
                      value={entry.pincode}
                      onChange={(event) => updateEntry(entry.id, { pincode: event.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">
                      Select City <span className="form-field__required">*</span>
                    </span>
                    <SearchableSelect
                      options={cityOptions}
                      value={entry.city}
                      onChange={(value) => updateEntry(entry.id, { city: value })}
                      ariaLabel="Select City"
                    />
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">
                      Select District <span className="form-field__required">*</span>
                    </span>
                    <SearchableSelect
                      options={districtOptions}
                      value={entry.district}
                      onChange={(value) => updateEntry(entry.id, { district: value })}
                      ariaLabel="Select District"
                    />
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">
                      Select State <span className="form-field__required">*</span>
                    </span>
                    <SearchableSelect
                      options={stateOptions}
                      value={entry.state}
                      onChange={(value) => updateEntry(entry.id, { state: value })}
                      ariaLabel="Select State"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Google Location</label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Share Google Map Location"
                      value={entry.googleLocation}
                      onChange={(event) =>
                        updateEntry(entry.id, { googleLocation: event.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="repeatable-entry__delete"
                  onClick={() => setPendingDeleteId(entry.id)}
                  aria-label="Remove address"
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
        title="Remove this address?"
        message="This will remove this address entry. This cannot be undone."
        onConfirm={confirmRemoveEntry}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default AdditionalAddressSection;
