export type EnquiryStatus = "New" | "Active" | "Closed";

/** A product enquiry sent from the website. */
export interface ProductEnquiry {
  id: string;
  productName: string;
  qtyMt: number;
  companyName: string;
  city: string;
  natureOfBusiness: string;
  email: string;
  phone: string;
  /** yyyy-mm-dd */
  date: string;
  status: EnquiryStatus;
  /** "" while unassigned. */
  assignedTo: string;
  comments: string;
}

/** What the Update Enquiry Status panel collects. */
export interface EnquiryUpdate {
  status: EnquiryStatus;
  assignedTo: string;
  comments: string;
}

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["New", "Active", "Closed"];
export const STATUS_OPTIONS = ENQUIRY_STATUSES.map((status) => ({ value: status, label: status }));

// TODO: load the team list from the users API once it is available.
export const ASSIGNEE_OPTIONS = ["Praveen", "Sathesh", "Mounica", "Swathi"].map((name) => ({ value: name, label: name }));

// TODO: replace with the product-enquiries API once it is available.
export const productEnquiries: ProductEnquiry[] = [
  {
    id: "1",
    productName: "Millets",
    qtyMt: 10,
    companyName: "Raghavendra seeds pvt ltd",
    city: "hyd",
    natureOfBusiness: "Producers",
    email: "raju@gmail.com",
    phone: "9705306737",
    date: "2026-06-16",
    status: "New",
    assignedTo: "",
    comments: "",
  },
  {
    id: "2",
    productName: "Rapeseed DOC",
    qtyMt: 12,
    companyName: "Raghavendra seeds pvt ltd",
    city: "Hyderabad",
    natureOfBusiness: "Manufacturing",
    email: "Mounica.kotapati@yopmail.com",
    phone: "7337286280",
    date: "2026-04-12",
    status: "New",
    assignedTo: "",
    comments: "",
  },
  {
    id: "3",
    productName: "Maize DDGS",
    qtyMt: 25,
    companyName: "SL International",
    city: "Vijayawada",
    natureOfBusiness: "Agriculture & Food Processing",
    email: "jashuva@yopmail.com",
    phone: "8499083999",
    date: "2026-03-29",
    status: "Active",
    assignedTo: "",
    comments: "",
  },
];
