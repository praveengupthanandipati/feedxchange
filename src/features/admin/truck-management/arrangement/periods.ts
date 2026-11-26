/**
 * Date periods shared by the Schedules Management dashboard and Add Trucks to Schedules: the presets, their first / last day, and
 * date helpers. Days are yyyy-MM-dd in the browser's time zone; weeks run Monday to Sunday.
 */

export type DatePreset = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth" | "custom";

export const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "thisWeek", label: "This Week" },
  { key: "lastWeek", label: "Last Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "custom", label: "Custom" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** yyyy-MM-dd of a date (local time). */
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** yyyy-MM-dd -> dd/MM/yyyy. */
export const shortDate = (key: string) => (key ? `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}` : "");

/** First and last day (yyyy-MM-dd) of a preset. */
export const presetRange = (preset: Exclude<DatePreset, "custom">, now = new Date()): [string, string] => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const addDays = (date: Date, n: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  const monday = addDays(d, -((d.getDay() + 6) % 7));
  switch (preset) {
    case "today":
      return [dayKey(d), dayKey(d)];
    case "yesterday": {
      const y = addDays(d, -1);
      return [dayKey(y), dayKey(y)];
    }
    case "thisWeek":
      return [dayKey(monday), dayKey(addDays(monday, 6))];
    case "lastWeek":
      return [dayKey(addDays(monday, -7)), dayKey(addDays(monday, -1))];
    case "lastMonth":
      return [dayKey(new Date(d.getFullYear(), d.getMonth() - 1, 1)), dayKey(new Date(d.getFullYear(), d.getMonth(), 0))];
    default:
      return [dayKey(new Date(d.getFullYear(), d.getMonth(), 1)), dayKey(new Date(d.getFullYear(), d.getMonth() + 1, 0))];
  }
};

export interface Period {
  preset: DatePreset;
  /** Used when preset is "custom". */
  from: string;
  to: string;
}
