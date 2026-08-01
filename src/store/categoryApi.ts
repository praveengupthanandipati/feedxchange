import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

export interface Category {
  id: string;
  categoryName: string;
  seoName: string;
  status: "Active" | "Inactive";
  priority: number;
  description: string;
  imageUrl: string;
}

export const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

interface CategoryApiResponse {
  id: number;
  name: string;
  seoName: string;
  description: string;
  fileName: string;
  priority: number;
  isActive: boolean;
}

export interface AddCategoryPayload {
  Name: string;
  SEOName: string;
  Description: string;
  Priority: number;
  IsActive: boolean;
  ActionPerfomedBy: number;
  Image: File;
}

export interface UpdateCategoryPayload {
  Id: number;
  Name: string;
  SEOName: string;
  Description: string;
  Priority: number;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedAt: string;
  CreatedBy: number;
  UpdatedAt: string;
  UpdatedBy: number;
  Image?: File;
}

export interface DeleteCategoryPayload {
  categoryId: number;
  actionPerformedBy: number;
}

export interface CategoryStatusPayload {
  categoryId: number;
  isActive: boolean;
}

export interface CategoryPriorityItem {
  categoryId: number;
  priority: number;
  seoName: string;
}

function transformCategory(item: CategoryApiResponse): Category {
  return {
    id: item.id.toString(),
    categoryName: item.name,
    seoName: item.seoName,
    status: item.isActive ? "Active" : "Inactive",
    priority: item.priority,
    description: item.description,
    imageUrl: item.fileName,
  };
}

function transformCategories(payload: unknown): Category[] {
  if (!Array.isArray(payload)) return [];

  return (payload as CategoryApiResponse[]).map(transformCategory);
}

function transformSingleCategory(payload: unknown): Category | null {
  if (!payload) return null;

  return transformCategory(payload as CategoryApiResponse);
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),

  tagTypes: ["Category"],

  endpoints: (builder) => ({
    // // ===========================
    // // GET ALL CATEGORIES
    // // ===========================
    // getAllCategories: builder.query<Category[], void>({
    //   query: () => "/api/Category/GetAllCategories",
    //   transformResponse: transformCategories,
    //   providesTags: ["Category"],
    // }),

    // ===========================
    // GET ACTIVE CATEGORIES
    // ===========================
    getAllActiveCategories: builder.query<Category[], void>({
      query: () => "/api/Category/GetAllActiveCategories",
      transformResponse: transformCategories,
      providesTags: ["Category"],
    }),
// commented code can be used in future if needed
    // // ===========================
    // // GET CATEGORY BY ID
    // // ===========================
    // getCategoryById: builder.query<
    //   Category | null,
    //   { categoryId: number; seoName: string }
    // >({
    //   query: ({ categoryId, seoName }) =>
    //     `/api/Category/GetCategoryById?categoryId=${categoryId}&seoName=${encodeURIComponent(
    //       seoName
    //     )}`,
    //   transformResponse: transformSingleCategory,
    //   providesTags: ["Category"],
    // }),

    // ===========================
    // ADD CATEGORY
    // ===========================
    addCategory: builder.mutation<number, AddCategoryPayload>({
      query: (body) => {
        const formData = new FormData();

        formData.append("Name", body.Name);
        formData.append("SEOName", body.SEOName);
        formData.append("Description", body.Description);
        formData.append("Priority", body.Priority.toString());
        formData.append("IsActive", body.IsActive.toString());
        formData.append(
          "ActionPerfomedBy",
          body.ActionPerfomedBy.toString()
        );

        if (body.Image) {
          formData.append("Image", body.Image);
        }

        return {
          url: "/api/Category/AddCategory",
          method: "POST",
          body: formData,
        };
      },

      invalidatesTags: ["Category"],
    }),
        // ===========================
    // UPDATE CATEGORY
    // ===========================
    updateCategory: builder.mutation<boolean, UpdateCategoryPayload>({
      query: (body) => {
        const formData = new FormData();

        formData.append("Id", body.Id.toString());
        formData.append("Name", body.Name);
        formData.append("SEOName", body.SEOName);
        formData.append("Description", body.Description);
        formData.append("Priority", body.Priority.toString());
        formData.append("IsActive", body.IsActive.toString());
        formData.append("IsDeleted", body.IsDeleted.toString());
        formData.append("CreatedAt", body.CreatedAt);
        formData.append("CreatedBy", body.CreatedBy.toString());
        formData.append("UpdatedAt", body.UpdatedAt);
        formData.append("UpdatedBy", body.UpdatedBy.toString());

        if (body.Image) {
          formData.append("Image", body.Image);
        }

        return {
          url: `/api/Category/UpdateCategory?categoryId=${body.Id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Category"],
    }),

    // ===========================
    // DELETE CATEGORY
    // ===========================
    deleteCategory: builder.mutation<boolean, DeleteCategoryPayload>({
      query: ({ categoryId, actionPerformedBy }) => ({
        url: `/api/Category/DeleteCategory?categoryId=${categoryId}&actionPerformedBy=${actionPerformedBy}`,
        method: "POST",
        responseHandler: "text",
      }),
      invalidatesTags: ["Category"],
    }),

    // // ===========================
    // // UPDATE CATEGORY STATUS
    // // ===========================
    // updateCategoryStatus: builder.mutation<boolean, CategoryStatusPayload>({
    //   query: ({ categoryId, isActive }) => ({
    //     url: `/api/Category/UpdateCategoryStatus?categoryId=${categoryId}&isActive=${isActive}`,
    //     method: "POST",
    //     responseHandler: "text",
    //   }),
    //   invalidatesTags: ["Category"],
    // }),

    // // ===========================
    // // CATEGORY PRIORITY CHANGE
    // // ===========================
    // categoryPriorityChange: builder.mutation<number, CategoryPriorityItem[]>({
    //   query: (body) => ({
    //     url: "/api/Category/CategoryPriorityChange",
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["Category"],
    // }),
  }),
});

export const {
  //useGetAllCategoriesQuery,
  useGetAllActiveCategoriesQuery,
  //useGetCategoryByIdQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  //useUpdateCategoryStatusMutation,
  //useCategoryPriorityChangeMutation,
} = categoryApi;