import { downloadBlob } from "../../truck-management/seller-dispatches-new/update-seller-dispatch/invoicePdf";
import type { Registration, RegistrationStatus } from "./registrationDetails.data";

/** 2026-03-30 → 30/03/2026. Built by hand so every browser shows the same text. */
export const formatRegistrationDate = (iso: string) => iso.split("-").reverse().join("/");

/** "Membership Taken" → "membership-taken", for the status modifier classes. */
export const statusSlug = (status: RegistrationStatus) => status.toLowerCase().replace(/\s+/g, "-");

export function matchesSearch(registration: Registration, query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return [registration.name, registration.phone, registration.email, registration.businessName, registration.lineOfBusiness, registration.referralCode].some((value) =>
    value.toLowerCase().includes(term),
  );
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function exportRegistrations(rows: Registration[]) {
  const head = ["Name", "Phone", "Email", "Registration Date", "Business Name", "Line of Business", "Referral Code", "Status", "Reason Description"];
  const body = rows
    .map((row) =>
      [row.name, row.phone, row.email, formatRegistrationDate(row.registrationDate), row.businessName, row.lineOfBusiness, row.referralCode, row.status, row.reason]
        // Text format keeps phone numbers from turning into 9.0E+09 in Excel.
        .map((cell) => `<td style="mso-number-format:'\\@'">${escapeHtml(cell)}</td>`)
        .join(""),
    )
    .map((cells) => `<tr>${cells}</tr>`)
    .join("");
  const html = `<meta charset="utf-8"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
  downloadBlob(new Blob([html], { type: "application/vnd.ms-excel" }), "registration-details.xls");
}
