// TODO: replace with real data once the business owners API is wired up.

export type BusinessType = "Fish Farm" | "Layer Poultry";
export type BusinessOwnerStatus = "Active" | "Inactive" | "Blocked";

export interface BusinessOwner {
  id: string;
  companyName: string;
  status: BusinessOwnerStatus;
  businessType: BusinessType;
  location: string;
  mobile: string;
  state: string;
}

export const businessTypeOptions = [
  { value: "All", label: "All" },
  { value: "Fish Farm", label: "Fish Farm" },
  { value: "Layer Poultry", label: "Layer Poultry" },
];

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const stateOptions = [
  { value: "All", label: "All" },
  ...indianStates.map((state) => ({ value: state, label: state })),
];

const COMPANY_NAMES = [
  "Sri Lakshmi Fish Farms",
  "Vijaya Layer Poultry Farm",
  "Krishna Aqua Ventures",
  "Godavari Poultry Estates",
  "Sai Balaji Fisheries",
  "Rayalaseema Layer Farms",
  "Konaseema Aqua Farms",
  "Nellore Fish Breeders",
  "Anantapur Poultry Co-op",
  "Guntur Layer Growers",
  "Krishnaveni Fisheries",
  "Eluru Aqua Exports",
  "Kakinada Poultry Farms",
  "Chittoor Layer Estates",
  "Tirupati Aqua Traders",
];

const LOCATIONS = [
  "Vijayawada",
  "Guntur",
  "Rajahmundry",
  "Achutapuram",
  "Kakinada",
  "Nellore",
  "Eluru",
  "Chittoor",
  "Tirupati",
  "Anantapur",
];

const STATUSES: BusinessOwnerStatus[] = ["Active", "Inactive", "Blocked"];
const BUSINESS_TYPES: BusinessType[] = ["Fish Farm", "Layer Poultry"];

const ROW_COUNT = 22;

const MOBILE_PREFIXES = ["6", "7", "8", "9"];

function buildBusinessOwners(): BusinessOwner[] {
  const rows: BusinessOwner[] = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    const prefix = MOBILE_PREFIXES[i % MOBILE_PREFIXES.length];
    const rest = String(100000000 + ((i * 791321) % 900000000)).padStart(9, "0");

    rows.push({
      id: `bo-${1000 + i}`,
      companyName: COMPANY_NAMES[i % COMPANY_NAMES.length],
      status: STATUSES[i % STATUSES.length],
      businessType: BUSINESS_TYPES[i % BUSINESS_TYPES.length],
      location: LOCATIONS[i % LOCATIONS.length],
      mobile: `${prefix}${rest}`,
      state: indianStates[(i * 3) % indianStates.length],
    });
  }

  return rows;
}

export const businessOwners: BusinessOwner[] = buildBusinessOwners();
