export type ContractStatus =
  | "Open"
  | "Pending"
  | "In-transit"
  | "Rejected";

export interface QualitySpecification {
  profileId?: number;
  parameterId?: number;
  parameter?: string;
  minValue?: number;
  maxValue?: number;
  unit?: string | null;
}

export interface ConditionInfo {
  commission: string;
  deliverySchedule: string;
  fromDate: string;
  toDate: string;
  specificDays: string;
  qualitySpecSource: string;
  address: string;
  remarks: string;
}

export interface Contract {
  // Existing display fields
  id: string;
  contractId: number;
  contractNumber: string;
  date: string;
  dateValue: number;
  status: ContractStatus;
  seller: string;
  buyer: string;
  product: string;
  quantityMeasure: string;
  qty: string;
  qtyValue: number;
  poTolerance: string;
  aQty: string;
  pQty: string;
  dQty: string;
  cRate: string;
  cRateValue: number;
  gst: string;
  netRate: string;
  netRateValue: number;
  indicativeFreight: string;
  rateRemarks: string;
  gstDetails?: string;
  deliveryType: string;
  paymentTerms: string;
  paymentBeforeDate: string;
  immediateAdvancePercent: string;
  immediateAdvanceDate: string;
  balanceAdvancePercent: string;
  balanceAdvanceDate: string;
  sellerPaymentDueDays: string;
  buyerPaymentDueDays: string;
  paymentRemarks: string;
  iFreight: string;
  iFreightValue: number;
  sellerConditions: ConditionInfo;
  buyerConditions: ConditionInfo;
  approved: boolean;

  // --------------------------------------------------
  // API values needed when editing a contract
  // --------------------------------------------------

  sellerId?: number;
  buyerId?: number;
  productId?: number;

  minQuantityMT?: number;
  maxQuantityMT?: number;
  dispatchedQuantityMT?: number;
  pendingQuantityMT?: number;

  currencyId?: number;
  contractStatusId?: number;

  sellerCommission?: number;
  sellerDeliverySchedule?: string;
  sellerSpecificDays?: number;
  sellerFromDate?: string;
  sellerToDate?: string;
  loadingAddressId?: number;
  sellerRemarksSpecialConditions?: string;
  sellerQualitySpecifications?: QualitySpecification[];

  buyerCommission?: number;
  buyerDeliverySchedule?: string;
  buyerSpecificDays?: number;
  buyerFromDate?: string;
  buyerToDate?: string;
  deliveryAddressId?: number;
  buyerRemarksSpecialConditions?: string;
  buyerQualitySpecifications?: QualitySpecification[];

  approvalRequired?: boolean;
  createdById?: number;

  paymentTermName?: string;
}

export const statusOptions = [
  { value: "All", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Rejected", label: "Rejected" },
  { value: "Pending", label: "Pending" },
  { value: "In-transit", label: "In Transit" },
];

export const dateRangeOptions = [
  { value: "All", label: "All" },
  { value: "Today", label: "Today" },
  { value: "Last 7 Days", label: "Last 7 Days" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "Previous Month", label: "Previous Month" },
  { value: "Custom Date Range", label: "Custom Date Range" },
];
