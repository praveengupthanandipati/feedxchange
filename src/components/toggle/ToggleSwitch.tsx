import "./ToggleSwitch.scss";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const ToggleSwitch = ({
  checked,
  onChange,
  onLabel = "Yes",
  offLabel = "No",
  ariaLabel,
  disabled = false,
}: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`toggle-switch ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch__track">
        <span className="toggle-switch__thumb" />
      </span>
      <span className="toggle-switch__label">{checked ? onLabel : offLabel}</span>
    </button>
  );
};

export default ToggleSwitch;
