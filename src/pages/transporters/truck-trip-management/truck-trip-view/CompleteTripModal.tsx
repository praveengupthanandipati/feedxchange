import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCheckCircle } from "react-icons/fi";
import "../../../../components/dialog/ConfirmDialog.scss";
import "./CompleteTripModal.scss";

export interface CompleteTripValues {
  actualDistance: number;
  actualDuration: number;
  fuelConsumed: number;
}

interface CompleteTripModalProps {
  open: boolean;
  tripNumber: number;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (values: CompleteTripValues) => void;
}

const CompleteTripModal = ({
  open,
  tripNumber,
  submitting,
  error,
  onClose,
  onSave,
}: CompleteTripModalProps) => {
  const [actualDistance, setActualDistance] = useState("");
  const [actualDuration, setActualDuration] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  useEffect(() => {
    if (!open) return;
    setActualDistance("");
    setActualDuration("");
    setFuelConsumed("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const isValid = actualDistance !== "" && actualDuration !== "" && fuelConsumed !== "";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    onSave({
      actualDistance: Number(actualDistance),
      actualDuration: Number(actualDuration),
      fuelConsumed: Number(fuelConsumed),
    });
  };

  return createPortal(
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div
        className="confirm-dialog complete-trip-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-trip-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog__icon complete-trip-modal__icon">
          <FiCheckCircle aria-hidden />
        </div>
        <h2 id="complete-trip-modal-title" className="confirm-dialog__title">
          Complete Trip #{tripNumber}
        </h2>
        <p className="confirm-dialog__message">Enter the actual trip figures to mark it complete.</p>

        <form onSubmit={handleSubmit}>
          <div className="complete-trip-modal__field">
            <label htmlFor="actualDistance">Actual Distance (KM)</label>
            <input
              id="actualDistance"
              type="number"
              min="0"
              step="any"
              className="form-field__control"
              placeholder="Enter actual distance"
              value={actualDistance}
              onChange={(event) => setActualDistance(event.target.value)}
              required
            />
          </div>

          <div className="complete-trip-modal__field">
            <label htmlFor="actualDuration">Actual Duration (mins)</label>
            <input
              id="actualDuration"
              type="number"
              min="0"
              step="any"
              className="form-field__control"
              placeholder="Enter actual duration"
              value={actualDuration}
              onChange={(event) => setActualDuration(event.target.value)}
              required
            />
          </div>

          <div className="complete-trip-modal__field">
            <label htmlFor="fuelConsumed">Fuel Consumed (litres)</label>
            <input
              id="fuelConsumed"
              type="number"
              min="0"
              step="any"
              className="form-field__control"
              placeholder="Enter fuel consumed"
              value={fuelConsumed}
              onChange={(event) => setFuelConsumed(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="complete-trip-modal__error" role="alert">
              {error}
            </p>
          )}

          <div className="confirm-dialog__actions">
            <button type="button" className="confirm-dialog__cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="confirm-dialog__confirm complete-trip-modal__confirm"
              disabled={!isValid || submitting}
            >
              {submitting ? "Completing…" : "Complete Trip"}
            </button>
          </div>
        </form>

        <button
          type="button"
          className="complete-trip-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default CompleteTripModal;
