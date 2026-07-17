// TODO: replace with real data once the promoters API is wired up.

import { indianStates } from "../../businessowners/BusinessList/businessOwners.data";

export type PromoterStatus = "Active" | "Inactive";

export interface Promoter {
  id: string;
  promoterName: string;
  referralCode: string;
  status: PromoterStatus;
  noOfRef: number;
  phone: string;
  email: string;
  state: string;
  district: string;
}

export const stateOptions = [
  { value: "All", label: "All" },
  ...indianStates.map((state) => ({ value: state, label: state })),
];

const DISTRICTS = [
  "Krishna",
  "Guntur",
  "East Godavari",
  "West Godavari",
  "SPSR Nellore",
  "Chittoor",
];

export const districtOptions = [
  { value: "All", label: "All" },
  ...DISTRICTS.map((district) => ({ value: district, label: district })),
];

const PROMOTER_NAMES = [
  "Rama Krishna",
  "Hemavardhan",
  "Suresh Babu",
  "Lakshmi Prasanna",
  "Venkata Ramana",
  "Anitha Reddy",
  "Naveen Kumar",
  "Sridevi Rao",
  "Praveen Chandra",
  "Kavitha Sharma",
];

const REFERRAL_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function buildReferralCode(seed: number): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CODE_CHARS[(seed + i * 37) % REFERRAL_CODE_CHARS.length];
  }
  return code;
}

const STATUSES: PromoterStatus[] = ["Active", "Inactive"];
const ROW_COUNT = 12;
const MOBILE_PREFIXES = ["6", "7", "8", "9"];

function buildPromoters(): Promoter[] {
  const rows: Promoter[] = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    const name = PROMOTER_NAMES[i % PROMOTER_NAMES.length];
    const firstName = name.split(" ")[0];
    const prefix = MOBILE_PREFIXES[i % MOBILE_PREFIXES.length];
    const rest = String(100000000 + ((i * 872341) % 900000000)).padStart(9, "0");

    rows.push({
      id: `pr-${1000 + i}`,
      promoterName: name,
      referralCode: buildReferralCode(i * 53 + 7),
      status: STATUSES[i % STATUSES.length],
      noOfRef: (i * 3) % 6,
      phone: `${prefix}${rest}`,
      email: `${firstName.toLowerCase()}@${i % 2 === 0 ? "gmail.com" : "emptylabs.com"}`,
      state: indianStates[(i * 4) % indianStates.length],
      district: DISTRICTS[i % DISTRICTS.length],
    });
  }

  return rows;
}

export const promoters: Promoter[] = buildPromoters();
