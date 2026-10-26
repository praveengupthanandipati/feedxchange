import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiRotateCcw } from "react-icons/fi";
import { transporterRequestHistory } from "./transporterAssignment.data";
import "./RequestHistoryModal.scss";

interface RequestHistoryModalProps {
  open: boolean;
  transporterName: string;
  onClose: () => void;
}

const RequestHistoryModal = ({ open, transporterName, onClose }: RequestHistoryModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return createPortal(
    <div className={`request-history-modal__backdrop ${open ? "is-open" : ""}`} onClick={onClose}>
      <div
        className={`request-history-modal ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-history-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="request-history-modal__header">
          <h2 id="request-history-modal-title">
            <FiRotateCcw aria-hidden /> Request History of{transporterName ? ` ${transporterName}` : ""}
          </h2>
          <button
            type="button"
            className="request-history-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div className="request-history-modal__body">
          <div className="request-history-modal__table-wrapper">
            <table className="request-history-modal__table">
              <thead>
                <tr>
                  <th>Date of Request</th>
                  <th>Base Freight</th>
                  <th>Transporter Status</th>
                  <th>Date of Status</th>
                  <th>Transporter Freight</th>
                </tr>
              </thead>
              <tbody>
                {transporterRequestHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.dateOfRequest}</td>
                    <td className="request-history-modal__amount">{entry.baseFreight}</td>
                    <td>
                      <span
                        className={`request-history-modal__status request-history-modal__status--${entry.transporterStatus.toLowerCase()}`}
                      >
                        {entry.transporterStatus}
                      </span>
                    </td>
                    <td>{entry.dateOfStatus}</td>
                    <td className="request-history-modal__amount">{entry.transporterFreight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RequestHistoryModal;
