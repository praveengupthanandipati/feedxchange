import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";


export function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  const envelope = payload as { result?: unknown; data?: unknown } | null | undefined;
  if (Array.isArray(envelope?.result)) return envelope.result as T[];
  if (Array.isArray(envelope?.data)) return envelope.data as T[];
  return [];
}

export function unwrapObject<T>(payload: unknown): T | null {
  const envelope = payload as { result?: unknown; data?: unknown } | null | undefined;
  if (envelope?.result) return envelope.result as T;
  if (envelope?.data) return envelope.data as T;
  return (payload as T) ?? null;
}

export const profilesBaseQuery = () => fetchBaseQuery({ baseUrl: API_URL });


export interface ProfileType {
  profileTypeId: number;
  profileTypeName: string;
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
}

export interface CreateProfileDocumentEntry extends DocumentPayload {
  profileId: number;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
  isVerified: boolean;
  verifiedBy: number;
  verifiedOn: string;
  createdBy: number;
}

export interface ProfileDocumentDetail extends DocumentPayload {
  documentId: number;
  profileId: number;
  documentTypeName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
  isVerified: boolean;
  verifiedBy: number | null;
  verifiedByName: string | null;
  verifiedOn: string | null;
  createdBy: number;
  createdByName: string;
  createdOn: string;
}

export interface UpdateProfileDocumentPayload extends CreateProfileDocumentEntry {
  documentId: number;
  createdOn: string;
}

export interface UploadDocumentResponse {
  fileName: string;
  storedFileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
}

export interface CreateProfileBankAccountEntry extends BankAccountPayload {
  profileId: number;
  createdBy: number;
}

export interface ProfileBankAccountDetail extends BankAccountPayload {
  bankAccountId: number;
  profileId: number;
  createdBy: number;
  createdByName: string;
  createdOn: string;
  modifiedBy: number | null;
  modifiedByName: string | null;
  modifiedOn: string | null;
}

export interface UpdateProfileBankAccountPayload extends BankAccountPayload {
  bankAccountId: number;
  profileId: number;
  createdBy: number;
  createdOn: string;
  modifiedBy: number;
  modifiedOn: string;
}

// Shape every "DeleteXProfile" mutation takes.
export interface DeleteProfilePayload {
  profileId: number;
  modifiedOn: string;
  modifiedBy: number;
}

export interface CreateProfileAddressEntry extends AddressPayload {
  profileId: number;
  createdBy: number;
}

export interface ProfileAddressDetail extends AddressPayload {
  addressId: number;
  profileId: number;
  createdBy: number;
  createdByName: string;
  createdOn: string;
  modifiedBy: number;
  modifiedByName: string;
  modifiedOn: string;
}

export interface ProfileContactDetail extends ContactPayload {
  contactId: number;
  profileId: number;
  createdBy: number;
  createdByName: string;
  createdOn: string;
  modifiedBy: number;
  modifiedByName: string;
  modifiedOn: string;
}


export function resolveDocumentFolderName(
  documentTypeOptions: { value: string; label: string }[],
  documentTypeValue: string,
): string {
  return (
    documentTypeOptions.find((option) => option.value === documentTypeValue)?.label || documentTypeValue
  );
}

export interface DocumentFileMeta {
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
}

export interface UploadableDocumentEntry {
  file?: File;
  meta?: DocumentFileMeta;
}

export function useDocumentFileFieldsResolver() {
  const [uploadDocumentFile] = useUploadDocumentFileMutation();

  return async (document: UploadableDocumentEntry, folderName: string): Promise<DocumentFileMeta> => {
    if (document.file) {
      const uploaded = await uploadDocumentFile({ file: document.file, folderName }).unwrap();
      return {
        filePath: uploaded.filePath,
        fileSize: uploaded.fileSize,
        contentType: uploaded.contentType,
        uploadDate: new Date().toISOString(),
      };
    }
    return {
      filePath: document.meta?.filePath ?? "",
      fileSize: document.meta?.fileSize ?? 0,
      contentType: document.meta?.contentType ?? "",
      uploadDate: document.meta?.uploadDate ?? new Date().toISOString(),
    };
  };
}

export const userProfilesCommonApi = createApi({
  reducerPath: "userProfilesCommonApi",
  baseQuery: profilesBaseQuery(),
  tagTypes: ["UserProfile"],
  endpoints: (builder) => ({
    getProfileTypes: builder.query<ProfileType[], void>({
      query: () => "/api/ProfileTypes",
      transformResponse: unwrapArray<ProfileType>,
    }),
    createProfileAddress: builder.mutation<void, CreateProfileAddressEntry[]>({
      query: (body) => ({
        url: "/api/Profile/CreateProfileAddress",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["UserProfile"],
    }),
    getProfileAddress: builder.query<ProfileAddressDetail[], string>({
      query: (profileId) => `/api/Profile/GetProfileAddress/${profileId}`,
      transformResponse: unwrapArray<ProfileAddressDetail>,
      providesTags: ["UserProfile"],
    }),
    updateProfileAddress: builder.mutation<void, ProfileAddressDetail>({
      query: (body) => ({
        url: "/api/Profile/UpdateProfileAddress",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["UserProfile"],
    }),
    createProfileDocument: builder.mutation<void, CreateProfileDocumentEntry[]>({
      query: (body) => ({
        url: "/api/Profile/CreateProfileDocument",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["UserProfile"],
    }),
    getProfileDocument: builder.query<ProfileDocumentDetail[], string>({
      query: (profileId) => `/api/Profile/GetProfileDocument/${profileId}`,
      transformResponse: unwrapArray<ProfileDocumentDetail>,
      providesTags: ["UserProfile"],
    }),
    updateProfileDocument: builder.mutation<void, UpdateProfileDocumentPayload>({
      query: (body) => ({
        url: "/api/Profile/UpdateProfileDocument",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["UserProfile"],
    }),
    uploadDocumentFile: builder.mutation<UploadDocumentResponse, { file: File; folderName: string }>({
      query: ({ file, folderName }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderName", folderName);
        return {
          url: "/api/FileUpload/UploadDocument",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (payload: unknown) => unwrapObject<UploadDocumentResponse>(payload) as UploadDocumentResponse,
    }),
    createProfileBankAccount: builder.mutation<void, CreateProfileBankAccountEntry[]>({
      query: (body) => ({
        url: "/api/Profile/CreateProfileBankAccount",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["UserProfile"],
    }),
    getProfileBankAccount: builder.query<ProfileBankAccountDetail[], string>({
      query: (profileId) => `/api/Profile/GetProfileBankAccount/${profileId}`,
      transformResponse: unwrapArray<ProfileBankAccountDetail>,
      providesTags: ["UserProfile"],
    }),
    updateProfileBankAccount: builder.mutation<void, UpdateProfileBankAccountPayload>({
      query: (body) => ({
        url: "/api/Profile/UpdateProfileBankAccount",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: ["UserProfile"],
    }),
  }),
});

export const {
  useGetProfileTypesQuery,
  useCreateProfileAddressMutation,
  useGetProfileAddressQuery,
  useUpdateProfileAddressMutation,
  useCreateProfileDocumentMutation,
  useGetProfileDocumentQuery,
  useUpdateProfileDocumentMutation,
  useCreateProfileBankAccountMutation,
  useGetProfileBankAccountQuery,
  useUpdateProfileBankAccountMutation,
  useUploadDocumentFileMutation,
} = userProfilesCommonApi;

