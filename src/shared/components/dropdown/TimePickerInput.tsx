import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClockIcon, ICON_STROKE_FINE } from "../icon";
import { useAnchoredPanel } from "./useAnchoredPanel";
import "./TimePickerInput.scss";

interface TimePickerInputProps {
  /** HH:MM (24-hour), or "" for no time. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest time that may be picked (HH:MM); earlier hours / minutes are shown greyed out. */
  min?: string;
  ariaLabel?: string;
  id?: string;
  /** Class for the text field, so it matches the screen's other fields. */
  className?: string;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const split = (value: string) => {
  const [h = "", m = ""] = value.split(":");
  return { h: h.slice(0, 2), m: m.slice(0, 2) };
};

/**
 * Time field: type the time (HH:MM) or pick it from a small panel with an Hours and a Minutes column, each showing
 * five rows. Used instead of the browser's own time popup, whose size cannot be changed.
 */
const TimePickerInput = ({ value, onChange, min, ariaLabel = "Time", id, className = "", disabled = false }: TimePickerInputProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLUListElement>(null);
  const minutesRef = useRef<HTMLUListElement>(null);
  const { panelStyle } = useAnchoredPanel(open, rootRef, { minWidth: 136, chromeHeight: 0, fitContent: "right" });

  const { h, m } = split(value);
  const minParts = min ? split(min) : null;
  const hourDisabled = (hour: string) => Boolean(minParts && hour < minParts.h);
  const minuteDisabled = (minute: string, hour = h) => Boolean(minParts && (hour < minParts.h || (hour === minParts.h && minute < minParts.m)));

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Opening scrolls the chosen hour and minute into view.
  useLayoutEffect(() => {
    if (!open) return;
    hoursRef.current?.querySelector<HTMLElement>(".is-selected")?.scrollIntoView({ block: "center" });
    minutesRef.current?.querySelector<HTMLElement>(".is-selected")?.scrollIntoView({ block: "center" });
  }, [open]);

  const pickHour = (hour: string) => {
    if (hourDisabled(hour)) return;
    // Keep the minutes; move them up to the earliest allowed minute if the new hour needs it.
    let minute = m || "00";
    if (minuteDisabled(minute, hour) && minParts) minute = minParts.m;
    onChange(`${hour}:${minute}`);
  };
  const pickMinute = (minute: string) => {
    const hour = h || "00";
    if (minuteDisabled(minute, hour)) return;
    onChange(`${hour}:${minute}`);
    setOpen(false);
  };

  return (
    <div className="time-picker" ref={rootRef}>
      <input
        id={id}
        type="time"
        className={`${className} time-picker__input`.trim()}
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        disabled={disabled}
      />
      <button
        type="button"
        className="time-picker__toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Choose ${ariaLabel.toLowerCase()}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
      >
        <ClockIcon size={14} strokeWidth={ICON_STROKE_FINE} aria-hidden />
      </button>

      {open &&
        createPortal(
          <div className="time-picker__panel" role="dialog" aria-label={`Choose ${ariaLabel.toLowerCase()}`} ref={panelRef} style={panelStyle}>
            <div className="time-picker__column">
              <span className="time-picker__heading">Hrs</span>
              <ul className="time-picker__list" role="listbox" aria-label="Hours" ref={hoursRef}>
                {HOURS.map((hour) => (
                  <li key={hour}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={hour === h}
                      className={hour === h ? "is-selected" : ""}
                      disabled={hourDisabled(hour)}
                      onClick={() => pickHour(hour)}
                    >
                      {hour}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="time-picker__column">
              <span className="time-picker__heading">Min</span>
              <ul className="time-picker__list" role="listbox" aria-label="Minutes" ref={minutesRef}>
                {MINUTES.map((minute) => (
                  <li key={minute}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={minute === m}
                      className={minute === m ? "is-selected" : ""}
                      disabled={minuteDisabled(minute, h || "00")}
                      onClick={() => pickMinute(minute)}
                    >
                      {minute}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TimePickerInput;
