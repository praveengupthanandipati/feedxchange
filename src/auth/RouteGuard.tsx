import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { asideNavSections } from "../components/asidemenu/aside.data";
import { filterNavSections, firstNavPath } from "../components/asidemenu/filterNav";
import { findPageForPath, toNavSections } from "./menu";
import { useAuth } from "./AuthContext";
import NoAccess from "./NoAccess";
import { requiredPermissionsFor } from "./routePermissions";

/** Sends visitors without a login session to the login page. */
export const RequireSession = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/** Shows the screen only when the user's role allows it; otherwise a "no access" page (inside the normal layout). */
export const RoutePermissionGate = ({ children }: { children: ReactNode }) => {
  const { can, permissionKeys, menu } = useAuth();
  const { pathname } = useLocation();

  // The API sent a permission list and it is empty: nothing is assigned to this account.
  if (permissionKeys !== null && permissionKeys.size === 0) return <NoAccess noRole />;

  // Preferred: the Pages table (every screen and whether this user may open it). Otherwise the built-in route rules.
  const page = menu ? findPageForPath(menu, pathname) : null;
  const required = page ? null : requiredPermissionsFor(pathname);
  const denied = page ? !page.allowed : !!required && !can(...required);
  if (denied) {
    // Roles without a Dashboard land on the first screen they can open instead of a dead end.
    if (pathname === "/" || pathname === "/dashboard") {
      const sections = menu ? toNavSections(menu) : filterNavSections(asideNavSections, can);
      const first = firstNavPath(sections);
      if (first && first !== pathname) return <Navigate to={first} replace />;
    }
    return <NoAccess />;
  }

  return <>{children}</>;
};
