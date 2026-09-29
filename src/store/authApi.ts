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
  /** The access token (short-lived JWT). */
  token?: string;
  /** Single-use token that renews the access token; every refresh returns a new one. */
  refreshToken?: string;
  /** ISO time the access token expires. */
  accessTokenExpiresAt?: string;
  accessToken?: string;
  message?: string;
  result?: { token?: string };
  user?: Record<string, unknown>;
  /** Stable permission keys, e.g. "contracts.manage". Absent on older API builds. */
  permissionKeys?: string[];
  roleKey?: string | null;
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
