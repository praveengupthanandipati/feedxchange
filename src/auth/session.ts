// Everything the app remembers about the signed-in user lives in localStorage.
// Login.tsx writes the profile keys below; the tokens and permission keys are added here.

const AUTH_USER_KEY = "authUser"; // { email, token }  - token is the ACCESS token (short-lived JWT)
const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_EXPIRES_KEY = "accessTokenExpiresAt"; // ISO time the access token stops working
const PERMISSION_KEYS_KEY = "permissionKeys";
const ROLE_KEY_KEY = "roleKey";

// Keys written by Login.tsx that must go when the user logs out.
const PROFILE_KEYS = [
  "userId",
  "businessProfileId",
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
  "roleId",
  "roleName",
  "businessName",
  "lastLoginDate",
  "permissions",
  "businessUnitType",
  "user",
];

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** The access token (JWT) sent on every request. */
export const getToken = (): string => {
  try {
    const raw = read(AUTH_USER_KEY);
    return raw ? ((JSON.parse(raw) as { token?: string }).token ?? "") : "";
  } catch {
    return "";
  }
};

export const getRefreshToken = (): string => read(REFRESH_TOKEN_KEY) ?? "";

/** When the access token expires, in epoch milliseconds (null when unknown, e.g. a session from before refresh tokens). */
export const getAccessTokenExpiresAt = (): number | null => {
  const raw = read(ACCESS_EXPIRES_KEY);
  const time = raw ? Date.parse(raw) : NaN;
  return Number.isNaN(time) ? null : time;
};

export interface SessionTokens {
  token: string;
  refreshToken?: string;
  /** ISO time the access token expires. */
  accessTokenExpiresAt?: string;
}

/** Stores a fresh access token (and refresh token) after login or after a refresh, keeping the rest of the session. */
export const saveTokens = ({ token, refreshToken, accessTokenExpiresAt }: SessionTokens) => {
  try {
    let email = "";
    try {
      email = (JSON.parse(read(AUTH_USER_KEY) ?? "{}") as { email?: string }).email ?? "";
    } catch {
      // ignore a corrupt value; it is replaced below
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ email, token }));
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (accessTokenExpiresAt) localStorage.setItem(ACCESS_EXPIRES_KEY, accessTokenExpiresAt);
    else localStorage.removeItem(ACCESS_EXPIRES_KEY);
  } catch {
    // storage unavailable - nothing to persist
  }
};

/**
 * The permission keys the user holds, or `null` when the backend did not send any
 * (an older API build). `null` means "unknown": the UI then behaves as it did before RBAC.
 */
export const getPermissionKeys = (): string[] | null => {
  const raw = read(PERMISSION_KEYS_KEY);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : null;
  } catch {
    return null;
  }
};

export const savePermissionKeys = (keys: string[] | undefined, roleKey?: string | null) => {
  try {
    if (Array.isArray(keys)) localStorage.setItem(PERMISSION_KEYS_KEY, JSON.stringify(keys));
    else localStorage.removeItem(PERMISSION_KEYS_KEY);
    if (roleKey) localStorage.setItem(ROLE_KEY_KEY, roleKey);
    else localStorage.removeItem(ROLE_KEY_KEY);
  } catch {
    // storage unavailable - nothing to persist
  }
};

export const getRoleKey = (): string => read(ROLE_KEY_KEY) ?? "";

export const getUserId = (): string => read("userId") ?? "";

export const getDisplayName = (): string => {
  const name = `${read("firstName") ?? ""} ${read("lastName") ?? ""}`.trim();
  return name || read("email") || "User";
};

export const getRoleName = (): string => read("roleName") ?? "";

export const getBusinessUnitType = (): string => read("businessUnitType") ?? "";

export const clearSession = () => {
  try {
    [AUTH_USER_KEY, REFRESH_TOKEN_KEY, ACCESS_EXPIRES_KEY, PERMISSION_KEYS_KEY, ROLE_KEY_KEY, ...PROFILE_KEYS].forEach((key) =>
      localStorage.removeItem(key),
    );
  } catch {
    // ignore
  }
};
