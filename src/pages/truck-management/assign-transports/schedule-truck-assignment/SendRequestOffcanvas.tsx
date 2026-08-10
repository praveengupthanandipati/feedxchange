import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSend, FiTruck } from "react-icons/fi";
import type { ContractSummary } from "../assignTransports.data";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";
import type { TransporterAssignmentRow } from "./transporterAssignment.data";
import "./SendRequestOffcanvas.scss";

interface SendRequestOffcanvasProps {
  open: boolean;
  summary: ContractSummary;
  scheduleRow: ScheduleTruckRow | null;
  rows: TransporterAssignmentRow[];
  onClose: () => void;
  onConfirm: () => void;
}

const SendRequestOffcanvas = ({
  open,
  summary,
  scheduleRow,
  rows,
  onClose,
  onConfirm,
}: SendRequestOffcanvasProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const details = [
    { label: "Seller", value: summary.sellerName },
    { label: "Buyer", value: summary.buyerName },
    { label: "Schedule Date & Time", value: scheduleRow?.scheduleDateTime ?? "—" },
    { label: "Loading Address", value: scheduleRow?.loadingAddress ?? summary.loadingAddress },
    { label: "Delivery Address", value: scheduleRow?.deliveryAddress ?? summary.deliveryAddress },
    { label: "Commodity", value: summary.productName },
    { label: "Qty", value: scheduleRow?.qty ?? summary.contractQty },
  ];

  return createPortal(
    <>
      <div className={`send-request-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`send-request-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-request-offcanvas-title"
      >
        <div className="send-request-offcanvas__header">
          <h2 id="send-request-offcanvas-title">Send Request — Details</h2>
          <button type="button" className="send-request-offcanvas__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="send-request-offcanvas__body">
          <table className="send-request-offcanvas__details">
            <tbody>
              {details.map((item) => (
                <tr key={item.label}>
                  <td className="send-request-offcanvas__details-label">{item.label}</td>
                  <td className="send-request-offcanvas__details-value">{item.value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="send-request-offcanvas__section-title">
            <FiTruck aria-hidden /> Transporters Requesting Approval
          </h3>

          <div className="send-request-offcanvas__table-wrapper">
            <table className="send-request-offcanvas__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Transporter Name</th>
                  <th>Qty</th>
                  <th>Freight Charges</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.transporterName}</td>
                    <td>{row.qtyMts}</td>
                    <td className="send-request-offcanvas__freight">{row.freightPerMt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="send-request-offcanvas__note">
            By confirming, the selected transporters will receive a request for approval along with
            the details mentioned above. You can track the status of their responses in the main
            table.
          </p>
        </div>

        <div className="send-request-offcanvas__footer">
          <button
            type="button"
            className="send-request-offcanvas__btn send-request-offcanvas__btn--confirm"
            onClick={onConfirm}
          >
            <FiSend aria-hidden /> Confirm &amp; Send
          </button>
          <button
            type="button"
            className="send-request-offcanvas__btn send-request-offcanvas__btn--cancel"
            onClick={onClose}
          >
            <FiX aria-hidden /> Cancel
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default SendRequestOffcanvas;
