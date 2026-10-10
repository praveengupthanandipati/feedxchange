import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import { ASSIGNEE_OPTIONS, STATUS_OPTIONS, type EnquiryStatus, type EnquiryUpdate, type ProductEnquiry } from "../productEnquiries.data";

interface UpdateStatusOffcanvasProps {
  enquiry: ProductEnquiry;
  onSave: (update: EnquiryUpdate) => void;
  onClose: () => void;
}

/** "Update Enquiry Status" panel sliding in from the right: half the screen on laptops, full width on phones. */
const UpdateStatusOffcanvas = ({ enquiry, onSave, onClose }: UpdateStatusOffcanvasProps) => {
  const [form, setForm] = useState<EnquiryUpdate>({ status: enquiry.status, assignedTo: enquiry.assignedTo, comments: enquiry.comments });
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
      <aside ref={panelRef} className="enquiry-panel" role="dialog" aria-modal="true" aria-labelledby="enquiry-panel-title" tabIndex={-1}>
        <header className="enquiry-panel__header">
          <div>
            <h2 id="enquiry-panel-title">Update Enquiry Status</h2>
            <p>
              {enquiry.productName} · {enquiry.companyName}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </header>

        <form className="enquiry-panel__form" onSubmit={handleSubmit} noValidate>
          <div className="enquiry-panel__body">
            <div className="enquiry-panel__field">
              <span className="enquiry-panel__label">
                Status <span aria-hidden>*</span>
              </span>
              <SearchableSelect
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(status) => {
                  setForm({ ...form, status: status as EnquiryStatus });
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
              <span className="enquiry-panel__label">Assign To</span>
              <SearchableSelect options={ASSIGNEE_OPTIONS} value={form.assignedTo} onChange={(assignedTo) => setForm({ ...form, assignedTo })} placeholder="Select user" ariaLabel="Assign To" clearable />
            </div>
            <div className="enquiry-panel__field">
              <label htmlFor="enquiry-comments" className="enquiry-panel__label">
                Comments
              </label>
              <textarea
                id="enquiry-comments"
                className="enquiry-panel__textarea"
                rows={4}
                placeholder="Enter comments"
                value={form.comments}
                onChange={(event) => setForm({ ...form, comments: event.target.value })}
              />
            </div>
            <div className="enquiry-panel__actions">
              <button type="submit" className="product-enquiries__btn product-enquiries__btn--navy">
                Save
              </button>
              <button type="button" className="product-enquiries__btn product-enquiries__btn--warning" onClick={onClose}>
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

export default UpdateStatusOffcanvas;
