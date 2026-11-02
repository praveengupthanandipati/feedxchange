import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

/** Body of AddRegistrationDetails: the website's "Join with us" signup. Line, type and sub type are sent as names. */
export interface AddRegistrationDetailsPayload {
  firstName: string;
  lastName: string;
  businessName: string;
  lineOfBusiness: string;
  typeOfBusiness: string;
  subTypeOfBusiness: string;
  email: string;
  password: string;
  phoneNumber: string;
  referralCode: string | null;
  isActive: boolean | null;
  isSubscribedToUpdates: boolean | null;
  status: number | null;
  actionPerformedBy: number;
}

/** A website sign-up as GetAllRegistrationDetails returns it. */
export interface RegistrationDetail {
  id: number;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  lineOfBusiness: string | null;
  typeOfBusiness: string | null;
  subTypeOfBusiness: string | null;
  email: string | null;
  phoneNumber: string | null;
  referralCode: string | null;
  isActive: boolean | null;
  roleId: number | null;
  /** Follow-up status code (see registrationDetails.utils.ts for the names). */
  status: number | string | null;
  remarks: string | null;
  lastLoginDate: string | null;
  isSubscribedToUpdates: boolean | null;
  createdAt: string | null;
  roleName: string | null;
  updatedAt: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

/** What AddRegistrationDetails returns: the new registration's id (used for the OTP calls) and a message. */
export interface RegistrationResponse {
  userId: number;
  message: string | null;
}

export interface UpdateRegistrationStatusPayload {
  registrationId: number;
  actionPerformedBy: number;
  /** Status code (see registrationDetails.utils.ts). */
  status: number;
  remarks: string;
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  const envelope = payload as { result?: unknown; data?: unknown } | null | undefined;
  if (Array.isArray(envelope?.result)) return envelope.result as T[];
  if (Array.isArray(envelope?.data)) return envelope.data as T[];
  return [];
}

export const registrationDetailsApi = createApi({
  reducerPath: "registrationDetailsApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["RegistrationDetails"],
  endpoints: (builder) => ({
    // Admin: every website sign-up, for the Registration Details screen.
    getAllRegistrationDetails: builder.query<RegistrationDetail[], void>({
      query: () => "/api/RegistrationDetails/GetAllRegistrationDetails",
      transformResponse: unwrapArray<RegistrationDetail>,
      providesTags: ["RegistrationDetails"],
    }),
    updateRegistrationStatus: builder.mutation<void, UpdateRegistrationStatusPayload>({
      query: (body) => ({
        url: "/api/RegistrationDetails/UpdateRegistrationStatus",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["RegistrationDetails"],
    }),
    // Public (no login): the website's "Join with us" signup. Sends the email OTP.
    addRegistrationDetails: builder.mutation<RegistrationResponse, AddRegistrationDetailsPayload>({
      query: (body) => ({
        url: "/api/RegistrationDetails/AddRegistrationDetails",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RegistrationDetails"],
    }),
    // Public: checks the OTP sent after signup. true = verified, false = wrong OTP.
    validateOtp: builder.mutation<boolean, { registrationId: number; otp: string }>({
      query: (body) => ({
        url: "/api/RegistrationDetails/ValidateOTP",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RegistrationDetails"],
    }),
    // Public: sends the signup OTP again. true = sent.
    resendOtp: builder.mutation<boolean, { registrationId: number }>({
      query: (body) => ({
        url: "/api/RegistrationDetails/ResendOTP",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllRegistrationDetailsQuery,
  useUpdateRegistrationStatusMutation,
  useAddRegistrationDetailsMutation,
  useValidateOtpMutation,
  useResendOtpMutation,
} = registrationDetailsApi;
