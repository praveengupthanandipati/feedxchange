export type GstType = "Inc GST" | "Exc GST";

export interface PendingDeliveryOrderRow {
  id: string;
  contractNo: string;
  contractId?: number;
  /** Set once a DO has been generated; otherwise the row offers "Add DO / Reassign". */
  doNumber?: string;
  doDate?: string;
  seller: string;
  buyer: string;
  truckNumber: string;
  product: string;
  contractRate: number;
  gstType: GstType;
  qty: number;
  qtyUnit: string;
  freight: number;
  deliveryType: string;
  status: string;
}

// TODO: replace with the Pending DO API once it is available.
export const pendingDeliveryOrderRows: PendingDeliveryOrderRow[] = [
  { id: "1", contractNo: "2026-29", seller: "Chatrai - Lakshmi Poultry Feeds", buyer: "Chilakaluripet - Eswar Feeds", truckNumber: "SDKJJHDSB", product: "Maize DDGS", contractRate: 23000, gstType: "Inc GST", qty: 7, qtyUnit: "MT", freight: 1000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "2", contractNo: "2026-29", seller: "Chatrai - Lakshmi Poultry Feeds", buyer: "Chilakaluripet - Eswar Feeds", truckNumber: "TS27C512", product: "Maize DDGS", contractRate: 23000, gstType: "Inc GST", qty: 30, qtyUnit: "MT", freight: 3000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "3", contractNo: "2026-17", seller: "Chilakaluripet - Eswar Feeds", buyer: "Tadepalligudem - SL Agro Industries", truckNumber: "ts27c5", product: "Rice DDGS", contractRate: 100000, gstType: "Exc GST", qty: 30, qtyUnit: "MT", freight: 30000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "4", contractNo: "2026-17", seller: "Chilakaluripet - Eswar Feeds", buyer: "Tadepalligudem - SL Agro Industries", truckNumber: "ts27c5112", product: "Rice DDGS", contractRate: 100000, gstType: "Exc GST", qty: 30, qtyUnit: "MT", freight: 20000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "5", contractNo: "2026-17", seller: "Chilakaluripet - Eswar Feeds", buyer: "Tadepalligudem - SL Agro Industries", truckNumber: "TS08ZA2256", product: "Rice DDGS", contractRate: 100000, gstType: "Inc GST", qty: 50, qtyUnit: "MT", freight: 5000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "6", contractNo: "2026-17", seller: "Chilakaluripet - Eswar Feeds", buyer: "Tadepalligudem - SL Agro Industries", truckNumber: "TS08BA2244", product: "Rice DDGS", contractRate: 100000, gstType: "Inc GST", qty: 25, qtyUnit: "MT", freight: 1000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "7", contractNo: "2026-16", seller: "Chatrai - Lakshmi Poultry Feeds", buyer: "Tadepalligudem - SL Agro Industries", truckNumber: "AP09KU0910", product: "Soya DOC", contractRate: 100000, gstType: "Inc GST", qty: 30, qtyUnit: "MT", freight: 3000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "8", contractNo: "2026-16", seller: "Chatrai - Lakshmi Poultry Feeds", buyer: "Tadepalligudem - SL Agro Industries", truckNumber: "AP09KL0909", product: "Soya DOC", contractRate: 100000, gstType: "Exc GST", qty: 20, qtyUnit: "MT", freight: 2000, deliveryType: "Ex-Loading", status: "DO Generated" },
  { id: "9", contractNo: "2026-12", doNumber: "235", doDate: "03-03-2026", seller: "Miryalguda - Rayapudi Traders", buyer: "Mudinepalli - Purnima Feeds", truckNumber: "TS29TB5354", product: "DORB", contractRate: 15400, gstType: "Exc GST", qty: 35, qtyUnit: "MT", freight: 1000, deliveryType: "FOR delivery", status: "DO Generated" },
];
