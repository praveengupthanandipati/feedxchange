import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDownIcon, MailIcon, PhoneIcon, XIcon } from "../../../shared/components/icon";
import { NavLink, useLocation } from "react-router-dom";
import { company, navItems } from "../../../features/website/data/content";
import { sitePaths } from "../../../features/website/routes/paths";
import Logo from "../../../features/website/components/common/Logo";
import { JoinButton, LoginLink, WhatsAppButton } from "./HeaderActions";
import ThemePicker from "../../../shared/theme/ThemePicker";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Off-canvas menu sliding in from the right on phones and tablets. Always mounted so it can animate
 * both ways; while closed it is `inert`, so it can't be tabbed into or read out.
 */
const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const { pathname } = useLocation();
  const closeRef = useRef<HTMLButtonElement>(null);
  // The Products accordion starts open when you're already on a product page.
  const [productsOpen, setProductsOpen] = useState(pathname.startsWith(sitePaths.products));

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div className={`mobile-menu ${open ? "is-open" : ""}`} inert={!open}>
      <div className="mobile-menu__backdrop" onClick={onClose} aria-hidden />

      <aside id="mobile-menu" className="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="mobile-menu__head">
          <Logo />
          <button ref={closeRef} type="button" className="mobile-menu__close" onClick={onClose} aria-label="Close menu">
            <XIcon aria-hidden />
          </button>
        </div>

        <nav className="mobile-menu__nav" aria-label="Website">
          <ul>
            {navItems.map((item, index) => (
              <li key={item.to} style={{ "--i": index } as CSSProperties}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className={`mobile-menu__link ${pathname.startsWith(item.to) ? "is-active" : ""}`}
                      aria-expanded={productsOpen}
                      aria-controls="mobile-products"
                      onClick={() => setProductsOpen((prev) => !prev)}
                    >
                      {item.label}
                      <ChevronDownIcon aria-hidden className="mobile-menu__chevron" />
                    </button>
                    {/* Height animates smoothly via grid-template-rows 0fr → 1fr. */}
                    <div id="mobile-products" className={`mobile-menu__sub ${productsOpen ? "is-open" : ""}`}>
                      <ul>
                        <li>
                          <NavLink to={item.to} end className={({ isActive }) => `mobile-menu__sublink ${isActive ? "is-active" : ""}`} tabIndex={productsOpen ? 0 : -1}>
                            All products
                          </NavLink>
                        </li>
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <NavLink to={child.to} className={({ isActive }) => `mobile-menu__sublink ${isActive ? "is-active" : ""}`} tabIndex={productsOpen ? 0 : -1}>
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <NavLink to={item.to} end={item.to === sitePaths.home} className={({ isActive }) => `mobile-menu__link ${isActive ? "is-active" : ""}`}>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-menu__foot">
          <div className="mobile-menu__cta">
            <JoinButton className="btn-site--block" />
            <WhatsAppButton />
          </div>
          <LoginLink className="site-login--block" />
          <div className="mobile-menu__theme">
            <span>Theme</span>
            <ThemePicker triggerClassName="site-theme" align="start" />
          </div>
          <a href={`tel:${company.phone.replace(/\s/g, "")}`}>
            <PhoneIcon aria-hidden /> {company.phone}
          </a>
          <a href={`mailto:${company.email}`}>
            <MailIcon aria-hidden /> {company.email}
          </a>
        </div>
      </aside>
    </div>
  );
};

export default MobileMenu;
