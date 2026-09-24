import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import { unwrapArray, unwrapObject } from "./userProfilesCommonApi";

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
  contractStatusId: number;
  statusName: string;
  displayName: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ScheduleStatusOption {
  scheduleStatusId: number;
  statusName: string;
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

export interface QualitySpecificationDetail {
  parameter: string | null;
  minValue: number | null;
  maxValue: number | null;
  unit: string | null;
}

export interface GetSellerConditionsDetail {
  commission: number | null;
  deliverySchedule: string | null;
  specificDays: string | null;
  sellerFromDate: string | null;
  sellerToDate: string | null;
  qualitySpecificationSource: string | null;
  qualitySpecifications: QualitySpecificationDetail[] | null;
  customQualitySpecifications: string | null;
  loadingAddressAt: string | null;
  remarksSpecialConditions: string | null;
}

export interface GetBuyerConditionsDetail {
  commission: number | null;
  deliverySchedule: string | null;
  specificDays: string | null;
  buyerFromDate: string | null;
  buyerToDate: string | null;
  qualitySpecificationSource: string | null;
  qualitySpecifications: QualitySpecificationDetail[] | null;
  customQualitySpecifications: string | null;
  loadingAddressAt: string | null;
  remarksSpecialConditions: string | null;
}

export interface GetPaymentsInvoicesDetail {
  paymentTerms: string | null;
  paymentBeforeDate: string | null;
  sellerPaymentDueDays: number | null;
  buyerPaymentDueDays: number | null;
  immediateAdvancePercentage: number | null;
  immediateAdvanceAmount: number | null;
  immediateAdvanceDate: string | null;
  balanceAdvancePercentage: number | null;
  balanceAdvanceAmount: number | null;
  balanceAdvanceDate: string | null;
  remarks: string | null;
}

export interface GetContractSettingsDetail {
  showContractStatus: boolean | null;
  approvalStatus: boolean | null;
  sendNotificationsToBuyer: boolean | null;
  sendNotificationsToSeller: boolean | null;
  sendNotificationsToTransporter: boolean | null;
  editContractUserPermissions: boolean | null;
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
  category: string | null;
  contractTypeId: number | null;
  businessUnitId: number | null;
  currencyId: number | null;
  statusId: number | null;
  versionNo: number | null;
  parentContractId: number | null;
  referenceNo: string | null;
  remarks: string | null;
  approvalRequired: boolean;
  isActive: boolean;
  basicDetails: GetContractBasicDetails;
  sellerConditions: GetSellerConditionsDetail;
  buyerConditions: GetBuyerConditionsDetail;
  paymentsInvoices: GetPaymentsInvoicesDetail;
  contractSettings: GetContractSettingsDetail;
  createdOn: string;
  createdById: number | null;
  createdBy: string | null;
  modifiedOn: string | null;
  modifiedById: number | null;
  updatedBy: string | null;
}

export interface UpdateContractStatusRequest {
  contractNumber: string[];
  contractStatusId: number;
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

export interface TruckAssignmentType {
  truckAssignmentTypeId: number;
  truckAssignmentTypeName: string;
}

export interface OpenAndPendingContract {
  contractNumber: string;
  contractDate: string;
  seller: string | null;
  buyer: string | null;
  pricePerKg: number;
  totalQuantityMT: number;
  dispatchedQuantityMT: number;
  pendingQuantityMT: number;
  productName: string;
  effectiveFrom: string;
  effectiveTo: string;
  deliverySchedule: string;
  paymentTermName: string;
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
      transformResponse: (payload: unknown) => unwrapObject<GetAllContractsResponse>(payload) as GetAllContractsResponse,
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
        url: "/api/Contracts/GetContractStatuses",
        method: "GET",
      }),
      transformResponse: unwrapArray<ContractStatusOption>,
    }),

    getContractByContractNumber: builder.query<GetContractDto, string>({
      query: (contractNumber) => ({
        url: "/api/Contracts/GetContractByContractNumber",
        method: "GET",
        params: { contractNo: contractNumber },
      }),
      transformResponse: (payload: unknown) => unwrapObject<GetContractDto>(payload) as GetContractDto,
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
      transformResponse: unwrapArray<PendingContractApiResponse>,
      providesTags: ["PendingContracts"],
    }),

    getAllOpenAndPendingContracts: builder.query<OpenAndPendingContract[], void>({
      query: () => ({
        url: "/api/Contracts/GetAllOpenAndPendingContracts",
        method: "GET",
      }),
      transformResponse: unwrapArray<OpenAndPendingContract>,
      providesTags: ["PendingContracts"],
    }),

    getTruckAssignmentTypes: builder.query<TruckAssignmentType[], void>({
      query: () => ({
        url: "/api/Contracts/GetTruckAssignmentTypes",
        method: "GET",
      }),
      transformResponse: unwrapArray<TruckAssignmentType>,
    }),

    getScheduleStatuses: builder.query<ScheduleStatusOption[], void>({
      query: () => ({
        url: "/api/Contracts/GetScheduleStatuses",
        method: "GET",
      }),
      transformResponse: unwrapArray<ScheduleStatusOption>,
    }),

    getAllContractsForTransporter: builder.query<TransporterContract[], GetAllContractsForTransporterParams>({
      query: (params) => ({
        url: "/api/Contracts/GetAllContractsForTransporter",
        method: "GET",
        params,
      }),
      transformResponse: unwrapArray<TransporterContract>,
      providesTags: ["PendingContracts"],
    }),
  }),
});

export const {
  useGetAllContractsQuery,
  useDeleteContractMutation,
  useGetAllContractStatusesQuery,
  useGetContractByContractNumberQuery,
  useLazyGetContractByContractNumberQuery,
  useUpdateContractStatusMutation,
  useUpdateContractMutation,
  useSaveContractMutation,
  useGetAllContractsByFiltersQuery,
  useLazyGetAllContractsByFiltersQuery,
  useGetAllOpenAndPendingContractsQuery,
  useLazyGetAllOpenAndPendingContractsQuery,
  useGetTruckAssignmentTypesQuery,
  useGetScheduleStatusesQuery,
  useGetAllContractsForTransporterQuery,
  useLazyGetAllContractsForTransporterQuery,
} = contractsApi;
