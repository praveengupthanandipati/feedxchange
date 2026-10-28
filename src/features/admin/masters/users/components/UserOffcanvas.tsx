import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "../../../../../shared/components/icon";
import DatePickerInput from "../../../../../shared/components/dropdown/DatePickerInput";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ToggleSwitch from "../../../../../shared/components/toggle/ToggleSwitch";
import { BUSINESS_OPTIONS, CURRENT_ADMIN, EMPTY_FORM, ROLE_OPTIONS, type MasterUser, type UserForm } from "../users.data";
import { MIN_PASSWORD_LENGTH, toForm, today, validateUser, type FormErrors } from "../users.utils";
import FormField from "./FormField";
import PasswordInput from "./PasswordInput";

interface UserOffcanvasProps {
  /** The user being edited, or null to create a new one. */
  user: MasterUser | null;
  users: MasterUser[];
  onSave: (form: UserForm) => void;
  onClose: () => void;
}

type TextKey = "firstName" | "lastName" | "email" | "phone" | "altPhone" | "postalCode" | "city" | "state" | "country";

/** Create / Edit panel sliding in from the right: half the viewport from tablets up, full width on phones. */
const UserOffcanvas = ({ user, users, onSave, onClose }: UserOffcanvasProps) => {
  const [form, setForm] = useState<UserForm>(user ? toForm(user) : EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const firstNameRef = useRef<HTMLInputElement>(null);
  const isEdit = user !== null;
  const businessLocked = !CURRENT_ADMIN.isSsrtsAdmin;

  useEffect(() => {
    firstNameRef.current?.focus();
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

  const set = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateUser(form, users, user?.id ?? null);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      // Take the user to the first problem, which may be scrolled out of view on phones.
      const first = Object.keys(found).find((key) => found[key as keyof FormErrors]);
      if (first) document.getElementById(`user-${first}`)?.focus();
      return;
    }
    onSave(form);
  };

  /** Shared props for the plain text inputs. */
  const inputProps = (key: TextKey, placeholder: string) => {
    const error = errors[key as keyof FormErrors];
    return {
      id: `user-${key}`,
      className: `user-panel__input ${error ? "is-invalid" : ""}`,
      placeholder,
      value: form[key],
      onChange: (event: { target: { value: string } }) => set(key, event.target.value),
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? `user-${key}-error` : undefined,
    };
  };

  return createPortal(
    <>
      <div className="user-panel__backdrop" onClick={onClose} aria-hidden />
      <aside className="user-panel" role="dialog" aria-modal="true" aria-labelledby="user-panel-title">
        <header className="user-panel__header">
          <h2 id="user-panel-title">{isEdit ? "Edit User" : "Create User"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <XIcon aria-hidden />
          </button>
        </header>

        <form className="user-panel__body" onSubmit={handleSubmit} noValidate>
          <div className="user-panel__grid">
            <FormField id="user-business" label="Select Business" required wide plainLabel error={errors.business} hint={businessLocked ? "Business is fixed for non-SSRTS admins." : undefined}>
              <SearchableSelect options={BUSINESS_OPTIONS} value={form.business} onChange={(business) => set("business", business)} placeholder="Select business" ariaLabel="Select Business" disabled={businessLocked} />
            </FormField>

            <FormField id="user-firstName" label="First Name" required error={errors.firstName}>
              <input ref={firstNameRef} type="text" autoComplete="off" aria-required {...inputProps("firstName", "Enter first name")} />
            </FormField>
            <FormField id="user-lastName" label="Last Name">
              <input type="text" autoComplete="off" {...inputProps("lastName", "Enter last name")} />
            </FormField>

            <FormField id="user-email" label="Email" required error={errors.email}>
              <input type="email" inputMode="email" autoComplete="off" aria-required {...inputProps("email", "Enter email")} />
            </FormField>
            <FormField id="user-password" label="Password" required={!isEdit} error={errors.password} hint={isEdit ? "Leave blank to keep the current password." : `At least ${MIN_PASSWORD_LENGTH} characters.`}>
              <PasswordInput
                id="user-password"
                className={`user-panel__input ${errors.password ? "is-invalid" : ""}`}
                placeholder="Enter password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => set("password", event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "user-password-error" : undefined}
                aria-required={!isEdit}
              />
            </FormField>

            <FormField id="user-phone" label="Phone Number" required error={errors.phone}>
              <input type="tel" inputMode="tel" autoComplete="off" maxLength={14} aria-required {...inputProps("phone", "Enter phone number")} />
            </FormField>
            <FormField id="user-altPhone" label="Alternative Number" error={errors.altPhone}>
              <input type="tel" inputMode="tel" autoComplete="off" maxLength={14} {...inputProps("altPhone", "Enter alternate number")} />
            </FormField>

            <FormField id="user-address" label="Address" wide>
              <textarea
                id="user-address"
                rows={2}
                className="user-panel__input user-panel__textarea"
                placeholder="Enter address"
                value={form.address}
                onChange={(event) => set("address", event.target.value)}
              />
            </FormField>

            <FormField id="user-postalCode" label="Postal Code" error={errors.postalCode}>
              <input type="text" inputMode="numeric" autoComplete="off" maxLength={6} {...inputProps("postalCode", "Enter postal code")} />
            </FormField>
            <FormField id="user-city" label="City">
              <input type="text" autoComplete="off" {...inputProps("city", "Enter city")} />
            </FormField>
            <FormField id="user-state" label="State">
              <input type="text" autoComplete="off" {...inputProps("state", "Enter state")} />
            </FormField>
            <FormField id="user-country" label="Country">
              <input type="text" autoComplete="off" {...inputProps("country", "Enter country")} />
            </FormField>

            <FormField id="user-dob" label="Date Of Birth" plainLabel>
              <DatePickerInput id="user-dob" value={form.dateOfBirth} onChange={(date) => set("dateOfBirth", date)} max={today()} placeholder="Select Date Of Birth" ariaLabel="Date Of Birth" clearable />
            </FormField>
            <FormField id="user-anniversary" label="Date Of Anniversary" plainLabel>
              <DatePickerInput
                id="user-anniversary"
                value={form.dateOfAnniversary}
                onChange={(date) => set("dateOfAnniversary", date)}
                min={form.dateOfBirth || undefined}
                max={today()}
                placeholder="Select Date Of Anniversary"
                ariaLabel="Date Of Anniversary"
                clearable
              />
            </FormField>

            <FormField id="user-role" label="Select Role" required wide plainLabel error={errors.role}>
              <SearchableSelect options={ROLE_OPTIONS} value={form.role} onChange={(role) => set("role", role)} placeholder="Select role" ariaLabel="Select Role" />
            </FormField>

            <div className="user-panel__field user-panel__field--wide">
              <ToggleSwitch checked={form.active} onChange={(active) => set("active", active)} onLabel="Active / Inactive" offLabel="Active / Inactive" ariaLabel="Active" />
            </div>
          </div>

          <div className="user-panel__actions">
            <button type="submit" className="users__btn users__btn--navy">
              {isEdit ? "Update User" : "Save User"}
            </button>
            <button type="button" className="users__btn users__btn--warning" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  );
};

export default UserOffcanvas;
