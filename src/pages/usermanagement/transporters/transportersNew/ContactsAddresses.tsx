import { useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { fetchLocationFromPincode } from "../../../../utils/pincodeLookup";
import {
  contactTypeOptions,
  designationOptions,
  cityOptions,
  districtOptions,
  stateOptions,
} from "./newTransporter.data";

export interface ContactEntry {
  id: string;
  contactType: string;
  contactPersonName: string;
  designation: string;
  mobileNumber: string;
  alternativeContact: string;
  email: string;
}

let contactSeq = 0;
export const nextContactId = () => `contact-${Date.now()}-${contactSeq++}`;

const emptyContactEntry = (): ContactEntry => ({
  id: nextContactId(),
  contactType: "",
  contactPersonName: "",
  designation: "",
  mobileNumber: "",
  alternativeContact: "",
  email: "",
});

interface AdditionalContactsSectionProps {
  entries: ContactEntry[];
  onEntriesChange: (entries: ContactEntry[]) => void;
}

const AdditionalContactsSection = ({ entries, onEntriesChange }: AdditionalContactsSectionProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addEntry = () => onEntriesChange([...entries, emptyContactEntry()]);
  const confirmRemoveEntry = () => {
    onEntriesChange(entries.filter((entry) => entry.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };
  const updateEntry = (id: string, patch: Partial<ContactEntry>) =>
    onEntriesChange(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

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
                      Contact Person <span className="form-field__required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Point of Contact Name"
                      value={entry.contactPersonName}
                      onChange={(event) =>
                        updateEntry(entry.id, { contactPersonName: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">
                      Select Designation <span className="form-field__required">*</span>
                    </span>
                    <SearchableSelect
                      options={designationOptions}
                      value={entry.designation}
                      onChange={(value) => updateEntry(entry.id, { designation: value })}
                      placeholder="Select or type..."
                      ariaLabel="Select Designation"
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
                    <label className="form-field__label">Alternative Contact Number</label>
                    <input
                      type="tel"
                      className="form-field__control"
                      placeholder="10-digit Number (Optional)"
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

export interface AddressEntry {
  id: string;
  officeName: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  googleLocation: string;
  // Present only for rows loaded from an existing profile — tells the save
  // step to call UpdateProfileAddress instead of bundling this row into the
  // next CreateProfileAddress call.
  meta?: { addressId: number; createdBy: number; createdOn: string };
}

let addressSeq = 0;
export const nextAddressId = () => `address-${Date.now()}-${addressSeq++}`;

const emptyAddressEntry = (): AddressEntry => ({
  id: nextAddressId(),
  officeName: "",
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  city: "",
  district: "",
  state: "",
  googleLocation: "",
});

interface AdditionalAddressSectionProps {
  entries: AddressEntry[];
  onEntriesChange: (entries: AddressEntry[]) => void;
}

const AdditionalAddressSection = ({ entries, onEntriesChange }: AdditionalAddressSectionProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  // Read in updateEntry so the pincode lookup's async callback (which can
  // resolve after further edits/re-renders) always patches the latest
  // entries instead of the stale array closed over when it started.
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const addEntry = () => onEntriesChange([...entries, emptyAddressEntry()]);
  const confirmRemoveEntry = () => {
    onEntriesChange(entries.filter((entry) => entry.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };
  const updateEntry = (id: string, patch: Partial<AddressEntry>) =>
    onEntriesChange(entriesRef.current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const handlePincodeChange = (id: string, value: string) => {
    updateEntry(id, { pincode: value });
    fetchLocationFromPincode(value).then((location) => {
      if (location) updateEntry(id, { city: location.city, district: location.district, state: location.state });
    });
  };

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
                      placeholder="Ex: Head Office, Warehouse, etc."
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
                    <label className="form-field__label">Pincode</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-field__control"
                      placeholder="Ex: 502325"
                      value={entry.pincode}
                      onChange={(event) => handlePincodeChange(entry.id, event.target.value)}
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
                      placeholder="Select or type..."
                      ariaLabel="Select City"
                      allowCustom
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
                      placeholder="Google Map Location"
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

interface ContactsAddressesProps {
  addressLine1: string;
  onAddressLine1Change: (value: string) => void;
  addressLine2: string;
  onAddressLine2Change: (value: string) => void;
  landmark: string;
  onLandmarkChange: (value: string) => void;
  pincode: string;
  onPincodeChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  district: string;
  onDistrictChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  websiteUrl: string;
  onWebsiteUrlChange: (value: string) => void;
  googleMapLocation: string;
  onGoogleMapLocationChange: (value: string) => void;
  primaryFullName: string;
  onPrimaryFullNameChange: (value: string) => void;
  primaryMobileNumber: string;
  onPrimaryMobileNumberChange: (value: string) => void;
  primaryAlternativeContact: string;
  onPrimaryAlternativeContactChange: (value: string) => void;
  contacts: ContactEntry[];
  onContactsChange: (entries: ContactEntry[]) => void;
  addresses: AddressEntry[];
  onAddressesChange: (entries: AddressEntry[]) => void;
}

const ContactsAddresses = ({
  addressLine1,
  onAddressLine1Change,
  addressLine2,
  onAddressLine2Change,
  landmark,
  onLandmarkChange,
  pincode,
  onPincodeChange,
  city,
  onCityChange,
  district,
  onDistrictChange,
  state,
  onStateChange,
  email,
  onEmailChange,
  websiteUrl,
  onWebsiteUrlChange,
  googleMapLocation,
  onGoogleMapLocationChange,
  primaryFullName,
  onPrimaryFullNameChange,
  primaryMobileNumber,
  onPrimaryMobileNumberChange,
  primaryAlternativeContact,
  onPrimaryAlternativeContactChange,
  contacts,
  onContactsChange,
  addresses,
  onAddressesChange,
}: ContactsAddressesProps) => {
  const handleBillingPincodeChange = (value: string) => {
    onPincodeChange(value);
    fetchLocationFromPincode(value).then((location) => {
      if (location) {
        onCityChange(location.city);
        onDistrictChange(location.district);
        onStateChange(location.state);
      }
    });
  };

  return (
    <div className="contact-address__subsections">
      <div className="new-contract__condition-card">
        <h3>Billing Communication Details</h3>
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label">
              Address Line 01 <span className="form-field__required">*</span>
            </label>
            <input
              type="text"
              className="form-field__control"
              placeholder="Address Line 01"
              value={addressLine1}
              onChange={(event) => onAddressLine1Change(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">Address Line 02</label>
            <input
              type="text"
              className="form-field__control"
              placeholder="Address Line 02"
              value={addressLine2}
              onChange={(event) => onAddressLine2Change(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">Landmark</label>
            <input
              type="text"
              className="form-field__control"
              placeholder="Landmark"
              value={landmark}
              onChange={(event) => onLandmarkChange(event.target.value)}
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
              placeholder="Enter Valid Pincode"
              value={pincode}
              onChange={(event) => handleBillingPincodeChange(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              City <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={cityOptions}
              value={city}
              onChange={onCityChange}
              placeholder="Select or type..."
              ariaLabel="City"
              allowCustom
            />
          </div>
          <div className="form-field">
            <span className="form-field__label">
              District <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={districtOptions}
              value={district}
              onChange={onDistrictChange}
              ariaLabel="District"
            />
          </div>
          <div className="form-field">
            <span className="form-field__label">
              State <span className="form-field__required">*</span>
            </span>
            <SearchableSelect options={stateOptions} value={state} onChange={onStateChange} ariaLabel="State" />
          </div>
          <div className="form-field">
            <label className="form-field__label">Email ID</label>
            <input
              type="email"
              className="form-field__control"
              placeholder="Valid Email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label">Website URL</label>
            <input
              type="url"
              className="form-field__control"
              placeholder="Website URL"
              value={websiteUrl}
              onChange={(event) => onWebsiteUrlChange(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">Google Map Location</label>
            <input
              type="text"
              className="form-field__control"
              placeholder="Google Map Location"
              value={googleMapLocation}
              onChange={(event) => onGoogleMapLocationChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="new-contract__condition-card">
        <h3>Primary Contact Numbers</h3>
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label">
              Full Name <span className="form-field__required">*</span>
            </label>
            <input
              type="text"
              className="form-field__control"
              placeholder="Full Name"
              value={primaryFullName}
              onChange={(event) => onPrimaryFullNameChange(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">
              Mobile Number <span className="form-field__required">*</span>
            </label>
            <input
              type="tel"
              className="form-field__control"
              placeholder="Enter 10-digit Mobile Number"
              value={primaryMobileNumber}
              onChange={(event) => onPrimaryMobileNumberChange(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">Alternative Contact Number</label>
            <input
              type="tel"
              className="form-field__control"
              placeholder="Phone Number Optional"
              value={primaryAlternativeContact}
              onChange={(event) => onPrimaryAlternativeContactChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      <AdditionalContactsSection entries={contacts} onEntriesChange={onContactsChange} />
      <AdditionalAddressSection entries={addresses} onEntriesChange={onAddressesChange} />
    </div>
  );
};

export default ContactsAddresses;
