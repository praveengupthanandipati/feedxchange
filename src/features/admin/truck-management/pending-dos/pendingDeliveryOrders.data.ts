export interface PendingDeliveryOrderRow {
  id: string;
  contractNo: string;
  contractId?: number;
  /** Populated when the API exposes an existing delivery order. */
  doNumber?: string;
  doDate?: string;
  seller: string;
  buyer: string;
  truckNumber: string;
  product: string;
  contractRate: number;
  gstType: string;
  qty: number;
  qtyUnit: string;
  freight: number;
  deliveryType: string;
  status: string;
}
