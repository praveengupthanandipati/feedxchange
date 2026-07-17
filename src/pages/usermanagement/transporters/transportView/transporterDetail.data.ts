// TODO: replace with real data once the transporter profile API is wired up.

import type { SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { Transporter } from "../transportersList/transporters.data";

export interface AddressRow {
  id: string;
  officeName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapUrl: string;
}

export interface ContactRow {
  id: string;
  contactName: string;
  isPrimary: boolean;
  designation: string;
  email: string;
  phone: string;
  additionalPhone: string;
}

export interface BankRow {
  id: string;
  accountType: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchIfsc: string;
  isPrimary: boolean;
}

export interface DocumentRow {
  id: string;
  sno: number;
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  fileName: string;
}

export interface TransporterProfile {
  transporterLegalName: string;
  transporterOwnerName: string;
  tradingName: string;
  mobile: string;
  email: string;
  website: string;
  city: string;
  state: string;
  yearOfEstablishment: string;
  panNumber: string;
  gstNumber: string;
  typeOfTransporter: string;
  group: string;
  referralBy: string;
  googleMapLocation: string;
  transporterDescription: string;
  addresses: AddressRow[];
  contacts: ContactRow[];
  bankDetails: BankRow[];
  documents: DocumentRow[];
}

const OFFICE_TEMPLATES: { officeName: string; address: string; pincode: string }[] = [
  { officeName: "Head Office", address: "Ausa Road, Near Hanuman Mandir, Opp Amar Lane", pincode: "413512" },
  { officeName: "Branch Office", address: "Plot No. 12, Transport Nagar", pincode: "500072" },
  { officeName: "Loading Yard", address: "Survey No. 8, Near NH-16", pincode: "530046" },
];

const OWNER_FIRST_NAMES = ["Amar", "Suresh", "Ravi", "Krishna", "Balaji", "Naveen", "Prakash"];
const OWNER_LAST_NAMES = ["Bhosale", "Reddy", "Rao", "Sharma", "Patil", "Naidu"];
const DESIGNATIONS = ["Manager", "Accountant", "Dispatcher", "Driver Coordinator", "Brother"];
const DOCUMENT_TYPES = ["Transport License", "PAN Card", "GST Certificate", "Vehicle Permit"];
const ACCOUNT_TYPES = ["Current Account", "Savings Account", "Cash Credit"];
const BANKS = [
  { bankName: "HDFC Bank", branchIfsc: "Kandivili West, HDFC0000288" },
  { bankName: "State Bank of India", branchIfsc: "Vijayawada Main, SBIN0001234" },
  { bankName: "ICICI Bank", branchIfsc: "Rajahmundry Branch, ICIC0002222" },
];

function seededPick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

export function getTransporterProfile(transporter: Transporter): TransporterProfile {
  const seed = hashId(transporter.id);
  const ownerName = `${seededPick(OWNER_FIRST_NAMES, seed)} ${seededPick(OWNER_LAST_NAMES, seed, 1)}`;

  const addressCount = 1 + (seed % 2); // 1-2 addresses
  const addresses: AddressRow[] = Array.from({ length: addressCount }, (_, index) => {
    const template = seededPick(OFFICE_TEMPLATES, seed, index);
    return {
      id: `${transporter.id}-address-${index}`,
      officeName: `${template.officeName}${index === 0 ? "" : index}`,
      address: template.address,
      city: transporter.location,
      state: transporter.state,
      pincode: template.pincode,
      googleMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(template.address)}`,
    };
  });

  const contactCount = 1 + (seed % 2); // 1-2 contacts
  const contacts: ContactRow[] = Array.from({ length: contactCount }, (_, index) => ({
    id: `${transporter.id}-contact-${index}`,
    contactName: index === 0 ? seededPick(OWNER_FIRST_NAMES, seed, 2) : `Associate ${index}`,
    isPrimary: index === 0,
    designation: seededPick(DESIGNATIONS, seed, index),
    email: "N/A",
    phone: transporter.mobile,
    additionalPhone: "N/A",
  }));

  const bankDetails: BankRow[] = [
    {
      id: `${transporter.id}-bank-0`,
      accountType: seededPick(ACCOUNT_TYPES, seed),
      accountName: transporter.companyName,
      accountNumber: String(800000000000 + (seed % 99999999)),
      bankName: seededPick(BANKS, seed).bankName,
      branchIfsc: seededPick(BANKS, seed).branchIfsc,
      isPrimary: true,
    },
  ];

  const documents: DocumentRow[] = Array.from({ length: 1 + (seed % 2) }, (_, index) => ({
    id: `${transporter.id}-document-${index}`,
    sno: index + 1,
    documentType: seededPick(DOCUMENT_TYPES, seed, index),
    documentNumber: `MDMDK${(seed + index * 97) % 99999999}`.slice(0, 13).toUpperCase(),
    issuingAuthority: "State Transport Authority",
    issueDate: "2021-02-02",
    fileName: `${seededPick(DOCUMENT_TYPES, seed, index).toLowerCase().replace(/\s+/g, "-")}.pdf`,
  }));

  return {
    transporterLegalName: transporter.companyName,
    transporterOwnerName: ownerName,
    tradingName: transporter.companyName.split(" ")[0],
    mobile: transporter.mobile,
    email: `${transporter.companyName.replace(/\s+/g, "").toLowerCase()}@gmail.com`,
    website: "",
    city: transporter.location,
    state: transporter.state,
    yearOfEstablishment: String(2005 + (seed % 20)),
    panNumber: `ADKAF${1000 + (seed % 8999)}D`,
    gstNumber: `29ADKAF${1000 + (seed % 8999)}D1ZC`,
    typeOfTransporter: transporter.transporterType,
    group: transporter.companyName.split(" ")[0],
    referralBy: "",
    googleMapLocation: "",
    transporterDescription: "",
    addresses,
    contacts,
    bankDetails,
    documents,
  };
}

export function toRecipientOptions(profile: TransporterProfile): SearchableSelectOption[] {
  return profile.contacts.map((contact) => ({
    value: contact.id,
    label: `${contact.contactName} (${contact.designation})`,
  }));
}
