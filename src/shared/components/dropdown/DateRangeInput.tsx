import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarIcon, ICON_STROKE_FINE } from "../icon";
import FieldClear from "./FieldClear";
import Calendar, { formatDisplayDate } from "./Calendar";
import { useAnchoredPanel } from "./useAnchoredPanel";
import "./DateRangeInput.scss";

interface DateRangeInputProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const DateRangeInput = ({ from, to, onChange, placeholder = "Select Date Range", ariaLabel }: DateRangeInputProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // A calendar is a fixed size, so it hangs from the trigger's edge rather than matching its width.
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

  // First click starts a range, second click ends it (whichever order the dates were picked in).
  const pickDay = (iso: string) => {
    if (!from || to) {
      onChange(iso, "");
      return;
    }
    if (iso < from) onChange(iso, from);
    else onChange(from, iso);
    setOpen(false);
  };

  const hasValue = Boolean(from || to);
  const displayValue = hasValue
    ? `${from ? formatDisplayDate(from) : "dd-mm-yyyy"} to ${to ? formatDisplayDate(to) : "dd-mm-yyyy"}`
    : "";

  return (
    <div className="date-range-input" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="date-range-input__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className={hasValue ? "" : "is-placeholder"}>{displayValue || placeholder}</span>
        <span className="date-range-input__trigger-icons">
          {hasValue && (
            <FieldClear label="Clear date range" onClear={() => onChange("", "")} />
          )}
          <CalendarIcon size={14} strokeWidth={ICON_STROKE_FINE} aria-hidden />
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="date-range-input__panel"
            role="dialog"
            aria-label="Select date range"
            ref={panelRef}
            style={panelStyle}
          >
            <Calendar from={from} to={to} onPick={pickDay} />
            <p className="date-range-input__hint">
              {!from || to ? "Pick the first date" : "Now pick the last date"}
              {hasValue && <span> · {displayValue}</span>}
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default DateRangeInput;
