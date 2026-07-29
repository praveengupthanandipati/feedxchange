import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import {
  unwrapArray,
  unwrapObject,
  type AddressPayload,
  type ContactPayload,
  type BankAccountPayload,
  type DocumentPayload,
  type ProfileAddressDetail,
  type ProfileContactDetail,
  type ProfileBankAccountDetail,
  type ProfileDocumentDetail,
} from "./userProfilesCommonApi";

export type TransporterProfileStatus = "Active" | "Inactive" | "Deleted";

export interface Transporter {
  profileId: number;
  profileTypeName: string;
  legalName: string;
  tradingName: string;
  yearOfEstablishment: string;
  panNumber: string;
  gstNumber: string;
  emailId: string;
  mobileNumber: string;
  alternativeContactNumber: string;
  websiteUrl: string;
  status: TransporterProfileStatus;
  transporterTypeName: string;
  transporterSubTypeName: string;
  transporterLineName: string;
  // TODO: not yet returned by GetAllTransporterProfilesSummary — ask backend to add these two fields.
  location: string;
  stateName: string;
}

export interface AddTransporterProfilePayload {
  profileTypeId: number;
  legalName: string;
  tradingName: string;
  yearOfEstablishment: string;
  panNumber: string;
  gstNumber: string;
  emailId: string;
  mobileNumber: string;
  alternativeContactNumber: string;
  websiteUrl: string;
  groupName: string;
  referredBy: string;
  aboutProfile: string;
  status: string;
  createdBy: number;
  transporterProfileDetails: {
    transporterLineId: number;
    transporterTypeId: number;
  };
  addresses: AddressPayload[];
  contacts: ContactPayload[];
  bankAccounts: BankAccountPayload[];
  documents: DocumentPayload[];
}

export interface UpdateTransporterProfilePayload extends AddTransporterProfilePayload {
  profileId: number;
  modifiedBy: number;
}

export interface DeleteTransporterProfilePayload {
  profileId: number;
  modifiedOn: string;
  modifiedBy: number;
}

export interface TransporterProfileDetailInfo {
  transporterProfileId: number;
  profileId: number;
  transporterLineId: number;
  transporterTypeId: number;
  transporterSubTypeId: number;
  operatingSince: string;
  totalFleetCount: number;
  serviceDescription: string;
  isVerified: boolean;
  verifiedBy: number;
  verifiedOn: string;
}

export interface TransporterLineApiItem {
  transporterLineId: number;
  transporterLineName: string;
}

export interface TransporterTypeApiItem {
  transporterTypeId: number;
  transporterTypeName: string;
}

export interface TransporterProfileDetail {
  profileId: number;
  profileTypeId: number;
  profileTypeName: string;
  profilePictureUrl: string;
  firstName: string;
  lastName: string;
  legalName: string;
  tradingName: string;
  yearOfEstablishment: string;
  panNumber: string;
  gstNumber: string;
  emailId: string;
  mobileNumber: string;
  alternativeContactNumber: string;
  websiteUrl: string;
  groupName: string;
  collectionArea: string;
  area: string;
  referredBy: string;
  aboutProfile: string;
  status: string;
  createdBy: number;
  createdByName: string;
  createdOn: string;
  modifiedBy: number;
  modifiedByName: string;
  modifiedOn: string;
  transporterProfileDetails: TransporterProfileDetailInfo;
  addresses: ProfileAddressDetail[];
  contacts: ProfileContactDetail[];
  bankAccounts: ProfileBankAccountDetail[];
  documents: ProfileDocumentDetail[];
}

export const transportersApi = createApi({
  reducerPath: "transportersApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["TransporterProfile"],
  endpoints: (builder) => ({
    getTransporterProfileSummary: builder.query<Transporter[], void>({
      query: () => "/api/TransporterProfiles/GetAllTransporterProfilesSummary",
      transformResponse: unwrapArray<Transporter>,
      providesTags: ["TransporterProfile"],
    }),
    getTransporterProfileById: builder.query<TransporterProfileDetail | null, string>({
      query: (profileId) => `/api/TransporterProfiles/GetTransporterProfileById/${profileId}`,
      transformResponse: unwrapObject<TransporterProfileDetail>,
      providesTags: ["TransporterProfile"],
    }),
    getAllTransporterLines: builder.query<TransporterLineApiItem[], void>({
      query: () => "/api/TransporterProfiles/GetAllTransporterLines",
      transformResponse: unwrapArray<TransporterLineApiItem>,
    }),
    getTransporterTypesByLine: builder.query<TransporterTypeApiItem[], string>({
      query: (transporterLineId) => `/api/TransporterProfiles/GetTransporterTypesByLineId/${transporterLineId}`,
      transformResponse: unwrapArray<TransporterTypeApiItem>,
    }),
    addTransporterProfile: builder.mutation<string, AddTransporterProfilePayload>({
      query: (body) => ({
        url: "/api/TransporterProfiles/CreateTransporterProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["TransporterProfile"],
    }),
    updateTransporterProfile: builder.mutation<void, UpdateTransporterProfilePayload>({
      query: (body) => ({
        url: "/api/TransporterProfiles/UpdateTransporterProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["TransporterProfile"],
    }),
    deleteTransporterProfile: builder.mutation<void, DeleteTransporterProfilePayload>({
      query: (body) => ({
        url: "/api/TransporterProfiles/DeleteTransporterProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["TransporterProfile"],
    }),
  }),
});

export const {
  useGetTransporterProfileSummaryQuery,
  useGetTransporterProfileByIdQuery,
  useAddTransporterProfileMutation,
  useUpdateTransporterProfileMutation,
  useDeleteTransporterProfileMutation,
  useGetAllTransporterLinesQuery,
  useGetTransporterTypesByLineQuery,
} = transportersApi;
