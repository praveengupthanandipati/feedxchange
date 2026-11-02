import { useEffect, useId, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { SearchIcon } from "../../../../shared/components/icon";

export interface SiteSelectOption {
  id: string;
  name: string;
}

interface SiteSelectProps {
  /** The button's id, so the field's <label htmlFor> and "focus the first invalid field" still reach it. */
  id: string;
  value: string;
  options: SiteSelectOption[];
  /** Shown when nothing is chosen (or while the list loads / is unavailable). */
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  /** Fired when the dropdown loses focus, for "validate on blur". */
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Compact dropdown for the signup form: a button that opens a panel under the field (no wider than the field) with a search
 * box and a short list (about six rows, then it scrolls). The browser's own <select> list can't be sized or themed.
 * Keyboard: Enter / Space / Arrow Down open (focus goes to the search box); typing filters; Arrow Up / Down move;
 * Enter picks; Esc closes (back to the button); Tab closes.
 */
const SiteSelect = ({ id, value, options, placeholder, disabled = false, onChange, onBlur, invalid, describedBy }: SiteSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.id === value);

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? options.filter((option) => option.name.toLowerCase().includes(term)) : options;
  }, [options, query]);

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    if (disabled || options.length === 0) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((option) => option.id === value)));
    setOpen(true);
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const pick = (option: SiteSelectOption) => {
    onChange(option.id);
    close(true);
  };

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(shown.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (shown[active]) pick(shown[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  // Leaving the whole dropdown (button, search box and list) closes it and counts as leaving the field.
  const onLeave = (event: FocusEvent) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    setOpen(false);
    onBlur?.();
  };

  return (
    <div className="su-select" ref={rootRef}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        className={`su-select__button ${selected ? "" : "is-empty"}`}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKeyDown}
        onBlur={onLeave}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      >
        {selected?.name ?? placeholder}
      </button>

      {open && (
        <div className="su-select__panel">
          <div className="su-select__search">
            <SearchIcon aria-hidden />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              autoComplete="off"
              placeholder="Search..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKeyDown}
              onBlur={onLeave}
              aria-label="Search options"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={shown[active] ? `${listId}-${active}` : undefined}
            />
          </div>
          <ul ref={listRef} id={listId} className="su-select__list" role="listbox" aria-labelledby={id}>
            {shown.length === 0 && <li className="su-select__empty">No matches</li>}
            {shown.map((option, index) => (
              <li
                key={option.id}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={option.id === value}
                className={`su-select__option ${index === active ? "is-active" : ""}`}
                // A mouse press would blur the search box first; keep focus there and pick on click.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(option)}
              >
                {option.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SiteSelect;
