// TODO: replace with real data once the truck-management API is wired up.

export type FreightApprovalStatus = "Updated" | "Accepted" | "Rejected";

export interface BulkFreightRow {
  lineId: string;
  contractNumber: string;
  status: FreightApprovalStatus;
  qtyOriginal?: string;
  qtyCurrent: string;
  qtyValue: number;
  freightOriginal?: string;
  freightCurrent: string;
  freightValue: number;
  seller: string;
  buyer: string;
  loadingAddress: string;
  deliveryAddress: string;
  transporter: string;
  assignedDate: string;
  assignedDateValue: number;
  assignedBy: string;
}

export const sellerOptions = [
  { value: "Chilakaluripet - Eswar Industries", label: "Chilakaluripet - Eswar Industries" },
  { value: "Chatrai - Lakshmi Poultry", label: "Chatrai - Lakshmi Poultry" },
  { value: "Miryalguda - Rayapudi Agro", label: "Miryalguda - Rayapudi Agro" },
  { value: "Mudinepalli - Purnima Feeds", label: "Mudinepalli - Purnima Feeds" },
];

export const buyerOptions = [
  { value: "Tadepalligudem - SL Traders", label: "Tadepalligudem - SL Traders" },
  { value: "Chatrai - Lakshmi Poultry", label: "Chatrai - Lakshmi Poultry" },
  { value: "Miryalguda - Rayapudi Agro", label: "Miryalguda - Rayapudi Agro" },
  { value: "Mudinepalli - Purnima Feeds", label: "Mudinepalli - Purnima Feeds" },
];

export const assignedByOptions = [
  { value: "SSRTS Admin", label: "SSRTS Admin" },
  { value: "Ravi Kumar", label: "Ravi Kumar" },
  { value: "Priya Sharma", label: "Priya Sharma" },
];

export const bulkFreightRows: BulkFreightRow[] = [
  {
    lineId: "2026-17-1",
    contractNumber: "2026-17",
    status: "Updated",
    qtyOriginal: "50 MT",
    qtyCurrent: "501 MT",
    qtyValue: 501,
    freightOriginal: "₹1000",
    freightCurrent: "₹1001",
    freightValue: 1001,
    seller: "Chilakaluripet - Eswar Industries",
    buyer: "Tadepalligudem - SL Traders",
    loadingAddress:
      "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    deliveryAddress: "5km from Badampudi Toll Plaza, NH16, Andhra Pradesh",
    transporter: "Jawahar Roadlines",
    assignedDate: "17/05/2026",
    assignedDateValue: new Date(2026, 4, 17).getTime(),
    assignedBy: "SSRTS Admin",
  },
  {
    lineId: "2026-17-2",
    contractNumber: "2026-17",
    status: "Accepted",
    qtyCurrent: "200 MT",
    qtyValue: 200,
    freightCurrent: "₹1000",
    freightValue: 1000,
    seller: "Chilakaluripet - Eswar Industries",
    buyer: "Tadepalligudem - SL Traders",
    loadingAddress: "Ammerpet",
    deliveryAddress: "Uppal",
    transporter: "Jawahar Roadlines",
    assignedDate: "15/05/2026",
    assignedDateValue: new Date(2026, 4, 15).getTime(),
    assignedBy: "SSRTS Admin",
  },
  {
    lineId: "2026-17-3",
    contractNumber: "2026-17",
    status: "Updated",
    qtyOriginal: "20 MT",
    qtyCurrent: "10 MT",
    qtyValue: 10,
    freightOriginal: "₹2000",
    freightCurrent: "₹3000",
    freightValue: 3000,
    seller: "Chilakaluripet - Eswar Industries",
    buyer: "Tadepalligudem - SL Traders",
    loadingAddress:
      "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    deliveryAddress: "Office, 123 Tadepalligudem Road, West Godavari, Andhra Pradesh",
    transporter: "Jawahar Roadlines",
    assignedDate: "05/05/2026",
    assignedDateValue: new Date(2026, 4, 5).getTime(),
    assignedBy: "SSRTS Admin",
  },
];

export const contractOptions = Array.from(
  new Set(bulkFreightRows.map((row) => row.contractNumber)),
).map((value) => ({ value, label: value }));
