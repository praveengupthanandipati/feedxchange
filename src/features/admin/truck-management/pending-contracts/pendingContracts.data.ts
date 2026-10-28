export interface PendingContractRow {
  id: string;
  contractId?: number;
  date: string;
  dateValue: number;
  seller: string;
  buyer: string;
  cRate: string;
  cRateValue: number;
  cQty: string;
  cQtyValue: number;
  dQty: string;
  dQtyValue: number;
  aQty: string;
  aQtyValue: number;
  pQty: string;
  pQtyValue: number;
  product: string;
  fromDate: string;
  toDate: string;
  deliverySchedule: string;
  paymentType: string;
}
