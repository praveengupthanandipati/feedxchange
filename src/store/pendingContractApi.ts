import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

export interface GetContractsByFiltersRequest {
  Status: string;
  SearchText?: string;
}

export const pendingContractApi = createApi({
  reducerPath: "pendingContractApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),

  endpoints: (builder) => ({
    getAllContractsForExcel: builder.query<Blob, void>({
      query: () => ({
        url: "/api/Contracts/GetAllContractsForExcel",
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    getAllContractsByFilters: builder.query<any, GetContractsByFiltersRequest>({
      query: ({ Status, SearchText }) => ({
        url: "/api/Contracts/GetAllContractsByFilters",
        method: "GET",
        params: {
          Status,
          SearchText,
        },
      }),
    }),
  }),
});

export const {
  useLazyGetAllContractsForExcelQuery,
  useGetAllContractsByFiltersQuery,
} = pendingContractApi;