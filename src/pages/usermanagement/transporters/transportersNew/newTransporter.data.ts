// TODO: replace with real reference data once the transporter masters are wired up.

import { indianStates } from "../../businessowners/BusinessList/businessOwners.data";

export const typeOfTransporterOptions = [
  { value: "mini-transporter", label: "Mini Transporter" },
  { value: "light-transporter", label: "Light Transporter" },
  { value: "heavy-transporter", label: "Heavy Transporter" },
  { value: "container-transporter", label: "Container Transporter" },
];

export const groupOptions = [
  { value: "north-zone", label: "North Zone" },
  { value: "south-zone", label: "South Zone" },
  { value: "east-zone", label: "East Zone" },
  { value: "west-zone", label: "West Zone" },
];

const CURRENT_YEAR = new Date().getFullYear();
export const establishmentYearOptions = Array.from({ length: 76 }, (_, index) => {
  const year = String(CURRENT_YEAR - index);
  return { value: year, label: year };
});

// ============================================================
// 2. Contact & Address
// ============================================================
export const contactTypeOptions = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "accountant", label: "Accountant" },
  { value: "driver-coordinator", label: "Driver Coordinator" },
];

export const designationOptions = [
  { value: "proprietor", label: "Proprietor" },
  { value: "director", label: "Director" },
  { value: "partner", label: "Partner" },
  { value: "manager", label: "Manager" },
  { value: "accountant", label: "Accountant" },
];

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

// ============================================================
// 3. Bank Details
// ============================================================
export const accountTypeOptions = [
  { value: "savings", label: "Savings" },
  { value: "current", label: "Current" },
  { value: "cash-credit", label: "Cash Credit" },
  { value: "overdraft", label: "Overdraft" },
];

// TODO: replace with a real IFSC lookup API — this is a small mock table for the demo.
export const ifscLookup: Record<string, { bankName: string; branch: string }> = {
  SBIN0001234: { bankName: "State Bank of India", branch: "Vijayawada Main" },
  HDFC0001111: { bankName: "HDFC Bank", branch: "Guntur Branch" },
  ICIC0002222: { bankName: "ICICI Bank", branch: "Rajahmundry Branch" },
  UTIB0003333: { bankName: "Axis Bank", branch: "Kakinada Branch" },
};

// ============================================================
// 4. Documents
// ============================================================
export const documentTypeOptions = [
  { value: "pan-card", label: "PAN Card" },
  { value: "aadhaar-card", label: "Aadhaar Card" },
  { value: "gst-certificate", label: "GST Certificate" },
  { value: "transport-license", label: "Transport License" },
  { value: "vehicle-permit", label: "Vehicle Permit" },
];

export const MAX_DOCUMENT_FILE_SIZE_MB = 5;
export const ALLOWED_DOCUMENT_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

// ============================================================
// 5. Profile Settings
// ============================================================
export interface ProfileSettingDefinition {
  key: string;
  title: string;
  description: string;
  defaultValue: boolean;
}

export const profileSettingDefinitions: ProfileSettingDefinition[] = [
  {
    key: "transporterStatus",
    title: "Transporter Status",
    description: "Indicates whether the transporter is active or inactive.",
    defaultValue: true,
  },
  {
    key: "showBasicInfo",
    title: "Show/Hide transporter description and basic info to user.",
    description: "Control the visibility of your transporter description and basic information to users.",
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
    description: "Allow sharing of transporter data with partners and third parties.",
    defaultValue: false,
  },
  {
    key: "autoApproveOrders",
    title: "Auto Approve Orders",
    description: "Automatically approve incoming orders without manual review.",
    defaultValue: false,
  },
];
