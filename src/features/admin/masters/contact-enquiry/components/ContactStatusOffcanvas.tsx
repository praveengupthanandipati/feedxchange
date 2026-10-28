import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import { STATUS_OPTIONS, type ContactEnquiry, type ContactEnquiryStatus, type ContactEnquiryUpdate } from "../contactEnquiry.data";
// Shared .enquiry-panel styles.
import "../../product-enquiries/ProductEnquiries.scss";

interface ContactStatusOffcanvasProps {
  enquiry: ContactEnquiry;
  onSave: (update: ContactEnquiryUpdate) => void;
  onClose: () => void;
}

/**
 * "Update Status" panel sliding in from the right. Reuses the Product Enquiry panel styles
 * (.enquiry-panel) so both enquiry screens look and behave the same.
 */
const ContactStatusOffcanvas = ({ enquiry, onSave, onClose }: ContactStatusOffcanvasProps) => {
  const [form, setForm] = useState<ContactEnquiryUpdate>({ status: enquiry.status, comments: enquiry.comments });
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
    onSave({ ...form, comments: form.comments.trim() });
  };

  return createPortal(
    <>
      <div className="enquiry-panel__backdrop" onClick={onClose} aria-hidden />
      <aside ref={panelRef} className="enquiry-panel" role="dialog" aria-modal="true" aria-labelledby="contact-panel-title" tabIndex={-1}>
        <header className="enquiry-panel__header">
          <div>
            <h2 id="contact-panel-title">Update Enquiry Status</h2>
            <p>
              {enquiry.fullName} · {enquiry.subject}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <XIcon aria-hidden />
          </button>
        </header>

        <form className="enquiry-panel__form" onSubmit={handleSubmit} noValidate>
          <div className="enquiry-panel__body">
            <div className="enquiry-panel__field">
              <span className="enquiry-panel__label">Message</span>
              <p className="contact-panel__message">{enquiry.message}</p>
            </div>
            <div className="enquiry-panel__field">
              <span className="enquiry-panel__label">
                Status <span aria-hidden>*</span>
              </span>
              <SearchableSelect
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(status) => {
                  setForm({ ...form, status: status as ContactEnquiryStatus });
                  setError("");
                }}
                placeholder="Select Status"
                ariaLabel="Status"
              />
              {error && (
                <small className="enquiry-panel__error" role="alert">
                  {error}
                </small>
              )}
            </div>
            <div className="enquiry-panel__field">
              <label htmlFor="contact-enquiry-comments" className="enquiry-panel__label">
                Comments
              </label>
              <textarea
                id="contact-enquiry-comments"
                className="enquiry-panel__textarea"
                rows={4}
                placeholder="Enter comments"
                value={form.comments}
                onChange={(event) => setForm({ ...form, comments: event.target.value })}
              />
            </div>
            <div className="enquiry-panel__actions">
              <button type="submit" className="contact-enquiry__btn contact-enquiry__btn--navy">
                Save
              </button>
              <button type="button" className="contact-enquiry__btn contact-enquiry__btn--warning" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  );
};

export default ContactStatusOffcanvas;
