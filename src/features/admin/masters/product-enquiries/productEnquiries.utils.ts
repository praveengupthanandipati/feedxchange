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

