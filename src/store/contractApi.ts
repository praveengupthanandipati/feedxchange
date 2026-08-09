import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

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

export const contractsApi = createApi({
  reducerPath: "contractsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),

  tagTypes: ["PendingContracts"],

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
      { contractNumber: string }
    >({
      query: (body) => ({
        url: "/api/Contracts/DeleteContract",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllContractsQuery,
  useDeleteContractMutation,
} = contractsApi;