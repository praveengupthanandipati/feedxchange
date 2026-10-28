import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { adminRoutes } from "../features/admin/admin.routes";
import { websiteRoutes } from "../features/website/website.routes";
import { ADMIN_BASE } from "../core/routes/adminPaths";
import { LEGACY_ADMIN_SEGMENTS, LegacyAdminRedirect, LegacyWebsiteRedirect } from "../core/routes/LegacyRedirects";
import PageLoader from "../shared/components/loader/PageLoader";

// Each layout is its own bundle: a website visitor never downloads the admin shell and the reverse.
const WebsiteLayout = lazy(() => import("../layouts/website-layout/WebsiteLayout"));
const AdminLayout = lazy(() => import("../layouts/admin-layout/AdminLayout"));
const AdminShell = lazy(() => import("./AdminShell"));
const Login = lazy(() => import("../features/admin/auth/login/Login"));

/**
 * One route table for the whole domain, two completely separate layouts:
 *
 *   /            WebsiteLayout  (public header and footer, no sign-in)   /about /products /faqs /blogs /contact /join
 *   /admin/login AdminShell     (public, no layout)
 *   /admin/**    AdminShell > AdminLayout (sidebar + header), behind the login check; each screen checks the role
 */
export const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* addresses from before the split */}
      <Route path="/website/*" element={<LegacyWebsiteRedirect />} />
      {LEGACY_ADMIN_SEGMENTS.map((segment) => (
        <Route key={segment} path={`/${segment}/*`} element={<LegacyAdminRedirect />} />
      ))}

      <Route path={ADMIN_BASE} element={<AdminShell />}>
        <Route path="login" element={<Login />} />
        <Route element={<AdminLayout />}>{adminRoutes}</Route>
      </Route>

      <Route element={<WebsiteLayout />}>{websiteRoutes}</Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
