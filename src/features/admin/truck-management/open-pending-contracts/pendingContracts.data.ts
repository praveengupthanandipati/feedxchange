import type { OpenAndPendingContract } from "../../../../core/store/contractsApi";

export interface PendingContractRow {
  id: string;
  status: "Open" | "Partially Dispatched";
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

const formatShortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const hasEffectivePeriod = (row: OpenAndPendingContract) => {
  const from = row.effectiveFrom?.slice(0, 10) ?? "";
  const to = row.effectiveTo?.slice(0, 10) ?? "";
  return Boolean(from && to && !from.startsWith("0001") && to > from);
};

export function mapOpenAndPendingContract(row: OpenAndPendingContract, status: PendingContractRow["status"] = "Open"): PendingContractRow {
  const dispatched = row.dispatchedQuantityMT ?? 0;
  const pending = row.pendingQuantityMT ?? 0;
  const total = row.totalQuantityMT ?? 0;
  const arranged = Math.max(total - dispatched - pending, 0);
  const dateValue = new Date(row.contractDate).getTime();

  return {
    id: row.contractNumber,
    status,
    date: formatShortDate(row.contractDate),
    dateValue: Number.isNaN(dateValue) ? 0 : dateValue,
    seller: row.seller ?? "-",
    buyer: row.buyer ?? "-",
    cRate: `₹${row.pricePerMT.toLocaleString("en-IN")}`,
    cRateValue: row.pricePerMT,
    cQty: `${total} MT`,
    cQtyValue: total,
    dQty: `${dispatched} MT`,
    dQtyValue: dispatched,
    aQty: `${arranged} MT`,
    aQtyValue: arranged,
    pQty: `${pending} MT`,
    pQtyValue: pending,
    product: row.productName,
    // Effective From / To are no longer entered (new contracts save both as the contract date): a range is shown
    // only when it is a real one, i.e. To is after From.
    fromDate: hasEffectivePeriod(row) ? formatShortDate(row.effectiveFrom) : "",
    toDate: hasEffectivePeriod(row) ? formatShortDate(row.effectiveTo) : "",
    deliverySchedule: row.deliverySchedule,
    paymentType: row.paymentTermName,
  };
}

