import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

export interface GetAllContractsResponse {
  totalContracts: number;
  totalQuantity: number;
  contracts: any[];
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

export const pendingContractApi = createApi({
  reducerPath: "pendingContractApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),

  tagTypes: ["PendingContracts"],

  endpoints: (builder) => ({
    getAllContractsByFilters: builder.query<GetAllContractsResponse, GetAllContractsByFiltersRequest>({
      query: (params) => ({
        url: "/api/Contracts/GetAllContractsByFilters",
        method: "GET",
        params,
      }),
      transformResponse: (response: GetAllContractsResponse) => response,
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
  
  useGetAllContractsByFiltersQuery,
  useLazyGetAllContractsForExcelQuery,
  
} = pendingContractApi;