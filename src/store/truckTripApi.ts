import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import { unwrapArray, unwrapObject } from "./userProfilesCommonApi";

export interface TruckTrip {
  tripId: number;
  truckId: number;
  truckNumber: string;
  driverId: number;
  driverName: string;
  businessProfileId: number;
  businessProfileName: string;
  fromAddress: string;
  toAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  distanceInKM: number;
  estimatedDuration: number;
  actualDistance: number;
  actualDuration: number;
  fuelConsumed: number;
  tripCompletedOn: string;
  productType: string;
  weight: number;
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string;
  tripStatus: string;
  freightAmount: number;
  remarks: string;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export interface AddTripPayload {
  truckId: number;
  driverId: number;
  businessProfileId: number;
  fromAddress: string;
  toAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  distanceInKM: number;
  estimatedDuration: number;
  productType: string;
  weight: number;
  startDate: string;
  expectedEndDate: string;
  freightAmount: number;
  remarks: string;
  actionPerformedBy: number;
}

export interface UpdateTripPayload {
  tripId: number;
  updateTrip: AddTripPayload;
}

export interface CompleteTripPayload {
  tripId: number;
  actualDistance: number;
  actualDuration: number;
  fuelConsumed: number;
  actionPerformedBy: number;
}

export const truckTripApi = createApi({
  reducerPath: "truckTripApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["TruckTrip"],
  endpoints: (builder) => ({
    getAllTrips: builder.query<TruckTrip[], void>({
      query: () => "/api/TruckTrips/GetAllTrips",
      transformResponse: unwrapArray<TruckTrip>,
      providesTags: ["TruckTrip"],
    }),
    getTripById: builder.query<TruckTrip | null, string>({
      query: (tripId) => ({
        url: "/api/TruckTrips/GetTripById",
        method: "GET",
        params: { tripId },
      }),
      transformResponse: unwrapObject<TruckTrip>,
      providesTags: ["TruckTrip"],
    }),
    getTripsByTruckId: builder.query<TruckTrip[], string>({
      query: (truckId) => ({
        url: "/api/TruckTrips/GetTripsByTruckId",
        method: "GET",
        params: { truckId },
      }),
      transformResponse: unwrapArray<TruckTrip>,
      providesTags: ["TruckTrip"],
    }),
    getTripsByBusinessProfileId: builder.query<TruckTrip[], string>({
      query: (businessProfileId) => ({
        url: "/api/TruckTrips/GetTripsByBusinessProfileId",
        method: "GET",
        params: { businessProfileId },
      }),
      transformResponse: unwrapArray<TruckTrip>,
      providesTags: ["TruckTrip"],
    }),
    addTrip: builder.mutation<string, AddTripPayload>({
      query: (body) => ({
        url: "/api/TruckTrips/AddTrip",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["TruckTrip"],
    }),
    updateTrip: builder.mutation<string, UpdateTripPayload>({
      query: (body) => ({
        url: "/api/TruckTrips/UpdateTrip",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["TruckTrip"],
    }),
    completeTrip: builder.mutation<string, CompleteTripPayload>({
      query: (body) => ({
        url: "/api/TruckTrips/CompleteTrip",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["TruckTrip"],
    }),
  }),
});

export const {
  useGetAllTripsQuery,
  useGetTripByIdQuery,
  useGetTripsByTruckIdQuery,
  useGetTripsByBusinessProfileIdQuery,
  useAddTripMutation,
  useUpdateTripMutation,
  useCompleteTripMutation,
} = truckTripApi;
