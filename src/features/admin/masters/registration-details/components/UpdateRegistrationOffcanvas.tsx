import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import { STATUS_OPTIONS, type Registration, type RegistrationStatus, type RegistrationUpdate } from "../registrationDetails.data";

interface UpdateRegistrationOffcanvasProps {
  registration: Registration;
  onSave: (update: RegistrationUpdate) => void;
  onClose: () => void;
}

/** "Update Registration Status" panel sliding in from the right: half the viewport from tablets up, full width on phones. */
const UpdateRegistrationOffcanvas = ({ registration, onSave, onClose }: UpdateRegistrationOffcanvasProps) => {
  const [form, setForm] = useState<RegistrationUpdate>({ status: registration.status, reason: registration.reason });
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    // Stop the page behind from scrolling while the panel is open (iOS Safari included).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.status) return setError("Select a status.");
    onSave({ ...form, reason: form.reason.trim() });
  };

  return createPortal(
    <>
      <div className="registration-panel__backdrop" onClick={onClose} aria-hidden />
      <aside ref={panelRef} className="registration-panel" role="dialog" aria-modal="true" aria-labelledby="registration-panel-title" tabIndex={-1}>
        <header className="registration-panel__header">
          <div>
            <h2 id="registration-panel-title">Update Registration Status</h2>
            <p>
              {registration.name} · {registration.businessName}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <XIcon aria-hidden />
          </button>
        </header>

        <form className="registration-panel__body" onSubmit={handleSubmit} noValidate>
          <div className="registration-panel__field">
            <span className="registration-panel__label">
              Status <span className="registration-panel__required" aria-hidden>*</span>
            </span>
            <SearchableSelect
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(status) => {
                setForm({ ...form, status: status as RegistrationStatus });
                setError("");
              }}
              placeholder="Select Status"
              ariaLabel="Status"
            />
            {error && (
              <small className="registration-panel__error" role="alert">
                {error}
              </small>
            )}
          </div>

          <div className="registration-panel__field">
            <label htmlFor="registration-reason" className="registration-panel__label">
              Reason Description
            </label>
            <textarea
              id="registration-reason"
              className="registration-panel__textarea"
              rows={4}
              placeholder="Enter reason description"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
            />
          </div>

          <div className="registration-panel__actions">
            <button type="submit" className="registrations__btn registrations__btn--navy">
              Save
            </button>
            <button type="button" className="registrations__btn registrations__btn--warning" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  );
};

export default UpdateRegistrationOffcanvas;
