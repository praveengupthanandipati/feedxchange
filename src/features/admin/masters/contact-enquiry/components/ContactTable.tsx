import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import type { ContactEnquiry } from "../contactEnquiry.data";
import { formatEnquiryDate } from "../contactEnquiry.utils";
import { ContactEmail, ContactPhone, ContactStatusBadge } from "./ContactBits";

export interface ContactListProps {
  rows: ContactEnquiry[];
  emptyMessage: string;
  onUpdateStatus: (enquiry: ContactEnquiry) => void;
}

/** Laptop and desktop view. */
const ContactTable = ({ rows, emptyMessage, onUpdateStatus }: ContactListProps) => {
  const columns: TableColumn<ContactEnquiry>[] = [
    { key: "fullName", header: "Full Name", sortable: true, render: (row) => <span className="contact-enquiry__wrap">{row.fullName}</span> },
    { key: "email", header: "Email", sortable: true, render: (row) => <ContactEmail email={row.email} /> },
    { key: "phone", header: "Phone Number", sortable: true, render: (row) => <ContactPhone phone={row.phone} /> },
    { key: "subject", header: "Subject", sortable: true, render: (row) => <span className="contact-enquiry__wrap">{row.subject}</span> },
    {
      key: "message",
      header: "Message",
      sortable: true,
      // Long messages are clamped to a few lines; the full text is in the tooltip.
      render: (row) => (
        <span className="contact-enquiry__wrap contact-enquiry__clamp" title={row.message}>
          {row.message}
        </span>
      ),
    },
    { key: "date", header: "Date", sortable: true, render: (row) => <span className="contact-enquiry__nowrap">{formatEnquiryDate(row.date)}</span> },
    { key: "status", header: "Status", sortable: true, render: (row) => <ContactStatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button type="button" className="contact-enquiry__btn contact-enquiry__btn--navy contact-enquiry__btn--sm" onClick={() => onUpdateStatus(row)} aria-label={`Update status of enquiry from ${row.fullName}`}>
          Update Status
        </button>
      ),
    },
  ];

  return (
    <div className="contact-enquiry__table-view">
      <Table columns={columns} data={rows} rowKey={(row) => row.id} className="contact-enquiry__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default ContactTable;
