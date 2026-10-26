import { formatEnquiryDate } from "../contactEnquiry.utils";
import { ContactEmail, ContactPhone, ContactStatusBadge } from "./ContactBits";
import type { ContactListProps } from "./ContactTable";

/** Phones and tablets: one card per enquiry instead of the wide table. */
const ContactCards = ({ rows, emptyMessage, onUpdateStatus }: ContactListProps) => (
  <ul className="contact-enquiry__cards">
    {rows.length === 0 && <li className="contact-enquiry__cards-empty">{emptyMessage}</li>}
    {rows.map((row) => (
      <li key={row.id} className="contact-enquiry__card">
        <div className="contact-enquiry__card-top">
          <strong>{row.fullName}</strong>
          <ContactStatusBadge status={row.status} />
        </div>
        <dl>
          <div className="contact-enquiry__card-full">
            <dt>Email</dt>
            <dd>
              <ContactEmail email={row.email} />
            </dd>
          </div>
          <div>
            <dt>Phone Number</dt>
            <dd>
              <ContactPhone phone={row.phone} />
            </dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatEnquiryDate(row.date)}</dd>
          </div>
          <div className="contact-enquiry__card-full">
            <dt>Subject</dt>
            <dd>{row.subject}</dd>
          </div>
          <div className="contact-enquiry__card-full">
            <dt>Message</dt>
            <dd>{row.message}</dd>
          </div>
        </dl>
        <div className="contact-enquiry__card-actions">
          <button type="button" className="contact-enquiry__btn contact-enquiry__btn--navy" onClick={() => onUpdateStatus(row)}>
            Update Status
          </button>
        </div>
      </li>
    ))}
  </ul>
);

export default ContactCards;
