import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiMapPin, FiX } from "react-icons/fi";
import {
  useCreateBusinessProfileAddressMutation,
  useLazyGetProfileAddressQuery,
} from "../../../store/userProfilesCommonApi";
import { fetchLocationFromPincode } from "../../../utils/pincodeLookup";
import "../../../components/dialog/ConfirmDialog.scss";
import "./NewAddressModal.scss";

interface AddressFormValues {
  officeName: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pincode: string;
  city: string;
  district: string;
  stateName: string;
  googleLocationUrl: string;
  isPrimary: boolean;
  isUnloadingLocation: boolean;
}

type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>;

const emptyAddressForm: AddressFormValues = {
  officeName: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  pincode: "",
  city: "",
  district: "",
  stateName: "",
  googleLocationUrl: "",
  isPrimary: false,
  isUnloadingLocation: false,
};

const PINCODE_REGEX = /^\d{6}$/;
const ID_ONLY_REGEX = /^\d+$/;

/** The parts of a saved address the calling screen needs to label and submit it. */
export interface CreatedAddress {
  addressId: number;
  officeName: string;
  addressLine1: string;
  city: string;
}

/**
 * Pulls the new addressId out of whatever CreateProfileAddress returned — the saved
 * address, a bare id, or an envelope around either. Returns null for a status message.
 */
function extractAddressId(payload: unknown): number | null {
  if (typeof payload === "number") return Number.isFinite(payload) && payload > 0 ? payload : null;
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return ID_ONLY_REGEX.test(trimmed) ? Number(trimmed) : null;
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const id = extractAddressId(entry);
      if (id) return id;
    }
    return null;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["addressId", "id", "result", "data"]) {
      if (key in record) {
        const id = extractAddressId(record[key]);
        if (id) return id;
      }
    }
  }

  return null;
}

function validate(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {};

  if (!values.officeName.trim()) errors.officeName = "Office / Location Name is required.";
  if (!values.addressLine1.trim()) errors.addressLine1 = "Address Line 1 is required.";

  if (!values.pincode) errors.pincode = "Pincode is required.";
  else if (!PINCODE_REGEX.test(values.pincode)) errors.pincode = "Enter a valid 6-digit pincode.";

  if (!values.city.trim()) errors.city = "City is required.";
  if (!values.stateName.trim()) errors.stateName = "State is required.";

  if (values.googleLocationUrl.trim() && !/^https?:\/\/.+/i.test(values.googleLocationUrl.trim())) {
    errors.googleLocationUrl = "Enter a valid URL starting with http:// or https://";
  }

  return errors;
}

interface NewAddressModalProps {
  open: boolean;
  /** Profile the address belongs to — the seller for loading, the buyer for delivery. */
  profileId: number;
  title: string;
  /** Pre-fills the office/location name, e.g. the text typed into the address dropdown. */
  initialName?: string;
  /** Pre-ticks "Unloading location", used for delivery addresses. */
  defaultUnloading?: boolean;
  onClose: () => void;
  /** Called with the newly created address so the calling screen can fill its field. */
  onCreated: (address: CreatedAddress) => void;
}

