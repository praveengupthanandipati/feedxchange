// TODO: replace with real data once the transporters API is wired up.

import { indianStates } from "../../businessowners/BusinessList/businessOwners.data";

export type TransporterType =
  | "Mini Transporter"
  | "Light Transporter"
  | "Heavy Transporter"
  | "Container Transporter";

export type TransporterStatus = "Active" | "Inactive" | "Blocked";

export interface Transporter {
  id: string;
  companyName: string;
  status: TransporterStatus;
  transporterType: TransporterType;
  truckCount: number;
  location: string;
  mobile: string;
  state: string;
}

export const transporterTypeOptions = [
  { value: "All", label: "All" },
  { value: "Mini Transporter", label: "Mini Transporter" },
  { value: "Light Transporter", label: "Light Transporter" },
  { value: "Heavy Transporter", label: "Heavy Transporter" },
  { value: "Container Transporter", label: "Container Transporter" },
];

export const stateOptions = [
  { value: "All", label: "All" },
  ...indianStates.map((state) => ({ value: state, label: state })),
];

const COMPANY_NAMES = [
  "Jawahar Roadlines",
  "Sri Venkateswara Logistics",
  "Godavari Freight Carriers",
  "Krishna Transport Co",
  "Balaji Roadways",
  "Konaseema Cargo Movers",
  "Nellore Truck Lines",
  "Anantapur Haulage Services",
  "Guntur Transport Corp",
  "Eluru Freight Express",
];

const LOCATIONS = [
  "Latur",
  "Vijayawada",
  "Guntur",
  "Rajahmundry",
  "Kakinada",
  "Nellore",
  "Eluru",
  "Chittoor",
  "Tirupati",
  "Anantapur",
];

const STATUSES: TransporterStatus[] = ["Active", "Inactive", "Blocked"];
const TRANSPORTER_TYPES: TransporterType[] = [
  "Mini Transporter",
  "Light Transporter",
  "Heavy Transporter",
  "Container Transporter",
];

const ROW_COUNT = 18;

const MOBILE_PREFIXES = ["6", "7", "8", "9"];

function buildTransporters(): Transporter[] {
  const rows: Transporter[] = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    const prefix = MOBILE_PREFIXES[i % MOBILE_PREFIXES.length];
    const rest = String(100000000 + ((i * 872341) % 900000000)).padStart(9, "0");

    rows.push({
      id: `tr-${1000 + i}`,
      companyName: COMPANY_NAMES[i % COMPANY_NAMES.length],
      status: STATUSES[i % STATUSES.length],
      transporterType: TRANSPORTER_TYPES[i % TRANSPORTER_TYPES.length],
      truckCount: i % 5,
      location: LOCATIONS[i % LOCATIONS.length],
      mobile: `${prefix}${rest}`,
      state: indianStates[(i * 4) % indianStates.length],
    });
  }

  return rows;
}

export const transporters: Transporter[] = buildTransporters();
