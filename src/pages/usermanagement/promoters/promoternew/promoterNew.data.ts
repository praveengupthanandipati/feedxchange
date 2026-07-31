// TODO: replace with real reference data once the promoter masters are wired up.

import { indianStates } from "../../businessowners/BusinessList/businessOwners.data";
import { productOptions } from "../../../contracts/newContract.data";

export { productOptions };

export const cityOptions = [
  { value: "vijayawada", label: "Vijayawada" },
  { value: "guntur", label: "Guntur" },
  { value: "rajahmundry", label: "Rajahmundry" },
  { value: "kakinada", label: "Kakinada" },
  { value: "nellore", label: "Nellore" },
  { value: "eluru", label: "Eluru" },
];

export const districtOptions = [
  { value: "krishna", label: "Krishna" },
  { value: "guntur", label: "Guntur" },
  { value: "east-godavari", label: "East Godavari" },
  { value: "west-godavari", label: "West Godavari" },
  { value: "nellore", label: "SPSR Nellore" },
];

export const stateOptions = indianStates.map((state) => ({ value: state, label: state }));

export const commissionStructureOptions = [
  { value: "percentage-of-sale", label: "Percentage of Sale" },
  { value: "flat-fee", label: "Flat Fee" },
  { value: "tiered-commission", label: "Tiered Commission" },
  { value: "fixed-per-referral", label: "Fixed Per Referral" },
];

export const paymentFrequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "per-transaction", label: "Per Transaction" },
  { value: "annually", label: "Annually" },
];

// ============================================================
// Documents
// ============================================================
// value is the real documentTypeId (as a string, for SearchableSelect) —
// confirmed against the backend: 1 = PAN.
export const documentTypeOptions = [
  { value: "1", label: "PAN Card" },
  { value: "2", label: "Aadhaar Card" },
  { value: "3", label: "GST Certificate" },
  { value: "4", label: "Address Proof" },
];

export const MAX_DOCUMENT_FILE_SIZE_MB = 5;
export const ALLOWED_DOCUMENT_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

// ============================================================
// Promoter Code
// ============================================================
const PROMOTER_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePromoterCode(): string {
  let code = "";
  for (let i = 0; i < 9; i++) {
    code += PROMOTER_CODE_CHARS[Math.floor(Math.random() * PROMOTER_CODE_CHARS.length)];
  }
  return code;
}

// ============================================================
// Profile Settings
// ============================================================
export interface ProfileSettingDefinition {
  key: string;
  title: string;
  description: string;
  defaultValue: boolean;
}

export const profileSettingDefinitions: ProfileSettingDefinition[] = [
  {
    key: "promoterStatus",
    title: "Promoter Status",
    description: "Set the promoter status as active or inactive.",
    defaultValue: true,
  },
  {
    key: "showBasicInfo",
    title: "Show/Hide Business description and basic info to user.",
    description: "Control the visibility of your business description and basic information to users.",
    defaultValue: false,
  },
  {
    key: "legalDocsVisibility",
    title: "Control visibility of legal and tax documents.",
    description: "Manage who can view your legal and tax documents associated with your profile.",
    defaultValue: false,
  },
  {
    key: "editProfilePermission",
    title: "Edit Profile User Permission",
    description: "Allow or restrict users from editing profile information.",
    defaultValue: false,
  },
  {
    key: "allowDataSharing",
    title: "Allow Data Sharing",
    description: "Allow sharing of promoter data with partners and third parties.",
    defaultValue: false,
  },
  {
    key: "autoApproveReferrals",
    title: "Auto Approve Referrals",
    description: "Automatically approve incoming referrals without manual review.",
    defaultValue: false,
  },
];
