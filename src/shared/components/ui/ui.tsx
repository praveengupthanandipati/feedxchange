import { forwardRef, useId } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { IconComponent } from "../icon";
import "./ui.scss";

// Shared building blocks, built on the design tokens and the compact density. New screens use these; existing screens move
// to them module by module. Every one passes unknown props (className, data-*, aria-*) through to its element.

// ---------------------------------------------------------------- Button

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: navy fill; secondary: outlined; ghost: text only; danger: red fill; accent: orange fill. */
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: IconComponent;
  /** Only an icon: give the button an aria-label. */
  iconOnly?: boolean;
  /** Shows a spinner, keeps the width and blocks clicks. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", icon: Glyph, iconOnly = false, loading = false, className = "", children, disabled, type = "button", ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${iconOnly ? "ui-btn--icon" : ""} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="ui-spinner" aria-hidden /> : Glyph && <Glyph size={size === "sm" ? 16 : "1.15em"} />}
      {!iconOnly && children}
    </button>
  ),
);
Button.displayName = "Button";

// ---------------------------------------------------------------- Field (label, hint, error) + Input / Select

interface FieldProps {
  label?: ReactNode;
  /** Help under the control. */
  hint?: ReactNode;
  /** Error under the control; marks it aria-invalid and links it with aria-describedby. */
  error?: ReactNode;
  required?: boolean;
  className?: string;
}

const useFieldIds = (id?: string) => {
  const generated = useId();
  const controlId = id ?? generated;
  return { controlId, hintId: `${controlId}-hint`, errorId: `${controlId}-error` };
};

const Field = ({ label, hint, error, required, className = "", controlId, hintId, errorId, children }: FieldProps & ReturnType<typeof useFieldIds> & { children: ReactNode }) => (
  <div className={`ui-field ${error ? "ui-field--invalid" : ""} ${className}`}>
    {label && (
      <label className="ui-field__label" htmlFor={controlId}>
        {label}
        {required && <span className="ui-field__required" aria-hidden> *</span>}
      </label>
    )}
    {children}
    {hint && !error && (
      <small id={hintId} className="ui-field__hint">
        {hint}
      </small>
    )}
    {error && (
      <small id={errorId} className="ui-field__error" role="alert">
        {error}
      </small>
    )}
  </div>
);

const describedBy = (hint: unknown, error: unknown, ids: { hintId: string; errorId: string }, own?: string) =>
  [own, error ? ids.errorId : hint ? ids.hintId : undefined].filter(Boolean).join(" ") || undefined;

export type InputProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { icon?: IconComponent; fieldClassName?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, required, id, icon: Glyph, className = "", fieldClassName, ...rest }, ref) => {
    const ids = useFieldIds(id);
    return (
      <Field label={label} hint={hint} error={error} required={required} className={fieldClassName} {...ids}>
        <span className={`ui-control ${Glyph ? "ui-control--icon" : ""}`}>
          {Glyph && <Glyph size={16} className="ui-control__icon" />}
          <input
            ref={ref}
            id={ids.controlId}
            className={`ui-input ${className}`}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(hint, error, ids, rest["aria-describedby"])}
            {...rest}
          />
        </span>
      </Field>
    );
  },
);
Input.displayName = "Input";

export type SelectProps = FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & { fieldClassName?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, required, id, className = "", fieldClassName, children, ...rest }, ref) => {
    const ids = useFieldIds(id);
    return (
      <Field label={label} hint={hint} error={error} required={required} className={fieldClassName} {...ids}>
        <select
          ref={ref}
          id={ids.controlId}
          className={`ui-select ${className}`}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint, error, ids, rest["aria-describedby"])}
          {...rest}
        >
          {children}
        </select>
      </Field>
    );
  },
);
Select.displayName = "Select";

// ---------------------------------------------------------------- Card

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  /** Buttons or links at the right of the title. */
  actions?: ReactNode;
  as?: "section" | "div" | "article";
}

export const Card = ({ title, actions, as: Element = "section", className = "", children, ...rest }: CardProps) => (
  <Element className={`ui-card ${className}`} {...rest}>
    {(title || actions) && (
      <header className="ui-card__header">
        {title && <h2 className="ui-card__title">{title}</h2>}
        {actions && <div className="ui-card__actions">{actions}</div>}
      </header>
    )}
    {children}
  </Element>
);

// ---------------------------------------------------------------- Badge

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "primary";

export const Badge = ({ tone = "neutral", icon: Glyph, className = "", children, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; icon?: IconComponent }) => (
  <span className={`ui-badge ui-badge--${tone} ${className}`} {...rest}>
    {Glyph && <Glyph size={16} />}
    {children}
  </span>
);

// ---------------------------------------------------------------- PageHeader

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons at the right (below the title on phones). */
  actions?: ReactNode;
  /** A link back, shown above the title. */
  back?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, actions, back, className = "" }: PageHeaderProps) => (
  <header className={`ui-page-header ${className}`}>
    <div className="ui-page-header__text">
      {back && <div className="ui-page-header__back">{back}</div>}
      <h1 className="ui-page-header__title">{title}</h1>
      {description && <p className="ui-page-header__description">{description}</p>}
    </div>
    {actions && <div className="ui-page-header__actions">{actions}</div>}
  </header>
);

// ---------------------------------------------------------------- EmptyState

export interface EmptyStateProps {
  icon?: IconComponent;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon: Glyph, title, description, action, className = "" }: EmptyStateProps) => (
  <div className={`ui-empty ${className}`} role="status">
    {Glyph && (
      <span className="ui-empty__icon">
        <Glyph size={24} />
      </span>
    )}
    <p className="ui-empty__title">{title}</p>
    {description && <p className="ui-empty__description">{description}</p>}
    {action && <div className="ui-empty__action">{action}</div>}
  </div>
);

// ---------------------------------------------------------------- Skeleton

export interface SkeletonProps {
  /** Number of text lines. */
  lines?: number;
  /** A single block instead of lines (an image, a chart). */
  height?: string;
  width?: string;
  className?: string;
}

/** Placeholder while content loads. Screen readers hear "Loading" once, from the wrapper. */
export const Skeleton = ({ lines = 1, height, width, className = "" }: SkeletonProps) => (
  <span className={`ui-skeleton ${className}`} role="status" aria-label="Loading">
    {height ? (
      <span className="ui-skeleton__block" style={{ height, width }} />
    ) : (
      Array.from({ length: lines }, (_, index) => (
        <span key={index} className="ui-skeleton__line" style={{ width: index === lines - 1 && lines > 1 ? "60%" : width }} />
      ))
    )}
  </span>
);
