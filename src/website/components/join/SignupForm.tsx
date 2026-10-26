import { useState, type ChangeEvent, type ReactNode, type SubmitEvent } from "react";
import type { IconType } from "react-icons";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiGift,
  FiLock,
  FiMail,
  FiSmartphone,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { businessTypes } from "../../data/content";
import { sitePaths } from "../../routes/paths";

interface SignupValues {
  firstName: string;
  lastName: string;
  business: string;
  line: string;
  email: string;
  password: string;
  confirm: string;
  mobile: string;
  referral: string;
  agree: boolean;
}

type Field = keyof SignupValues;
type Errors = Partial<Record<Field, string>>;

const EMPTY: SignupValues = { firstName: "", lastName: "", business: "", line: "", email: "", password: "", confirm: "", mobile: "", referral: "", agree: false };
// Form order, so the first invalid field gets focus on submit.
const ORDER: Field[] = ["firstName", "lastName", "business", "line", "email", "password", "confirm", "mobile", "referral", "agree"];

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const REFERRAL_PATTERN = /^[A-Za-z0-9]{4,12}$/;

/** Password rules, shown as a live checklist under the field. */
const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /\d/.test(value) },
  { label: "Special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const STRENGTH = ["Too weak", "Weak", "Fair", "Good", "Strong", "Strong"];

function validateField(key: Field, values: SignupValues): string | undefined {
  const value = values[key];
  const text = typeof value === "string" ? value.trim() : "";
  switch (key) {
    case "firstName":
    case "lastName": {
      const label = key === "firstName" ? "first" : "last";
      if (!text) return `Enter your ${label} name.`;
      if (!NAME_PATTERN.test(text)) return "Use letters only.";
      if (text.length < 2 && key === "firstName") return "Enter at least 2 letters.";
      if (text.length > 50) return "Keep it under 50 characters.";
      return undefined;
    }
    case "business":
      if (!text) return "Enter your business name.";
      if (text.length < 2) return "Enter at least 2 characters.";
      return undefined;
    case "line":
      return text ? undefined : "Select your line of business.";
    case "email":
      if (!text) return "Enter your email ID.";
      return EMAIL_PATTERN.test(text) ? undefined : "Enter a valid email ID, e.g. name@company.com.";
    case "password": {
      if (!values.password) return "Create a password.";
      const missing = PASSWORD_RULES.filter((rule) => !rule.test(values.password));
      return missing.length ? `Add: ${missing.map((rule) => rule.label.toLowerCase()).join(", ")}.` : undefined;
    }
    case "confirm":
      if (!values.confirm) return "Re-enter your password.";
      return values.confirm === values.password ? undefined : "Passwords don't match.";
    case "mobile": {
      const digits = values.mobile.replace(/\D/g, "");
      if (!digits) return "Enter your mobile number.";
      return MOBILE_PATTERN.test(digits) ? undefined : "Enter a valid 10-digit mobile number.";
    }
    case "referral":
      if (!text) return undefined;
      return REFERRAL_PATTERN.test(text) ? undefined : "Referral codes are 4–12 letters or numbers.";
    case "agree":
      return values.agree ? undefined : "Please accept the Terms & Conditions.";
    default:
      return undefined;
  }
}

const validateAll = (values: SignupValues): Errors =>
  ORDER.reduce<Errors>((errors, key) => {
    const message = validateField(key, values);
    return message ? { ...errors, [key]: message } : errors;
  }, {});

/** Outlined field with its label sitting on the top border and an icon inside. */
const OutlinedField = ({
  id,
  label,
  required,
  icon: Icon,
  error,
  hint,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  icon: IconType;
  error?: string;
  hint?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) => (
  <div className={`su-field ${wide ? "su-field--wide" : ""} ${error ? "has-error" : ""}`}>
    <div className="su-field__box">
      <label htmlFor={id} className="su-field__label">
        {label} {required && <span aria-hidden>*</span>}
      </label>
      <Icon aria-hidden className="su-field__icon" />
      {children}
    </div>
    {hint && !error && (
      <small id={`${id}-hint`} className="su-field__hint">
        {hint}
      </small>
    )}
    {error && (
      <small id={`${id}-error`} className="su-field__error">
        {error}
      </small>
    )}
  </div>
);

/** "Signup your Business Account" form with inline validation. */
const SignupForm = () => {
  const [values, setValues] = useState<SignupValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  // Fields are checked on blur once touched, then live as you fix them.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [show, setShow] = useState({ password: false, confirm: false });
  const [sentTo, setSentTo] = useState<string | null>(null);

  const update = (key: Field, value: string | boolean) => {
    const next = { ...values, [key]: value };
    setValues(next);
    const recheck: Errors = {};
    if (touched[key] || errors[key]) recheck[key] = validateField(key, next);
    // Changing the password re-checks the confirmation too.
    if (key === "password" && (touched.confirm || errors.confirm)) recheck.confirm = validateField("confirm", next);
    if (Object.keys(recheck).length) setErrors((current) => ({ ...current, ...recheck }));
  };

  const onChange = (key: Field) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    update(key, target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value);
  };

  const onBlur = (key: Field) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, values) }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateAll(values);
    setErrors(found);
    setTouched(Object.fromEntries(ORDER.map((key) => [key, true])));
    const first = ORDER.find((key) => found[key]);
    if (first) {
      document.getElementById(`signup-${first}`)?.focus();
      return;
    }
    // TODO: call the signup API and send the email OTP once it is available.
    setSentTo(values.email.trim());
    setValues(EMPTY);
    setTouched({});
  };

  // Shared props for text inputs: id, change/blur handlers and error wiring.
  const bind = (key: Exclude<Field, "agree">, hint = false) => ({
    id: `signup-${key}`,
    name: key,
    value: values[key],
    onChange: onChange(key),
    onBlur: onBlur(key),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `signup-${key}-error` : hint ? `signup-${key}-hint` : undefined,
  });

  const passed = PASSWORD_RULES.filter((rule) => rule.test(values.password)).length;

  if (sentTo) {
    return (
      <div className="signup-card signup-card--sent" role="status">
        <FiCheckCircle aria-hidden />
        <h2>Verify your email</h2>
        <p>
          We&rsquo;ve sent a one-time password (OTP) to <strong>{sentTo}</strong>. Enter it to activate your FeedXchange business account.
        </p>
        <button type="button" className="btn-site btn-site--outline" onClick={() => setSentTo(null)}>
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form className="signup-card" onSubmit={handleSubmit} noValidate aria-labelledby="signup-title">
      <div className="signup-card__head">
        <h2 id="signup-title">Signup your Business Account</h2>
        <p>Create one Account for Buyers, Suppliers, Transporters, Promoters</p>
      </div>

      <div className="signup-card__grid">
        <OutlinedField id="signup-firstName" label="First Name" required icon={FiUser} error={errors.firstName}>
          <input {...bind("firstName")} type="text" autoComplete="given-name" placeholder="First Name" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-lastName" label="Last Name" required icon={FiUser} error={errors.lastName}>
          <input {...bind("lastName")} type="text" autoComplete="family-name" placeholder="Last Name" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-business" label="Business Name" required icon={FiBriefcase} error={errors.business}>
          <input {...bind("business")} type="text" autoComplete="organization" placeholder="Business Name" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-line" label="Line of Business" required icon={FiBriefcase} error={errors.line}>
          <select {...bind("line")} className={values.line ? undefined : "is-empty"} aria-required>
            <option value="" disabled>
              Select Line of Business
            </option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <FiChevronDown aria-hidden className="su-field__chevron" />
        </OutlinedField>

        <OutlinedField id="signup-email" label="Email Id" required icon={FiMail} error={errors.email} hint="* This will be your Login user ID and OTP will be sent here" wide>
          <input {...bind("email", true)} type="email" inputMode="email" autoComplete="email" placeholder="Enter Your Email Id" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-password" label="Password" required icon={FiLock} error={errors.password}>
          <input {...bind("password")} type={show.password ? "text" : "password"} autoComplete="new-password" placeholder="Password" aria-required />
          <button
            type="button"
            className="su-field__toggle"
            onClick={() => setShow((prev) => ({ ...prev, password: !prev.password }))}
            aria-label={show.password ? "Hide password" : "Show password"}
            aria-pressed={show.password}
          >
            {show.password ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
          </button>
        </OutlinedField>

        <OutlinedField id="signup-confirm" label="Confirm Password" required icon={FiLock} error={errors.confirm}>
          <input {...bind("confirm")} type={show.confirm ? "text" : "password"} autoComplete="new-password" placeholder="Confirm Password" aria-required />
          <button
            type="button"
            className="su-field__toggle"
            onClick={() => setShow((prev) => ({ ...prev, confirm: !prev.confirm }))}
            aria-label={show.confirm ? "Hide password" : "Show password"}
            aria-pressed={show.confirm}
          >
            {show.confirm ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
          </button>
        </OutlinedField>

        {/* Live password strength, shown once typing starts. */}
        {values.password && (
          <div className="su-strength" data-score={passed} aria-live="polite">
            <div className="su-strength__bar" aria-hidden>
              {PASSWORD_RULES.map((rule, index) => (
                <span key={rule.label} className={index < passed ? "is-on" : undefined} />
              ))}
            </div>
            <p>
              Password strength: <strong>{STRENGTH[passed]}</strong>
            </p>
            <ul>
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(values.password);
                return (
                  <li key={rule.label} className={ok ? "is-ok" : undefined}>
                    <FiCheck aria-hidden /> {rule.label}
                    <span className="visually-hidden-site">{ok ? " (done)" : " (missing)"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <OutlinedField id="signup-mobile" label="Mobile Number" required icon={FiSmartphone} error={errors.mobile}>
          <span className="su-field__prefix" aria-hidden>
            +91
          </span>
          <input
            {...bind("mobile")}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Enter Mobile Number"
            maxLength={10}
            onChange={(event) => update("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))}
            aria-required
          />
        </OutlinedField>

        <OutlinedField id="signup-referral" label="Enter Referral Code" icon={FiGift} error={errors.referral}>
          <input
            {...bind("referral")}
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="Enter Referral Code (Optional)"
            maxLength={12}
            onChange={(event) => update("referral", event.target.value.toUpperCase())}
          />
        </OutlinedField>
      </div>

      <div className={`su-agree ${errors.agree ? "has-error" : ""}`}>
        <label htmlFor="signup-agree">
          <input
            id="signup-agree"
            type="checkbox"
            checked={values.agree}
            onChange={onChange("agree")}
            aria-invalid={Boolean(errors.agree)}
            aria-describedby={errors.agree ? "signup-agree-error" : undefined}
            aria-required
          />
          <span className="su-agree__box" aria-hidden>
            <FiCheck />
          </span>
          <span>
            I agree to SSRTS{" "}
            <Link to={sitePaths.terms} target="_blank" rel="noopener">
              Terms &amp; Conditions
            </Link>{" "}
            <span className="su-agree__star" aria-hidden>
              *
            </span>
          </span>
        </label>
        {errors.agree && (
          <small id="signup-agree-error" className="su-field__error">
            {errors.agree}
          </small>
        )}
      </div>

      <button type="submit" className="btn-site btn-site--primary btn-site--block signup-card__submit">
        Verify Email &amp; Create An account <FiArrowRight aria-hidden />
      </button>
    </form>
  );
};

export default SignupForm;
