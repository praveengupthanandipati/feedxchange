import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ICON_STROKE_FINE, SearchIcon, XIcon } from "../icon";
import type { SearchableSelectOption } from "./SearchableSelect";
import { useAnchoredPanel } from "./useAnchoredPanel";
import "./MultiSelect.scss";

interface MultiSelectProps {
  options: SearchableSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  /** Keep the placeholder on the first line and show the chosen items as chips underneath (inside the same box). */
  chipsBelow?: boolean;
  /** Chip colour (default: the neutral navy tint). */
  tone?: "blue" | "green";
}

const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ariaLabel,
  disabled = false,
  chipsBelow = false,
  tone,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { panelStyle, listMaxHeight } = useAnchoredPanel(open, triggerRef);

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
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
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

  const renderChips = (extraClass: string) => (
    <span className={`multi-select__chips ${extraClass}`}>
      {selectedOptions.map((option) => (
        <span className={`multi-select__chip ${tone ? `multi-select__chip--${tone}` : ""}`} key={option.value}>
          {option.label}
          <span
            className="multi-select__chip-remove"
            role="button"
            tabIndex={-1}
            aria-label={`Remove ${option.label}`}
            onClick={(event) => removeValue(option.value, event)}
          >
            <XIcon size={12} strokeWidth={ICON_STROKE_FINE} aria-hidden />
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`multi-select ${chipsBelow ? "multi-select--below" : ""}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="multi-select__trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        {chipsBelow || selectedOptions.length === 0 ? (
          <span className="multi-select__placeholder">{placeholder}</span>
        ) : (
          renderChips("")
        )}
        <ChevronDownIcon className={open ? "is-open" : ""} size={14} strokeWidth={ICON_STROKE_FINE} aria-hidden />
        {chipsBelow && selectedOptions.length > 0 && renderChips("multi-select__chips--below")}
      </button>

      {open &&
        createPortal(
        <div className="multi-select__panel" ref={panelRef} style={panelStyle}>
          <div className="multi-select__search">
            <SearchIcon aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
            />
          </div>
          <ul
            className="multi-select__options"
            role="listbox"
            aria-multiselectable="true"
            style={{ maxHeight: listMaxHeight }}
          >
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
        </div>,
        document.body,
      )}
    </div>
  );
};

export default MultiSelect;
