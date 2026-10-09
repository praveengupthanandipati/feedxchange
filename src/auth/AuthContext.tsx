import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch, revokeSessionOnServer, SESSION_REFRESHED_EVENT } from "../api/tokenRefresh";
import { hasAnyPermission } from "./access";
import { canOnPage } from "./menu";
import type { AccessMenu, PageAction } from "./menu";
import {
  clearSession,
  getDisplayName,
  getBusinessUnitType,
  getPermissionKeys,
  getRoleName,
  getToken,
  getUserId,
  savePermissionKeys,
} from "./session";

interface AuthState {
  isAuthenticated: boolean;
  /** The access token in use; it changes on login and on every silent refresh. */
  token: string;
  /** Who is signed in; a different id means a different user signed in. */
  userId: string;
  displayName: string;
  roleName: string;
  businessUnitType: string;
  /** null = the backend sent no permission list, so nothing is hidden. */
  permissionKeys: ReadonlySet<string> | null;
}

interface AuthContextValue extends AuthState {
  /** Modules / pages / actions for this user from the database (GET /api/Access/menu); null until loaded or when the API has none. */
  menu: AccessMenu | null;
  /** True when the user may do `action` on the page (page keys come from the Pages table, e.g. "products", "truck-master"). */
  canPage: (pageKey: string, action: PageAction) => boolean;
  /** True when the user holds ANY of the given keys ("x.manage" also satisfies "x.view"). */
  can: (...keys: string[]) => boolean;
  /** Re-read the stored session (call after login). */
  reload: () => void;
  /** Ends the session: revokes the refresh token on the server and forgets everything locally. */
  logout: () => void;
}

const readState = (): AuthState => {
  const keys = getPermissionKeys();
  return {
    isAuthenticated: getToken() !== "",
    token: getToken(),
    userId: getUserId(),
    displayName: getDisplayName(),
    roleName: getRoleName(),
    businessUnitType: getBusinessUnitType(),
    permissionKeys: keys === null ? null : new Set(keys),
  };
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(readState);
  const [menu, setMenu] = useState<AccessMenu | null>(null);
  const lastUserId = useRef(state.userId);

  const reload = useCallback(() => setState(readState()), []);

  const logout = useCallback(() => {
    revokeSessionOnServer(); // reads the refresh token, so it must run before the session is cleared
    clearSession();
    setMenu(null);
    setState(readState());
  }, []);

  // A silent token refresh (any tab) may bring changed permissions: pick them up.
  useEffect(() => {
    const onRefreshed = () => setState(readState());
    window.addEventListener(SESSION_REFRESHED_EVENT, onRefreshed);
    return () => window.removeEventListener(SESSION_REFRESHED_EVENT, onRefreshed);
  }, []);

  // Pick up role/permission changes made since login without forcing a new login, and load the screen catalogue.
  // Silent on failure (older API without these endpoints): the stored keys and the built-in menu keep working.
  useEffect(() => {
    // never show the previous user's screens while a different user's menu loads (a refresh of the SAME user keeps the menu)
    if (lastUserId.current !== state.userId) {
      lastUserId.current = state.userId;
      setMenu(null);
    }
    if (!state.isAuthenticated || state.permissionKeys === null) return;
    const controller = new AbortController();

    apiFetch("/api/Access/me", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { permissionKeys?: string[]; roleKey?: string | null } | null) => {
        if (data && Array.isArray(data.permissionKeys)) {
          savePermissionKeys(data.permissionKeys, data.roleKey);
          setState((previous) => ({ ...previous, permissionKeys: new Set(data.permissionKeys) }));
        }
      })
      .catch(() => undefined);

    apiFetch("/api/Access/menu", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: AccessMenu | null) => {
        if (data && Array.isArray(data.modules)) setMenu(data);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [state.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      menu,
      canPage: (pageKey: string, action: PageAction) => canOnPage(menu, pageKey, action),
      can: (...keys: string[]) => hasAnyPermission(state.permissionKeys, keys),
      reload,
      logout,
    }),
    [state, menu, reload, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
};

/** `const canEdit = usePermission("products.manage")` */
export const usePermission = (...keys: string[]): boolean => useAuth().can(...keys);
