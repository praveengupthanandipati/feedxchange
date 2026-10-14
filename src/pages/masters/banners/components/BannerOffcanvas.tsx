import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { EMPTY_FORM, type Banner, type BannerForm, type BannerStatus } from "../banners.data";
import { toForm, validateBanner, type FormErrors } from "../banners.utils";
import BannerImageField from "./BannerImageField";

interface BannerOffcanvasProps {
  /** The banner being edited, or null to create a new one. */
  banner: Banner | null;
  banners: Banner[];
  onSave: (form: BannerForm) => void;
  onClose: () => void;
}

const STATUSES: BannerStatus[] = ["Active", "Inactive"];

/** Create / Edit panel sliding in from the right: half the screen on laptops, full width on phones. */
const BannerOffcanvas = ({ banner, banners, onSave, onClose }: BannerOffcanvasProps) => {
  const [form, setForm] = useState<BannerForm>(banner ? toForm(banner) : EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = banner !== null;

  useEffect(() => {
    titleRef.current?.focus();
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

  const set = <K extends keyof BannerForm>(key: K, value: BannerForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateBanner(form, banners, banner?.id ?? null);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    onSave(form);
  };

  const field = (key: "title" | "linkUrl" | "priority", label: string, placeholder: string, type = "text") => (
    <div className="banner-panel__field">
      <label htmlFor={`banner-${key}`} className="banner-panel__label">
        {label} <span className="banner-panel__required" aria-hidden>*</span>
      </label>
      <input
        ref={key === "title" ? titleRef : undefined}
        id={`banner-${key}`}
        type={type}
        inputMode={key === "priority" ? "numeric" : key === "linkUrl" ? "url" : undefined}
        min={key === "priority" ? 1 : undefined}
        className={`banner-panel__input ${errors[key] ? "is-invalid" : ""}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={(event) => set(key, event.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `banner-${key}-error` : undefined}
        aria-required
      />
      {errors[key] && (
        <small id={`banner-${key}-error`} className="banner-panel__error">
          {errors[key]}
        </small>
      )}
    </div>
  );

  return createPortal(
    <>
      <div className="banner-panel__backdrop" onClick={onClose} aria-hidden />
      <aside className="banner-panel" role="dialog" aria-modal="true" aria-labelledby="banner-panel-title">
        <header className="banner-panel__header">
          <h2 id="banner-panel-title">{isEdit ? "Edit Banner" : "Create Banner"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </header>

        <form className="banner-panel__form" onSubmit={handleSubmit} noValidate>
          <div className="banner-panel__body">
            {field("title", "Title", "Enter Banner Title")}
            {field("linkUrl", "Link URL", "Enter Link URL", "url")}
            {field("priority", "Priority", "Enter Priority", "number")}
            <BannerImageField
              image={form.image}
              fileName={form.fileName}
              error={errors.image}
              onChange={(image, fileName) => {
                setForm((prev) => ({ ...prev, image, fileName }));
                setErrors((prev) => ({ ...prev, image: undefined }));
              }}
            />
            <fieldset className="banner-panel__field banner-panel__status">
              <legend className="banner-panel__label">Status</legend>
              <div className="banner-panel__radios">
                {STATUSES.map((status) => (
                  <label key={status}>
                    <input type="radio" name="banner-status" value={status} checked={form.status === status} onChange={() => set("status", status)} />
                    {status}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="banner-panel__actions">
            <button type="submit" className="banners__btn banners__btn--navy">
              {isEdit ? "Update Banner" : "Create Banner"}
            </button>
            <button type="button" className="banners__btn banners__btn--warning" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  );
};

export default BannerOffcanvas;
