import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { ArrowRightIcon, ChevronDownIcon, PackageIcon } from "../../../shared/components/icon";
import { Link, useLocation } from "react-router-dom";
import { products, type NavItem } from "../../../features/website/data/content";
import { productPath, sitePaths } from "../../../features/website/routes/paths";

const CLOSE_DELAY = 160;

/**
 * Desktop "Products" menu. Opens on hover (with a short close delay so the pointer can cross the gap),
 * on click / tap, and from the keyboard; Esc or leaving it closes it. The panel fades and lifts in with CSS.
 */
const ProductsDropdown = ({ item }: { item: NavItem }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { pathname } = useLocation();
  const active = pathname.startsWith(sitePaths.products);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const openNow = () => {
    cancelClose();
    setOpen(true);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  // Close after navigating, and clear any pending timer on unmount.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Keyboard users tabbing out of the menu close it.
  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  };

  return (
    <li className={`nav-dropdown ${open ? "is-open" : ""}`} onMouseEnter={openNow} onMouseLeave={closeSoon} onBlur={handleBlur}>
      <button
        ref={triggerRef}
        type="button"
        className={`site-nav__link nav-dropdown__trigger ${active ? "is-active" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? setOpen(false) : openNow())}
      >
        {item.label}
        <ChevronDownIcon aria-hidden className="nav-dropdown__chevron" />
      </button>

      <div id={panelId} className="nav-dropdown__panel">
        <ul className="nav-dropdown__grid">
          {products.map((product) => (
            <li key={product.slug}>
              <Link to={productPath(product.slug)} className="nav-dropdown__item" tabIndex={open ? 0 : -1}>
                <span className="nav-dropdown__icon">
                  <PackageIcon aria-hidden />
                </span>
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.summary}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to={sitePaths.products} className="nav-dropdown__all" tabIndex={open ? 0 : -1}>
          View all products <ArrowRightIcon aria-hidden />
        </Link>
      </div>
    </li>
  );
};

export default ProductsDropdown;
