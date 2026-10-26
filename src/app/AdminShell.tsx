import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import "../shared/assets/styles/App.scss";
import { SelectedContractProvider } from "../core/context/SelectedContractContext";
import { AuthProvider } from "../core/auth/AuthContext";
import { NotificationProvider } from "../shared/notifications/NotificationProvider";
import { AutoNotifyProvider } from "../shared/notifications/AutoNotifyProvider";
import PageLoader from "../shared/components/loader/PageLoader";

/** Tells search engines to keep every /admin page out of their index (robots.txt asks them not to crawl it either). */
const useNoIndex = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
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
