// TODO: replace with real data once the promoter profile API is wired up.

import type { SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { Promoter } from "../promoterslist/promoters.data";

export interface DocumentRow {
  id: string;
  sno: number;
  documentName: string;
  registrationNumber: string;
  issueAuthority: string;
  issueDate: string;
  fileName: string;
}

export interface PromoterProfile {
  promoterCode: string;
  completeAddress: string;
  companyName: string;
  designation: string;
  associatedProducts: string;
  region: string;
  commissionStructure: string;
  commissionRateValue: string;
  paymentFrequency: string;
  remarks: string;
  documents: DocumentRow[];
}

const COMPANY_NAMES = ["RK Enterprises", "HV Traders", "SB Agencies", "LP Associates"];
const DESIGNATIONS = ["Marketing Manager", "Field Promoter", "Regional Coordinator", "Sales Associate"];
const PRODUCT_COMBOS = [
  "Rapeseed DOC, Soya DOC",
  "Maize DDGS, Rice DDGS",
  "DORB, Soya DOC",
  "Maize DDGS, Rapeseed DOC",
];
const REGION_COMBOS = [
  "Central India, West India",
  "North India, East India",
  "South India, West India",
  "North India, Central India",
];
const COMMISSION_STRUCTURES = ["Percentage of Sales", "Flat Fee", "Tiered Commission"];
const PAYMENT_FREQUENCIES = ["Monthly", "Quarterly", "Per Transaction"];
const DOCUMENT_NAMES = ["Passport", "PAN Card", "Aadhaar Card", "Voter ID"];

function seededPick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

export function getPromoterProfile(promoter: Promoter): PromoterProfile {
  const seed = hashId(promoter.id);
  const firstName = promoter.promoterName.split(" ")[0];

  const documents: DocumentRow[] = [
    {
      id: `${promoter.id}-document-0`,
      sno: 1,
      documentName: seededPick(DOCUMENT_NAMES, seed),
      registrationNumber: `IND${2200000 + (seed % 799999)}`,
      issueAuthority: `${seededPick(DOCUMENT_NAMES, seed)} Authority`,
      issueDate: "2021-01-02",
      fileName: `Document_${(seed % 90) + 10}.pdf`,
    },
  ];

  return {
    promoterCode: promoter.referralCode,
    completeAddress: `${firstName} Beach, ${promoter.district}, ${promoter.state}, ${500000 + (seed % 99999)}`,
    companyName: seededPick(COMPANY_NAMES, seed).split(" ")[0].slice(0, 2).toUpperCase(),
    designation: seededPick(DESIGNATIONS, seed),
    associatedProducts: seededPick(PRODUCT_COMBOS, seed),
    region: seededPick(REGION_COMBOS, seed),
    commissionStructure: seededPick(COMMISSION_STRUCTURES, seed),
    commissionRateValue: (0.01 + (seed % 10) / 100).toFixed(2),
    paymentFrequency: seededPick(PAYMENT_FREQUENCIES, seed),
    remarks: "",
    documents,
  };
}

export function toRecipientOptions(promoter: Promoter): SearchableSelectOption[] {
  return [{ value: promoter.id, label: promoter.promoterName }];
}
