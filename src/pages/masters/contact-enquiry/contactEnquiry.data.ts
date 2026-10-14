export type ContactEnquiryStatus = "Open" | "In Progress" | "Closed";

/** A message sent from the website's Contact Us form. */
export interface ContactEnquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  /** yyyy-mm-dd */
  date: string;
  status: ContactEnquiryStatus;
  comments: string;
}

/** What the Update Status panel collects. */
export interface ContactEnquiryUpdate {
  status: ContactEnquiryStatus;
  comments: string;
}

export const CONTACT_STATUSES: ContactEnquiryStatus[] = ["Open", "In Progress", "Closed"];
export const STATUS_OPTIONS = CONTACT_STATUSES.map((status) => ({ value: status, label: status }));

// TODO: replace with the contact-enquiries API once it is available.
export const contactEnquiries: ContactEnquiry[] = [
  {
    id: "1",
    fullName: "Hrishikesh Mithinti",
    email: "kittu@gmail.com",
    phone: "8499053999",
    subject: "Happy with your services",
    message: "Happy",
    date: "2026-04-05",
    status: "Open",
    comments: "",
  },
  {
    id: "2",
    fullName: "Kiran Ki",
    email: "kiran@gmail.com",
    phone: "8848499885",
    subject: "Testin u",
    message: "hi",
    date: "2026-03-29",
    status: "Open",
    comments: "",
  },
];
