import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { CheckIcon, ContrastIcon, MonitorIcon, MoonIcon, SunIcon } from "../components/icon";
import type { IconComponent } from "../components/icon";
import { THEME_CHOICES, setThemeChoice, useThemeChoice } from "./theme";
import type { ThemeChoice } from "./theme";
import "./ThemePicker.scss";

const ICONS: Record<ThemeChoice, IconComponent> = {
  light: SunIcon,
  dark: MoonIcon,
  "high-contrast": ContrastIcon,
  system: MonitorIcon,
};

interface ThemePickerProps {
  /**
   * "menu": an icon button that opens a small menu (headers).
   * "list": every choice on the page with its description (Settings).
   */
  variant?: "menu" | "list";
  /** Classes for the menu's button, so it matches the header it sits in. */
  triggerClassName?: string;
  /** Which way the menu opens from the button. */
  align?: "start" | "end";
}

const ThemePicker = ({ variant = "menu", triggerClassName = "", align = "end" }: ThemePickerProps) => {
  const choice = useThemeChoice();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const labelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    // move focus into the menu, onto the current choice
    rootRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "list") {
    return (
      <div className="theme-picker theme-picker--list" role="radiogroup" aria-labelledby={labelId}>
        <span id={labelId} className="theme-picker__heading">
          Theme
        </span>
        {THEME_CHOICES.map(({ value, label, hint }) => {
          const Glyph = ICONS[value];
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={choice === value}
              className="theme-picker__option"
              onClick={() => setThemeChoice(value)}
            >
              <Glyph size={20} className="theme-picker__icon" />
              <span className="theme-picker__text">
                <span className="theme-picker__label">{label}</span>
                <small className="theme-picker__hint">{hint}</small>
              </span>
              {choice === value && <CheckIcon size={20} className="theme-picker__check" />}
            </button>
          );
        })}
      </div>
    );
  }

  const Current = ICONS[choice];
  const currentLabel = THEME_CHOICES.find((item) => item.value === choice)?.label ?? "";

  // arrow keys move between the choices, as in any menu
  const onMenuKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className="theme-picker theme-picker--menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`theme-picker__trigger ${triggerClassName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Theme: ${currentLabel}`}
        title="Theme"
        onClick={() => setOpen((value) => !value)}
      >
        <Current />
      </button>
      {open && (
        <div id={menuId} className={`theme-picker__menu theme-picker__menu--${align}`} role="menu" aria-label="Theme" onKeyDown={onMenuKey}>
          {THEME_CHOICES.map(({ value, label }) => {
            const Glyph = ICONS[value];
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={choice === value}
                className="theme-picker__item"
                onClick={() => {
                  setThemeChoice(value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <Glyph size={16} />
                <span>{label}</span>
                {choice === value && <CheckIcon size={16} className="theme-picker__check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
