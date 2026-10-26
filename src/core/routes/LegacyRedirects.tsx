import { Navigate, useLocation, useParams } from "react-router-dom";
import { adminPath } from "./adminPaths";

/** First path segments of the admin screens, so old bookmarks and links sent before the /admin prefix still arrive. */
export const LEGACY_ADMIN_SEGMENTS = [
  "business-owners", "categories", "company-invoices", "contract-status", "contracts", "dashboard", "estimations", "interest-payments",
  "login", "masters", "menu-management", "my-notification-preferences", "notification-preferences", "notification-templates",
  "notifications", "payments", "product-management", "products", "promocodes", "promoter-dashboard", "promoters", "referred-profiles",
  "reports", "roles-permissions", "settings", "transporters", "truck-management", "user-access",
];

/** /contracts/2026-5?x=1 -> /admin/contracts/2026-5?x=1 */
export const LegacyAdminRedirect = () => {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={`${adminPath(pathname)}${search}${hash}`} replace />;
};

/** The website used to live under /website. */
export const LegacyWebsiteRedirect = () => {
  const rest = useParams()["*"];
  return <Navigate to={rest ? `/${rest}` : "/"} replace />;
};
