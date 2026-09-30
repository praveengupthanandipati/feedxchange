import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./DateRangeInput.scss";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** The month a date falls in, or the current month when there is no date yet. */
function monthOf(iso: string): { year: number; month: number } {
  const [year, month] = iso.split("-").map(Number);
  if (year && month) return { year, month: month - 1 };
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}

interface CalendarProps {
  /** yyyy-mm-dd of the range start (or the one selected date). */
  from: string;
  /** yyyy-mm-dd of the range end; leave empty for a single date. */
  to?: string;
  onPick: (iso: string) => void;
  /** Dates before this (yyyy-mm-dd) cannot be picked. */
  min?: string;
  /** Dates after this (yyyy-mm-dd) cannot be picked. */
  max?: string;
}

/**
 * A month grid used by the date pickers instead of the browser's native picker, whose popup is
 * drawn by the browser and cannot be kept inside the screen. It opens on the month of `from`
 * (or `to`), so mount it fresh each time its dropdown opens.
 */
const Calendar = ({ from, to = "", onPick, min, max }: CalendarProps) => {
  const [view, setView] = useState(() => monthOf(from || to));

  const shiftMonth = (delta: number) => {
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const now = new Date();
  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <>
      <div className="date-range-input__month">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <FiChevronLeft aria-hidden />
        </button>
        <strong>
          {MONTHS[view.month]} {view.year}
        </strong>
        <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
          <FiChevronRight aria-hidden />
        </button>
      </div>

      <div className="date-range-input__days" role="grid">
        {WEEKDAYS.map((weekday) => (
          <span className="date-range-input__weekday" key={weekday}>
            {weekday}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const iso = toIso(view.year, view.month, day);
          const isEdge = iso === from || iso === to;
          const inRange = Boolean(from && to && iso > from && iso < to);
          const disabled = Boolean((min && iso < min) || (max && iso > max));
          const classes = [
            "date-range-input__day",
            isEdge ? "is-edge" : "",
            inRange ? "is-in-range" : "",
            iso === todayIso ? "is-today" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              type="button"
              key={iso}
              className={classes}
              onClick={() => onPick(iso)}
              disabled={disabled}
              aria-pressed={isEdge}
              aria-label={formatDisplayDate(iso)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Calendar;
