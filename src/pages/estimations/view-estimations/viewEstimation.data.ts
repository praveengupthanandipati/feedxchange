/** A saved commission estimation (what Commission Estimation produces and View Estimations lists). */
export interface Estimation {
  id: string;
  estimateNo: string;
  /** Period covered, yyyy-mm-dd. toDate is "" while the estimate is still open. */
  fromDate: string;
  toDate: string;
  /** "" when not assigned yet. */
  partyName: string;
  /** MT */
  qty: number;
  /** ₹; null while the estimate hasn't been priced. */
  netAmount: number | null;
  remarks: string;
}

export interface EstimationFilters {
  party: string;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: EstimationFilters = { party: "", from: "", to: "" };

export type EstimationEdit = Pick<Estimation, "fromDate" | "toDate" | "remarks">;

// TODO: replace with the estimations API once it is available.
export const estimations: Estimation[] = [
  { id: "1", estimateNo: "EST-1001", fromDate: "2026-04-01", toDate: "2026-04-05", partyName: "Sai Feeds Pvt Ltd - Mumbai", qty: 50, netAmount: 131250, remarks: "" },
  { id: "2", estimateNo: "EST-1002", fromDate: "2026-04-02", toDate: "2026-04-06", partyName: "Ankur Animal Feeds - Ahmedabad", qty: 40, netAmount: 756000, remarks: "" },
  { id: "3", estimateNo: "EST-1003", fromDate: "2026-04-03", toDate: "2026-04-07", partyName: "Blue Aqua Farms - Kochi", qty: 60, netAmount: 2016000, remarks: "" },
  { id: "4", estimateNo: "EST-1004", fromDate: "2026-04-05", toDate: "2026-04-09", partyName: "Green Valley Dairy - Pune", qty: 35, netAmount: 441000, remarks: "" },
  { id: "5", estimateNo: "EST-1005", fromDate: "2026-04-06", toDate: "2026-04-10", partyName: "FairSquare Trading Pvt Ltd - Pune", qty: 45, netAmount: 1181250, remarks: "" },
  { id: "6", estimateNo: "EST-1006", fromDate: "2026-04-07", toDate: "2026-04-11", partyName: "Shubham Pvt Ltd - Vijayawada", qty: 55, netAmount: 1068375, remarks: "" },
  { id: "7", estimateNo: "EST-1007", fromDate: "2026-04-08", toDate: "2026-04-12", partyName: "Sai Feeds Pvt Ltd - Mumbai", qty: 30, netAmount: 992250, remarks: "" },
  { id: "8", estimateNo: "EST-1008", fromDate: "2026-04-10", toDate: "", partyName: "", qty: 35, netAmount: null, remarks: "Awaiting party confirmation" },
  { id: "9", estimateNo: "EST-1009", fromDate: "2026-04-12", toDate: "2026-04-16", partyName: "Ankur Animal Feeds - Ahmedabad", qty: 25, netAmount: 472500, remarks: "" },
  { id: "10", estimateNo: "EST-1010", fromDate: "2026-04-14", toDate: "2026-04-18", partyName: "Blue Aqua Farms - Kochi", qty: 40, netAmount: 1344000, remarks: "" },
];
