import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

interface EstimationModalProps {
  titleId: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Popup shell for the Edit dialog: backdrop click and Escape close it. */
const EstimationModal = ({ titleId, title, onClose, children }: EstimationModalProps) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    // Stop the page behind from scrolling while the popup is open (iOS Safari included).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="estimations-modal" role="presentation" onClick={onClose}>
      <div className="estimations-modal__dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <header>
          <h2 id={titleId}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default EstimationModal;
