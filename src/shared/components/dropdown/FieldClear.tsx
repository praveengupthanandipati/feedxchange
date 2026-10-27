import type { KeyboardEvent, MouseEvent } from "react";
import { ICON_STROKE_FINE, XIcon } from "../icon";
import "./FieldClear.scss";

interface FieldClearProps {
  /** Accessible name, e.g. "Clear selection". */
  label: string;
  onClear: () => void;
}

/**
 * The small clear "x" inside a field's trigger (SearchableSelect, DatePickerInput, DateRangeInput): a 14px icon, the same
 * size and stroke as the chevron beside it, in a 24px click area. It sits inside the trigger button, so it stops the click
 * from also opening the dropdown.
 */
const FieldClear = ({ label, onClear }: FieldClearProps) => (
  <span
    className="field-clear"
    aria-label={label}
    role="button"
    tabIndex={0}
    onClick={(event: MouseEvent) => {
      event.stopPropagation();
      onClear();
    }}
    onKeyDown={(event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.stopPropagation();
        onClear();
      }
    }}
  >
    <XIcon size={14} strokeWidth={ICON_STROKE_FINE} aria-hidden />
  </span>
);

export default FieldClear;
