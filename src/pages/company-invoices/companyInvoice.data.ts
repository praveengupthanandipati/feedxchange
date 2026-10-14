export type ActionType = "Buy" | "Sell";

/** A contract the company earned commission on, waiting to be invoiced. */
export interface CommissionContract {
  id: string;
  company: string;
  /** yyyy-mm-dd */
  contractDate: string;
  contractNo: string;
  partyName: string;
  actionType: ActionType;
  commodity: string;
  /** ₹ per MT; null when not recorded. */
  contractRate: number | null;
  quantityMt: number;
  /** ₹ commission per MT. */
  commissionPerMt: number;
}

export const DEFAULT_COMMISSION_PER_MT = 50;

const LAKSHMI = "Lakshmi Agro Traders";
const SAI = "Sai Commodities Pvt Ltd";

// TODO: replace with the uninvoiced-contracts API once it is available.
export const commissionContracts: CommissionContract[] = [
  { id: "1", company: LAKSHMI, contractDate: "2024-04-01", contractNo: "CON-24-001", partyName: "ABC Poultech Pvt Ltd - Katakoteswaram", actionType: "Sell", commodity: "Maize", contractRate: null, quantityMt: 100, commissionPerMt: 50 },
  { id: "2", company: LAKSHMI, contractDate: "2024-04-02", contractNo: "CON-24-002", partyName: "Amalgam Nutrients and Feeds Limited - Karumancherry", actionType: "Buy", commodity: "Soybean Meal", contractRate: null, quantityMt: 200, commissionPerMt: 50 },
  { id: "3", company: LAKSHMI, contractDate: "2024-04-03", contractNo: "CON-24-003", partyName: "Arjun Poultry Farm - Karimnagar", actionType: "Sell", commodity: "Wheat Bran", contractRate: null, quantityMt: 150, commissionPerMt: 50 },
  { id: "4", company: LAKSHMI, contractDate: "2024-04-05", contractNo: "CON-24-004", partyName: "ABC Poultech Pvt Ltd - Katakoteswaram", actionType: "Buy", commodity: "Soybean Meal", contractRate: 42500, quantityMt: 80, commissionPerMt: 40 },
  { id: "5", company: LAKSHMI, contractDate: "2024-04-08", contractNo: "CON-24-005", partyName: "Arjun Poultry Farm - Karimnagar", actionType: "Sell", commodity: "Maize", contractRate: 23100, quantityMt: 120, commissionPerMt: 50 },
  { id: "6", company: SAI, contractDate: "2024-04-04", contractNo: "CON-24-006", partyName: "Srinidhi Feeds Pvt Ltd - Gunnampalli", actionType: "Buy", commodity: "Rice DDGS", contractRate: 18400, quantityMt: 250, commissionPerMt: 30 },
  { id: "7", company: SAI, contractDate: "2024-04-09", contractNo: "CON-24-007", partyName: "KK Proteins Pvt Ltd - Adilabad", actionType: "Sell", commodity: "Soya DOC", contractRate: 36800, quantityMt: 60, commissionPerMt: 60 },
  { id: "8", company: SAI, contractDate: "2024-04-12", contractNo: "CON-24-008", partyName: "Srinidhi Feeds Pvt Ltd - Gunnampalli", actionType: "Sell", commodity: "Maize", contractRate: 22900, quantityMt: 175, commissionPerMt: 30 },
];

/** One contract line on a generated invoice. */
export interface InvoiceLine {
  contractNo: string;
  /** yyyy-mm-dd */
  contractDate: string;
  commodity: string;
  quantityMt: number;
  commissionPerMt: number;
}

/** A generated company invoice (what Generate Invoice produces and View Invoices lists). */
export interface CompanyInvoice {
  id: string;
  invoiceNo: string;
  company: string;
  /** Period covered, yyyy-mm-dd */
  fromDate: string;
  toDate: string;
  partyName: string;
  /** The party's side of the trade on this invoice. */
  partyRole: "Seller" | "Buyer";
  area: string;
  collectionArea: string;
  group: string;
  city: string;
  /** Adjustment added to the line total (negative for a deduction). */
  difference: number;
  remarks: string;
  lines: InvoiceLine[];
}

export const invoiceQty = (invoice: CompanyInvoice) => invoice.lines.reduce((sum, line) => sum + line.quantityMt, 0);

