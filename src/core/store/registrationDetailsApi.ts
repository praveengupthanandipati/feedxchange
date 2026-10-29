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

export const registrationDetailsApi = createApi({
  reducerPath: "registrationDetailsApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["RegistrationDetails"],
  endpoints: (builder) => ({
    // Public (no login). The response shape is not documented, so it is passed through as-is.
    addRegistrationDetails: builder.mutation<unknown, AddRegistrationDetailsPayload>({
      query: (body) => ({
        url: "/api/RegistrationDetails/AddRegistrationDetails",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RegistrationDetails"],
    }),
  }),
});

export const { useAddRegistrationDetailsMutation } = registrationDetailsApi;
