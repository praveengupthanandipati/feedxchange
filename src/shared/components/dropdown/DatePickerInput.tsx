import { useEffect, useRef, useState, type Ref } from "react";
import { createPortal } from "react-dom";
import { FiCalendar, FiX } from "react-icons/fi";
import Calendar, { formatDisplayDate } from "./Calendar";
import { useAnchoredPanel } from "./useAnchoredPanel";
import "./DateRangeInput.scss";

interface DatePickerInputProps {
  /** yyyy-mm-dd, or "" for no date. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  /** Id for the trigger, so a <label htmlFor> can point at it. */
  id?: string;
  /** Ref to the trigger button, e.g. to focus it when a dialog opens. */
  buttonRef?: Ref<HTMLButtonElement>;
  min?: string;
  max?: string;
  disabled?: boolean;
  /** Shows an "x" to clear the date once one is chosen. */
  clearable?: boolean;
}

/**
 * Single-date field with its own calendar dropdown, in place of <input type="date">. The native
 * picker's popup is drawn by the browser and overflows small screens; this one is kept inside the
 * viewport like the other dropdowns.
 */
const DatePickerInput = ({
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  ariaLabel,
  id,
  buttonRef,
  min,
  max,
  disabled = false,
  clearable = false,
}: DatePickerInputProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { panelStyle } = useAnchoredPanel(open, triggerRef, { minWidth: 288, chromeHeight: 0, fitContent: "left" });

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="date-range-input" ref={rootRef}>
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof buttonRef === "function") buttonRef(node);
          else if (buttonRef) buttonRef.current = node;
        }}
        id={id}
        type="button"
        className="date-range-input__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className={value ? "" : "is-placeholder"}>{value ? formatDisplayDate(value) : placeholder}</span>
        <span className="date-range-input__trigger-icons">
          {clearable && value && (
            <FiX
              className="date-range-input__clear"
              aria-label="Clear date"
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
          <FiCalendar aria-hidden />
        </span>
      </button>

      {open &&
        createPortal(
          <div className="date-range-input__panel" role="dialog" aria-label="Select date" ref={panelRef} style={panelStyle}>
            <Calendar
              from={value}
              min={min}
              max={max}
              onPick={(iso) => {
                onChange(iso);
                setOpen(false);
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default DatePickerInput;
