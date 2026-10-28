import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CirclePauseIcon, XIcon } from "../../../shared/components/icon";
import DatePickerInput from "../../../shared/components/dropdown/DatePickerInput";
import { toIsoEnd } from "./preferenceUtils";

interface PauseDialogProps {
  open: boolean;
  /** Who is being paused, e.g. a contact's name, "your notifications" or the business. */
  subject: string;
  busy?: boolean;
  error?: string;
  onConfirm: (resumeOn: string | null, reason: string) => void;
  onClose: () => void;
}

type Choice = "day" | "week" | "fortnight" | "date" | "open";

const CHOICES: { id: Choice; label: string; days?: number }[] = [
  { id: "day", label: "Until tomorrow", days: 1 },
  { id: "week", label: "For a week", days: 7 },
  { id: "fortnight", label: "For two weeks", days: 14 },
  { id: "date", label: "Until a date" },
  { id: "open", label: "Until I resume" },
];

const localDateInput = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Asks how long to pause notifications. A pause with a date lifts by itself when the date arrives. */
const PauseDialog = ({ open, subject, busy = false, error, onConfirm, onClose }: PauseDialogProps) => {
  const [choice, setChoice] = useState<Choice>("week");
  const [date, setDate] = useState(localDateInput(3));
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setChoice("week");
    setDate(localDateInput(3));
    setReason("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const confirm = () => {
    const days = CHOICES.find((c) => c.id === choice)?.days;
    const resumeOn = choice === "open" ? null : toIsoEnd(choice === "date" ? date : localDateInput(days ?? 1));
    onConfirm(resumeOn, reason.trim());
  };

  return createPortal(
    <div className="pref-modal__backdrop" onMouseDown={onClose}>
      <div className="pref-modal" role="dialog" aria-modal="true" aria-labelledby="pause-title" onMouseDown={(e) => e.stopPropagation()}>
        <header className="pref-modal__header">
          <span className="pref-modal__icon" aria-hidden><CirclePauseIcon /></span>
          <div>
            <h2 id="pause-title">Pause notifications</h2>
            <p>{subject} will not be notified while paused, except about events that are always sent.</p>
          </div>
          <button type="button" className="pref-modal__close" onClick={onClose} aria-label="Close"><XIcon aria-hidden /></button>
        </header>

        <div className="pref-modal__body">
          <div className="pref-choices" role="radiogroup" aria-label="How long">
            {CHOICES.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={choice === c.id} className={`pref-choice ${choice === c.id ? "is-selected" : ""}`} onClick={() => setChoice(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          {choice === "date" && (
            <div className="pref-field">
              <label htmlFor="pause-date">Resume on</label>
              <DatePickerInput id="pause-date" value={date} min={localDateInput(1)} onChange={setDate} />
            </div>
          )}

          <div className="pref-field">
            <label htmlFor="pause-reason">Reason <small>(optional)</small></label>
            <input id="pause-reason" type="text" maxLength={200} value={reason} placeholder="For example: on leave" onChange={(e) => setReason(e.target.value)} />
          </div>

          {error && <p className="pref-error" role="alert">{error}</p>}
        </div>

        <footer className="pref-modal__footer">
          <button type="button" className="pref-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="pref-btn pref-btn--primary" onClick={confirm} disabled={busy || (choice === "date" && !date)}>
            {busy ? "Pausing…" : "Pause"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};

export default PauseDialog;
