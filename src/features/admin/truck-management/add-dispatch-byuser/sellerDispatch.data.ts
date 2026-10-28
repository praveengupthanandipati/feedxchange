export interface SellerDispatchRow {
  id: string;
  contractNo: string;
  contractId?: number;
  /** yyyy-mm-dd, used by the date range filter. */
  date: string;
  seller: string;
  buyer: string;
  truckNumber: string;
  product: string;
  qty: number;
  qtyUnit: string;
  deliverySchedule: string;
  status: string;
}

// TODO: replace with the pending seller trucks dispatch / invoice API once it is available.
export const sellerDispatchRows: SellerDispatchRow[] = [];
