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
    deliverySchedule: string | null;
    deliveryType: string | null;
    deliveryFromDate: string | null;
    deliveryToDate: string | null;
    calculatedStatus: string;
  };
}
/*save contract request interface*/
export interface SaveContractRequest {
  contractNumber: string;
  sellerId: number;
  buyerId: number;
  contractDate: string;
  effectiveFrom: string;
  effectiveTo: string;
  totalQuantityMT: number;
  productId: number;
  tolerancePercentage: number;
  minQuantityMT: number;
  maxQuantityMT: number;
  dispatchedQuantityMT: number;
  pendingQuantityMT: number;
  pricePerKg: number;
  currencyId: number;
  contractStatusId: number;

  sellerCommission: number;
  sellerDeliverySchedule: string;
  sellerSpecificDays: number;
  sellerFromDate: string;
  sellerToDate: string;
  loadingAddressId: number;
  sellerRemarksSpecialConditions: string;

  sellerQualitySpecifications: {
    profileId: number;
    parameterId: number;
    minValue: number;
    maxValue: number;
    unit: string;
  }[];

  buyerCommission: number;
  buyerDeliverySchedule: string;
  buyerSpecificDays: number;
  buyerFromDate: string;
  buyerToDate: string;
  deliveryAddressId: number;
  buyerRemarksSpecialConditions: string;

  buyerQualitySpecifications: {
    profileId: number;
    parameterId: number;
    minValue: number;
    maxValue: number;
    unit: string;
  }[];

  remarks: string;
  approvalRequired: boolean;
  createdBy: number;

  paymentTerms: {
    paymentTermName: string;
    paymentBeforeDate: string;
    sellerPaymentDueDays: number;
    buyerPaymentDueDays: number;
    immediateAdvancePercentage: number;
    immediateAdvanceDate: string;
    balanceAdvancePercentage: number;
    balanceAdvanceDate: string;
    remarks: string;
  };
}

/* UpdateContract expects the existing contract number and a flat update DTO. */
export interface UpdateContractRequest {
  contractNumber: string;
  updateContract: {
    contractNumber: string;
    sellerId: number;
    buyerId: number;
    contractDate: string;
    effectiveFrom: string;
    effectiveTo: string;
    totalQuantityMT: number;
    productId: number;
    tolerancePercentage: number;
    minQuantityMT: number;
    maxQuantityMT: number;
    dispatchedQuantityMT: number;
    pendingQuantityMT: number;
    pricePerKg: number;
    currencyId: number;
    contractStatusId: number;
    sellerCommission: number;
    sellerDeliverySchedule: string;
    sellerSpecificDays: number;
    sellerFromDate: string;
    sellerToDate: string;
    loadingAddressId: number;
    sellerRemarksSpecialConditions: string;
    sellerQualitySpecifications: SaveContractRequest["sellerQualitySpecifications"];
    buyerCommission: number;
    buyerDeliverySchedule: string;
    buyerSpecificDays: number;
    buyerFromDate: string;
    buyerToDate: string;
    deliveryAddressId: number;
    buyerRemarksSpecialConditions: string;
    buyerQualitySpecifications: SaveContractRequest["buyerQualitySpecifications"];
    remarks: string;
    approvalRequired: boolean;
    createdBy: number;
    paymentTerms: SaveContractRequest["paymentTerms"];
  };
}


/* =========================
   CONTRACT STATUS CHANGE
========================= */

export interface ContractStatusOption {
  contractStatusId: number;
  statusName: string;
  displayName: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateContractStatusRequest {
  contractId: number;
  calculatedStatus: string;
  reviewRemarks?: string | null;
  actionPerformedBy: number;
}

/* =========================
   PENDING CONTRACTS / FILTERS
========================= */

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

    saveContract: builder.mutation<unknown, SaveContractRequest>({
  query: (body) => ({
    url: "/api/Contracts/SaveContract",
    method: "POST",
    body,
  }),
  invalidatesTags: ["Contract", "PendingContracts"],
}),

updateContract: builder.mutation<unknown, UpdateContractRequest>({
  query: (body) => ({
    url: "/api/Contracts/UpdateContract",
    method: "PUT",
    body,
    // The endpoint may return 200 with an empty or plain-text response.
    // Treat either as a successful mutation instead of attempting JSON parsing.
    responseHandler: "text",
  }),
  invalidatesTags: ["Contract", "PendingContracts"],
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
        url: "/api/Contracts/GetContractStatuses",
        method: "GET",
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

    getAllContractsByFilters: builder.query<PendingContractApiResponse[], void>({
      query: () => ({
        url: "/api/Contracts/GetAllContractsByFilters",
        method: "GET",
      }),
      providesTags: ["PendingContracts"],
    }),

    getContractByContractNumber: builder.query<unknown, string>({
      query: (contractNo) => ({
        url: "/api/Contracts/GetContractByContractNumber",
        method: "GET",
        params: { contractNo },
      }),
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
  useSaveContractMutation,
  useUpdateContractMutation,
  useDeleteContractMutation,
  useGetAllContractStatusesQuery,
  useUpdateContractStatusMutation,
  useGetAllContractsByFiltersQuery,
  useLazyGetAllContractsByFiltersQuery,
  useGetContractByContractNumberQuery,
  useLazyGetContractByContractNumberQuery,
  useLazyGetAllContractsForExcelQuery,
} = contractsApi;
