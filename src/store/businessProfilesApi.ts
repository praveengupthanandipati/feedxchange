import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import type {
  ProfileAddressDetail,
  ProfileContactDetail,
  ProfileBankAccountDetail,
  ProfileDocumentDetail,
} from "./userProfilesCommonApi";

export type BusinessOwnerStatus = "Active" | "Inactive" | "Deleted";

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

export interface CreateBusinessCollectionAreaEntry {
  profileId: number;
  collectionAreaId: number;
}

export interface UpdateBusinessCollectionAreaPayload {
  id: number;
  profileId: number;
  collectionAreaId: number;
}

export interface CreateBusinessCapacityRequirementEntry {
  profileId: number;
  productId: number;
  tonsPerDay: number;
  tonsPerMonth: number;
  createdBy: number;
}

export interface UpdateBusinessCapacityRequirementPayload {
  capacityRequirementId: number;
  profileId: number;
  productId: number;
  tonsPerDay: number;
  tonsPerMonth: number;
  createdBy: number;
  createdOn: string;
  modifiedBy: number;
  modifiedOn: string;
}

export interface CreateBusinessBuySellChargeEntry {
  profileId: number;
  productId: number;
  buyCharge: number;
  sellCharge: number;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  createdBy: number;
}

export interface UpdateBusinessBuySellChargePayload {
  chargeId: number;
  profileId: number;
  productId: number;
  buyCharge: number;
  sellCharge: number;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  createdBy: number;
  createdOn: string;
  modifiedBy: number;
  modifiedOn: string;
}

export interface BusinessProfileDetailInfo {
  businessProfileId: number;
  profileId: number;
  businessUnitTypeId: number;
  businessUnitTypeName: string;
  businessLineId: number;
  businessLineName: string;
  businessTypeId: number;
  businessTypeName: string;
  businessSubTypeId: number;
  businessSubTypeName: string;
  buyBrokerageCharges: number;
  sellBrokerageCharges: number;
  annualTurnover: number;
  monthlyTurnover: number;
  employeeCount: number;
  isVerified: boolean;
  verifiedBy: number;
  verifiedByName: string;
  verifiedOn: string;
}



export interface BusinessProfileCategoryDetail {
  id: number;
  profileId: number;
  categoryId: number;
  categoryName: string;
}

export interface BusinessProfileCollectionAreaDetail {
  profileId: number;
  collectionAreaId: number;
  collectionAreaName: string;
}

export interface BusinessProfileProductDetail {
  businessProductId: number;
  profileId: number;
  productId: number;
  productName: string;
  isBuyer: boolean;
  isSeller: boolean;
  isManufacturer: boolean;
  createdBy: number;
  createdByName: string;
  createdOn: string;
  modifiedBy: number;
  modifiedByName: string;
  modifiedOn: string;
}

export interface BusinessProfileCapacityRequirementDetail {
  profileId: number;
  productId: number;
  productName: string;
  tonsPerDay: number;
  tonsPerMonth: number;
  createdBy: number;
  createdByName: string;
  createdOn: string;
  modifiedBy: number;
  modifiedByName: string;
  modifiedOn: string;
}

export interface BusinessProfileBuySellChargeDetail {
  chargeId: number;
  profileId: number;
  productId: number;
  productName: string;
  buyCharge: number;
  sellCharge: number;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  createdBy: number;
  createdByName: string;
  createdOn: string;
  modifiedBy: number;
  modifiedByName: string;
  modifiedOn: string;
}

