import { downloadBlob } from "../../truck-management/seller-dispatches-new/update-seller-dispatch/invoicePdf";
import type { ProductEnquiry } from "./productEnquiries.data";

export const NOT_ASSIGNED = "NA";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 2026-06-16 → 16 Jun 2026. Built by hand so every browser shows the same text. */
export const formatEnquiryDate = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day} ${MONTHS[Number(month) - 1] ?? month} ${year}`;
};

export function matchesSearch(enquiry: ProductEnquiry, query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return [enquiry.productName, enquiry.companyName, enquiry.city, enquiry.email, enquiry.phone].some((value) => value.toLowerCase().includes(term));
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function exportEnquiries(rows: ProductEnquiry[]) {
  const head = ["Product Name", "Qty in MT", "Company Name", "City", "Nature of Business", "Email", "Phone Number", "Date", "Status", "Assign To", "Comments"];
  const body = rows
    .map((row) =>
      [
        row.productName,
        String(row.qtyMt),
        row.companyName,
        row.city,
        row.natureOfBusiness,
        row.email,
        row.phone,
        formatEnquiryDate(row.date),
        row.status,
        row.assignedTo || NOT_ASSIGNED,
        row.comments,
      ]
        // Text format keeps phone numbers from turning into 9.7E+09 in Excel.
        .map((cell) => `<td style="mso-number-format:'\\@'">${escapeHtml(cell)}</td>`)
        .join(""),
    )
    .map((cells) => `<tr>${cells}</tr>`)
    .join("");
  const html = `<meta charset="utf-8"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
  downloadBlob(new Blob([html], { type: "application/vnd.ms-excel" }), "product-enquiries.xls");
}
