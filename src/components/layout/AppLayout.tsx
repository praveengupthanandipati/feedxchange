import { useState } from "react";
import { Outlet } from "react-router-dom";
import Aside from "../asidemenu/aside";
import Header from "../header/Header";

const AppLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
