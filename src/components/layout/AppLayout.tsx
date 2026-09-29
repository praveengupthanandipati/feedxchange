import { useState } from "react";
import { Outlet } from "react-router-dom";
import Aside from "../asidemenu/aside";
import Header from "../header/Header";
import { RequireSession, RoutePermissionGate } from "../../auth/RouteGuard";

const AppLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RequireSession>
    <div className="app-layout">
      <Aside mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      {mobileNavOpen && (
        <button
          type="button"
          className="app-layout__backdrop"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="app-layout__content">
        <Header
          title="feedXchange"
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
        />
        <main className="app-layout__body">
          <RoutePermissionGate>
            <Outlet />
          </RoutePermissionGate>
        </main>
      </div>
    </div>
    </RequireSession>
  );
};

export default AppLayout;
