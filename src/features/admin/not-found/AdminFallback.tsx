import { useLocation } from "react-router-dom";
import { useAuth } from "../../../core/auth/AuthContext";
import { findPageForPath } from "../../../core/auth/menu";
import ComingSoon from "../coming-soon/ComingSoon";
import AdminNotFound from "./AdminNotFound";

/** An address with no screen: a page the menu lists is "coming soon"; anything else is not found. */
const AdminFallback = () => {
  const { pathname } = useLocation();
  const { menu } = useAuth();
  return menu && findPageForPath(menu, pathname) ? <ComingSoon /> : <AdminNotFound />;
};

export default AdminFallback;
