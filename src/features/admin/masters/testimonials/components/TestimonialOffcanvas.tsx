import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "../../../../../shared/components/icon";
import { EMPTY_FORM, MAX_RATING, TESTIMONIAL_STATUSES, type Testimonial, type TestimonialForm } from "../testimonials.data";
import { toForm, validateTestimonial, type FormErrors } from "../testimonials.utils";

interface TestimonialOffcanvasProps {
  /** The testimonial being edited, or null to create a new one. */
  testimonial: Testimonial | null;
  onSave: (form: TestimonialForm) => void;
  onClose: () => void;
}

type FieldKey = keyof FormErrors;

/** Create / Edit panel sliding in from the right: half the viewport on laptops, full width on phones. */
const TestimonialOffcanvas = ({ testimonial, onSave, onClose }: TestimonialOffcanvasProps) => {
  const [form, setForm] = useState<TestimonialForm>(testimonial ? toForm(testimonial) : EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = testimonial !== null;

  useEffect(() => {
    nameRef.current?.focus();
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

  const set = <K extends keyof TestimonialForm>(key: K, value: TestimonialForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateTestimonial(form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      // Take the user to the first problem, which may be scrolled out of view on phones.
      const first = (Object.keys(found) as FieldKey[]).find((key) => found[key]);
      if (first) document.getElementById(`testimonial-${first}`)?.focus();
      return;
    }
    onSave(form);
  };

  const errorProps = (key: FieldKey) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `testimonial-${key}-error` : undefined,
    "aria-required": true,
  });

  const label = (key: FieldKey, text: string) => (
    <label htmlFor={`testimonial-${key}`} className="testimonial-panel__label">
      {text} <span className="testimonial-panel__required" aria-hidden>*</span>
    </label>
  );

  const error = (key: FieldKey) =>
    errors[key] && (
      <small id={`testimonial-${key}-error`} className="testimonial-panel__error">
        {errors[key]}
      </small>
    );

  const input = (key: "customerName" | "customerEmail" | "title", text: string, placeholder: string, type = "text") => (
    <div className="testimonial-panel__field">
      {label(key, text)}
      <input
        ref={key === "customerName" ? nameRef : undefined}
        id={`testimonial-${key}`}
        type={type}
        autoComplete="off"
        className={`testimonial-panel__input ${errors[key] ? "is-invalid" : ""}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={(event) => set(key, event.target.value)}
        {...errorProps(key)}
      />
      {error(key)}
    </div>
  );

  return createPortal(
    <>
      <div className="testimonial-panel__backdrop" onClick={onClose} aria-hidden />
      <aside className="testimonial-panel" role="dialog" aria-modal="true" aria-labelledby="testimonial-panel-title">
        <header className="testimonial-panel__header">
          <h2 id="testimonial-panel-title">{isEdit ? "Edit Testimonial" : "Create Testimonial"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <XIcon aria-hidden />
          </button>
        </header>

        <form className="testimonial-panel__body" onSubmit={handleSubmit} noValidate>
          {input("customerName", "Customer Name", "Enter Customer Name")}
          {input("customerEmail", "Customer Email", "Enter Customer Email", "email")}
          {input("title", "Title", "Enter Title")}

          <div className="testimonial-panel__field">
            {label("content", "Review Content")}
            <textarea
              id="testimonial-content"
              rows={4}
              className={`testimonial-panel__input testimonial-panel__textarea ${errors.content ? "is-invalid" : ""}`}
              placeholder="Enter Review Content"
              value={form.content}
              onChange={(event) => set("content", event.target.value)}
              {...errorProps("content")}
            />
            {error("content")}
          </div>

          <div className="testimonial-panel__field">
            {label("rating", "Rating")}
            <input
              id="testimonial-rating"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_RATING}
              step={1}
              className={`testimonial-panel__input ${errors.rating ? "is-invalid" : ""}`}
              value={form.rating}
              onChange={(event) => set("rating", event.target.value)}
              {...errorProps("rating")}
            />
            {error("rating")}
          </div>

          <fieldset className="testimonial-panel__field">
            <legend className="testimonial-panel__label">Status</legend>
            <div className="testimonial-panel__radios">
              {TESTIMONIAL_STATUSES.map((status) => (
                <label key={status}>
                  <input type="radio" name="testimonial-status" value={status} checked={form.status === status} onChange={() => set("status", status)} />
                  {status}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="testimonial-panel__actions">
            <button type="submit" className="testimonials__btn testimonials__btn--navy">
              {isEdit ? "Update Testimonial" : "Create Testimonial"}
            </button>
            <button type="button" className="testimonials__btn testimonials__btn--warning" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  );
};

export default TestimonialOffcanvas;
