import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { FiCheckCircle, FiChevronDown, FiSend } from "react-icons/fi";
import { businessTypes } from "../../data/content";

interface EnquiryValues {
  quantity: string;
  company: string;
  business: string;
  city: string;
  email: string;
  phone: string;
}

type Field = keyof EnquiryValues;
type Errors = Partial<Record<Field, string>>;

const EMPTY: EnquiryValues = { quantity: "", company: "", business: "", city: "", email: "", phone: "" };
const ORDER: Field[] = ["quantity", "company", "business", "city", "email", "phone"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

function validate(values: EnquiryValues): Errors {
  const errors: Errors = {};
  const quantity = Number(values.quantity);
  if (!values.quantity.trim() || Number.isNaN(quantity) || quantity < 1) errors.quantity = "Enter a quantity of at least 1 MT.";
  if (!values.company.trim()) errors.company = "Enter your company name.";
  if (!values.business) errors.business = "Select your type of business.";
  if (!values.city.trim()) errors.city = "Enter your city.";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!PHONE_PATTERN.test(values.phone.replace(/\D/g, "").slice(-10))) errors.phone = "Enter a valid 10-digit mobile number.";
  return errors;
}

/** "Send Enquiry" sidebar on a product page. */
const EnquiryForm = ({ productName }: { productName: string }) => {
  const [values, setValues] = useState<EnquiryValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onChange = (key: Field) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = ORDER.find((key) => found[key]);
    if (first) {
      document.getElementById(`enquiry-${first}`)?.focus();
      return;
    }
    // TODO: send to the enquiries API once it is available.
    setSent(true);
    setValues(EMPTY);
  };

  if (sent) {
    return (
      <div className="enquiry-card enquiry-card--sent" role="status">
        <FiCheckCircle aria-hidden />
        <h2>Enquiry sent!</h2>
        <p>Thanks for your interest in {productName}. Our team will contact you shortly with the best price.</p>
        <button type="button" className="btn-site btn-site--outline" onClick={() => setSent(false)}>
          Send another enquiry
        </button>
      </div>
    );
  }

  // Shared props for each required field: label link, error state and message.
  const a11y = (key: Field) => ({
    id: `enquiry-${key}`,
    "aria-required": true,
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `enquiry-${key}-error` : undefined,
  });

  const error = (key: Field) =>
    errors[key] && (
      <small id={`enquiry-${key}-error`} className="site-field__error">
        {errors[key]}
      </small>
    );

  const label = (key: Field, text: string) => (
    <label htmlFor={`enquiry-${key}`}>
      {text} <span aria-hidden>*</span>
    </label>
  );

  return (
    <form className="enquiry-card" onSubmit={handleSubmit} noValidate aria-labelledby="enquiry-title">
      <h2 id="enquiry-title">Send Enquiry</h2>

      <div className="enquiry-card__fields">
        <div className="site-field">
          <label htmlFor="enquiry-product">Product Name</label>
          <input id="enquiry-product" type="text" value={productName} readOnly />
        </div>

        <div className="site-field">
          {label("quantity", "Enter Quantity")}
          <div className="enquiry-card__unit">
            <input {...a11y("quantity")} type="number" inputMode="decimal" min={1} step="any" placeholder="Min: 1" value={values.quantity} onChange={onChange("quantity")} />
            <span aria-hidden>MT</span>
          </div>
          {error("quantity")}
        </div>

        <div className="site-field">
          {label("company", "Company Name")}
          <input {...a11y("company")} type="text" autoComplete="organization" placeholder="Ex: ABC Pvt Ltd" value={values.company} onChange={onChange("company")} />
          {error("company")}
        </div>

        <div className="site-field">
          {label("business", "Nature Of Business")}
          <div className="enquiry-card__select">
            <select {...a11y("business")} value={values.business} onChange={onChange("business")} className={values.business ? undefined : "is-empty"}>
              <option value="" disabled>
                Select Business Type
              </option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <FiChevronDown aria-hidden />
          </div>
          {error("business")}
        </div>

        <div className="site-field">
          {label("city", "City")}
          <input {...a11y("city")} type="text" autoComplete="address-level2" placeholder="Enter City Name" value={values.city} onChange={onChange("city")} />
          {error("city")}
        </div>

        <div className="site-field">
          {label("email", "Email")}
          <input {...a11y("email")} type="email" inputMode="email" autoComplete="email" placeholder="Enter Email" value={values.email} onChange={onChange("email")} />
          {error("email")}
        </div>

        <div className="site-field">
          {label("phone", "Phone")}
          <input {...a11y("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="Enter Phone Number" value={values.phone} onChange={onChange("phone")} />
          {error("phone")}
        </div>
      </div>

      <button type="submit" className="btn-site btn-site--primary btn-site--block">
        Submit Enquiry <FiSend aria-hidden />
      </button>
    </form>
  );
};

export default EnquiryForm;
