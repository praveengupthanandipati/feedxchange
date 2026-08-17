import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

/* =========================
   GET ALL CONTRACTS
========================= */

export interface GetAllContractsRow {
  id: number;
  contractDate: string;
  contractNumber: string;
  status: string;

  sellerId: number | null;
  sellerName: string | null;
  sellerCity: string | null;

  buyerId: number | null;
  buyerName: string | null;
  buyerCity: string | null;

  productId: number;
  productName: string | null;

  quantity: number;
  quantityMeasure: string | null;

  contractRate: number;
  gstPercentage: number;
  baseRate: number;
  gstAmount: number;
  netRate: number;

  deliveryType: string | null;

  dispatchedQuantity: number;
  arrangedQuantity: number;
  pendingQuantity: number;

  approvalStatus: boolean;
  isActive: boolean;

  createdBy: number;
  createdOn: string;

  modifiedBy: number | null;
  modifiedOn: string | null;
}

export interface GetAllContractsResponse {
  totalContracts: number;
  totalQuantity: number;
  contracts: GetAllContractsRow[];
}

/* =========================
   CONTRACT STATUS CHANGE
========================= */

export interface ContractStatusOption {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
}

export interface GetContractBasicDetails {
  quantity: number | null;
  quantityMeasure: string | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  poTolerance: string | null;
  poTolerancePercentage: number | null;
  deliveryType: string | null;
  contractRate: number | null;
  gstPercentage: number | null;
  gstDetails: string | null;
  baseRate: number | null;
  gstAmount: number | null;
  netRate: number | null;
  indicativeFreight: number | null;
  rateRemarks: string | null;
  calculatedStatus: string | null;
  reviewRemarks: string | null;
}

export interface GetContractDto {
  id: number;
  contractNumber: string | null;
  contractDate: string;
  sellerId: number | null;
  sellerName: string | null;
  buyerId: number | null;
  buyerName: string | null;
  productId: number | null;
  productName: string | null;
  statusId: number | null;
  basicDetails: GetContractBasicDetails;
  createdOn: string;
  modifiedOn: string | null;
}

export interface UpdateContractStatusRequest {
  contractId: number;
  calculatedStatus: string;
  reviewRemarks?: string | null;
  actionPerformedBy: number;
}

/* =========================
   SAVE / UPDATE CONTRACT
========================= */

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
  contractTypeId: number | null;
  businessUnitId: number | null;
  effectiveFrom: string;
  effectiveTo: string;
  currencyId: number | null;
  statusId: number | null;
  versionNo: number | null;
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
  contractId: number;
  updateContract: UpdateContractPayload;
}

export type SaveContractRequest = UpdateContractPayload;

/* =========================
   PENDING CONTRACTS / FILTERS
========================= */

export interface PendingContractApiResponse {
  contractId: number;
  contractNumber: string;
  contractDate: string;
  sellerId: number | null;
  sellerName: string | null;
  buyerId: number | null;
  buyerName: string | null;
  productId: number | null;
  productName: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;

  basicDetails: {
    contractRate: number;
    quantity: number;
    quantityMeasure: string;
    minQuantity: number;
    maxQuantity: number;
    deliverySchedule: string;
    deliveryType: string;
    deliveryFromDate: string | null;
    deliveryToDate: string | null;
    calculatedStatus: string;
  };
}

export interface GetAllContractsParams {
  DateFilter?: string;
  FromDate?: string;
  ToDate?: string;
  Status?: string;
}

export interface TransporterContract {
  contractNumber: string;
  sellerId: number;
  sellerName: string;
  loadingAddress: string;
  buyerId: number;
  buyerName: string;
  deliveryAddress: string;
  contractDate: string;
  productId: number;
  productName: string;
  contractRate: number;
  contractQuantity: number;
  quantityMeasure: string;
  dispatchedQuantity: number;
  arrangedQuantity: number;
  pendingQuantity: number;
  truckAssignedStatus: string;
  deliverySchedule: string;
  deliveryFromDate: string;
  deliveryToDate: string;
  deliveryType: string;
  paymentType: string;
  createdAt: string;
  updatedAt: string;
}

// Backend only accepts Status + SearchText for this endpoint (confirmed via Swagger).
export interface GetAllContractsByFiltersRequest {
  Status?: string;
  SearchText?: string;
}

export interface GetAllContractsForTransporterParams {
  SellerName?: string;
  BuyerName?: string;
  ContractDateFrom?: string;
  ContractDateTo?: string;
  DeliveryFromDate?: string;
  DeliveryToDate?: string;
  TruckAssignedStatus?: string;
  DeliverySchedule?: string;
  SearchText?: string;
}

export const contractsApi = createApi({
  reducerPath: "contractsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),

  tagTypes: ["Contract", "PendingContracts"],

  endpoints: (builder) => ({
    /* =========================
       GET ALL CONTRACTS
    ========================= */

    getAllContracts: builder.query<GetAllContractsResponse, void>({
      query: () => ({
        url: "/api/Contracts/GetAllContracts",
        method: "GET",
      }),

      providesTags: ["PendingContracts"],
    }),

    /* =========================
       DELETE CONTRACT
    ========================= */

    deleteContract: builder.mutation<
      void,
      { contractId: number }
    >({
      query: (body) => ({
        url: "/api/Contracts/DeleteContract",
        method: "POST",
        body,
      }),
    }),

    /* =========================
       CONTRACT STATUS CHANGE
    ========================= */

    getAllContractStatuses: builder.query<ContractStatusOption[], void>({
      query: () => ({
        url: "/api/Contracts/GetAllContractStatuses",
        method: "GET",
      }),
    }),

    getContractByContractId: builder.query<GetContractDto, number>({
      query: (contractId) => ({
        url: "/api/Contracts/GetContractByContractId",
        method: "GET",
        params: { contractId },
      }),
    }),

    updateContractStatus: builder.mutation<void, UpdateContractStatusRequest>({
      query: (body) => ({
        url: "/api/Contracts/UpdateContractStatus",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PendingContracts"],
    }),

    /* =========================
       SAVE / UPDATE CONTRACT
    ========================= */

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

    /* =========================
       PENDING CONTRACTS / FILTERS
    ========================= */

    getAllContractsByFilters: builder.query<PendingContractApiResponse[], GetAllContractsByFiltersRequest>({
      query: (params) => ({
        url: "/api/Contracts/GetAllContractsByFilters",
        method: "GET",
        params,
      }),
      providesTags: ["PendingContracts"],
    }),

    getAllContractsForExcel: builder.query<Blob, void>({
      query: () => ({
        url: "/api/Contracts/GetAllContractsForExcel",
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetAllContractsQuery,
  useDeleteContractMutation,
  useGetAllContractStatusesQuery,
  useLazyGetContractByContractIdQuery,
  useUpdateContractStatusMutation,
  useUpdateContractMutation,
  useSaveContractMutation,
  useGetAllContractsByFiltersQuery,
  useLazyGetAllContractsByFiltersQuery,
  useLazyGetAllContractsForExcelQuery,
} = contractsApi;
