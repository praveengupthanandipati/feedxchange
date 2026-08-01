import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

export interface ProductPriceHistoryEntry {
  id: number;
  productId: number;
  price: number;
  insertedTime: string;
  reason: string | null;
}

export interface ProductNutritionalSpec {
  parameter: string;
  min: string;
  max: string;
  showInWebsite: boolean;
}

export interface ProductNutritionalValue {
  title: string;
  description: string;
}

export interface ParsedProductFeatures {
  nutritionalSpecifications?: ProductNutritionalSpec[];
  nutritionalValueAndUses?: ProductNutritionalValue[];
}

export function parseProductFeatures(productFeatures: string | null): ParsedProductFeatures {
  if (!productFeatures) return {};
  try {
    return JSON.parse(productFeatures) as ParsedProductFeatures;
  } catch {
    return {};
  }
}

export interface Product {
  id: number;
  name: string | null;
  imageUrl: string | null;
  seoName: string | null;
  sku: string | null;
  description: string | null;
  fileName: string | null;
  price: number;
  categoryName: string | null;
  categoryId: number | null;
  productFeatures: string | null;
  weightClause: string | null;
  insertedTime: string;
  stock: number | null;
  minimumQuantity: number | null;
  maximumQuantity: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: number;
  createdByName: string | null;
  updatedByName: string | null;
  updatedBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  productPriceHistoryResponse?: ProductPriceHistoryEntry[] | null;
}

export interface CreateProductPayload {
  name: string;
  seoName: string;
  sku: string;
  description: string;
  price: number;
  categoryId: number;
  productFeatures: string;
  weightClause: string;
  stock: number;
  minimumQuantity: number;
  maximumQuantity: number;
  reason: string;
  isActive: boolean;
  actionPerfomedBy: number;
  image?: File;
}

function toProductFormData(payload: CreateProductPayload): FormData {
  const formData = new FormData();
  formData.append("Name", payload.name);
  formData.append("SEOName", payload.seoName);
  formData.append("SKU", payload.sku);
  formData.append("Description", payload.description);
  formData.append("Price", String(payload.price));
  formData.append("CategoryId", String(payload.categoryId));
  formData.append("ProductFeatures", payload.productFeatures);
  formData.append("WeightClause", payload.weightClause);
  formData.append("Stock", String(payload.stock));
  formData.append("MinimumQuantity", String(payload.minimumQuantity));
  formData.append("MaximumQuantity", String(payload.maximumQuantity));
  formData.append("Reason", payload.reason);
  formData.append("IsActive", String(payload.isActive));
  formData.append("ActionPerfomedBy", String(payload.actionPerfomedBy));
  if (payload.image) formData.append("Image", payload.image);
  return formData;
}

export interface UpdateProductPayload {
  id: number;
  name: string;
  seoName: string;
  sku: string;
  description: string;
  price: number;
  reason: string;
  categoryId: number;
  productFeatures: string;
  weightClause: string;
  insertedTime: string;
  stock: number;
  minimumQuantity: number;
  maximumQuantity: number;
  isActive: boolean;
  isDeleted: boolean;
  updatedBy: number;
  image?: File;
}

function toUpdateProductFormData(payload: UpdateProductPayload): FormData {
  const formData = new FormData();
  formData.append("Id", String(payload.id));
  formData.append("Name", payload.name);
  formData.append("SEOName", payload.seoName);
  formData.append("SKU", payload.sku);
  formData.append("Description", payload.description);
  formData.append("Price", String(payload.price));
  formData.append("Reason", payload.reason);
  formData.append("CategoryId", String(payload.categoryId));
  formData.append("ProductFeatures", payload.productFeatures);
  formData.append("WeightClause", payload.weightClause);
  formData.append("InsertedTime", payload.insertedTime);
  formData.append("Stock", String(payload.stock));
  formData.append("MinimumQuantity", String(payload.minimumQuantity));
  formData.append("MaximumQuantity", String(payload.maximumQuantity));
  formData.append("IsActive", String(payload.isActive));
  formData.append("IsDeleted", String(payload.isDeleted));
  formData.append("UpdatedBy", String(payload.updatedBy));
  if (payload.image) formData.append("Image", payload.image);
  return formData;
}


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

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/api/Product/GetAllActiveProducts",
      transformResponse: unwrapArray<Product>,
      providesTags: ["Product"],
    }),
    getProductById: builder.query<Product | null, string>({
      query: (productId) => `/api/Product/GetProductByProductId?productId=${productId}`,
      transformResponse: unwrapObject<Product>,
      providesTags: ["Product"],
    }),
    getProductsByCategoryId: builder.query<Product[], string>({
      query: (categoryId) => `/api/Product/GetProductsByCategoryId?categoryId=${categoryId}`,
      transformResponse: unwrapArray<Product>,
      providesTags: ["Product"],
    }),
    createProduct: builder.mutation<number, CreateProductPayload>({
      query: (newProduct) => ({
        url: "/api/Product/AddProduct",
        method: "POST",
        body: toProductFormData(newProduct),
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<boolean, UpdateProductPayload>({
      query: (payload) => ({
        url: `/api/Product/UpdateProduct?productId=${payload.id}`,
        method: "POST",
        body: toUpdateProductFormData(payload),
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<boolean, { productId: number; actionPerformedBy: number }>({
      query: ({ productId, actionPerformedBy }) => ({
        url: `/api/Product/DeleteProduct?productId=${productId}&actionPerformedBy=${actionPerformedBy}`,
        method: "POST",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
