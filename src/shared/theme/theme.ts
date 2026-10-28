import { useSyncExternalStore } from "react";

// The colour theme: chosen per browser (localStorage), applied as data-theme on <html>, where tokens.scss switches every
// --fx-* colour. index.html runs the same steps inline before the first paint, so a page never flashes the wrong theme;
// keep THEME_KEY and the resolution rules in step with that script.

export type ThemeChoice = "light" | "dark" | "high-contrast" | "system";
export type Theme = Exclude<ThemeChoice, "system">;

export const THEME_KEY = "fx-theme";

export const THEME_CHOICES: { value: ThemeChoice; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "The FeedXchange colours on a white page" },
  { value: "dark", label: "Dark", hint: "Light text on a dark page, easier at night" },
  { value: "high-contrast", label: "High contrast", hint: "Darker text and stronger borders" },
  { value: "system", label: "Match my device", hint: "Follows your device's light, dark or contrast setting" },
];

const DARK_QUERY = "(prefers-color-scheme: dark)";
const CONTRAST_QUERY = "(prefers-contrast: more)";

const isChoice = (value: unknown): value is ThemeChoice =>
  value === "light" || value === "dark" || value === "high-contrast" || value === "system";

export const getThemeChoice = (): ThemeChoice => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return isChoice(stored) ? stored : "light";
  } catch {
    return "light";
  }
};

const matches = (query: string) => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;

export const resolveTheme = (choice: ThemeChoice): Theme => {
  if (choice !== "system") return choice;
  if (matches(CONTRAST_QUERY)) return "high-contrast";
  return matches(DARK_QUERY) ? "dark" : "light";
};

type TauriInvoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

/** In the desktop app, the window frame (title bar) follows the theme too. */
const syncDesktopWindow = (theme: Theme) => {
  const invoke = (window as unknown as { __TAURI_INTERNALS__?: { invoke?: TauriInvoke } }).__TAURI_INTERNALS__?.invoke;
  invoke?.("plugin:window|set_theme", { label: "main", value: theme === "dark" ? "dark" : "light" }).catch(() => undefined);
};

const listeners = new Set<() => void>();

export const applyTheme = (choice: ThemeChoice = getThemeChoice()) => {
  const theme = resolveTheme(choice);
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-theme-choice", choice);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme === "dark" ? "dark" : "light");
  syncDesktopWindow(theme);
  listeners.forEach((listener) => listener());
};

export const setThemeChoice = (choice: ThemeChoice) => {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    // storage unavailable (private mode): the theme still changes for this visit
  }
  applyTheme(choice);
};

let started = false;

/** Call once at start-up: re-applies the stored choice and follows device changes while "Match my device" is chosen. */
export const startTheme = () => {
  if (started || typeof window === "undefined") return;
  started = true;
  applyTheme();
  const onDeviceChange = () => {
    if (getThemeChoice() === "system") applyTheme("system");
  };
  for (const query of [DARK_QUERY, CONTRAST_QUERY]) window.matchMedia?.(query).addEventListener?.("change", onDeviceChange);
  // another tab changed the theme
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_KEY) applyTheme();
  });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The current choice, re-rendering when it changes. */
export const useThemeChoice = (): ThemeChoice => useSyncExternalStore(subscribe, getThemeChoice, () => "light");
