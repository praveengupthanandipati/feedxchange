import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle } from "react-icons/fi";
import "./ConfirmDialog.scss";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** When set, renders a textarea for capturing a reason before confirming. */
  reasonLabel?: string;
  reasonValue?: string;
  onReasonChange?: (value: string) => void;
  /** Disables the confirm button — e.g. while the reason is still empty. */
  confirmDisabled?: boolean;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  reasonLabel,
  reasonValue,
  onReasonChange,
  confirmDisabled = false,
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="confirm-dialog__backdrop" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog__icon">
          <FiAlertTriangle aria-hidden />
        </div>
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>
        <p className="confirm-dialog__message">{message}</p>
        {reasonLabel && onReasonChange && (
          <div className="confirm-dialog__reason">
            <label htmlFor="confirm-dialog-reason">{reasonLabel}</label>
            <textarea
              id="confirm-dialog-reason"
              rows={3}
              value={reasonValue ?? ""}
              onChange={(event) => onReasonChange(event.target.value)}
            />
          </div>
        )}
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog__confirm"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
