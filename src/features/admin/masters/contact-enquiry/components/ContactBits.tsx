import type { ContactEnquiryStatus } from "../contactEnquiry.data";
import { statusSlug } from "../contactEnquiry.utils";

/** Email and phone as tap-to-contact links. */
export const ContactEmail = ({ email }: { email: string }) => (
  <a className="contact-enquiry__link contact-enquiry__email" href={`mailto:${email}`}>
    {email}
  </a>
);

export const ContactPhone = ({ phone }: { phone: string }) => (
  <a className="contact-enquiry__link" href={`tel:${phone}`}>
    {phone}
  </a>
);

export const ContactStatusBadge = ({ status }: { status: ContactEnquiryStatus }) => (
  <span className={`contact-enquiry__status contact-enquiry__status--${statusSlug(status)}`}>{status}</span>
);
