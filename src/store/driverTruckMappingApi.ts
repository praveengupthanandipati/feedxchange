import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import { unwrapArray } from "./userProfilesCommonApi";

export interface DriverTruckMapping {
  mappingId: number;
  truckId: number;
  truckNumber: string;
  driverId: number;
  driverName: string;
  assignedFrom: string;
  assignedTo: string;
  assignmentReason: string;
  releasedReason: string;
  isPrimary: boolean;
  status: string;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export interface AddMappingPayload {
  truckId: number;
  driverId: number;
  assignedFrom: string;
  assignmentReason: string;
  isPrimary: boolean;
  actionPerformedBy: number;
}

export interface ReleaseMappingPayload {
  mappingId: number;
  releasedReason: string;
  actionPerformedBy: number;
}

export const driverTruckMappingApi = createApi({
  reducerPath: "driverTruckMappingApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["DriverTruckMapping"],
  endpoints: (builder) => ({
    getAllMappings: builder.query<DriverTruckMapping[], void>({
      query: () => "/api/TruckDriverMappings/GetAllMappings",
      transformResponse: unwrapArray<DriverTruckMapping>,
      providesTags: ["DriverTruckMapping"],
    }),
    getMappingsByTruckId: builder.query<DriverTruckMapping[], string>({
      query: (truckId) => ({
        url: "/api/TruckDriverMappings/GetMappingsByTruckId",
        method: "GET",
        params: { truckId },
      }),
      transformResponse: unwrapArray<DriverTruckMapping>,
      providesTags: ["DriverTruckMapping"],
    }),
    getMappingsByDriverId: builder.query<DriverTruckMapping[], string>({
      query: (driverId) => ({
        url: "/api/TruckDriverMappings/GetMappingsByDriverId",
        method: "GET",
        params: { driverId },
      }),
      transformResponse: unwrapArray<DriverTruckMapping>,
      providesTags: ["DriverTruckMapping"],
    }),
    addMapping: builder.mutation<string, AddMappingPayload>({
      query: (body) => ({
        url: "/api/TruckDriverMappings/AddMapping",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["DriverTruckMapping"],
    }),
    releaseMapping: builder.mutation<string, ReleaseMappingPayload>({
      query: (body) => ({
        url: "/api/TruckDriverMappings/ReleaseMapping",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["DriverTruckMapping"],
    }),
  }),
});

export const {
  useGetAllMappingsQuery,
  useGetMappingsByTruckIdQuery,
  useGetMappingsByDriverIdQuery,
  useAddMappingMutation,
  useReleaseMappingMutation,
} = driverTruckMappingApi;
