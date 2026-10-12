import { useEffect } from "react";
import { createPortal } from "react-dom";
import NotifyPanel from "./NotifyPanel";
import type { NotifyPanelProps } from "./NotifyPanel";
import "./Notifications.scss";

interface NotifyModalProps extends NotifyPanelProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  /** Clicking outside closes the dialog. Turn off where closing has a side effect (e.g. leaving the screen). */
  closeOnBackdrop?: boolean;
}

/** The Notify panel in a dialog: drop it next to any "save" action, e.g. after a truck is added or a payment is recorded. */
const NotifyModal = ({ open, title = "Send notification", onClose, onSkip, closeOnBackdrop = true, ...panel }: NotifyModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fx-modal__backdrop" onClick={closeOnBackdrop ? onClose : undefined}>
      <div className="fx-modal__box" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="fx-modal__header">
          <h2>{title}</h2>
          <button type="button" className="fx-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="fx-modal__body">
          <NotifyPanel {...panel} onSkip={() => { onSkip?.(); onClose(); }} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default NotifyModal;
