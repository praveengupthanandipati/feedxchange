import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import type { SearchableSelectOption } from "./SearchableSelect";
import "./MultiSelect.scss";

interface MultiSelectProps {
  options: SearchableSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ariaLabel,
  disabled = false,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

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

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeValue = (optionValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter((item) => item !== optionValue));
  };

  return (
    <div className="multi-select" ref={rootRef}>
      <button
        type="button"
        className="multi-select__trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        {selectedOptions.length === 0 ? (
          <span className="multi-select__placeholder">{placeholder}</span>
        ) : (
          <span className="multi-select__chips">
            {selectedOptions.map((option) => (
              <span className="multi-select__chip" key={option.value}>
                {option.label}
                <span
                  className="multi-select__chip-remove"
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${option.label}`}
                  onClick={(event) => removeValue(option.value, event)}
                >
                  <FiX aria-hidden />
                </span>
              </span>
            ))}
          </span>
        )}
        <FiChevronDown className={open ? "is-open" : ""} aria-hidden />
      </button>

      {open && (
        <div className="multi-select__panel">
          <div className="multi-select__search">
            <FiSearch aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
            />
          </div>
          <ul className="multi-select__options" role="listbox" aria-multiselectable="true">
            {filteredOptions.length === 0 ? (
              <li className="multi-select__empty">No matches</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={isSelected ? "is-selected" : ""}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleValue(option.value)}
                    >
                      <input type="checkbox" checked={isSelected} readOnly tabIndex={-1} />
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
