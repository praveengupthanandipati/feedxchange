import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import "../shared/assets/styles/App.scss";
import { SelectedContractProvider } from "../core/context/SelectedContractContext";
import { AuthProvider } from "../core/auth/AuthContext";
import { NotificationProvider } from "../shared/notifications/NotificationProvider";
import { AutoNotifyProvider } from "../shared/notifications/AutoNotifyProvider";
import PageLoader from "../shared/components/loader/PageLoader";

/**
 * Head of every /admin page: keeps search engines from indexing it (robots.txt asks them not to crawl it either) and clears the
 * description, canonical and social tags a prerendered website page may have left behind.
 */
const useNoIndex = () => {
  useEffect(() => {
    document.title = "feedXchange";
    document.head
      .querySelectorAll('meta[name="description"], meta[name="twitter:card"], meta[property^="og:"], link[rel="canonical"]')
      .forEach((element) => element.remove());
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    // the admin app's compact type and control sizes (tokens.scss); index.html sets it before the first paint as well
    document.documentElement.setAttribute("data-app", "admin");
    return () => {
      meta.remove();
      document.documentElement.setAttribute("data-app", "site");
    };
  }, []);
};

/**
 * Everything the signed-in application needs and the public website must not pay for: login session, live notifications, the selected
 * contract, and the admin styles. Mounted at /admin, so none of it loads for a visitor reading the website.
 */
const AdminShell = () => {
  useNoIndex();
  return (
    <AuthProvider>
      <NotificationProvider>
        <AutoNotifyProvider>
          <SelectedContractProvider>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </SelectedContractProvider>
        </AutoNotifyProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AdminShell;
