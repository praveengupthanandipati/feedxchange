import { useMemo, useState, type ChangeEvent, type ReactNode, type SubmitEvent } from "react";
import {
  type IconComponent,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleCheckBigIcon,
  EyeIcon,
  EyeOffIcon,
  GiftIcon,
  LayersIcon,
  LockIcon,
  MailIcon,
  SmartphoneIcon,
  TagIcon,
  UserIcon,
} from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import {
  useGetAllBusinessLinesQuery,
  useGetBusinessSubTypesQuery,
  useGetBusinessTypesByLineQuery,
} from "../../../../core/store/businessProfilesApi";
import { useAddRegistrationDetailsMutation } from "../../../../core/store/registrationDetailsApi";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";
import { sitePaths } from "../../routes/paths";

interface SignupValues {
  firstName: string;
  lastName: string;
  business: string;
  /** Ids from the business line / type / sub type lookups (the same ones the admin business profile uses). */
  line: string;
  type: string;
  subType: string;
  email: string;
  password: string;
  confirm: string;
  mobile: string;
  referral: string;
  agree: boolean;
  /** Rates and updates by email / WhatsApp (optional). */
  subscribe: boolean;
}

type Field = keyof SignupValues;
type Errors = Partial<Record<Field, string>>;

const EMPTY: SignupValues = { firstName: "", lastName: "", business: "", line: "", type: "", subType: "", email: "", password: "", confirm: "", mobile: "", referral: "", agree: false, subscribe: false };
// Form order, so the first invalid field gets focus on submit.
const ORDER: Field[] = ["firstName", "lastName", "business", "line", "type", "subType", "email", "password", "confirm", "mobile", "referral", "agree"];

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

/** How many types / sub types the chosen line / type has: those fields are only required when there is something to pick. */
interface OptionCounts {
  types: number;
  subTypes: number;
}

