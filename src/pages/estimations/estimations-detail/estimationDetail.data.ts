import { estimations, type Estimation } from "../view-estimations/viewEstimation.data";

export type ActionType = "Buy" | "Sell";

/** One contract counted in an estimate. */
export interface EstimationLine {
  id: string;
  /** yyyy-mm-dd */
  contractDate: string;
  contractNo: string;
  partyName: string;
  actionType: ActionType;
  commodity: string;
  quantityMt: number;
  /** ₹ per MT */
  commissionPerMt: number;
}

/** An estimate from View Estimations together with the contracts it covers. */
export interface EstimationDetailRecord extends Estimation {
  /** ₹ adjustment added to the gross amount (negative for a deduction). */
  difference: number;
  lines: EstimationLine[];
}

export interface DetailFilters {
  estimateId: string;
  from: string;
  to: string;
}

const SAI = "Sai Feeds Pvt Ltd - Mumbai";
const ANKUR = "Ankur Animal Feeds - Ahmedabad";
const BLUE_AQUA = "Blue Aqua Farms - Kochi";
const GREEN_VALLEY = "Green Valley Dairy - Pune";
const FAIRSQUARE = "FairSquare Trading Pvt Ltd - Pune";
const SHUBHAM = "Shubham Pvt Ltd - Vijayawada";

type LineSeed = [contractDate: string, contractNo: string, partyName: string, actionType: ActionType, commodity: string, quantityMt: number, commissionPerMt: number];

// TODO: replace with the estimation-detail API once it is available.
/** Contracts per estimate, keyed by the estimate's id in View Estimations. */
const LINE_SEEDS: Record<string, LineSeed[]> = {
  // EST-1001 is the estimate shown in the design (gross amount 28,735).
  "1": [
    ["2026-04-01", "EST-1001", SAI, "Sell", "Rice DDGS", 50, 50],
    ["2026-04-02", "EST-1002", ANKUR, "Buy", "Maize", 40, 60],
    ["2026-04-03", "EST-1003", BLUE_AQUA, "Sell", "Soybean Meal", 60, 55],
    ["2026-04-05", "EST-1004", GREEN_VALLEY, "Buy", "Wheat Bran", 35, 45],
    ["2026-04-06", "EST-1005", FAIRSQUARE, "Sell", "Rice DDGS", 45, 50],
    ["2026-04-07", "EST-1006", SHUBHAM, "Buy", "Maize", 55, 60],
    ["2026-04-08", "EST-1007", SAI, "Sell", "Soybean Meal", 30, 55],
    ["2026-04-09", "EST-1008", ANKUR, "Buy", "Wheat Bran", 60, 60],
    ["2026-04-10", "EST-1009", BLUE_AQUA, "Sell", "Soybean Meal", 80, 55],
    ["2026-04-11", "EST-1010", GREEN_VALLEY, "Buy", "Rice DDGS", 94, 40],
  ],
  "2": [
    ["2026-04-02", "EST-1011", ANKUR, "Buy", "Maize", 25, 60],
    ["2026-04-04", "EST-1012", SHUBHAM, "Sell", "Soybean Meal", 15, 55],
  ],
  "3": [
    ["2026-04-03", "EST-1013", BLUE_AQUA, "Sell", "Soybean Meal", 40, 55],
    ["2026-04-06", "EST-1014", SAI, "Buy", "Rice DDGS", 20, 50],
  ],
  "4": [["2026-04-05", "EST-1015", GREEN_VALLEY, "Buy", "Wheat Bran", 35, 45]],
  "5": [
    ["2026-04-06", "EST-1016", FAIRSQUARE, "Sell", "Rice DDGS", 30, 50],
    ["2026-04-09", "EST-1017", ANKUR, "Buy", "Maize", 15, 60],
  ],
  "6": [
    ["2026-04-07", "EST-1018", SHUBHAM, "Buy", "Maize", 35, 60],
    ["2026-04-10", "EST-1019", BLUE_AQUA, "Sell", "Soybean Meal", 20, 55],
  ],
  "7": [["2026-04-08", "EST-1020", SAI, "Sell", "Soybean Meal", 30, 55]],
  "8": [["2026-04-10", "EST-1021", FAIRSQUARE, "Buy", "Wheat Bran", 35, 45]],
  "9": [["2026-04-12", "EST-1022", ANKUR, "Buy", "Maize", 25, 60]],
  "10": [
    ["2026-04-14", "EST-1023", BLUE_AQUA, "Sell", "Soybean Meal", 25, 55],
    ["2026-04-16", "EST-1024", GREEN_VALLEY, "Buy", "Rice DDGS", 15, 40],
  ],
};

export const estimationDetails: EstimationDetailRecord[] = estimations.map((estimation) => ({
  ...estimation,
  difference: 0,
  lines: (LINE_SEEDS[estimation.id] ?? []).map(([contractDate, contractNo, partyName, actionType, commodity, quantityMt, commissionPerMt], index) => ({
    id: `${estimation.id}-${index + 1}`,
    contractDate,
    contractNo,
    partyName,
    actionType,
    commodity,
    quantityMt,
    commissionPerMt,
  })),
}));

export const EMPTY_DATES = { from: "", to: "" };
