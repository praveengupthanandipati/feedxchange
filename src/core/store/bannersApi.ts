import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

export interface Banner {
  id: number;
  title: string;
  link_URL: string;
  priority: number;
  fileName: string | null;
  isActive: boolean;
  createdBy: number | null;
  createdByName: string | null;
  updatedBy: number | null;
  updatedByName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AddBannerPayload {
  title: string;
  linkUrl: string;
  priority: number;
  isActive: boolean;
  actionPerfomedBy: number;
  image: File;
}

export interface UpdateBannerPayload {
  id: number;
  title: string;
  linkUrl: string;
  priority: number;
  isActive: boolean;
  updatedBy: number;
  // Optional: leave it out to keep the current image.
  image?: File | null;
}

// AddBanner takes multipart/form-data with these exact field names (the API spells "ActionPerfomedBy" this way).
function toBannerFormData(payload: AddBannerPayload): FormData {
  const formData = new FormData();
  formData.append("Title", payload.title);
  formData.append("Link_URL", payload.linkUrl);
  formData.append("Priority", String(payload.priority));
  formData.append("IsActive", String(payload.isActive));
  formData.append("ActionPerfomedBy", String(payload.actionPerfomedBy));
  formData.append("BannerImage", payload.image);
  return formData;
}

function toUpdateBannerFormData(payload: UpdateBannerPayload): FormData {
  const formData = new FormData();
  formData.append("Id", String(payload.id));
  formData.append("Title", payload.title);
  formData.append("Link_URL", payload.linkUrl);
  formData.append("Priority", String(payload.priority));
  formData.append("IsActive", String(payload.isActive));
  formData.append("IsDeleted", "false");
  formData.append("UpdatedAt", new Date().toISOString());
  formData.append("UpdatedBy", String(payload.updatedBy));
  if (payload.image) formData.append("BannerImage", payload.image);
  return formData;
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  const envelope = payload as { result?: unknown; data?: unknown } | null | undefined;
  if (Array.isArray(envelope?.result)) return envelope.result as T[];
  if (Array.isArray(envelope?.data)) return envelope.data as T[];
  return [];
}

export const bannersApi = createApi({
  reducerPath: "bannersApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Banner"],
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => "/api/Banners/GetAllBanners",
      transformResponse: unwrapArray<Banner>,
      providesTags: ["Banner"],
    }),
    // Public: the website's home page carousel.
    getActiveBanners: builder.query<Banner[], void>({
      query: () => "/api/Banners/GetAllActiveBanners",
      transformResponse: unwrapArray<Banner>,
      providesTags: ["Banner"],
    }),
    addBanner: builder.mutation<void, AddBannerPayload>({
      query: (payload) => ({
        url: "/api/Banners/AddBanner",
        method: "POST",
        body: toBannerFormData(payload),
      }),
      invalidatesTags: ["Banner"],
    }),
    updateBanner: builder.mutation<void, UpdateBannerPayload>({
      query: (payload) => ({
        url: `/api/Banners/UpdateBanner?bannerId=${payload.id}`,
        method: "POST",
        body: toUpdateBannerFormData(payload),
      }),
      invalidatesTags: ["Banner"],
    }),
    deleteBanner: builder.mutation<void, { bannerId: number; userId: number }>({
      query: ({ bannerId, userId }) => ({
        url: `/api/Banners/DeleteBanner?bannerId=${bannerId}&userId=${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetActiveBannersQuery,
  useAddBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannersApi;
