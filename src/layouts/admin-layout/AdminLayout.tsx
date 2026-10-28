import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Aside from "./asidemenu/aside";
import Header from "./header/Header";
import BottomNav from "./bottomnav/BottomNav";
import PageLoader from "../../shared/components/loader/PageLoader";
import { RequireSession, RoutePermissionGate } from "../../core/auth/RouteGuard";

/** Sidebar, header and bottom bar around every signed-in screen. Each screen loads on demand inside it. */
const AdminLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RequireSession>
    <div className="app-layout">
      <Aside mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      {mobileNavOpen && (
        // a click outside closes the drawer; keyboard and screen reader users have its Close button and Escape
        <div className="app-layout__backdrop" aria-hidden onClick={() => setMobileNavOpen(false)} />
      )}

      <div className="app-layout__content">
        <Header
          title="feedXchange"
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
        />
        <main className="app-layout__body">
          <RoutePermissionGate>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </RoutePermissionGate>
        </main>
        <BottomNav />
      </div>
    </div>
    </RequireSession>
  );
};

export default AdminLayout;
