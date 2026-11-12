// Financial Year has no backing reference-data endpoint yet, so the list is worked out here.
// Indian financial year: 1 April to 31 March, written "2026-2027".

const FIRST_FINANCIAL_YEAR_START = 2021;

/** The financial year a date (ISO "yyyy-mm-dd…" or Date) falls in, e.g. 2026-11-11 -> "2026-2027". */
export function financialYearOf(value: string | Date = new Date()): string {
  const date = typeof value === "string" ? new Date(value.slice(0, 10) + "T00:00:00") : value;
  // The API's empty date (0001-01-01) and anything unreadable count as "today".
  const valid = !Number.isNaN(date.getTime()) && date.getFullYear() >= 2000 ? date : new Date();
  const startYear = valid.getMonth() >= 3 ? valid.getFullYear() : valid.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}

/** Every financial year from 2021-2022 up to the later of the current one and `latest`. */
export function financialYearOptionsUpTo(latest?: string): { value: string; label: string }[] {
  const latestStart = Number((latest ?? "").slice(0, 4));
  // Only a real year widens the list (never a stray "0-1" from an empty date).
  const known = Number.isFinite(latestStart) && latestStart >= 2000 ? latestStart : null;
  const lastStart = Math.max(Number(financialYearOf().slice(0, 4)), known ?? 0);
  const firstStart = Math.min(FIRST_FINANCIAL_YEAR_START, known ?? FIRST_FINANCIAL_YEAR_START);
  const options = [];
  for (let start = firstStart; start <= lastStart; start += 1) {
    const value = `${start}-${start + 1}`;
    options.push({ value, label: value });
  }
  return options;
}
