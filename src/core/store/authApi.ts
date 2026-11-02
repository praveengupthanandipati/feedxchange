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

/**
 * What forgotpassword returns. userId is the account the reset code is for (the registrationId ValidateOTPForResetPassword
 * takes); token is what resetpassword needs. For an email with no account both are empty, and the message is the same
 * ("If the email address belongs to an account…"), so the reply never reveals whether an account exists.
 */
export interface ForgotPasswordResponse {
  id: number;
  userId: number;
  message: string | null;
  token: string | null;
  expiresAt: string | null;
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
    // Sends the password-reset code to the email (no login needed).
    forgotPassword: builder.mutation<ForgotPasswordResponse, { email: string }>({
      query: (body) => ({
        url: "/api/Authentication/forgotpassword",
        method: "POST",
        body,
      }),
    }),
    // Checks the reset code. true = correct.
    validateOtpForResetPassword: builder.mutation<boolean, { registrationId: number; otp: string }>({
      query: (body) => ({
        url: "/api/RegistrationDetails/ValidateOTPForResetPassword",
        method: "POST",
        body,
      }),
    }),
    // Sets the new password, with the token from forgotpassword.
    resetPassword: builder.mutation<unknown, { token: string; newPassword: string }>({
      query: (body) => ({
        url: "/api/Authentication/resetpassword",
        method: "POST",
        body,
        responseHandler: "content-type",
      }),
    }),
  }),
});

export const { useLoginMutation, useForgotPasswordMutation, useValidateOtpForResetPasswordMutation, useResetPasswordMutation } = authApi;
