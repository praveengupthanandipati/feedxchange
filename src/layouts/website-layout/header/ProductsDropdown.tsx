import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { ArrowRightIcon, ChevronDownIcon, ChevronRightIcon } from "../../../shared/components/icon";
import { Link, useLocation } from "react-router-dom";
import { catalogueCategories, categoryForSlug, productsIn, type NavItem } from "../../../features/website/data/content";
import { productPath, sitePaths } from "../../../features/website/routes/paths";

const CLOSE_DELAY = 160;

/** Category of the product page you're on, so the menu opens on it; otherwise the first category. */
const startCategory = (pathname: string) => {
  const slug = pathname.startsWith(`${sitePaths.products}/`) ? pathname.slice(sitePaths.products.length + 1) : "";
  return categoryForSlug(slug)?.id ?? catalogueCategories[0].id;
};

/**
 * Desktop "Products" menu: categories on the left, the chosen category's products on the right.
 * Hovering or clicking a category shows its products; clicking a product opens its page.
 * The menu opens on hover (with a short close delay so the pointer can cross the gap), on click / tap,
 * and from the keyboard; Esc or leaving it closes it.
 */
const ProductsDropdown = ({ item }: { item: NavItem }) => {
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(() => startCategory(pathname));
  const closeTimer = useRef<number | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const listId = useId();
  const active = pathname.startsWith(sitePaths.products);

  const category = catalogueCategories.find((entry) => entry.id === categoryId) ?? catalogueCategories[0];
  const items = productsIn(category.id);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const openNow = () => {
    cancelClose();
    setOpen(true);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  // Close after navigating (and re-centre on the new page's category); clear any pending timer on unmount.
  useEffect(() => {
    setOpen(false);
    setCategoryId(startCategory(pathname));
  }, [pathname, search]);
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

  const tab = open ? 0 : -1;

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

      <div id={panelId} className="nav-dropdown__panel nav-mega">
        <div className="nav-mega__body">
          {/* ---------- Categories ---------- */}
          <ul className="nav-mega__categories" aria-label="Product categories">
            {catalogueCategories.map((entry) => {
              const selected = entry.id === category.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`nav-mega__category ${selected ? "is-active" : ""}`}
                    aria-expanded={selected}
                    aria-controls={listId}
                    tabIndex={tab}
                    onMouseEnter={() => setCategoryId(entry.id)}
                    onFocus={() => setCategoryId(entry.id)}
                    onClick={() => setCategoryId(entry.id)}
                  >
                    <span>
                      <strong>{entry.name}</strong>
                      <small>{productsIn(entry.id).length} products</small>
                    </span>
                    <ChevronRightIcon aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ---------- Products in the chosen category ---------- */}
          <div id={listId} className="nav-mega__products" aria-live="polite">
            <p className="nav-mega__title">{category.name}</p>
            {/* Keyed so the list fades in again when the category changes. */}
            <ul key={category.id}>
              {items.map((product) => (
                <li key={product.slug}>
                  <Link to={productPath(product.slug)} className={`nav-mega__product ${pathname === productPath(product.slug) ? "is-current" : ""}`} tabIndex={tab}>
                    {product.name}
                    <ArrowRightIcon aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to={`${sitePaths.products}?category=${category.id}`} className="nav-mega__more" tabIndex={tab}>
              View all {category.name} <ArrowRightIcon aria-hidden />
            </Link>
          </div>
        </div>

        <Link to={sitePaths.products} className="nav-dropdown__all" tabIndex={tab}>
          View all products <ArrowRightIcon aria-hidden />
        </Link>
      </div>
    </li>
  );
};

export default ProductsDropdown;
