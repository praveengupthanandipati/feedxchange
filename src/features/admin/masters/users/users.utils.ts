import type { MasterUser, UserForm } from "./users.data";

export type FormErrors = Partial<Record<"business" | "firstName" | "email" | "password" | "phone" | "altPhone" | "postalCode" | "role", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const POSTAL_PATTERN = /^\d{6}$/;
export const MIN_PASSWORD_LENGTH = 6;

export const fullName = (user: MasterUser) => `${user.firstName} ${user.lastName}`.trim();

/** Spaces and dashes are allowed while typing; only the digits are stored. */
export const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Today as yyyy-mm-dd, for the date pickers' upper limit. */
export const today = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const toForm = (user: MasterUser): UserForm => {
  const { id: _id, status, ...rest } = user;
  return { ...rest, password: "", active: status === "Active" };
};

/** Password is required for new users only; leaving it blank on edit keeps the current one. */
export function validateUser(form: UserForm, users: MasterUser[], editingId: string | null): FormErrors {
  const errors: FormErrors = {};
  const email = form.email.trim().toLowerCase();

  if (!form.business) errors.business = "Select a business.";
  if (!form.firstName.trim()) errors.firstName = "Enter the first name.";

  if (!email) errors.email = "Enter the email.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  else if (users.some((user) => user.id !== editingId && user.email.toLowerCase() === email)) errors.email = "A user with this email already exists.";

  if (!editingId && !form.password) errors.password = "Enter a password.";
  else if (form.password && form.password.length < MIN_PASSWORD_LENGTH) errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;

  if (!form.phone.trim()) errors.phone = "Enter the phone number.";
  else if (!PHONE_PATTERN.test(digitsOnly(form.phone))) errors.phone = "Enter a valid 10-digit mobile number.";
  if (form.altPhone.trim() && !PHONE_PATTERN.test(digitsOnly(form.altPhone))) errors.altPhone = "Enter a valid 10-digit mobile number.";

  if (form.postalCode.trim() && !POSTAL_PATTERN.test(form.postalCode.trim())) errors.postalCode = "Enter a 6-digit postal code.";
  if (!form.role) errors.role = "Select a role.";
  return errors;
}
