const HAS_TIMEZONE = /(z|[+-]\d{2}:?\d{2})$/i;

/**
 * API timestamps are UTC but come back without a timezone designator
 * ("2026-09-22T14:59:00"), which `new Date()` reads as local time — showing IST
 * values 5:30 behind what was actually saved. Treat a naked timestamp as UTC.
 */
export function parseApiDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const date = new Date(HAS_TIMEZONE.test(trimmed) ? trimmed : `${trimmed}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** dd/mm/yyyy hh:mm in the viewer's own timezone. */
export function formatApiDateTime(value: string | null | undefined, fallback = "-"): string {
  const date = parseApiDateTime(value);
  if (!date) return fallback;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}

/** Splits an API timestamp into the yyyy-mm-dd and hh:00 values a form's date and time inputs take. */
export function splitApiDateTimeForForm(value: string | null | undefined): {
  date: string;
  time: string;
} {
  const parsed = parseApiDateTime(value);
  if (!parsed) return { date: "", time: "" };

  const date = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(
    parsed.getDate(),
  ).padStart(2, "0")}`;
  return { date, time: `${String(parsed.getHours()).padStart(2, "0")}:00` };
}