function validateField(key: Field, values: SignupValues, counts: OptionCounts): string | undefined {
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
    case "type":
      return text || !values.line || counts.types === 0 ? undefined : "Select your type of business.";
    case "subType":
      return text || !values.type || counts.subTypes === 0 ? undefined : "Select your sub type of business.";
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

const validateAll = (values: SignupValues, counts: OptionCounts): Errors =>
  ORDER.reduce<Errors>((errors, key) => {
    const message = validateField(key, values, counts);
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
  icon: IconComponent;
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
  const [submitError, setSubmitError] = useState("");
  const [addRegistration, { isLoading: submitting }] = useAddRegistrationDetailsMutation();

  // Line → type → sub type, each list loaded once the one before it is chosen.
  const { data: lines, isLoading: linesLoading } = useGetAllBusinessLinesQuery();
  const { data: types, isFetching: typesLoading } = useGetBusinessTypesByLineQuery(values.line, { skip: !values.line });
  const { data: subTypes, isFetching: subTypesLoading } = useGetBusinessSubTypesQuery(values.type, { skip: !values.type });
  const lineOptions = useMemo(() => (lines ?? []).map((line) => ({ id: String(line.businessLineId), name: line.businessLineName })), [lines]);
  const typeOptions = useMemo(
    () => (values.line ? (types ?? []) : []).map((type) => ({ id: String(type.businessTypeId), name: type.businessTypeName })),
    [types, values.line],
  );
  const subTypeOptions = useMemo(
    () => (values.type ? (subTypes ?? []) : []).map((subType) => ({ id: String(subType.businessSubTypeId), name: subType.businessSubTypeName })),
    [subTypes, values.type],
  );
  // While a list is loading it counts as "has options", so the field stays required.
  const counts: OptionCounts = { types: typesLoading ? 1 : typeOptions.length, subTypes: subTypesLoading ? 1 : subTypeOptions.length };
  const nameOf = (options: { id: string; name: string }[], id: string) => options.find((option) => option.id === id)?.name ?? "";

  const update = (key: Field, value: string | boolean) => {
    const next = { ...values, [key]: value };
    // A new line clears its type and sub type; a new type clears its sub type.
    if (key === "line") Object.assign(next, { type: "", subType: "" });
    if (key === "type") next.subType = "";
    setValues(next);
    const recheck: Errors = {};
    if (touched[key] || errors[key]) recheck[key] = validateField(key, next, counts);
    if (key === "line") Object.assign(recheck, { type: undefined, subType: undefined });
    if (key === "type") recheck.subType = undefined;
    // Changing the password re-checks the confirmation too.
    if (key === "password" && (touched.confirm || errors.confirm)) recheck.confirm = validateField("confirm", next, counts);
    if (Object.keys(recheck).length) setErrors((current) => ({ ...current, ...recheck }));
  };

  const onChange = (key: Field) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    update(key, target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value);
  };

  const onBlur = (key: Field) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, values, counts) }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const found = validateAll(values, counts);
    setErrors(found);
    setTouched(Object.fromEntries(ORDER.map((key) => [key, true])));
    const first = ORDER.find((key) => found[key]);
    if (first) {
      document.getElementById(`signup-${first}`)?.focus();
      return;
    }
    setSubmitError("");
    try {
      await addRegistration({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        businessName: values.business.trim(),
        lineOfBusiness: nameOf(lineOptions, values.line),
        typeOfBusiness: nameOf(typeOptions, values.type),
        subTypeOfBusiness: nameOf(subTypeOptions, values.subType),
        email: values.email.trim(),
        password: values.password,
        phoneNumber: values.mobile.replace(/\D/g, ""),
        referralCode: values.referral.trim() || null,
        // Left to the server: a new registration starts pending until the email OTP is verified.
        isActive: null,
        isSubscribedToUpdates: values.subscribe,
        status: null,
        actionPerformedBy: 0,
      }).unwrap();
    } catch (error) {
      setSubmitError(apiErrorMessage(error, "We couldn't create your account. Please try again."));
      return;
    }
    setSentTo(values.email.trim());
    setValues(EMPTY);
    setTouched({});
  };

  // Shared props for text inputs: id, change/blur handlers and error wiring.
  const bind = (key: Exclude<Field, "agree" | "subscribe">, hint = false) => ({
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
        <CircleCheckBigIcon aria-hidden />
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
        <OutlinedField id="signup-firstName" label="First Name" required icon={UserIcon} error={errors.firstName}>
          <input {...bind("firstName")} type="text" autoComplete="given-name" placeholder="First Name" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-lastName" label="Last Name" required icon={UserIcon} error={errors.lastName}>
          <input {...bind("lastName")} type="text" autoComplete="family-name" placeholder="Last Name" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-business" label="Business Name" required icon={BriefcaseIcon} error={errors.business}>
          <input {...bind("business")} type="text" autoComplete="organization" placeholder="Business Name" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-line" label="Line of Business" required icon={BriefcaseIcon} error={errors.line}>
          <select {...bind("line")} className={values.line ? undefined : "is-empty"} aria-required>
            <option value="" disabled>
              {linesLoading ? "Loading…" : "Select Line of Business"}
            </option>
            {lineOptions.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon aria-hidden className="su-field__chevron" />
        </OutlinedField>

        <OutlinedField id="signup-type" label="Type of Business" required icon={LayersIcon} error={errors.type}>
          <select {...bind("type")} className={values.type ? undefined : "is-empty"} disabled={!values.line || typeOptions.length === 0} aria-required>
            <option value="" disabled>
              {!values.line ? "Select Line of Business first" : typesLoading ? "Loading…" : typeOptions.length ? "Select Type of Business" : "No types for this line"}
            </option>
            {typeOptions.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon aria-hidden className="su-field__chevron" />
        </OutlinedField>

        <OutlinedField id="signup-subType" label="Sub Type of Business" required icon={TagIcon} error={errors.subType}>
          <select {...bind("subType")} className={values.subType ? undefined : "is-empty"} disabled={!values.type || subTypeOptions.length === 0} aria-required>
            <option value="" disabled>
              {!values.type ? "Select Type of Business first" : subTypesLoading ? "Loading…" : subTypeOptions.length ? "Select Sub Type" : "No sub types for this type"}
            </option>
            {subTypeOptions.map((subType) => (
              <option key={subType.id} value={subType.id}>
                {subType.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon aria-hidden className="su-field__chevron" />
        </OutlinedField>

        <OutlinedField id="signup-email" label="Email Id" required icon={MailIcon} error={errors.email} hint="* This will be your Login user ID and OTP will be sent here" wide>
          <input {...bind("email", true)} type="email" inputMode="email" autoComplete="email" placeholder="Enter Your Email Id" aria-required />
        </OutlinedField>

        <OutlinedField id="signup-password" label="Password" required icon={LockIcon} error={errors.password}>
          <input {...bind("password")} type={show.password ? "text" : "password"} autoComplete="new-password" placeholder="Password" aria-required />
          <button
            type="button"
            className="su-field__toggle"
            onClick={() => setShow((prev) => ({ ...prev, password: !prev.password }))}
            aria-label={show.password ? "Hide password" : "Show password"}
            aria-pressed={show.password}
          >
            {show.password ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
          </button>
        </OutlinedField>

        <OutlinedField id="signup-confirm" label="Confirm Password" required icon={LockIcon} error={errors.confirm}>
          <input {...bind("confirm")} type={show.confirm ? "text" : "password"} autoComplete="new-password" placeholder="Confirm Password" aria-required />
          <button
            type="button"
            className="su-field__toggle"
            onClick={() => setShow((prev) => ({ ...prev, confirm: !prev.confirm }))}
            aria-label={show.confirm ? "Hide password" : "Show password"}
            aria-pressed={show.confirm}
          >
            {show.confirm ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
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
                    <CheckIcon aria-hidden /> {rule.label}
                    <span className="visually-hidden-site">{ok ? " (done)" : " (missing)"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <OutlinedField id="signup-mobile" label="Mobile Number" required icon={SmartphoneIcon} error={errors.mobile}>
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

        <OutlinedField id="signup-referral" label="Enter Referral Code" icon={GiftIcon} error={errors.referral}>
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
            <CheckIcon />
          </span>
          <span>
            I agree to FeedXchange{" "}
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

      <div className="su-agree">
        <label htmlFor="signup-subscribe">
          <input id="signup-subscribe" type="checkbox" checked={values.subscribe} onChange={onChange("subscribe")} />
          <span className="su-agree__box" aria-hidden>
            <CheckIcon />
          </span>
          <span>Send me daily rates and market updates</span>
        </label>
      </div>

      {submitError && (
        <p className="su-field__error signup-card__error" role="alert">
          {submitError}
        </p>
      )}

      <button type="submit" className="btn-site btn-site--primary btn-site--block signup-card__submit" disabled={submitting}>
        {submitting ? (
          "Creating your account…"
        ) : (
          <>
            Verify Email &amp; Create An account <ArrowRightIcon aria-hidden />
          </>
        )}
      </button>
    </form>
  );
};

export default SignupForm;
