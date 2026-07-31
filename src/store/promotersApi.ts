import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import {
  unwrapArray,
  unwrapObject,
  type ProfileAddressDetail,
  type ProfileContactDetail,
  type ProfileBankAccountDetail,
  type ProfileDocumentDetail,
} from "./userProfilesCommonApi";

export type PromoterProfileStatus = "Active" | "Inactive" | "Deleted";

export interface Promoter {
  profileId: number;
  profileTypeName: string;
  legalName: string;
  tradingName: string;
  yearOfEstablishment: number;
  panNumber: string;
  gstNumber: string;
  emailId: string;
  mobileNumber: string;
  alternativeContactNumber: string;
  websiteUrl: string;
  commissionRate: number;
  commissionStructure: string;
  companyName: string;
  paymentFrequency: string;
  totalActiveReferrals: number;
  totalReferrals: number;
  status: PromoterProfileStatus;
}

export interface PromoterProfileDetailsPayload {
  promoterCode: string;
  companyName: string;
  designation: string;
  commissionStructure: string;
  commissionRate: number;
  paymentFrequency: string;
  internalNotes: string;
  remarks: string;
  totalReferrals: number;
  totalActiveReferrals: number;
  isVerified: boolean;
  verifiedBy: number;
  verifiedOn: string;
  createdBy: number;
  createdOn: string;
}


export interface AddPromoterProfilePayload {
  profileTypeId: number;
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
  promoterProfileDetails: PromoterProfileDetailsPayload;
}

export interface UpdatePromoterProfilePayload extends AddPromoterProfilePayload {
  profileId: number;
  modifiedBy: number;
}

export interface DeletePromoterProfilePayload {
  profileId: number;
  modifiedOn: string;
  modifiedBy: number;
}

export interface PromoterProfileDetailInfo extends PromoterProfileDetailsPayload {
  promoterProfileId: number;
  profileId: number;
  modifiedBy: number;
  modifiedOn: string;
}

export interface PromoterBusinessMapping {
  mappingId: number;
  promoterProfileId: number;
  businessProfileId: number;
  createdOn: string;
  createdBy: number;
  modifiedOn: string;
  modifiedBy: number;
  isActive: boolean;
}

export interface CreatePromoterRegionEntry {
  stateName: string;
  districtName: string;
  cityName: string;
  createdOn: string;
  createdBy: number;
}

export interface PromoterRegionDetail {
  regionId: number;
  profileId: number;
  stateName: string;
  districtName: string;
  cityName: string;
  createdOn: string;
  createdBy: number;
  modifiedOn: string;
  modifiedBy: number;
}

export interface PromoterProfileDetail {
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
  promoterProfileDetails: PromoterProfileDetailInfo;
  addresses: ProfileAddressDetail[];
  contacts: ProfileContactDetail[];
  bankAccounts: ProfileBankAccountDetail[];
  documents: ProfileDocumentDetail[];
  businessMappings: PromoterBusinessMapping[];
  promoterRegions: PromoterRegionDetail[];
}

export const promotersApi = createApi({
  reducerPath: "promotersApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["PromoterProfile"],
  endpoints: (builder) => ({
    getPromoterProfileSummary: builder.query<Promoter[], void>({
      query: () => "/api/PromoterProfile/GetPromoterProfilesSummary",
      transformResponse: unwrapArray<Promoter>,
      providesTags: ["PromoterProfile"],
    }),
    getPromoterProfileById: builder.query<PromoterProfileDetail | null, string>({
      query: (profileId) => `/api/PromoterProfile/GetPromoterProfileById/${profileId}`,
      transformResponse: unwrapObject<PromoterProfileDetail>,
      providesTags: ["PromoterProfile"],
    }),
    addPromoterProfile: builder.mutation<string, AddPromoterProfilePayload>({
      query: (body) => ({
        url: "/api/PromoterProfile/CreatePromoterProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["PromoterProfile"],
    }),
    updatePromoterProfile: builder.mutation<void, UpdatePromoterProfilePayload>({
      query: (body) => ({
        url: "/api/PromoterProfile/UpdatePromoterProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["PromoterProfile"],
    }),
    deletePromoterProfile: builder.mutation<void, DeletePromoterProfilePayload>({
      query: (body) => ({
        url: "/api/PromoterProfile/DeletePromoterProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["PromoterProfile"],
    }),
    createPromoterRegion: builder.mutation<void, CreatePromoterRegionEntry[]>({
      query: (body) => ({
        url: "/api/PromoterProfile/CreatePromoterRegion",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["PromoterProfile"],
    }),
    getPromoterRegion: builder.query<PromoterRegionDetail[], string>({
      query: (profileId) => `/api/PromoterProfile/GetPromoterRegion/${profileId}`,
      transformResponse: unwrapArray<PromoterRegionDetail>,
      providesTags: ["PromoterProfile"],
    }),
    updatePromoterRegion: builder.mutation<void, PromoterRegionDetail>({
      query: (body) => ({
        url: "/api/PromoterProfile/UpdatePromoterRegion",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["PromoterProfile"],
    }),
  }),
});

export const {
  useGetPromoterProfileSummaryQuery,
  useGetPromoterProfileByIdQuery,
  useAddPromoterProfileMutation,
  useUpdatePromoterProfileMutation,
  useDeletePromoterProfileMutation,
  useCreatePromoterRegionMutation,
  useGetPromoterRegionQuery,
  useUpdatePromoterRegionMutation,
} = promotersApi;
