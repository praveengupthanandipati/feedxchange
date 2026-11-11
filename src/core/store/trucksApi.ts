import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";
import { unwrapArray, unwrapObject } from "./userProfilesCommonApi";

export interface Truck {
  truckId: number;
  /** Legacy: trucks are no longer tagged to a transporter (it is chosen for each trip). */
  profileId?: number | null;
  profileLegalName?: string | null;
  truckNumber: string;
  /** Same as the truck number; kept only because older records and reports still carry it. */
  registrationNumber?: string;
  truckType: string;
  make: string;
  model: string;
  manufactureYear: number;
  capacity: number;
  capacityUnit: string;
  fuelType: string;
  ownershipType: string;
  /** The truck's live-tracking link, if any. */
  trackingUrl?: string | null;
  status: string;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export interface AddTruckDetailsPayload {
  truckNumber: string;
  truckType: string;
  make: string;
  model: string;
  manufactureYear: number;
  capacity: number;
  capacityUnit: string;
  fuelType: string;
  ownershipType: string;
  /** Optional http/https link. On update: left out = unchanged, blank = remove it. */
  trackingUrl?: string;
  actionPerformedBy: number;
}

export interface UpdateTruckDetailsPayload {
  truckId: number;
  updateTruckDetails: AddTruckDetailsPayload;
}

export interface DeleteTruckDetailsPayload {
  truckId: number;
  actionPerformedBy: number;
}

export const trucksApi = createApi({
  reducerPath: "trucksApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Truck"],
  endpoints: (builder) => ({
    getAllActiveTruckDetails: builder.query<Truck[], void>({
      query: () => "/api/TruckDetails/GetAllActiveTruckDetails",
      transformResponse: unwrapArray<Truck>,
      providesTags: ["Truck"],
    }),
    getTruckDetailsById: builder.query<Truck | null, string>({
      query: (truckId) => ({
        url: "/api/TruckDetails/GetTruckDetailsById",
        method: "GET",
        params: { truckId },
      }),
      transformResponse: unwrapObject<Truck>,
      providesTags: ["Truck"],
    }),
    addTruckDetails: builder.mutation<string, AddTruckDetailsPayload>({
      query: (body) => ({
        url: "/api/TruckDetails/AddTruckDetails",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["Truck"],
    }),
    updateTruckDetails: builder.mutation<string, UpdateTruckDetailsPayload>({
      query: (body) => ({
        url: "/api/TruckDetails/UpdateTruckDetails",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["Truck"],
    }),
    deleteTruckDetails: builder.mutation<string, DeleteTruckDetailsPayload>({
      query: (body) => ({
        url: "/api/TruckDetails/DeleteTruckDetails",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["Truck"],
    }),
  }),
});

export const {
  useGetAllActiveTruckDetailsQuery,
  useGetTruckDetailsByIdQuery,
  useAddTruckDetailsMutation,
  useUpdateTruckDetailsMutation,
  useDeleteTruckDetailsMutation,
} = trucksApi;
