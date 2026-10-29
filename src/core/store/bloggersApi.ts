import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

/** A blog post (the API calls them "bloggers"). */
export interface Blogger {
  id: number;
  name: string | null;
  description: string | null;
  link_URL: string | null;
  priority: number;
  /** Image path on the API server. */
  fileName: string | null;
  isActive: boolean;
  createdBy: number | null;
  createdByName: string | null;
  updatedBy: number | null;
  updatedByName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  const envelope = payload as { result?: unknown; data?: unknown } | null | undefined;
  if (Array.isArray(envelope?.result)) return envelope.result as T[];
  if (Array.isArray(envelope?.data)) return envelope.data as T[];
  return [];
}

export const bloggersApi = createApi({
  reducerPath: "bloggersApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Blogger"],
  endpoints: (builder) => ({
    // Public (no login): the website's Blogs page. Includes inactive posts, so callers filter on isActive.
    getAllBloggers: builder.query<Blogger[], void>({
      query: () => "/api/Bloggers/GetAllBloggers",
      transformResponse: unwrapArray<Blogger>,
      providesTags: ["Blogger"],
    }),
  }),
});

export const { useGetAllBloggersQuery } = bloggersApi;
