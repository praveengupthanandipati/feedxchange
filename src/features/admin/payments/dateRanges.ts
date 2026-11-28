/** Date presets of the payment screens' filters (invoice date / payment date ranges). */
export const DATE_PRESETS = [
  { value: "", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This week" },
  { value: "lastWeek", label: "Last week" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The invoice-date range of a preset (weeks run Monday to Sunday). */
export const presetRange = (preset: string): { from?: string; to?: string } => {
  const now = new Date();
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const add = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  const monday = add(day, -((day.getDay() + 6) % 7));
  switch (preset) {
    case "today": return { from: ymd(day), to: ymd(day) };
    case "yesterday": return { from: ymd(add(day, -1)), to: ymd(add(day, -1)) };
    case "thisWeek": return { from: ymd(monday), to: ymd(add(monday, 6)) };
    case "lastWeek": return { from: ymd(add(monday, -7)), to: ymd(add(monday, -1)) };
    case "thisMonth": return { from: ymd(new Date(day.getFullYear(), day.getMonth(), 1)), to: ymd(new Date(day.getFullYear(), day.getMonth() + 1, 0)) };
    case "lastMonth": return { from: ymd(new Date(day.getFullYear(), day.getMonth() - 1, 1)), to: ymd(new Date(day.getFullYear(), day.getMonth(), 0)) };
    default: return {};
  }
};

