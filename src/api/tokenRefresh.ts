import { API_URL } from "./api";
import {
  clearSession,
  getAccessTokenExpiresAt,
  getRefreshToken,
  getToken,
  saveTokens,
  savePermissionKeys,
} from "../auth/session";

/** Fired after a refresh so the app can pick up permission / menu changes. */
export const SESSION_REFRESHED_EVENT = "fx-auth-refreshed";

/** Refresh a little before the access token really expires, so requests do not go out with a token about to die. */
const REFRESH_MARGIN_MS = 30_000;

/**
 * ok        - a new access token is stored (or another tab just stored one)
 * rejected  - the server refused the refresh token (expired, revoked, user deactivated): the user must sign in again
 * unavailable - no refresh token to use, or the network / server was unreachable: keep the session, do not sign out
 */
export type RefreshOutcome = "ok" | "rejected" | "unavailable";

interface RefreshResponse {
  token: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  permissionKeys?: string[];
  roleKey?: string | null;
}

const performRefresh = async (): Promise<RefreshOutcome> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return "unavailable";

  try {
    const response = await fetch(`${API_URL}/api/Authentication/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = (await response.json()) as RefreshResponse;
      saveTokens({ token: data.token, refreshToken: data.refreshToken, accessTokenExpiresAt: data.accessTokenExpiresAt });
      savePermissionKeys(data.permissionKeys, data.roleKey);
      window.dispatchEvent(new Event(SESSION_REFRESHED_EVENT));
      return "ok";
    }

    if (response.status === 401) {
      // Another tab may have rotated the token a moment ago. If a newer one is stored, that tab succeeded.
      const latest = getRefreshToken();
      if (latest && latest !== refreshToken) return "ok";
      return "rejected";
    }

    return "unavailable"; // 5xx etc.: not a verdict on the token
  } catch {
    return "unavailable"; // network error
  }
};

let inFlight: Promise<RefreshOutcome> | null = null;

/** One refresh at a time, however many requests hit an expired token together. */
export const refreshSession = (): Promise<RefreshOutcome> => {
  if (!inFlight) {
    inFlight = performRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};

/** The access token to send now: refreshes first when it has expired or is about to. */
export const getFreshAccessToken = async (): Promise<string> => {
  const expiresAt = getAccessTokenExpiresAt();
  if (expiresAt !== null && expiresAt - Date.now() < REFRESH_MARGIN_MS && getRefreshToken()) {
    await refreshSession();
  }
  return getToken();
};

/** Ends the session on the server (revokes the refresh token). Fire and forget - the user is signed out either way. */
export const revokeSessionOnServer = () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;
  fetch(`${API_URL}/api/Authentication/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    keepalive: true,
  }).catch(() => undefined);
};

/** The session cannot continue: forget it and go to the login page. */
export const endSession = () => {
  clearSession();
  window.location.assign("/login");
};

/** `fetch` for the API with the access token attached, one silent refresh + retry on 401. Use it outside RTK Query. */
export const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const send = async () => {
    const token = await getFreshAccessToken();
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...init, headers });
  };

  let response = await send();
  if (response.status === 401 && getRefreshToken()) {
    const outcome = await refreshSession();
    if (outcome === "ok") response = await send();
    else if (outcome === "rejected") endSession();
  }
  return response;
};
