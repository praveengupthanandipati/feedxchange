import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon, PackageIcon, SearchIcon, XIcon } from "../../../../shared/components/icon";
import { useNavigate } from "react-router-dom";
import { products } from "../../data/content";
import { productPath } from "../../routes/paths";

/** Chips under the search box. */
const POPULAR = ["Soya DOC", "Maize DDGS", "DORB", "DOC"];

/**
 * Product search (ARIA combobox). Focusing the box lists every product; typing filters by name or
 * description; ↑/↓ move the highlight, Enter opens the highlighted (or first) product, Esc closes.
 */
const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const navigate = useNavigate();

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => product.name.toLowerCase().includes(term) || product.summary.toLowerCase().includes(term));
  }, [query]);

  // Close when clicking / tapping anywhere outside the search.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const go = (slug: string) => {
    setOpen(false);
    navigate(productPath(slug));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[highlight] ?? results[0];
      if (target) go(target.slug);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const activeId = open && results[highlight] ? `${listId}-${results[highlight].slug}` : undefined;

  return (
    <div className="product-search" ref={wrapRef}>
      <div className={`product-search__box ${open ? "is-open" : ""}`}>
        <SearchIcon aria-hidden className="product-search__icon" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search products, e.g. Soya DOC"
          aria-label="Search products"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          value={query}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            type="button"
            className="product-search__clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setHighlight(0);
              inputRef.current?.focus();
            }}
          >
            <XIcon aria-hidden />
          </button>
        )}
      </div>

      <div className={`product-search__panel ${open ? "is-open" : ""}`}>
        <ul id={listId} role="listbox" aria-label="Products">
          {results.map((product, index) => (
            <li
              key={product.slug}
              id={`${listId}-${product.slug}`}
              role="option"
              aria-selected={index === highlight}
              className={index === highlight ? "is-highlighted" : ""}
              onMouseEnter={() => setHighlight(index)}
              // pointerdown would blur the input first; mousedown + preventDefault keeps focus, click navigates.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => go(product.slug)}
            >
              <span className="product-search__thumb">
                <PackageIcon aria-hidden />
              </span>
              <span className="product-search__text">
                <strong>{product.name}</strong>
                <small>{product.summary}</small>
              </span>
              <ArrowRightIcon aria-hidden className="product-search__go" />
            </li>
          ))}
        </ul>
        {results.length === 0 && (
          <p className="product-search__empty" role="status">
            No products match “{query.trim()}”.
          </p>
        )}
      </div>

      <div className="product-search__popular">
        <span>Popular Searches</span>
        <ul>
          {POPULAR.map((name) => {
            const product = products.find((item) => item.name === name);
            return (
              product && (
                <li key={name}>
                  <button type="button" onClick={() => go(product.slug)}>
                    {name}
                  </button>
                </li>
              )
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ProductSearch;