export interface BusinessProfileDetail {
  profileId: number;
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
  createdByName: string;
  createdOn: string;
  modifiedBy: number;
  modifiedByName: string;
  modifiedOn: string;
  businessProfileDetails: BusinessProfileDetailInfo;
  categories: BusinessProfileCategoryDetail[];
  collectionAreas: BusinessProfileCollectionAreaDetail[];
  products: BusinessProfileProductDetail[];
  capacityRequirements: BusinessProfileCapacityRequirementDetail[];
  buySellCharges: BusinessProfileBuySellChargeDetail[];
  addresses: ProfileAddressDetail[];
  contacts: ProfileContactDetail[];
  bankAccounts: ProfileBankAccountDetail[];
  documents: ProfileDocumentDetail[];
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
    getBusinessProfileById: builder.query<BusinessProfileDetail | null, string>({
      query: (profileId) => `/api/BusinessProfiles/GetBusinessProfileById/${profileId}`,
      transformResponse: unwrapObject<BusinessProfileDetail>,
      providesTags: ["BusinessProfile"],
    }),
    getBusinessCollectionArea: builder.query<BusinessProfileCollectionAreaDetail[], string>({
      query: (profileId) => `/api/BusinessProfiles/GetBusinessCollectionArea/${profileId}`,
      transformResponse: unwrapArray<BusinessProfileCollectionAreaDetail>,
      providesTags: ["BusinessProfile"],
    }),
    
    createBusinessCollectionArea: builder.mutation<void, CreateBusinessCollectionAreaEntry[]>({
      query: (body) => ({
        url: "/api/BusinessProfiles/CreateBusinessCollectionArea",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    // Also not called yet, same reason as createBusinessCollectionArea above.
    updateBusinessCollectionArea: builder.mutation<void, UpdateBusinessCollectionAreaPayload>({
      query: (body) => ({
        url: "/api/BusinessProfiles/UpdateBusinessCollectionArea",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    createBusinessCapacityRequirement: builder.mutation<void, CreateBusinessCapacityRequirementEntry[]>({
      query: (body) => ({
        url: "/api/BusinessProfiles/CreateBusinessCapacityRequirement",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    getBusinessCapacityRequirement: builder.query<BusinessProfileCapacityRequirementDetail[], string>({
      query: (profileId) => `/api/BusinessProfiles/GetBusinessCapacityRequirement/${profileId}`,
      transformResponse: unwrapArray<BusinessProfileCapacityRequirementDetail>,
      providesTags: ["BusinessProfile"],
    }),
    updateBusinessCapacityRequirement: builder.mutation<void, UpdateBusinessCapacityRequirementPayload>({
      query: (body) => ({
        url: "/api/BusinessProfiles/UpdateBusinessCapacityRequirement",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    createBusinessBuySellCharge: builder.mutation<void, CreateBusinessBuySellChargeEntry[]>({
      query: (body) => ({
        url: "/api/BusinessProfiles/CreateBusinessBuySellCharge",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    getBusinessBuySellCharge: builder.query<BusinessProfileBuySellChargeDetail[], string>({
      query: (profileId) => `/api/BusinessProfiles/GetBusinessBuySellCharge/${profileId}`,
      transformResponse: unwrapArray<BusinessProfileBuySellChargeDetail>,
      providesTags: ["BusinessProfile"],
    }),
    updateBusinessBuySellCharge: builder.mutation<void, UpdateBusinessBuySellChargePayload>({
      query: (body) => ({
        url: "/api/BusinessProfiles/UpdateBusinessBuySellCharge",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["BusinessProfile"],
    }),
    addBusinessProfile: builder.mutation<string, AddBusinessProfilePayload>({
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
  useGetBusinessCollectionAreaQuery,
  useCreateBusinessCollectionAreaMutation,
  useUpdateBusinessCollectionAreaMutation,
  useCreateBusinessCapacityRequirementMutation,
  useGetBusinessCapacityRequirementQuery,
  useUpdateBusinessCapacityRequirementMutation,
  useCreateBusinessBuySellChargeMutation,
  useGetBusinessBuySellChargeQuery,
  useUpdateBusinessBuySellChargeMutation,
  useAddBusinessProfileMutation,
  useUpdateBusinessProfileMutation,
  useDeleteBusinessProfileMutation,
  useGetAllBusinessLinesQuery,
  useGetBusinessTypesByLineQuery,
  useGetBusinessSubTypesQuery,
} = businessProfilesApi;
