import { downloadBlob } from "../../truck-management/seller-dispatches-new/update-seller-dispatch/invoicePdf";
import { formatEnquiryDate } from "../product-enquiries/productEnquiries.utils";
import type { ContactEnquiry, ContactEnquiryStatus } from "./contactEnquiry.data";

export { formatEnquiryDate };

/** "In Progress" → "in-progress", for the status badge modifier class. */
export const statusSlug = (status: ContactEnquiryStatus) => status.toLowerCase().replace(/\s+/g, "-");

export function matchesSearch(enquiry: ContactEnquiry, query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return [enquiry.fullName, enquiry.email, enquiry.phone, enquiry.subject, enquiry.message].some((value) => value.toLowerCase().includes(term));
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function exportContactEnquiries(rows: ContactEnquiry[]) {
  const head = ["Full Name", "Email", "Phone Number", "Subject", "Message", "Date", "Status", "Comments"];
  const body = rows
    .map((row) =>
      [row.fullName, row.email, row.phone, row.subject, row.message, formatEnquiryDate(row.date), row.status, row.comments]
        // Text format keeps phone numbers from turning into 8.4E+09 in Excel.
        .map((cell) => `<td style="mso-number-format:'\\@'">${escapeHtml(cell)}</td>`)
        .join(""),
    )
    .map((cells) => `<tr>${cells}</tr>`)
    .join("");
  const html = `<meta charset="utf-8"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
  downloadBlob(new Blob([html], { type: "application/vnd.ms-excel" }), "contact-enquiries.xls");
}
