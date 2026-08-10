// TODO: replace with real data once the truck-management API is wired up.

export interface TruckDocument {
  id: string;
  name: string;
}

export interface TruckDetailRow {
  id: string;
  truckNo: string;
  truckCapacity: string;
  ownerName: string;
  ownerContact: string;
  driverName: string;
  driverPhone: string;
  freightPerMt: string;
  trackUrl: string;
  documents: TruckDocument[];
}

export function createEmptyTruckEntry(): TruckDetailRow {
  return {
    id: `tk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    truckNo: "",
    truckCapacity: "",
    ownerName: "",
    ownerContact: "",
    driverName: "",
    driverPhone: "",
    freightPerMt: "",
    trackUrl: "",
    documents: [],
  };
}

export const truckDetailRows: TruckDetailRow[] = [
  {
    id: "td-1",
    truckNo: "",
    truckCapacity: "",
    ownerName: "",
    ownerContact: "",
    driverName: "",
    driverPhone: "",
    freightPerMt: "₹1,000",
    trackUrl: "",
    documents: [],
  },
];

// Truck master lookup — selecting a truck in the Add Trucks offcanvas
// auto-fills owner, driver and document fields from here.
export const truckMasterDirectory: Record<string, Omit<TruckDetailRow, "id" | "truckNo" | "freightPerMt" | "trackUrl">> = {
  TS27C512: {
    truckCapacity: "25 MT",
    ownerName: "Lakshmi Transport Co.",
    ownerContact: "9848099999",
    driverName: "Ramesh Kumar",
    driverPhone: "9848012345",
    documents: [
      { id: "doc-1", name: "RC_TS27C512.pdf" },
      { id: "doc-2", name: "Insurance_TS27C512.pdf" },
    ],
  },
  AP16TA9021: {
    truckCapacity: "20 MT",
    ownerName: "Sri Ganesh Roadlines",
    ownerContact: "9876511111",
    driverName: "Suresh Babu",
    driverPhone: "9876543210",
    documents: [{ id: "doc-3", name: "RC_AP16TA9021.pdf" }],
  },
  TS09FB3345: {
    truckCapacity: "18 MT",
    ownerName: "Rayapudi Logistics",
    ownerContact: "9963222222",
    driverName: "Venkatesh Rao",
    driverPhone: "9963214870",
    documents: [
      { id: "doc-4", name: "RC_TS09FB3345.pdf" },
      { id: "doc-5", name: "Permit_TS09FB3345.pdf" },
    ],
  },
  AP07TB6612: {
    truckCapacity: "22 MT",
    ownerName: "Krishna Carriers",
    ownerContact: "9700133333",
    driverName: "Krishna Murthy",
    driverPhone: "9700123456",
    documents: [{ id: "doc-6", name: "RC_AP07TB6612.pdf" }],
  },
};

export const truckMasterOptions = Object.keys(truckMasterDirectory).map((value) => ({
  value,
  label: value,
}));

export interface QuantityFreightState {
  qty: string;
  freight: string;
  qtyUpdatedOn: string;
  freightUpdatedOn: string;
}

export const initialQuantityFreight: QuantityFreightState = {
  qty: "25",
  freight: "1500",
  qtyUpdatedOn: "30-04-2026",
  freightUpdatedOn: "30-04-2026",
};

export type FreightRequestStatus = "Pending" | "Accepted" | "Rejected";

export interface FreightHistoryEntry {
  id: string;
  date: string;
  adminQty: string;
  adminFreight: string;
  transporterQty: string;
  transporterFreight: string;
  status: FreightRequestStatus;
}

export const freightHistoryRows: FreightHistoryEntry[] = [
  {
    id: "fh-1",
    date: "17/5/2026",
    adminQty: "20 MT",
    adminFreight: "₹1,000",
    transporterQty: "25 MT",
    transporterFreight: "₹1,500",
    status: "Accepted",
  },
  {
    id: "fh-2",
    date: "16/5/2026",
    adminQty: "20 MT",
    adminFreight: "₹950",
    transporterQty: "22 MT",
    transporterFreight: "₹1,400",
    status: "Rejected",
  },
  {
    id: "fh-3",
    date: "15/5/2026",
    adminQty: "18 MT",
    adminFreight: "₹900",
    transporterQty: "20 MT",
    transporterFreight: "₹1,300",
    status: "Accepted",
  },
];
