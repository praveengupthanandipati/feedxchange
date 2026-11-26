import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "../../../../../shared/components/icon";

type Icon = typeof CheckIcon;

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  icon: Icon;
  /** Shown on hover. */
  hint?: string;
}

interface FilterDropdownProps<T extends string> {
  /** The filter's name, for screen readers (the visible heading sits above it). */
  label: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  /** The value that means "no filter": the box is drawn plain while it is chosen. */
  emptyValue: T;
}

/**
 * Single-select dropdown for the Schedules Management filters. Unlike a native select, the list shows each option's icon and a tick
 * on the chosen one. Opens on click or Arrow Down; Arrow keys move, Enter / Space picks, Escape or a click outside closes.
 */
const FilterDropdown = <T extends string>({ label, value, options, onChange, emptyValue }: FilterDropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];
  const SelectedIcon = selected?.icon ?? CheckIcon;

  // Close on a click outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const pick = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="schedules-mgmt__dd" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`schedules-mgmt__dd-button${value !== emptyValue ? " is-set" : ""}${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={`${label}: ${selected?.label ?? ""}`}
        title={selected?.hint ?? selected?.label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <SelectedIcon aria-hidden className="schedules-mgmt__dd-icon" />
        <span className="schedules-mgmt__dd-text">{selected?.label}</span>
        <ChevronDownIcon aria-hidden className="schedules-mgmt__dd-caret" />
      </button>

      {open && (
        <ul id={listId} role="listbox" aria-label={label} className="schedules-mgmt__dd-list">
          {options.map((o, i) => {
            const OptionIcon = o.icon;
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                className={`schedules-mgmt__dd-option${i === active ? " is-active" : ""}${isSelected ? " is-selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                // mousedown, so the click lands before the outside-click handler and focus stay sane
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(i);
                }}
              >
                <OptionIcon aria-hidden className="schedules-mgmt__dd-icon" />
                {/* the hint on the text, not the option, so the option is still announced by its name */}
                <span title={o.hint}>{o.label}</span>
                {isSelected && <CheckIcon aria-hidden className="schedules-mgmt__dd-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;
