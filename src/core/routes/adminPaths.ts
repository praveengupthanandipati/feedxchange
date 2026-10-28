/** Every screen of the signed-in application lives under this prefix; the public website owns the rest of the domain. */
export const ADMIN_BASE = "/admin";

export const ADMIN_LOGIN = `${ADMIN_BASE}/login`;
export const ADMIN_HOME = `${ADMIN_BASE}/dashboard`;

/**
 * "/contracts/2026-5" -> "/admin/contracts/2026-5". Paths that already carry the prefix and full URLs pass through, so it is safe on
 * anything the server sends (menu routes, notification deep links) however old the data is.
 */
export const adminPath = (path: string): string => {
  if (!path || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith("//")) return path;
  if (path === ADMIN_BASE || path.startsWith(`${ADMIN_BASE}/`)) return path;
  if (path === "/") return ADMIN_BASE;
  return `${ADMIN_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const isAdminPath = (pathname: string): boolean => pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);
