import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { findPageForPath, isVisibleInMenu } from "../../auth/menu";
import { asideNavSections } from "../../components/asidemenu/aside.data";
import { filterNavSections } from "../../components/asidemenu/filterNav";
import "./SubModuleOverview.scss";

interface Entry {
  id: string;
  label: string;
  path: string;
}

/**
 * Landing page of a Sub Module (Payments, Reports, Products, Transporters ...): the pages inside it that the signed-in user may open.
 * It is the place to put that Sub Module's own dashboard later; for now it lists its pages so the dropdown has somewhere to go.
 */
const SubModuleOverview = () => {
  const { menu, can } = useAuth();
  const { pathname } = useLocation();

  let title = "Overview";
  let entries: Entry[] = [];

  const page = menu ? findPageForPath(menu, pathname) : null;
  if (menu && page) {
    title = page.title;
    entries = page.children
      .filter((child) => isVisibleInMenu(child) && !!child.routePath)
      .map((child) => ({ id: child.pageKey, label: child.title, path: child.routePath! }));
  } else {
    // built-in menu (API without a menu): the item whose path is this page
    const item = filterNavSections(asideNavSections, can)
      .flatMap((section) => section.items)
      .find((candidate) => candidate.path === pathname);
    if (item) {
      title = item.label;
      entries = (item.children ?? []).map((child) => ({ id: child.id, label: child.label, path: child.path }));
    }
  }

  return (
    <div className="submodule-overview">
      <h1
        className={`submodule-overview__title${pathname === "/product-management/overview" ? " submodule-overview__title--products" : pathname === "/reports/overview" ? " submodule-overview__title--reports" : pathname === "/menu-management/overview" ? " submodule-overview__title--menu-management" : pathname === "/payments/overview" ? " submodule-overview__title--payments" : ""}`}
      >
        {title}
      </h1>
      {entries.length === 0 ? (
        <p className="submodule-overview__empty">Nothing here is available for your role.</p>
      ) : (
        <div className="submodule-overview__grid">
          {entries.map((entry) => (
            <Link key={entry.id} to={entry.path} className="submodule-overview__card">
              {entry.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubModuleOverview;
