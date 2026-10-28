import { useState, type SubmitEvent } from "react";
import { CircleCheckBigIcon, SendIcon } from "../../../../shared/components/icon";

interface ContactValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

type Errors = Partial<Record<keyof ContactValues, string>>;

const EMPTY: ContactValues = { name: "", email: "", phone: "", company: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

function validate(values: ContactValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.replace(/\D/g, ""))) errors.phone = "Enter a valid 10-digit mobile number.";
  if (values.message.trim().length < 10) errors.message = "Tell us a little more (at least 10 characters).";
  return errors;
}

interface ContactFormProps {
  title?: string;
  submitLabel?: string;
}

const ContactForm = ({ title = "Send us a message", submitLabel = "Send message" }: ContactFormProps) => {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof ContactValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof ContactValues)[]).find((key) => found[key]);
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    // TODO: send to the contact-enquiries API once it is available.
    setSent(true);
    setValues(EMPTY);
  };

  if (sent) {
    return (
      <div className="contact-form contact-form--sent" role="status">
        <CircleCheckBigIcon aria-hidden />
        <h2>Thank you!</h2>
        <p>Your message is on its way. Our team will get back to you within one business day.</p>
        <button type="button" className="btn-site btn-site--outline" onClick={() => setSent(false)}>
          Send another message
        </button>
      </div>
    );
  }

  const field = (key: keyof ContactValues, label: string, props: { type?: string; required?: boolean; autoComplete?: string; inputMode?: "email" | "tel" } = {}) => (
    <div className="site-field">
      <label htmlFor={`contact-${key}`}>
        {label} {props.required && <span aria-hidden>*</span>}
      </label>
      <input
        id={`contact-${key}`}
        type={props.type ?? "text"}
        inputMode={props.inputMode}
        autoComplete={props.autoComplete}
        value={values[key]}
        onChange={(event) => set(key, event.target.value)}
        aria-required={props.required}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `contact-${key}-error` : undefined}
      />
      {errors[key] && (
        <small id={`contact-${key}-error`} className="site-field__error">
          {errors[key]}
        </small>
      )}
    </div>
  );

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate data-reveal data-reveal-delay="120">
      <h2>{title}</h2>
      <div className="contact-form__grid">
        {field("name", "Full name", { required: true, autoComplete: "name" })}
        {field("email", "Email", { type: "email", required: true, autoComplete: "email", inputMode: "email" })}
        {field("phone", "Phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
        {field("company", "Company", { autoComplete: "organization" })}
        <div className="site-field site-field--wide">
          <label htmlFor="contact-message">
            Message <span aria-hidden>*</span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            value={values.message}
            onChange={(event) => set("message", event.target.value)}
            aria-required
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
          {errors.message && (
            <small id="contact-message-error" className="site-field__error">
              {errors.message}
            </small>
          )}
        </div>
      </div>
      <button type="submit" className="btn-site btn-site--primary">
        {submitLabel} <SendIcon aria-hidden />
      </button>
    </form>
  );
};

export default ContactForm;
