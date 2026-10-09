export type ActionType = "Buy" | "Sell";

/** An invoice (dispatch) raised against a contract. */
export interface EstimationInvoice {
  id: string;
  /** yyyy-mm-dd */
  invoiceDate: string;
  invoiceNo: string;
  /** MT */
  qty: number;
  truckNumber: string;
  /** ₹ */
  amount: number;
}

/** A contract the company expects to earn commission on. */
export interface EstimationContract {
  id: string;
  /** yyyy-mm-dd */
  contractDate: string;
  contractNo: string;
  partyName: string;
  actionType: ActionType;
  commodity: string;
  /** ₹ per quintal */
  contractRate: number;
  quantityMt: number;
  /** ₹ commission per MT. */
  commissionPerMt: number;
  invoices: EstimationInvoice[];
}

export interface EstimationFilters {
  party: string;
  actionType: string;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: EstimationFilters = { party: "", actionType: "", from: "", to: "" };

/** The grey "apply commission to many rows" bar. */
export interface BulkCommission {
  commodity: string;
  party: string;
  commission: string;
}

export const EMPTY_BULK: BulkCommission = { commodity: "", party: "", commission: "" };

export const ACTION_TYPE_OPTIONS = [
  { value: "Buy", label: "Buy" },
  { value: "Sell", label: "Sell" },
];

// TODO: replace with the commission-estimation API once it is available.
export const estimationContracts: EstimationContract[] = [
  {
    id: "1",
    contractDate: "2024-04-01",
    contractNo: "25",
    partyName: "ABC Poultech Pvt Ltd - Katakoteswaram",
    actionType: "Sell",
    commodity: "Maize",
    contractRate: 2100,
    quantityMt: 100,
    commissionPerMt: 50,
    invoices: [
      { id: "1-1", invoiceDate: "2024-04-10", invoiceNo: "INV001", qty: 40, truckNumber: "AP16AB1234", amount: 42000 },
      { id: "1-2", invoiceDate: "2024-04-12", invoiceNo: "INV002", qty: 60, truckNumber: "AP16CD5678", amount: 63000 },
    ],
  },
  {
    id: "2",
    contractDate: "2024-04-02",
    contractNo: "50",
    partyName: "Amalgam Nutrients and Feeds Limited - Karumancherry",
    actionType: "Buy",
    commodity: "Soybean Meal",
    contractRate: 3200,
    quantityMt: 200,
    commissionPerMt: 50,
    invoices: [
      { id: "2-1", invoiceDate: "2024-04-08", invoiceNo: "INV003", qty: 80, truckNumber: "TS09EF2345", amount: 256000 },
      { id: "2-2", invoiceDate: "2024-04-11", invoiceNo: "INV004", qty: 70, truckNumber: "TS09GH6789", amount: 224000 },
      { id: "2-3", invoiceDate: "2024-04-15", invoiceNo: "INV005", qty: 50, truckNumber: "AP28JK1122", amount: 160000 },
    ],
  },
  {
    id: "3",
    contractDate: "2024-04-03",
    contractNo: "65",
    partyName: "Arjun Poultry Farm - Karimnagar",
    actionType: "Sell",
    commodity: "Wheat Bran",
    contractRate: 1800,
    quantityMt: 150,
    commissionPerMt: 50,
    invoices: [
      { id: "3-1", invoiceDate: "2024-04-09", invoiceNo: "INV006", qty: 75, truckNumber: "TS02LM3344", amount: 135000 },
      { id: "3-2", invoiceDate: "2024-04-14", invoiceNo: "INV007", qty: 75, truckNumber: "TS02NP5566", amount: 135000 },
    ],
  },
  {
    id: "4",
    contractDate: "2024-04-05",
    contractNo: "72",
    partyName: "Srinidhi Feeds Pvt Ltd - Gunnampalli",
    actionType: "Buy",
    commodity: "Rice DDGS",
    contractRate: 1840,
    quantityMt: 120,
    commissionPerMt: 30,
    invoices: [{ id: "4-1", invoiceDate: "2024-04-13", invoiceNo: "INV008", qty: 120, truckNumber: "AP37QR7788", amount: 220800 }],
  },
  {
    id: "5",
    contractDate: "2024-04-09",
    contractNo: "88",
    partyName: "KK Proteins Pvt Ltd - Adilabad",
    actionType: "Sell",
    commodity: "Soya DOC",
    contractRate: 3680,
    quantityMt: 60,
    commissionPerMt: 60,
    invoices: [],
  },
];
