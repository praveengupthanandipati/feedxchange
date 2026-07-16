// TODO: replace with real data once the business owner profile API is wired up.

import type { SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { BusinessOwner } from "../BusinessList/businessOwners.data";

export interface BrokerageChargeRow {
  product: string;
  buyCharge: number;
  sellCharge: number;
}

export interface CapacityRow {
  product: string;
  tpd: number;
  tpm: number;
}

export interface AddressRow {
  id: string;
  officeName: string;
  tag?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapUrl: string;
}

export interface ContactRow {
  id: string;
  contactName: string;
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
  documentName: string;
  registrationNumber: string;
  issueAuthority: string;
  issueDate: string;
  fileName: string;
}

export interface BusinessOwnerProfile {
  businessLegalName: string;
  tradingName: string;
  businessType: string;
  mobile: string;
  email: string;
  website: string;
  city: string;
  state: string;
  location: string;
  pincode: string;
  yearOfEstablishment: string;
  lineOfBusiness: string;
  subTypeOfBusiness: string;
  group: string;
  collectionArea: string;
  area: string;
  panNumber: string;
  gstNumber: string;
  businessDescription: string;
  brokerageCharges: BrokerageChargeRow[];
  capacity: CapacityRow[];
  addresses: AddressRow[];
  contacts: ContactRow[];
  bankDetails: BankRow[];
  documents: DocumentRow[];
}

const OFFICE_TEMPLATES: { officeName: string; tag?: string; address: string; pincode: string }[] = [
  {
    officeName: "Head Office",
    tag: "Unloading Location",
    address: "174, Mahatma Gandhi Complex, Mahendra Nagar, Gollapudi",
    pincode: "521225",
  },
  { officeName: "Branch Office", address: "Plot No. 22, Poultry Road, Kukatpally", pincode: "500072" },
  {
    officeName: "Feed Mill",
    tag: "Unloading Location",
    address: "Survey No. 45, Near NH-16, Duvvada",
    pincode: "530046",
  },
  { officeName: "Farm Unit", address: "Village Road, Chinnakakani", pincode: "522509" },
];

const DESIGNATIONS = ["Manager", "Accountant", "Purchase Executive", "Sales Executive"];
const DOCUMENT_TYPES = ["GST Certificate", "PAN Card", "FSSAI License", "Shop & Establishment License"];
const ACCOUNT_TYPES = ["Current", "Savings", "Cash Credit"];
const BANKS = [
  { bankName: "SBI", branchIfsc: "PBB Kukatpally, SBIN004275" },
  { bankName: "HDFC Bank", branchIfsc: "Guntur Branch, HDFC0001111" },
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

export function getBusinessOwnerProfile(owner: BusinessOwner): BusinessOwnerProfile {
  const seed = hashId(owner.id);
  const firstName = owner.companyName.split(" ")[0];
  const domain = `${firstName.toLowerCase()}business.com`;

  const addressCount = 2 + (seed % 3); // 2-4 addresses
  const addresses: AddressRow[] = Array.from({ length: addressCount }, (_, index) => {
    const template = seededPick(OFFICE_TEMPLATES, seed, index);
    const addressState = seededPick([owner.state, "Andhra Pradesh", "Telangana"], seed, index);
    return {
      id: `${owner.id}-address-${index}`,
      officeName: template.officeName,
      tag: template.tag,
      address: template.address,
      city: seededPick([owner.location, "Vijayawada", "Hyderabad", "Guntur"], seed, index),
      state: addressState,
      pincode: template.pincode,
      googleMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(template.address)}`,
    };
  });

  const contactCount = 1 + (seed % 3); // 1-3 contacts
  const contacts: ContactRow[] = Array.from({ length: contactCount }, (_, index) => ({
    id: `${owner.id}-contact-${index}`,
    contactName: index === 0 ? owner.companyName.split(" ")[0] : `${firstName} Associate ${index}`,
    designation: seededPick(DESIGNATIONS, seed, index),
    email: index === 0 ? `${firstName.toLowerCase()}@${domain}` : `associate${index}.${domain}`,
    phone: owner.mobile,
    additionalPhone: `9${String(800000000 + ((seed + index * 137) % 99999999)).padStart(9, "0").slice(0, 9)}`,
  }));

  const bankDetails: BankRow[] = [
    {
      id: `${owner.id}-bank-0`,
      accountType: seededPick(ACCOUNT_TYPES, seed),
      accountName: `${owner.companyName.split(" ")[0]} Kumar`,
      accountNumber: String(900000000 + (seed % 99999999)),
      bankName: seededPick(BANKS, seed).bankName,
      branchIfsc: seededPick(BANKS, seed).branchIfsc,
      isPrimary: true,
    },
  ];

  const documents: DocumentRow[] = Array.from({ length: 1 + (seed % 2) }, (_, index) => ({
    id: `${owner.id}-document-${index}`,
    sno: index + 1,
    documentName: seededPick(DOCUMENT_TYPES, seed, index),
    registrationNumber: `REG${(seed + index * 97) % 999999}`,
    issueAuthority: "State Authority",
    issueDate: "2026-06-29",
    fileName: `${seededPick(DOCUMENT_TYPES, seed, index).toLowerCase().replace(/\s+/g, "-")}.pdf`,
  }));

  return {
    businessLegalName: owner.companyName,
    tradingName: firstName,
    businessType: owner.businessType,
    mobile: owner.mobile,
    email: `${firstName.toLowerCase()}@${domain}`,
    website: `https://${domain}`,
    city: owner.location,
    state: owner.state,
    location: "Main Road",
    pincode: addresses[0]?.pincode ?? "",
    yearOfEstablishment: String(2005 + (seed % 20)),
    lineOfBusiness: owner.businessType === "Fish Farm" ? "Aqua Farming" : "Poultry Farming",
    subTypeOfBusiness: owner.businessType === "Fish Farm" ? "Freshwater" : "Cage System",
    group: seededPick(["North Zone", "South Zone", "East Zone", "West Zone"], seed),
    collectionArea: owner.location,
    area: seededPick(["Achutapuram", "Nellore", "Eluru", "Chittoor"], seed),
    panNumber: `APMPM${1000 + (seed % 8999)}R`,
    gstNumber: `GST${100000 + (seed % 899999)}`,
    businessDescription: "",
    brokerageCharges: [
      { product: owner.businessType === "Fish Farm" ? "Fish Feed" : "Layer Feed", buyCharge: 60, sellCharge: 60 },
    ],
    capacity: [
      { product: owner.businessType === "Fish Farm" ? "Fish Feed" : "Layer Feed", tpd: 10, tpm: 300 },
    ],
    addresses,
    contacts,
    bankDetails,
    documents,
  };
}

export interface LinkedBusinessRow {
  id: string;
  companyName: string;
  businessType: string;
  location: string;
  mobile: string;
  state: string;
}

export function toRecipientOptions(profile: BusinessOwnerProfile): SearchableSelectOption[] {
  return profile.contacts.map((contact) => ({ value: contact.id, label: `${contact.contactName} (${contact.designation})` }));
}
