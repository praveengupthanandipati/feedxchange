export type TransportStatus = "Pending" | "Submitted" | "Approved";

export interface TransportRow {
  id: string;
  seller: string;
  sellerCity: string;
  buyer: string;
  buyerCity: string;
  /** yyyy-mm-dd */
  scheduleDate: string;
  billChange: "Direct Bill" | "Change Bill";
  status: TransportStatus;
  loadingCity: string;
  unloadingCity: string;
  pendingTrucks: number;
  qty: number;
  freight: number;
}

// TODO: replace with the transport dashboard API once it is available.
export const transportRows: TransportRow[] = [
  { id: "1", seller: "Amit Sharma - Mumbai", sellerCity: "Mumbai", buyer: "Rajesh Kumar - Bengaluru", buyerCity: "Bengaluru", scheduleDate: "2026-01-10", billChange: "Direct Bill", status: "Pending", loadingCity: "Mumbai", unloadingCity: "Bengaluru", pendingTrucks: 2, qty: 100, freight: 5000 },
  { id: "2", seller: "Vikram Patil - Pune", sellerCity: "Pune", buyer: "Priya Deshmukh - Hyderabad", buyerCity: "Hyderabad", scheduleDate: "2026-01-12", billChange: "Change Bill", status: "Submitted", loadingCity: "Pune", unloadingCity: "Hyderabad", pendingTrucks: 1, qty: 50, freight: 3000 },
  { id: "3", seller: "Neha Mehta - Ahmedabad", sellerCity: "Ahmedabad", buyer: "Suresh Iyer - Chennai", buyerCity: "Chennai", scheduleDate: "2026-01-15", billChange: "Direct Bill", status: "Approved", loadingCity: "Ahmedabad", unloadingCity: "Chennai", pendingTrucks: 0, qty: 200, freight: 12000 },
];
