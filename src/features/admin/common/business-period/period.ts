import type { Period } from "../../business-dashboard/businessDashboard.utils";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Local midnight of a yyyy-MM-dd date (new Date("yyyy-MM-dd") would be UTC midnight). */
const startOfDay = (iso: string) => new Date(`${iso}T00:00:00`).getTime();

/** Whether a contract date (ms) is inside the period (From and To inclusive; empty = no limit). */
export const inPeriod = (period: Period, dateValue: number) => {
  if (period.from && dateValue < startOfDay(period.from)) return false;
  if (period.to && dateValue >= startOfDay(period.to) + DAY_MS) return false;
  return true;
};

export const ALL_TIME: Period = { key: "all", from: "", to: "" };
