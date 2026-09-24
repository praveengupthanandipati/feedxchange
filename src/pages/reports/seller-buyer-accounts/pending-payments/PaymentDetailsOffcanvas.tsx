import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { money, type PendingPaymentRow } from "./pendingPayments.data";
import "./PaymentDetailsOffcanvas.scss";

interface PaymentDetailsOffcanvasProps {
  open: boolean;
  row: PendingPaymentRow | null;
  onClose: () => void;
}

const PaymentDetailsOffcanvas = ({ open, row, onClose }: PaymentDetailsOffcanvasProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return createPortal(
    <>
      <div className={`payment-details-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`payment-details-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-details-offcanvas-title"
      >
        <div className="payment-details-offcanvas__header">
          <h2 id="payment-details-offcanvas-title">Payment Details</h2>
          <button type="button" className="payment-details-offcanvas__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        {row && (
          <div className="payment-details-offcanvas__body">
            <div className="payment-details-offcanvas__table-wrapper">
              <table className="payment-details-offcanvas__table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Invoice Date</th>
                    <th>Invoice No</th>
                    <th>Truck No</th>
                    <th>Bags</th>
                    <th>Qty</th>
                    <th>Freight</th>
                    <th>Deduction</th>
                    <th>Invoice Amount</th>
                    <th>Pending Amount</th>
                    <th>Total Pending of Contract</th>
                  </tr>
                </thead>
                <tbody>
                  {row.paymentDetails.map((item) => (
                    <tr key={item.id}>
                      <td>{item.sNo}</td>
                      <td>{item.invoiceDate}</td>
                      <td>{item.invoiceNo}</td>
                      <td>{item.truckNo}</td>
                      <td>{item.bags}</td>
                      <td>{item.qty}</td>
                      <td>{money(item.freight)}</td>
                      <td>{money(item.deduction)}</td>
                      <td>{money(item.invoiceAmount)}</td>
                      <td>{money(item.pendingAmount)}</td>
                      <td>{money(item.totalPendingOfContract)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
};

export default PaymentDetailsOffcanvas;
