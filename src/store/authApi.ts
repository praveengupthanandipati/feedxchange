import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";

export interface LoginPayload {
  username: string;
  password: string;
  authenticationType: number;
  phoneNumber: string;
  email: string;
  phoneOTP: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  message?: string;
  result?: { token?: string };
  user?: Record<string, unknown>;
  userPermissions?: unknown[];
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (body) => ({
        url: "/api/Authentication/login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
