import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { findPageForPath, isVisibleInMenu } from "../../auth/menu";
import { asideNavSections } from "../../components/asidemenu/aside.data";
import { filterNavSections } from "../../components/asidemenu/filterNav";
import TransportersDashboard from "./TransportersDashboard";
import PaymentsDashboard from "./PaymentsDashboard";
import ProductsDashboard from "./ProductsDashboard";
import ReportsDashboard from "./ReportsDashboard";
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
    const sections = filterNavSections(asideNavSections, can);
    const sectionItems = sections.flatMap((section) => section.items);
    const item = sectionItems
      .find((candidate) => candidate.path === pathname);
    if (item) {
      title = item.label;
      entries = (item.children ?? []).map((child) => ({ id: child.id, label: child.label, path: child.path }));
    } else if (pathname === "/product-management/overview") {
      title = "Products";
      const productItems = sections.find((section) => section.id === "our-features")?.items ?? [];
      entries = productItems.flatMap((candidate) => {
        if (candidate.id === "categories" && candidate.path) {
          return [{ id: candidate.id, label: candidate.label, path: candidate.path }];
        }
        return (candidate.id === "apps" ? candidate.children ?? [] : []).map((child) => ({
          id: child.id,
          label: child.label,
          path: child.path,
        }));
      });
    } else if (pathname === "/reports/overview") {
      title = "Reports";
      const reportGroup = sections
        .find((section) => section.id === "reports-statements")
        ?.items.find((candidate) => candidate.id === "reports");
      entries = (reportGroup?.children ?? [])
        .filter((child) => child.path !== "/reports/do-truck-history")
        .map((child) => ({ id: child.id, label: child.label, path: child.path }));
    }
  }

  const dashboardPaths = [
    "/truck-management/transporters/overview",
    "/payments/overview",
    "/product-management/overview",
    "/reports/overview",
  ];
  const isDashboard = dashboardPaths.includes(pathname);

  return (
    <div className="submodule-overview">
      {!isDashboard && <h1 className="submodule-overview__title">{title}</h1>}
      {pathname === "/truck-management/transporters/overview" && <TransportersDashboard entries={entries} />}
      {pathname === "/payments/overview" && <PaymentsDashboard entries={entries} />}
      {pathname === "/product-management/overview" && <ProductsDashboard entries={entries} />}
      {pathname === "/reports/overview" && <ReportsDashboard entries={entries} />}
      {!['/truck-management/transporters/overview', '/payments/overview', '/product-management/overview', '/reports/overview'].includes(pathname) && entries.length === 0 ? (
        <p className="submodule-overview__empty">Nothing here is available for your role.</p>
      ) : !['/truck-management/transporters/overview', '/payments/overview', '/product-management/overview', '/reports/overview'].includes(pathname) && (
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
