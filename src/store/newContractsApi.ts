import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

export interface BasicDetailsPayload {
  quantity: number;
  quantityMeasure: string;
  minQuantity: number;
  maxQuantity: number;
  poTolerancePercentage: number;
  deliveryType: string;
  contractRate: number;
  gstPercentage: number;
  gstDetails: string;
  baseRate: number;
  gstAmount: number;
  netRate: number;
  indicativeFreight: number;
  rateRemarks: string;
}

export interface QualitySpecificationPayload {
  parameter: string;
  minValue: number;
  maxValue: number;
  unit: string;
}

export interface ConditionPayload {
  commission: number;
  deliverySchedule: string;
  sellerSpecificDays: string | null;
  sellerFromDate: string | null;
  sellerToDate: string | null;
  qualitySpecifications: QualitySpecificationPayload[];
  customQualitySpecifications: string;
  loadingAddressAt: string;
  remarksSpecialConditions: string;
}

export interface BuyerConditionPayload {
  commission: number;
  deliverySchedule: string;
  buyerFromDate: string | null;
  buyerToDate: string | null;
  buyerSpecificDays: string | null;
  qualitySpecifications: QualitySpecificationPayload[];
  customQualitySpecifications: string;
  loadingAddressAt: string;
  remarksSpecialConditions: string;
}

export interface PaymentsInvoicesPayload {
  paymentBeforeDate: string | null;
  sellerPaymentDueDays: number;
  buyerPaymentDueDays: number;
  immediateAdvancePercentage: number;
  immediateAdvanceDate: string | null;
  balanceAdvancePercentage: number;
  balanceAdvanceDate: string | null;
  remarks: string;
}

export interface UpdateContractPayload {
  contractDate: string;
  contractTypeId: number;
  businessUnitId: number;
  effectiveFrom: string;
  effectiveTo: string;
  currencyId: number;
  statusId: number;
  versionNo: number;
  parentContractId: number | null;
  referenceNo: string;
  remarks: string;
  approvalRequired: boolean;
  isActive: boolean;
  sellerId: number;
  buyerId: number;
  productId: number;
  basicDetails: BasicDetailsPayload;
  sellerConditions: ConditionPayload;
  buyerConditions: BuyerConditionPayload;
  paymentsInvoices: PaymentsInvoicesPayload;
  actionPerformedBy: number;
}

export interface UpdateContractRequest {
  contractNumber: string;
  updateContract: UpdateContractPayload;
}

export type SaveContractRequest = UpdateContractPayload;

export const newContractsApi = createApi({
  reducerPath: "newContractsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["Contract", "PendingContracts"],
  endpoints: (builder) => ({
    updateContract: builder.mutation<void, UpdateContractRequest>({
      query: (body) => ({
        url: "/api/Contracts/UpdateContract",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PendingContracts"],
    }),
    saveContract: builder.mutation<void, SaveContractRequest>({
      query: (body) => ({
        url: "/api/Contracts/SaveContract",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PendingContracts"],
    }),
  }),
});

export const { useUpdateContractMutation, useSaveContractMutation } = newContractsApi;

