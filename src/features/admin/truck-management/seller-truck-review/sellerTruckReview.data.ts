export interface PendingContractForDo {
  id: string;
  contractNo: string;
  date: string;
  seller: string;
  quantity: number;
  qtyUnit: string;
  contractRate: number;
  pendingQty: number;
  scheduleStart: string;
  scheduleEnd: string;
}

// TODO: replace with the seller's pending contracts for this product from the API.
export const pendingContractsForDo: PendingContractForDo[] = [
  { id: "c-15", contractNo: "2026-15", date: "29-04-2026", seller: "Chilakaluripet - Eswar Industries", quantity: 800, qtyUnit: "MT", contractRate: 2625000, pendingQty: 0, scheduleStart: "28-04-2026", scheduleEnd: "28-04-2026" },
];
