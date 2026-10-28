import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { API_URL } from "./api";
import { endSession, getFreshAccessToken, refreshSession } from "./tokenRefresh";
import { getRefreshToken, getToken } from "../auth/session";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  // async on purpose: when the access token is about to expire it is refreshed first, so the request goes out with a good one
  prepareHeaders: async (headers) => {
    const token = await getFreshAccessToken();
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

/**
 * Shared base query for every authenticated API slice.
 *  - sends the access token (refreshing it beforehand when it is about to expire)
 *  - on a 401 it refreshes the session once and retries the request
 *  - only when the refresh token is refused too does it sign the user out and go to the login page
 */
export const apiBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && getToken()) {
    const outcome = getRefreshToken() ? await refreshSession() : "rejected";
    if (outcome === "ok") {
      result = await rawBaseQuery(args, api, extraOptions);
    }
    if (outcome === "rejected" || (outcome === "ok" && result.error?.status === 401)) {
      endSession();
    }
  }
  return result;
};
