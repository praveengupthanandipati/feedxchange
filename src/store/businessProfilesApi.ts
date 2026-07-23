import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

export type BusinessOwnerStatus = "Active" | "Inactive" | "Blocked";

export interface BusinessOwner {
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
  status: BusinessOwnerStatus;
  businessUnitTypeName: string;
  businessLineName: string;
  // TODO: not yet returned by GetBusinessProfileSummary — ask backend to add this two fields.
  location: string;
  stateName: string;
  businessTypeName: string;
  businessSubTypeName: string;
  buyCharge: number;
  sellCharge: number;
}

export interface AddressPayload {
  officeName: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pincode: string;
  city: string;
  district: string;
  stateName: string;
  googleLocationUrl: string;
  isPrimary: boolean;
  isUnloadingLocation: boolean;
}

export interface ContactPayload {
  contactType: string;
  contactPerson: string;
  designation: string;
  mobileNumber: string;
  alternativeContactNumber: string;
  emailId: string;
  isUnloadingContact: boolean;
}

export interface BankAccountPayload {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  branchName: string;
  accountHolderName: string;
  isPrimaryAccount: boolean;
}

export interface DocumentPayload {
  documentTypeId: number;
  documentNumber: string;
  fileName: string;
  issuingAuthority: string;
  issuedDate: string;
  expiryDate: string;
}

export interface CapacityRequirementPayload {
  productId: number;
  tonsPerDay: number;
  tonsPerMonth: number;
}

export interface BuySellChargePayload {
  productId: number;
  buyCharge: number;
  sellCharge: number;
}

export interface AddBusinessProfilePayload {
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
  collectionArea: string;
  area: string;
  referredBy: string;
  referralName: string;
  aboutProfile: string;
  status: string;
  createdBy: number;
  businessProfileDetails: {
    businessLineId: number;
    businessTypeId: number;
    businessSubTypeId: number;
    buyBrokerageCharges: number;
    sellBrokerageCharges: number;
  };
  addresses: AddressPayload[];
  contacts: ContactPayload[];
  bankAccounts: BankAccountPayload[];
  documents: DocumentPayload[];
  capacityRequirements: CapacityRequirementPayload[];
  buySellCharges: BuySellChargePayload[];
}

export interface UpdateBusinessProfilePayload extends AddBusinessProfilePayload {
  profileId: number;
  modifiedBy: number;
}

export interface DeleteBusinessProfilePayload {
  profileId: number;
  modifiedOn: string;
  modifiedBy: number;
}

export interface BusinessLineApiItem {
  businessLineId: number;
  businessLineName: string;
}

export interface BusinessTypeApiItem {
  businessTypeId: number;
  businessTypeName: string;
}

export interface BusinessSubTypeApiItem {
  businessSubTypeId: number;
  businessSubTypeName: string;
}

// Endpoints inconsistently return the array/object directly or wrapped in a result/data envelope.
function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  const envelope = payload as { result?: unknown; data?: unknown } | null | undefined;
  if (Array.isArray(envelope?.result)) return envelope.result as T[];
  if (Array.isArray(envelope?.data)) return envelope.data as T[];
  return [];
}

function unwrapObject<T>(payload: unknown): T | null {
  const envelope = payload as { result?: unknown; data?: unknown } | null | undefined;
  if (envelope?.result) return envelope.result as T;
  if (envelope?.data) return envelope.data as T;
  return (payload as T) ?? null;
}

export const businessProfilesApi = createApi({
  reducerPath: "businessProfilesApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["BusinessProfile"],
  endpoints: (builder) => ({
    getBusinessProfileSummary: builder.query<BusinessOwner[], void>({
      query: () => "/api/BusinessProfiles/GetBusinessProfileSummary",
      transformResponse: unwrapArray<BusinessOwner>,
      providesTags: ["BusinessProfile"],
    }),
    getBusinessProfileById: builder.query<Record<string, unknown> | null, string>({
      query: (profileId) => `/api/BusinessProfiles/GetBusinessProfileById/${profileId}`,
      transformResponse: unwrapObject<Record<string, unknown>>,
      providesTags: ["BusinessProfile"],
    }),
    addBusinessProfile: builder.mutation<void, AddBusinessProfilePayload>({
      query: (body) => ({
        url: "/api/BusinessProfiles/AddBusinessProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    updateBusinessProfile: builder.mutation<void, UpdateBusinessProfilePayload>({
      query: (body) => ({
        url: "/api/BusinessProfiles/UpdateBusinessProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    deleteBusinessProfile: builder.mutation<void, DeleteBusinessProfilePayload>({
      query: (body) => ({
        url: "/api/BusinessProfiles/DeleteBusinessProfile",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    getAllBusinessLines: builder.query<BusinessLineApiItem[], void>({
      query: () => "/api/BusinessProfiles/GetAllBusinessLines",
      transformResponse: unwrapArray<BusinessLineApiItem>,
    }),
    getBusinessTypesByLine: builder.query<BusinessTypeApiItem[], string>({
      query: (businessLineId) => `/api/BusinessProfiles/GetBusinessTypesByBusinessLine/${businessLineId}`,
      transformResponse: unwrapArray<BusinessTypeApiItem>,
    }),
    getBusinessSubTypes: builder.query<BusinessSubTypeApiItem[], string>({
      query: (businessTypeId) => `/api/BusinessProfiles/GetBusinessSubTypes/${businessTypeId}`,
      transformResponse: unwrapArray<BusinessSubTypeApiItem>,
    }),
  }),
});

export const {
  useGetBusinessProfileSummaryQuery,
  useGetBusinessProfileByIdQuery,
  useAddBusinessProfileMutation,
  useUpdateBusinessProfileMutation,
  useDeleteBusinessProfileMutation,
  useGetAllBusinessLinesQuery,
  useGetBusinessTypesByLineQuery,
  useGetBusinessSubTypesQuery,
} = businessProfilesApi;
