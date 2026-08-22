import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiPlus, FiSearch, FiX } from "react-icons/fi";
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
  /** When true, shows a "+" button beside the search box that saves the typed text as a new option, appended to the end of the list. */
  allowCustom?: boolean;
  disabled?: boolean;
  /** When true, shows an "x" button in the trigger to clear the current value once one is selected. */
  clearable?: boolean;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ariaLabel,
  allowCustom = false,
  disabled = false,
  clearable = false,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customOptions, setCustomOptions] = useState<SearchableSelectOption[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Custom items are saved here and always rendered at the end of the list.
  const allOptions = useMemo(() => [...options, ...customOptions], [options, customOptions]);

  const knownLabel = allOptions.find((option) => option.value === value)?.label;
  const selectedLabel = knownLabel ?? (allowCustom && value ? value : undefined);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return allOptions;
    const q = query.trim().toLowerCase();
    return allOptions.filter((option) => option.label.toLowerCase().includes(q));
  }, [allOptions, query]);

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

  // Saves the typed query as a new option (or selects it if it already exists).
  const handleAddCustom = () => {
    const label = query.trim();
    if (!label) return;

    const existing = allOptions.find(
      (option) => option.label.toLowerCase() === label.toLowerCase(),
    );
    if (existing) {
      handleSelect(existing);
      return;
    }

    const newOption: SearchableSelectOption = { value: label, label };
    setCustomOptions((prev) => [...prev, newOption]);
    handleSelect(newOption);
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
        disabled={disabled}
      >
        <span>{selectedLabel ?? placeholder}</span>
        <span className="searchable-select__trigger-icons">
          {clearable && value && (
            <FiX
              className="searchable-select__clear"
              aria-label="Clear selection"
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  onChange("");
                }
              }}
            />
          )}
          <FiChevronDown className={open ? "is-open" : ""} aria-hidden />
        </span>
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
              placeholder={allowCustom ? "Search or add new..." : "Search..."}
              onKeyDown={(event) => {
                if (allowCustom && event.key === "Enter") {
                  event.preventDefault();
                  handleAddCustom();
                }
              }}
            />
            {allowCustom && (
              <button
                type="button"
                className="searchable-select__add"
                onClick={handleAddCustom}
                aria-label="Add custom item"
                title="Save as new option"
              >
                <FiPlus aria-hidden />
              </button>
            )}
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
