import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiUserPlus, FiX } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import {
  useAddDriverMutation,
  useLazyGetDriverByMobileQuery,
  type Driver,
} from "../../../../store/driversApi";
import {
  bloodGroupOptions,
  buildDriverDetailsPayload,
  emptyDriverForm,
  licenseTypeOptions,
  validateDriverForm,
  type DriverFormErrors,
  type DriverFormValues,
} from "./driverNew.data";
import "../../../../components/dialog/ConfirmDialog.scss";
import "./NewDriverModal.scss";

interface NewDriverModalProps {
  open: boolean;
  /** Pre-fills the driver name, e.g. the text typed into the driver dropdown. */
  initialName?: string;
  /** Pre-fills the mobile number, e.g. the digits typed into the contact-number dropdown. */
  initialMobile?: string;
  onClose: () => void;
  /** Called with the newly created driver so the calling screen can fill its fields. */
  onCreated: (driver: Driver) => void;
}

const NewDriverModal = ({
  open,
  initialName = "",
  initialMobile = "",
  onClose,
  onCreated,
}: NewDriverModalProps) => {
  const [addDriver] = useAddDriverMutation();
  const [fetchDriverByMobile] = useLazyGetDriverByMobileQuery();

  const [form, setForm] = useState<DriverFormValues>(emptyDriverForm);
  const [errors, setErrors] = useState<DriverFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyDriverForm,
      driverName: initialName,
      mobileNumber: initialMobile.replace(/\D/g, "").slice(0, 10),
    });
    setErrors({});
    setSubmitError(null);
  }, [open, initialName, initialMobile]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const setField = <K extends keyof DriverFormValues>(key: K, value: DriverFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validateDriverForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await addDriver(buildDriverDetailsPayload(form)).unwrap();
      // AddDriver only returns a status message, so read the saved record back to get its driverId.
      const created = await fetchDriverByMobile(form.mobileNumber).unwrap();
      if (!created) {
        setSubmitError("Driver was saved, but could not be loaded back. Pick them from the list.");
        return;
      }
      onCreated(created);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save driver.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div
        className="confirm-dialog new-driver-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-driver-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog__icon new-driver-modal__icon">
          <FiUserPlus aria-hidden />
        </div>
        <h2 id="new-driver-modal-title" className="confirm-dialog__title">
          New Driver
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="new-driver-modal__scroll">
            <h3 className="new-driver-modal__section-title">1. Personal Details</h3>
            <div className="new-driver-modal__grid">
              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-name">
                  Driver Name <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-name"
                  type="text"
                  className="form-field__control"
                  placeholder="Enter Driver Name"
                  value={form.driverName}
                  onChange={(event) => setField("driverName", event.target.value)}
                />
                {errors.driverName && <p className="new-driver-modal__error">{errors.driverName}</p>}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-mobile">
                  Mobile Number <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="form-field__control"
                  placeholder="10-digit mobile number"
                  value={form.mobileNumber}
                  onChange={(event) =>
                    setField("mobileNumber", event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
                {errors.mobileNumber && <p className="new-driver-modal__error">{errors.mobileNumber}</p>}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-dob">
                  Date of Birth <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-dob"
                  type="date"
                  className="form-field__control"
                  value={form.dateOfBirth}
                  onChange={(event) => setField("dateOfBirth", event.target.value)}
                />
                {errors.dateOfBirth && <p className="new-driver-modal__error">{errors.dateOfBirth}</p>}
              </div>

              <div className="new-driver-modal__field">
                <span className="new-driver-modal__label">
                  Blood Group <span className="new-driver-modal__required">*</span>
                </span>
                <SearchableSelect
                  options={bloodGroupOptions}
                  value={form.bloodGroup}
                  onChange={(value) => setField("bloodGroup", value)}
                  placeholder="Select Blood Group"
                  ariaLabel="Blood Group"
                />
                {errors.bloodGroup && <p className="new-driver-modal__error">{errors.bloodGroup}</p>}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-experience">
                  Experience (Years) <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-experience"
                  type="number"
                  min="0"
                  max="50"
                  className="form-field__control"
                  placeholder="Enter years of experience"
                  value={form.experienceYears}
                  onChange={(event) => setField("experienceYears", event.target.value)}
                />
                {errors.experienceYears && (
                  <p className="new-driver-modal__error">{errors.experienceYears}</p>
                )}
              </div>

              <div className="new-driver-modal__field new-driver-modal__field--full">
                <label htmlFor="new-driver-address">
                  Address <span className="new-driver-modal__required">*</span>
                </label>
                <textarea
                  id="new-driver-address"
                  className="form-field__control new-driver-modal__textarea"
                  placeholder="Enter full address"
                  value={form.address}
                  onChange={(event) => setField("address", event.target.value)}
                />
                {errors.address && <p className="new-driver-modal__error">{errors.address}</p>}
              </div>
            </div>

            <h3 className="new-driver-modal__section-title">2. License Details</h3>
            <div className="new-driver-modal__grid">
              <div className="new-driver-modal__field">
                <span className="new-driver-modal__label">
                  License Type <span className="new-driver-modal__required">*</span>
                </span>
                <SearchableSelect
                  options={licenseTypeOptions}
                  value={form.licenseType}
                  onChange={(value) => setField("licenseType", value)}
                  placeholder="Select License Type"
                  ariaLabel="License Type"
                />
                {errors.licenseType && <p className="new-driver-modal__error">{errors.licenseType}</p>}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-license-number">
                  License Number <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-license-number"
                  type="text"
                  className="form-field__control"
                  placeholder="Enter License Number"
                  value={form.licenseNumber}
                  onChange={(event) => setField("licenseNumber", event.target.value)}
                />
                {errors.licenseNumber && <p className="new-driver-modal__error">{errors.licenseNumber}</p>}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-license-issued">
                  License Issued Date <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-license-issued"
                  type="date"
                  className="form-field__control"
                  value={form.licenseIssuedDate}
                  onChange={(event) => setField("licenseIssuedDate", event.target.value)}
                />
                {errors.licenseIssuedDate && (
                  <p className="new-driver-modal__error">{errors.licenseIssuedDate}</p>
                )}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-license-expiry">
                  License Expiry Date <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-license-expiry"
                  type="date"
                  className="form-field__control"
                  value={form.licenseExpiryDate}
                  onChange={(event) => setField("licenseExpiryDate", event.target.value)}
                />
                {errors.licenseExpiryDate && (
                  <p className="new-driver-modal__error">{errors.licenseExpiryDate}</p>
                )}
              </div>
            </div>

            <h3 className="new-driver-modal__section-title">3. Emergency Contact</h3>
            <div className="new-driver-modal__grid">
              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-emergency-name">
                  Emergency Contact Name <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-emergency-name"
                  type="text"
                  className="form-field__control"
                  placeholder="Enter Emergency Contact Name"
                  value={form.emergencyContactName}
                  onChange={(event) => setField("emergencyContactName", event.target.value)}
                />
                {errors.emergencyContactName && (
                  <p className="new-driver-modal__error">{errors.emergencyContactName}</p>
                )}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-emergency-number">
                  Emergency Contact Number <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-emergency-number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="form-field__control"
                  placeholder="10-digit mobile number"
                  value={form.emergencyContactNumber}
                  onChange={(event) =>
                    setField("emergencyContactNumber", event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
                {errors.emergencyContactNumber && (
                  <p className="new-driver-modal__error">{errors.emergencyContactNumber}</p>
                )}
              </div>
            </div>

            <h3 className="new-driver-modal__section-title">4. Identity Documents</h3>
            <div className="new-driver-modal__grid">
              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-aadhar">
                  Aadhar Number <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-aadhar"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  className="form-field__control"
                  placeholder="12-digit Aadhar number"
                  value={form.aadharNumber}
                  onChange={(event) =>
                    setField("aadharNumber", event.target.value.replace(/\D/g, "").slice(0, 12))
                  }
                />
                {errors.aadharNumber && <p className="new-driver-modal__error">{errors.aadharNumber}</p>}
              </div>

              <div className="new-driver-modal__field">
                <label htmlFor="new-driver-pan">
                  PAN Number <span className="new-driver-modal__required">*</span>
                </label>
                <input
                  id="new-driver-pan"
                  type="text"
                  maxLength={10}
                  className="form-field__control"
                  placeholder="ABCDE1234F"
                  value={form.panNumber}
                  onChange={(event) => setField("panNumber", event.target.value.toUpperCase().slice(0, 10))}
                />
                {errors.panNumber && <p className="new-driver-modal__error">{errors.panNumber}</p>}
              </div>
            </div>
          </div>

          {submitError && (
            <p className="new-driver-modal__error" role="alert">
              {submitError}
            </p>
          )}

          <div className="confirm-dialog__actions">
            <button type="button" className="confirm-dialog__cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="confirm-dialog__confirm new-driver-modal__confirm"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Driver"}
            </button>
          </div>
        </form>

        <button type="button" className="new-driver-modal__close" onClick={onClose} aria-label="Close">
          <FiX aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default NewDriverModal;
