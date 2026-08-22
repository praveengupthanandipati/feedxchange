import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiX } from "react-icons/fi";
import "./DateRangeInput.scss";

interface DateRangeInputProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

function formatDisplay(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
}

const DateRangeInput = ({ from, to, onChange, placeholder = "Select Date Range", ariaLabel }: DateRangeInputProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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

  const hasValue = Boolean(from || to);
  const displayValue = hasValue
    ? `${from ? formatDisplay(from) : "dd-mm-yyyy"} to ${to ? formatDisplay(to) : "dd-mm-yyyy"}`
    : "";

  return (
    <div className="date-range-input" ref={rootRef}>
      <button
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
            <FiX
              className="date-range-input__clear"
              aria-label="Clear date range"
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onChange("", "");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  onChange("", "");
                }
              }}
            />
          )}
          <FiCalendar aria-hidden />
        </span>
      </button>

      {open && (
        <div className="date-range-input__panel" role="dialog" aria-label="Select date range">
          <label className="date-range-input__field">
            <span>From</span>
            <input type="date" value={from} onChange={(event) => onChange(event.target.value, to)} />
          </label>
          <label className="date-range-input__field">
            <span>To</span>
            <input type="date" value={to} onChange={(event) => onChange(from, event.target.value)} />
          </label>
        </div>
      )}
    </div>
  );
};

export default DateRangeInput;