export const invoiceNetAmount = (invoice: CompanyInvoice) =>
  invoice.lines.reduce((sum, line) => sum + line.quantityMt * line.commissionPerMt, 0) + invoice.difference;

// TODO: replace with the company invoices API once it is available.
export const companyInvoices: CompanyInvoice[] = [
  {
    id: "1", invoiceNo: "INV-1001", company: "Sri Sai Raghavendra Trade Services", fromDate: "2024-04-01", toDate: "2024-04-10",
    partyName: "ABC Poultech Pvt Ltd - Katakoteswaram", partyRole: "Seller", area: "Krishna", collectionArea: "Vijayawada", group: "ABC Group", city: "Katakoteswaram",
    difference: 0, remarks: "",
    lines: [{ contractNo: "CON-24-001", contractDate: "2024-04-01", commodity: "Maize", quantityMt: 100, commissionPerMt: 2100 }],
  },
  {
    id: "2", invoiceNo: "INV-1002", company: "Mithinti Sarada", fromDate: "2024-04-05", toDate: "2024-04-12",
    partyName: "Amalgam Nutrients and Feeds Limited - Karumancherry", partyRole: "Buyer", area: "Chennai", collectionArea: "Chennai", group: "Amalgam Group", city: "Karumancherry",
    difference: 0, remarks: "",
    lines: [
      { contractNo: "CON-24-002", contractDate: "2024-04-05", commodity: "Soybean Meal", quantityMt: 120, commissionPerMt: 1600 },
      { contractNo: "CON-24-009", contractDate: "2024-04-09", commodity: "Soybean Meal", quantityMt: 80, commissionPerMt: 1600 },
    ],
  },
  {
    id: "3", invoiceNo: "INV-1003", company: "Tatavarthi Sandeep", fromDate: "2024-04-10", toDate: "2024-04-15",
    partyName: "Arjun Poultry Farm - Karimnagar", partyRole: "Seller", area: "North Telangana", collectionArea: "Hyderabad", group: "Independent", city: "Karimnagar",
    difference: 0, remarks: "",
    lines: [{ contractNo: "CON-24-003", contractDate: "2024-04-10", commodity: "Wheat Bran", quantityMt: 150, commissionPerMt: 1200 }],
  },
  {
    id: "4", invoiceNo: "INV-1004", company: "Sri Sai Raghavendra Trade Services", fromDate: "2024-04-16", toDate: "2024-04-25",
    partyName: "Srinidhi Feeds Pvt Ltd - Gunnampalli", partyRole: "Buyer", area: "West Godavari", collectionArea: "Vijayawada", group: "Srinidhi Group", city: "Gunnampalli",
    difference: -2500, remarks: "Rate difference adjusted.",
    lines: [
      { contractNo: "CON-24-006", contractDate: "2024-04-16", commodity: "Rice DDGS", quantityMt: 250, commissionPerMt: 30 },
      { contractNo: "CON-24-008", contractDate: "2024-04-20", commodity: "Maize", quantityMt: 175, commissionPerMt: 30 },
    ],
  },
  {
    id: "5", invoiceNo: "INV-1005", company: "Mithinti Sarada", fromDate: "2024-04-18", toDate: "2024-04-28",
    partyName: "KK Proteins Pvt Ltd - Adilabad", partyRole: "Seller", area: "North Telangana", collectionArea: "Hyderabad", group: "Independent", city: "Adilabad",
    difference: 0, remarks: "",
    lines: [{ contractNo: "CON-24-007", contractDate: "2024-04-18", commodity: "Soya DOC", quantityMt: 60, commissionPerMt: 60 }],
  },
  {
    id: "6", invoiceNo: "INV-1006", company: "Tatavarthi Sandeep", fromDate: "2024-05-01", toDate: "2024-05-10",
    partyName: "ABC Poultech Pvt Ltd - Katakoteswaram", partyRole: "Buyer", area: "Krishna", collectionArea: "Vijayawada", group: "ABC Group", city: "Katakoteswaram",
    difference: 1000, remarks: "Includes handling charges.",
    lines: [{ contractNo: "CON-24-004", contractDate: "2024-05-02", commodity: "Soybean Meal", quantityMt: 80, commissionPerMt: 40 }],
  },
];
