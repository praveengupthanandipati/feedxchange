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

