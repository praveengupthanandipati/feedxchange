export interface ReassignContext {
  buyer: string;
  product: string;
  truckNo: string;
  /** Truck quantity in MT. */
  qty: number;
}

export interface ReassignContractRow {
  id: string;
  /** dd-mm-yyyy */
  date: string;
  seller: string;
  qty: number;
  pendingQty: number;
  scheduleStart: string;
  scheduleEnd: string;
  assignableQty: number;
}

// TODO: replace with the pending contracts API for reassigning a truck.
export const reassignContext: ReassignContext = {
  buyer: "Chatrai - Lakshmi Poultry",
  product: "Soya DOC",
  truckNo: "AP09KL0909",
  qty: 500,
};

export const reassignContractRows: ReassignContractRow[] = [
  { id: "1", date: "01-04-2026", seller: "Sai Feeds Pvt Ltd", qty: 500, pendingQty: 300, scheduleStart: "01-04-2026", scheduleEnd: "10-04-2026", assignableQty: 2 },
  { id: "2", date: "03-04-2026", seller: "Ankur Animal Feeds", qty: 300, pendingQty: 150, scheduleStart: "03-04-2026", scheduleEnd: "12-04-2026", assignableQty: 0 },
  { id: "3", date: "05-04-2026", seller: "Blue Aqua Farms", qty: 400, pendingQty: 200, scheduleStart: "05-04-2026", scheduleEnd: "15-04-2026", assignableQty: 0 },
  { id: "4", date: "07-04-2026", seller: "Green Valley Dairy", qty: 250, pendingQty: 100, scheduleStart: "07-04-2026", scheduleEnd: "17-04-2026", assignableQty: 0 },
  { id: "5", date: "09-04-2026", seller: "FairSquare Trading", qty: 350, pendingQty: 180, scheduleStart: "09-04-2026", scheduleEnd: "20-04-2026", assignableQty: 0 },
];
