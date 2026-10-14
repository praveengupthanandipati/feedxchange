export interface SellerDispatchRow {
  contractNo: string;
  seller: string;
  buyer: string;
  truckNo: string;
  doNo: string;
  /** yyyy-mm-dd */
  doDate: string;
  invNo: string;
  /** yyyy-mm-dd, or "" before invoicing */
  invDate: string;
  product: string;
  contractRate: number;
  qty: number;
  freight: number;
  deliveryType: "FOR Loading" | "Ex-Loading";
  status: "Invoice Generated" | "DO Generated" | "Dispatched" | "Pending";
}

// TODO: replace with the seller dispatches API once it is available.
export const sellerDispatchRows: SellerDispatchRow[] = [
  { contractNo: "CON-2026-001", seller: "Sai Feeds Pvt Ltd", buyer: "Srinidhi Feeds Pvt Ltd", truckNo: "TS25U1234", doNo: "DO-001", doDate: "2026-04-01", invNo: "INV-001", invDate: "2026-04-02", product: "Soya DOC", contractRate: 3200, qty: 20, freight: 5000, deliveryType: "FOR Loading", status: "Invoice Generated" },
  { contractNo: "CON-2026-002", seller: "Ankur Animal Feeds", buyer: "KK Proteins Pvt Ltd", truckNo: "AP09Z9876", doNo: "DO-002", doDate: "2026-04-03", invNo: "INV-002", invDate: "2026-04-04", product: "Maize", contractRate: 2100, qty: 18, freight: 4800, deliveryType: "Ex-Loading", status: "DO Generated" },
  { contractNo: "CON-2026-003", seller: "Blue Aqua Farms", buyer: "Cargill India Pvt Ltd", truckNo: "TS07K4567", doNo: "DO-003", doDate: "2026-04-05", invNo: "", invDate: "", product: "Wheat Bran", contractRate: 1800, qty: 25, freight: 5200, deliveryType: "FOR Loading", status: "DO Generated" },
  { contractNo: "CON-2026-004", seller: "Green Valley Dairy", buyer: "Godrej Agrovet", truckNo: "KA05G3311", doNo: "DO-004", doDate: "2026-04-07", invNo: "INV-003", invDate: "2026-04-08", product: "Rice DDGS", contractRate: 2400, qty: 15, freight: 4500, deliveryType: "Ex-Loading", status: "Dispatched" },
  { contractNo: "CON-2026-005", seller: "FairSquare Trading", buyer: "ITC Agro", truckNo: "MH12AB7890", doNo: "DO-005", doDate: "2026-04-09", invNo: "INV-004", invDate: "2026-04-10", product: "Corn Gluten", contractRate: 3500, qty: 22, freight: 5500, deliveryType: "FOR Loading", status: "Invoice Generated" },
  { contractNo: "CON-2026-006", seller: "Shubham Pvt Ltd", buyer: "Amul Agribusiness", truckNo: "TS25U5678", doNo: "DO-006", doDate: "2026-04-11", invNo: "", invDate: "", product: "Soya DOC", contractRate: 3250, qty: 20, freight: 5000, deliveryType: "Ex-Loading", status: "Pending" },
  { contractNo: "CON-2026-007", seller: "Sunrise Agro", buyer: "Heritage Foods", truckNo: "AP09Z1122", doNo: "DO-007", doDate: "2026-04-13", invNo: "INV-005", invDate: "2026-04-14", product: "Rapeseed Meal", contractRate: 2800, qty: 18, freight: 4700, deliveryType: "FOR Loading", status: "Invoice Generated" },
  { contractNo: "CON-2026-008", seller: "Royal Feeds", buyer: "Suguna Foods", truckNo: "TS07K9988", doNo: "DO-008", doDate: "2026-04-15", invNo: "", invDate: "", product: "Maize", contractRate: 2150, qty: 20, freight: 5100, deliveryType: "Ex-Loading", status: "DO Generated" },
  { contractNo: "CON-2026-009", seller: "AgroStar Enterprises", buyer: "Venkateshwara Hatch.", truckNo: "KA05G7744", doNo: "DO-009", doDate: "2026-04-17", invNo: "INV-006", invDate: "2026-04-18", product: "Groundnut Cake", contractRate: 4100, qty: 12, freight: 4300, deliveryType: "FOR Loading", status: "Dispatched" },
  { contractNo: "CON-2026-010", seller: "Farm Fresh Ltd", buyer: "Charoen Pokphand India", truckNo: "MH12AB3344", doNo: "DO-010", doDate: "2026-04-19", invNo: "INV-007", invDate: "2026-04-20", product: "Fish Meal", contractRate: 6200, qty: 10, freight: 4900, deliveryType: "Ex-Loading", status: "Invoice Generated" },
];
