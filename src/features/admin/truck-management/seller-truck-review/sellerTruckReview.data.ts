import {
  pendingDeliveryOrderRows,
  type PendingDeliveryOrderRow,
} from "../pending-dos/pendingDeliveryOrders.data";

export interface TruckAssignment {
  truckNumber: string;
  capacity: number;
  ownerName: string;
  ownerContact: string;
  driverName: string;
  driverContact: string;
}

export interface SellerTruckReviewDetails {
  row: PendingDeliveryOrderRow;
  contractDate: string;
  transporter: string;
  scheduleDate: string;
  loadingAddress: string;
  deliveryAddress: string;
  truckStatus: string;
  truck: TruckAssignment;
}

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

// TODO: replace with the seller truck review API once it is available.
export function getSellerTruckReview(id: string): SellerTruckReviewDetails | null {
  const row = pendingDeliveryOrderRows.find((item) => item.id === id);
  if (!row) return null;

  return {
    row,
    contractDate: "18-05-2026",
    transporter: "",
    scheduleDate: "20-05-2026",
    loadingAddress: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    deliveryAddress:
      "6-114, Pedda ramalayam, Kattubadi vari palem, Chilakaluripet, Palnadu, Andhra Pradesh Chilakaluripet Andhra Pradesh 522616",
    truckStatus: "In-Transit",
    truck: {
      truckNumber: row.truckNumber,
      capacity: row.qty,
      ownerName: "JAhu",
      ownerContact: "9099089787",
      driverName: "UJashuva",
      driverContact: "87978789",
    },
  };
}

// TODO: replace with the seller's pending contracts for this product from the API.
export const pendingContractsForDo: PendingContractForDo[] = [
  { id: "c-15", contractNo: "2026-15", date: "29-04-2026", seller: "Chilakaluripet - Eswar Industries", quantity: 800, qtyUnit: "MT", contractRate: 2625000, pendingQty: 0, scheduleStart: "28-04-2026", scheduleEnd: "28-04-2026" },
];
