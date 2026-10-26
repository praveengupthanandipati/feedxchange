// TODO: replace with real data once the truck-management API is wired up.

export interface ContractSummary {
  contractNumber: string;
  contractQty: string;
  dispatchedQty: string;
  vehicleArrangedQty: string;
  pendingQty: string;
  totalTrucksAssigned: number;
  sellerName: string;
  buyerName: string;
  contractDate: string;
  productName: string;
  contractRate: string;
  indicativeFreight: string;
  loadingAddress: string;
  deliveryAddress: string;
}

export const defaultContractSummary: ContractSummary = {
  contractNumber: "2026-29",
  contractQty: "50 MT",
  dispatchedQty: "0 MT",
  vehicleArrangedQty: "40 MT",
  pendingQty: "10 MT",
  totalTrucksAssigned: 2,
  sellerName: "Chatrai - Lakshmi Poultry Complex",
  buyerName: "Chilakaluripet - Eswar Industries",
  contractDate: "18/5/2026",
  productName: "Maize DDGS",
  contractRate: "—",
  indicativeFreight: "₹1,000",
  loadingAddress: "—",
  deliveryAddress: "—",
};

export function getContractSummary(contractNumber: string | null): ContractSummary {
  if (!contractNumber) return defaultContractSummary;
  return { ...defaultContractSummary, contractNumber };
}
