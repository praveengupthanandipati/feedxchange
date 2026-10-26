import { useEffect, useState } from "react";
import { MenuIcon } from "../../../shared/components/icon";
import { useLocation } from "react-router-dom";
import Logo from "../../../features/website/components/common/Logo";
import DesktopNav from "./DesktopNav";
import { JoinButton, LoginLink, WhatsAppButton } from "./HeaderActions";
import MobileMenu from "./MobileMenu";
import ThemePicker from "../../../shared/theme/ThemePicker";

/**
 * Fixed site header: logo left, menu centre, "Join with us" + WhatsApp top right.
 * Below 1200px the menu moves into an off-canvas panel opened by the hamburger.
 */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  // Close the menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the menu is open: Esc closes it, and the page behind stops scrolling.
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
        <DesktopNav />
        <div className="site-header__actions">
          <LoginLink />
          <JoinButton />
          <ThemePicker triggerClassName="site-theme" />
          <WhatsAppButton />
          <button type="button" className="site-header__toggle" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label="Open menu">
            <MenuIcon aria-hidden />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
};

export default Header;
