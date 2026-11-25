import { Link, useLocation } from "react-router-dom";
import { ADMIN_HOME } from "../../../core/routes/adminPaths";
import { useAuth } from "../../../core/auth/AuthContext";
import { findPageForPath } from "../../../core/auth/menu";

/** "reports/do-truck-history" -> "Do Truck History" (used when the menu has no title for the address). */
const titleFromPath = (pathname: string) =>
  (pathname.split("/").filter(Boolean).pop() ?? "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** Placeholder for a menu entry whose screen is not built yet. */
const ComingSoon = ({ title }: { title?: string }) => {
  const { pathname } = useLocation();
  const { menu } = useAuth();
  const heading = title ?? (menu ? findPageForPath(menu, pathname)?.title : undefined) ?? titleFromPath(pathname);

  return (
    <div className="text-center py-5">
      <h1 className="h3 mb-2">{heading}</h1>
      <p className="text-secondary mb-3">Coming soon. This screen is not available yet.</p>
      <Link to={ADMIN_HOME} className="btn btn-primary">Go to the dashboard</Link>
    </div>
  );
};

export default ComingSoon;
