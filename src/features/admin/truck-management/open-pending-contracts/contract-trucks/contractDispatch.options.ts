export const timeOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  return { value, label: value };
});

/** The current time as HH:MM (hours and minutes), for time fields that start at "now" and can be changed. */
export const currentTimeValue = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

/** Today's date as YYYY-MM-DD (the earliest date a new instant / schedule truck can be given). */
export const todayDateValue = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** True when the date (YYYY-MM-DD) and time (HH:MM) are before the current minute; false when either is empty. */
export const isPastDateTime = (date: string, time: string): boolean => {
  if (!date || !time) return false;
  const chosen = new Date(`${date}T${time}`);
  const now = new Date();
  now.setSeconds(0, 0);
  return !Number.isNaN(chosen.getTime()) && chosen.getTime() < now.getTime();
};
