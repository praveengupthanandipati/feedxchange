interface LookupLoadErrorProps {
  /** True when one of the lists behind the form's dropdowns failed to load. */
  failed: boolean;
  /** The screen's own error style, so the notice looks like that screen's other errors. */
  className: string;
}

/**
 * Says that a dropdown's options could not be loaded, instead of leaving the dropdown silently empty.
 * Never shows backend details.
 */
const LookupLoadError = ({ failed, className }: LookupLoadErrorProps) =>
  failed ? (
    <p className={className} role="alert">
      Some options could not be loaded, so a dropdown may be empty. Please refresh the page and try again.
    </p>
  ) : null;

export default LookupLoadError;