const NewAddressModal = ({
  open,
  profileId,
  title,
  initialName = "",
  defaultUnloading = false,
  onClose,
  onCreated,
}: NewAddressModalProps) => {
  const [createAddress] = useCreateBusinessProfileAddressMutation();
  const [fetchProfileAddresses] = useLazyGetProfileAddressQuery();

  const [form, setForm] = useState<AddressFormValues>(emptyAddressForm);
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyAddressForm,
      officeName: initialName,
      isUnloadingLocation: defaultUnloading,
    });
    setErrors({});
    setSubmitError(null);
  }, [open, initialName, defaultUnloading]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const setField = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // A full pincode fills in city, district and state, as it does on the profile screens.
  const handlePincodeChange = (value: string) => {
    setField("pincode", value);
    fetchLocationFromPincode(value).then((location) => {
      if (!location) return;
      setForm((prev) =>
        prev.pincode === value
          ? { ...prev, city: location.city, district: location.district, stateName: location.state }
          : prev,
      );
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!profileId) {
      setSubmitError("No profile to attach this address to. Pick a contract first.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const savedAddress = {
      officeName: form.officeName.trim(),
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
    };

    try {
      const response = await createAddress([
        {
          profileId,
          officeName: form.officeName.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          landmark: form.landmark.trim(),
          pincode: form.pincode,
          city: form.city.trim(),
          district: form.district.trim(),
          stateName: form.stateName.trim(),
          googleLocationUrl: form.googleLocationUrl.trim(),
          isPrimary: form.isPrimary,
          isUnloadingLocation: form.isUnloadingLocation,
          createdBy: Number(localStorage.getItem("userId")) || 0,
        },
      ]).unwrap();

      // Prefer the id the save returned — a one-time dispatch address need not appear in the address list.
      let addressId = extractAddressId(response);

      if (!addressId) {
        // Otherwise look it up, for profiles whose address list does include it.
        const addresses = await fetchProfileAddresses(String(profileId))
          .unwrap()
          .catch(() => []);
        addressId =
          addresses
            .filter(
              (address) =>
                address.officeName === savedAddress.officeName &&
                address.addressLine1 === savedAddress.addressLine1 &&
                address.pincode === form.pincode,
            )
            .reduce((newest, address) => Math.max(newest, address.addressId), 0) || null;
      }

      if (!addressId) {
        const raw = typeof response === "string" ? response : JSON.stringify(response);
        setSubmitError(
          `Address was saved, but no address id came back, so it could not be filled in here. Server replied: ${
            raw?.slice(0, 120) || "(empty)"
          }`,
        );
        return;
      }

      onCreated({ addressId, ...savedAddress });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div
        className="confirm-dialog new-address-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-address-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog__icon new-address-modal__icon">
          <FiMapPin aria-hidden />
        </div>
        <h2 id="new-address-modal-title" className="confirm-dialog__title">
          {title}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="new-address-modal__scroll">
            <div className="new-address-modal__grid">
              <div className="new-address-modal__field new-address-modal__field--full">
                <label htmlFor="new-address-office">
                  Office / Location Name <span className="new-address-modal__required">*</span>
                </label>
                <input
                  id="new-address-office"
                  type="text"
                  className="form-field__control"
                  placeholder="e.g. Balanagar Warehouse"
                  value={form.officeName}
                  onChange={(event) => setField("officeName", event.target.value)}
                />
                {errors.officeName && <p className="new-address-modal__error">{errors.officeName}</p>}
              </div>

              <div className="new-address-modal__field new-address-modal__field--full">
                <label htmlFor="new-address-line1">
                  Address Line 1 <span className="new-address-modal__required">*</span>
                </label>
                <input
                  id="new-address-line1"
                  type="text"
                  className="form-field__control"
                  placeholder="Door / Building / Street"
                  value={form.addressLine1}
                  onChange={(event) => setField("addressLine1", event.target.value)}
                />
                {errors.addressLine1 && <p className="new-address-modal__error">{errors.addressLine1}</p>}
              </div>

              <div className="new-address-modal__field new-address-modal__field--full">
                <label htmlFor="new-address-line2">Address Line 2</label>
                <input
                  id="new-address-line2"
                  type="text"
                  className="form-field__control"
                  placeholder="Area / Locality"
                  value={form.addressLine2}
                  onChange={(event) => setField("addressLine2", event.target.value)}
                />
              </div>

              <div className="new-address-modal__field">
                <label htmlFor="new-address-landmark">Landmark</label>
                <input
                  id="new-address-landmark"
                  type="text"
                  className="form-field__control"
                  placeholder="Nearby landmark"
                  value={form.landmark}
                  onChange={(event) => setField("landmark", event.target.value)}
                />
              </div>

              <div className="new-address-modal__field">
                <label htmlFor="new-address-pincode">
                  Pincode <span className="new-address-modal__required">*</span>
                </label>
                <input
                  id="new-address-pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-field__control"
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  onChange={(event) =>
                    handlePincodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
                {errors.pincode && <p className="new-address-modal__error">{errors.pincode}</p>}
              </div>

              <div className="new-address-modal__field">
                <label htmlFor="new-address-city">
                  City <span className="new-address-modal__required">*</span>
                </label>
                <input
                  id="new-address-city"
                  type="text"
                  className="form-field__control"
                  placeholder="City"
                  value={form.city}
                  onChange={(event) => setField("city", event.target.value)}
                />
                {errors.city && <p className="new-address-modal__error">{errors.city}</p>}
              </div>

              <div className="new-address-modal__field">
                <label htmlFor="new-address-district">District</label>
                <input
                  id="new-address-district"
                  type="text"
                  className="form-field__control"
                  placeholder="District"
                  value={form.district}
                  onChange={(event) => setField("district", event.target.value)}
                />
              </div>

              <div className="new-address-modal__field">
                <label htmlFor="new-address-state">
                  State <span className="new-address-modal__required">*</span>
                </label>
                <input
                  id="new-address-state"
                  type="text"
                  className="form-field__control"
                  placeholder="State"
                  value={form.stateName}
                  onChange={(event) => setField("stateName", event.target.value)}
                />
                {errors.stateName && <p className="new-address-modal__error">{errors.stateName}</p>}
              </div>

              <div className="new-address-modal__field new-address-modal__field--full">
                <label htmlFor="new-address-map">Google Location URL</label>
                <input
                  id="new-address-map"
                  type="text"
                  className="form-field__control"
                  placeholder="https://maps.google.com/..."
                  value={form.googleLocationUrl}
                  onChange={(event) => setField("googleLocationUrl", event.target.value)}
                />
                {errors.googleLocationUrl && (
                  <p className="new-address-modal__error">{errors.googleLocationUrl}</p>
                )}
              </div>

              <div className="new-address-modal__field new-address-modal__field--full">
                <label className="new-address-modal__checkbox">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(event) => setField("isPrimary", event.target.checked)}
                  />
                  Primary address
                </label>
                <label className="new-address-modal__checkbox">
                  <input
                    type="checkbox"
                    checked={form.isUnloadingLocation}
                    onChange={(event) => setField("isUnloadingLocation", event.target.checked)}
                  />
                  Unloading location
                </label>
              </div>
            </div>
          </div>

          {submitError && (
            <p className="new-address-modal__error" role="alert">
              {submitError}
            </p>
          )}

          <div className="confirm-dialog__actions">
            <button type="button" className="confirm-dialog__cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="confirm-dialog__confirm new-address-modal__confirm"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Address"}
            </button>
          </div>
        </form>

        <button type="button" className="new-address-modal__close" onClick={onClose} aria-label="Close">
          <FiX aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default NewAddressModal;
