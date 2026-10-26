import type { ReactNode } from "react";

interface FormFieldProps {
  /** Id of the control, so the label points at it and the error is announced with it. */
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Full width in the two-column grid. */
  wide?: boolean;
  /** Custom controls (dropdowns, date pickers) are not native inputs, so the label can't point at them. */
  plainLabel?: boolean;
  children: ReactNode;
}

/** Label + control + hint/error, laid out for the user panel's grid. */
const FormField = ({ id, label, required, error, hint, wide, plainLabel, children }: FormFieldProps) => {
  const text = (
    <>
      {label} {required && <span className="user-panel__required" aria-hidden>*</span>}
    </>
  );

  return (
    <div className={`user-panel__field ${wide ? "user-panel__field--wide" : ""}`}>
      {plainLabel ? (
        <span className="user-panel__label" id={`${id}-label`}>
          {text}
        </span>
      ) : (
        <label htmlFor={id} className="user-panel__label">
          {text}
        </label>
      )}
      {children}
      {hint && <small className="user-panel__hint">{hint}</small>}
      {error && (
        <small id={`${id}-error`} className="user-panel__error">
          {error}
        </small>
      )}
    </div>
  );
};

export default FormField;
