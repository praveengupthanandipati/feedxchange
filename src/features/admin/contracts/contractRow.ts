import type { PendingContractApiResponse } from "../../../core/store/contractsApi";
import type { Contract } from "./contracts.data";

/** A contract-list row (GetAllContractsByFilters) as the Contracts table and the contract form use it. */
export function mapApiContract(row: PendingContractApiResponse): Contract {
  const qtyMeasure = row.basicDetails.quantityMeasure || "mt";
  const quantity = row.basicDetails.quantity ?? 0;
  const contractRate = row.basicDetails.contractRate ?? 0;
  const netRateValue = row.basicDetails.netRate ?? contractRate;
  return {
    id: row.contractNumber,
    contractId: row.contractId,
    contractNumber: row.contractNumber,
    date: row.contractDate ? new Date(row.contractDate).toLocaleDateString("en-IN") : "",
    dateValue: row.contractDate ? new Date(row.contractDate).getTime() : 0,
    status: row.basicDetails.calculatedStatus as Contract["status"],
    seller: row.sellerName ?? "",
    sellerId: row.sellerId ?? undefined,
    buyer: row.buyerName ?? "",
    buyerId: row.buyerId ?? undefined,
    product: row.productName ?? "",
    quantityMeasure: qtyMeasure,
    qty: `${quantity} ${qtyMeasure}`,
    qtyValue: quantity,
    poTolerance: "",
    aQty: `${row.basicDetails.arrangedQuantity ?? 0} ${qtyMeasure}`,
    pQty: `${row.basicDetails.pendingQuantity ?? quantity} ${qtyMeasure}`,
    dQty: `${row.basicDetails.dispatchedQuantity ?? 0} ${qtyMeasure}`,
    cRate: `₹${contractRate}`,
    cRateValue: contractRate,
    gst: `${row.basicDetails.gstPercentage ?? 0}%`,
    netRate: `₹${netRateValue}`,
    netRateValue,
    // Not returned by the GetAllContracts summary endpoint.
    indicativeFreight: "",
    rateRemarks: "",
    deliveryType: row.basicDetails.deliveryType ?? "",
    paymentTerms: "",
    paymentBeforeDate: "",
    immediateAdvancePercent: "",
    immediateAdvanceDate: "",
    balanceAdvancePercent: "",
    balanceAdvanceDate: "",
    sellerPaymentDueDays: "",
    buyerPaymentDueDays: "",
    paymentRemarks: "",
    iFreight: "",
    iFreightValue: 0,
    sellerConditions: {
      commission: "",
      deliverySchedule: "ready-loading",
      fromDate: "",
      toDate: "",
      specificDays: "",
      qualitySpecSource: "",
      address: "",
      remarks: "",
    },
    buyerConditions: {
      commission: "",
      deliverySchedule: "ready-loading",
      fromDate: "",
      toDate: "",
      specificDays: "",
      qualitySpecSource: "",
      address: "",
      remarks: "",
    },
    approved: false,
  };
}
