import { useEffect, useState } from "react";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navLinks } from "../../data/content";
import { sitePaths } from "../../routes/paths";
import Logo from "../common/Logo";

/** Sticky site header: gains a shadow once the page scrolls; links collapse into a drawer on phones and tablets. */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  // Close the drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc closes the drawer, and the page behind it stops scrolling while it's open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-container site-header__inner">
        <Logo />

        <nav id="site-menu" className={`site-nav ${menuOpen ? "is-open" : ""}`} aria-label="Website">
          <ul className="site-nav__list">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end className={({ isActive }) => `site-nav__link ${isActive ? "is-active" : ""}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="site-nav__actions">
            <Link to={sitePaths.login} className="site-nav__login">
              Login
            </Link>
            <Link to={sitePaths.contact} className="btn-site btn-site--primary">
              Get Started <FiArrowRight aria-hidden />
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="site-header__toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <FiX aria-hidden /> : <FiMenu aria-hidden />}
        </button>
      </div>
      {menuOpen && <button type="button" className="site-header__backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    </header>
  );
};

export default Header;
