import { NavLink } from "react-router-dom";
import { navItems } from "../../../features/website/data/content";
import { sitePaths } from "../../../features/website/routes/paths";
import ProductsDropdown from "./ProductsDropdown";

/** Centre menu for laptops and desktops (xl+). Phones and tablets use the off-canvas menu. */
const DesktopNav = () => (
  <nav className="site-nav" aria-label="Website">
    <ul className="site-nav__list">
      {navItems.map((item) =>
        item.children ? (
          <ProductsDropdown key={item.to} item={item} />
        ) : (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === sitePaths.home} className={({ isActive }) => `site-nav__link ${isActive ? "is-active" : ""}`}>
              {item.label}
            </NavLink>
          </li>
        ),
      )}
    </ul>
  </nav>
);

export default DesktopNav;
