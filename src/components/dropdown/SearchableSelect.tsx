import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import "./SearchableSelect.scss";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ariaLabel,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="searchable-select" ref={rootRef}>
      <button
        type="button"
        className="searchable-select__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span>{selectedLabel ?? placeholder}</span>
        <FiChevronDown className={open ? "is-open" : ""} aria-hidden />
      </button>

      {open && (
        <div className="searchable-select__panel">
          <div className="searchable-select__search">
            <FiSearch aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
            />
          </div>
          <ul className="searchable-select__options" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="searchable-select__empty">No matches</li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={option.value === value ? "is-selected" : ""}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
