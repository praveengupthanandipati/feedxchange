// TODO: replace with real data once the truck-management API is wired up.

export interface TransporterAssignmentRow {
  id: string;
  transporterName: string;
  truckNo: string;
  driverName: string;
  driverPhone: string;
  qtyMts: string;
  freightPerMt: string;
  trackUrl: string;
  /** True once the row has passed validation and been saved — renders as read-only text with an Edit action instead of inputs. */
  saved: boolean;
}

export function createEmptyTransporterRow(): TransporterAssignmentRow {
  return {
    id: `tar-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    transporterName: "",
    truckNo: "",
    driverName: "",
    driverPhone: "",
    qtyMts: "",
    freightPerMt: "",
    trackUrl: "",
    saved: false,
  };
}

/** Fields that must be filled before a row can be saved or a request sent. */
export const REQUIRED_TRANSPORTER_FIELDS: (keyof TransporterAssignmentRow)[] = [
  "transporterName",
  "truckNo",
  "driverName",
  "driverPhone",
  "qtyMts",
  "freightPerMt",
];

export function getMissingTransporterFields(
  row: TransporterAssignmentRow,
): Set<keyof TransporterAssignmentRow> {
  const missing = new Set<keyof TransporterAssignmentRow>();
  REQUIRED_TRANSPORTER_FIELDS.forEach((field) => {
    if (!String(row[field]).trim()) missing.add(field);
  });
  return missing;
}

export function getSeedTransporterRows(): TransporterAssignmentRow[] {
  return [createEmptyTransporterRow()];
}

export type TransporterRequestStatus = "Agreed" | "Rejected";

export interface TransporterRequestHistoryEntry {
  id: string;
  dateOfRequest: string;
  baseFreight: string;
  transporterStatus: TransporterRequestStatus;
  dateOfStatus: string;
  transporterFreight: string;
}

export const transporterRequestHistory: TransporterRequestHistoryEntry[] = [
  {
    id: "trh-1",
    dateOfRequest: "20-04-2026",
    baseFreight: "₹47,000",
    transporterStatus: "Agreed",
    dateOfStatus: "21-04-2026",
    transporterFreight: "₹48,000",
  },
  {
    id: "trh-2",
    dateOfRequest: "22-04-2026",
    baseFreight: "₹45,500",
    transporterStatus: "Rejected",
    dateOfStatus: "23-04-2026",
    transporterFreight: "₹46,500",
  },
  {
    id: "trh-3",
    dateOfRequest: "24-04-2026",
    baseFreight: "₹49,000",
    transporterStatus: "Agreed",
    dateOfStatus: "25-04-2026",
    transporterFreight: "₹50,000",
  },
];

export interface ApprovedTruckRow {
  id: string;
  transporter: string;
  truckNo: string;
  driverName: string;
  driverContact: string;
  qty: string;
  freightPerMt: string;
  trackUrl: string;
}

export const approvedTruckRows: ApprovedTruckRow[] = [
  {
    id: "apt-1",
    transporter: "Jawahar Transporters, Hyderabad",
    truckNo: "TS25U1234",
    driverName: "Ravi Kumar",
    driverContact: "9876543210",
    qty: "100 MT",
    freightPerMt: "₹2,500",
    trackUrl: "https://maps.google.com/track/apt-1",
  },
  {
    id: "apt-2",
    transporter: "Sai Logistics, Vijayawada",
    truckNo: "AP09Z9876",
    driverName: "Naresh Babu",
    driverContact: "9000012345",
    qty: "80 MT",
    freightPerMt: "₹2,800",
    trackUrl: "https://maps.google.com/track/apt-2",
  },
  {
    id: "apt-3",
    transporter: "Krishna Carriers, Guntur",
    truckNo: "TS07K4567",
    driverName: "Suresh Reddy",
    driverContact: "9123456780",
    qty: "120 MT",
    freightPerMt: "₹2,600",
    trackUrl: "https://maps.google.com/track/apt-3",
  },
  {
    id: "apt-4",
    transporter: "Ganesh Roadlines, Vijayawada",
    truckNo: "AP16TA9021",
    driverName: "Mahesh Rao",
    driverContact: "9345612780",
    qty: "60 MT",
    freightPerMt: "₹2,450",
    trackUrl: "https://maps.google.com/track/apt-4",
  },
  {
    id: "apt-5",
    transporter: "Rayapudi Logistics, Guntur",
    truckNo: "TS09FB3345",
    driverName: "Anil Chowdary",
    driverContact: "9988776655",
    qty: "90 MT",
    freightPerMt: "₹2,700",
    trackUrl: "https://maps.google.com/track/apt-5",
  },
  {
    id: "apt-6",
    transporter: "Sri Ganesh Transports, Nellore",
    truckNo: "AP07TB6612",
    driverName: "Ramesh Naidu",
    driverContact: "9012345678",
    qty: "70 MT",
    freightPerMt: "₹2,550",
    trackUrl: "https://maps.google.com/track/apt-6",
  },
  {
    id: "apt-7",
    transporter: "Balaji Roadways, Tirupati",
    truckNo: "AP03CD1122",
    driverName: "Venkatesh",
    driverContact: "9765432109",
    qty: "50 MT",
    freightPerMt: "₹2,400",
    trackUrl: "https://maps.google.com/track/apt-7",
  },
  {
    id: "apt-8",
    transporter: "Lakshmi Transports, Kakinada",
    truckNo: "AP05EF3344",
    driverName: "Prasad Rao",
    driverContact: "9654321098",
    qty: "110 MT",
    freightPerMt: "₹2,650",
    trackUrl: "https://maps.google.com/track/apt-8",
  },
  {
    id: "apt-9",
    transporter: "Sri Venkateswara Carriers, Ongole",
    truckNo: "AP04GH5566",
    driverName: "Kiran Kumar",
    driverContact: "9543210987",
    qty: "95 MT",
    freightPerMt: "₹2,500",
    trackUrl: "https://maps.google.com/track/apt-9",
  },
  {
    id: "apt-10",
    transporter: "Annapurna Logistics, Rajahmundry",
    truckNo: "AP06IJ7788",
    driverName: "Srinivas Rao",
    driverContact: "9432109876",
    qty: "130 MT",
    freightPerMt: "₹2,750",
    trackUrl: "https://maps.google.com/track/apt-10",
  },
];
