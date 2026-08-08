import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import { unwrapArray, unwrapObject } from "./userProfilesCommonApi";

export interface Driver {
  driverId: number;
  driverName: string;
  mobileNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  dateOfBirth: string;
  address: string;
  status: string;
  isActive: boolean;
  licenseType: string;
  licenseIssuedDate: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  bloodGroup: string;
  experienceYears: number;
  aadharNumber: string;
  panNumber: string;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export interface AddDriverPayload {
  driverName: string;
  mobileNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  dateOfBirth: string;
  address: string;
  licenseType: string;
  licenseIssuedDate: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  bloodGroup: string;
  experienceYears: number;
  aadharNumber: string;
  panNumber: string;
  actionPerformedBy: number;
}

export interface UpdateDriverPayload {
  driverId: number;
  updateDriver: AddDriverPayload;
}

export interface DeleteDriverPayload {
  driverId: number;
  actionPerformedBy: number;
}

export const driversApi = createApi({
  reducerPath: "driversApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["Driver"],
  endpoints: (builder) => ({
    getAllActiveDrivers: builder.query<Driver[], void>({
      query: () => "/api/Drivers/GetAllActiveDrivers",
      transformResponse: unwrapArray<Driver>,
      providesTags: ["Driver"],
    }),
    getDriverById: builder.query<Driver | null, string>({
      query: (driverId) => ({
        url: "/api/Drivers/GetDriverById",
        method: "GET",
        params: { driverId },
      }),
      transformResponse: unwrapObject<Driver>,
      providesTags: ["Driver"],
    }),
    addDriver: builder.mutation<string, AddDriverPayload>({
      query: (body) => ({
        url: "/api/Drivers/AddDriver",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["Driver"],
    }),
    updateDriver: builder.mutation<string, UpdateDriverPayload>({
      query: (body) => ({
        url: "/api/Drivers/UpdateDriver",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["Driver"],
    }),
    deleteDriver: builder.mutation<string, DeleteDriverPayload>({
      query: (body) => ({
        url: "/api/Drivers/DeleteDriver",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["Driver"],
    }),
  }),
});

export const {
  useGetAllActiveDriversQuery,
  useGetDriverByIdQuery,
  useAddDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
} = driversApi;
