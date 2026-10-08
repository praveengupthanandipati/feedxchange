import { interestInvoices, type InterestInvoice } from "./create-interest/interestCalculation.data";
import { calculateInvoice, type CalculatedRow } from "./interestCalc";

export type InterestStatus = "Pending" | "Partially Paid" | "Paid";

/** A saved interest entry (what Create Interest produces and View Interest lists). */
export interface InterestRecord {
  /** Interest No */
  id: string;
  seller: string;
  buyer: string;
  /** Date of Entry, yyyy-mm-dd */
  createdOn: string;
  /** yyyy-mm-dd */
  fromDate: string;
  /** yyyy-mm-dd */
  toDate: string;
  /** Interest rate, % per annum. */
  ratePercent: number;
  interestAmount: number;
  contractNo: string;
  invoiceNo: string;
  /** Overdue amount the interest was charged on. */
  principal: number;
  paidAmount: number;
  status: InterestStatus;
  remarks: string;
  /** Invoices (from the interest calculation data) this entry covers; empty for entries made before they were linked. */
  invoiceIds: string[];
}

export type InterestUpdate = Pick<InterestRecord, "fromDate" | "toDate" | "ratePercent" | "interestAmount" | "remarks">;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days between the two dates, counting both ends; 0 when the range is incomplete or reversed. */
export function interestDays(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) return 0;
  const days = Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / DAY_MS) + 1;
  return Math.max(0, days);
}

export { formatInr } from "./interestCalc";

const KK = "Adilabad - KK Proteins Pvt Ltd";
const SRINIDHI = "Gunnampalli - Srinidhi Feeds Pvt Ltd";
const SAI = "Tanuku - Sai Feeds Pvt Ltd";
const GODREJ = "Hyderabad - Godrej Agrovet";
const ANKUR = "Vijayawada - Ankur Animal Feeds";
const CARGILL = "Kakinada - Cargill India Pvt Ltd";

// TODO: replace with the interest API once it is available. Kept in memory, so changes last until a reload.
const records: InterestRecord[] = [
  { id: "INT-001", seller: KK, buyer: SRINIDHI, createdOn: "2025-06-25", fromDate: "2025-06-01", toDate: "2025-06-25", ratePercent: 12, interestAmount: 5000, contractNo: "CON-001", invoiceNo: "INV-001", principal: 410000, paidAmount: 0, status: "Pending", remarks: "Payment delayed beyond the agreed credit period.", invoiceIds: ["1", "2"] },
  { id: "INT-002", seller: KK, buyer: SRINIDHI, createdOn: "2025-06-26", fromDate: "2025-06-05", toDate: "2025-06-26", ratePercent: 15, interestAmount: 12000, contractNo: "CON-002", invoiceNo: "INV-002", principal: 320000, paidAmount: 6000, status: "Partially Paid", remarks: "", invoiceIds: ["3"] },
  { id: "INT-003", seller: KK, buyer: SRINIDHI, createdOn: "2025-06-27", fromDate: "2025-06-10", toDate: "2025-06-27", ratePercent: 10, interestAmount: 8500, contractNo: "CON-003", invoiceNo: "INV-003", principal: 250000, paidAmount: 8500, status: "Paid", remarks: "Settled with the final payment.", invoiceIds: ["4"] },
  { id: "INT-004", seller: SAI, buyer: GODREJ, createdOn: "2025-07-02", fromDate: "2025-06-12", toDate: "2025-07-01", ratePercent: 18, interestAmount: 9800, contractNo: "CON-005", invoiceNo: "INV-005", principal: 560000, paidAmount: 0, status: "Pending", remarks: "", invoiceIds: ["5"] },
  { id: "INT-005", seller: SAI, buyer: GODREJ, createdOn: "2025-07-05", fromDate: "2025-06-15", toDate: "2025-07-04", ratePercent: 18, interestAmount: 4200, contractNo: "CON-006", invoiceNo: "INV-006", principal: 275000, paidAmount: 4200, status: "Paid", remarks: "", invoiceIds: ["6"] },
  { id: "INT-006", seller: ANKUR, buyer: CARGILL, createdOn: "2025-07-08", fromDate: "2025-06-18", toDate: "2025-07-07", ratePercent: 12, interestAmount: 3600, contractNo: "CON-007", invoiceNo: "INV-007", principal: 180000, paidAmount: 1800, status: "Partially Paid", remarks: "Buyer requested a waiver review.", invoiceIds: [] },
  { id: "INT-007", seller: KK, buyer: GODREJ, createdOn: "2025-07-10", fromDate: "2025-06-20", toDate: "2025-07-09", ratePercent: 15, interestAmount: 7400, contractNo: "CON-008", invoiceNo: "INV-008", principal: 300000, paidAmount: 0, status: "Pending", remarks: "", invoiceIds: [] },
  { id: "INT-008", seller: SAI, buyer: SRINIDHI, createdOn: "2025-07-12", fromDate: "2025-06-22", toDate: "2025-07-11", ratePercent: 10, interestAmount: 2900, contractNo: "CON-009", invoiceNo: "INV-009", principal: 150000, paidAmount: 2900, status: "Paid", remarks: "", invoiceIds: [] },
  { id: "INT-009", seller: ANKUR, buyer: SRINIDHI, createdOn: "2025-07-15", fromDate: "2025-06-25", toDate: "2025-07-14", ratePercent: 18, interestAmount: 11250, contractNo: "CON-010", invoiceNo: "INV-010", principal: 420000, paidAmount: 0, status: "Pending", remarks: "", invoiceIds: [] },
  { id: "INT-010", seller: KK, buyer: CARGILL, createdOn: "2025-07-18", fromDate: "2025-06-28", toDate: "2025-07-17", ratePercent: 12, interestAmount: 6300, contractNo: "CON-011", invoiceNo: "INV-011", principal: 290000, paidAmount: 3000, status: "Partially Paid", remarks: "", invoiceIds: [] },
];

/** A record's invoices with interest worked out at the record's rate. */
export const invoiceRowsFor = (record: InterestRecord): CalculatedRow[] =>
  record.invoiceIds
    .map((invoiceId) => interestInvoices.find((invoice) => invoice.id === invoiceId))
    .filter((invoice): invoice is InterestInvoice => Boolean(invoice))
    .map((invoice, index) => calculateInvoice(invoice, index + 1, null, record.ratePercent));

// Linked entries take their figures from their invoices, so the list and the detail page always agree.
for (const record of records) {
  const rows = invoiceRowsFor(record);
  if (rows.length === 0) continue;
  record.interestAmount = rows.reduce((sum, row) => sum + row.interest, 0);
  record.principal = rows.reduce((sum, row) => sum + row.paidAmount, 0);
  record.contractNo = rows.map((row) => row.contractNo).join(", ");
  record.invoiceNo = rows.map((row) => row.invoiceNo).join(", ");
  record.paidAmount =
    record.status === "Paid" ? record.interestAmount : record.status === "Partially Paid" ? Math.round(record.interestAmount / 2) : 0;
}

export const getInterestRecords = (): InterestRecord[] => [...records];

export const getInterestRecord = (id: string) => records.find((record) => record.id === id) ?? null;

export function updateInterestRecord(id: string, changes: InterestUpdate) {
  const index = records.findIndex((record) => record.id === id);
  if (index !== -1) records[index] = { ...records[index], ...changes };
}

export function deleteInterestRecord(id: string) {
  const index = records.findIndex((record) => record.id === id);
  if (index !== -1) records.splice(index, 1);
}
