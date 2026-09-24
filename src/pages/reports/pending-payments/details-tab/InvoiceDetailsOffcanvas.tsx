import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { money, type PendingPaymentRow } from "../pendingPayments.data";
import "./InvoiceDetailsOffcanvas.scss";

interface InvoiceDetailsOffcanvasProps {
  open: boolean;
  row: PendingPaymentRow | null;
  onClose: () => void;
}

const InvoiceDetailsOffcanvas = ({ open, row, onClose }: InvoiceDetailsOffcanvasProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const detail = row?.detail;
  const deductionAmount = detail ? detail.deductions.reduce((sum, item) => sum + item.amount, 0) : 0;
  const amountToPay = detail ? detail.invoiceAmount - deductionAmount : 0;

  const fields = detail
    ? [
        { label: "Contract Number", value: detail.contractNumber },
        { label: "Entry Date", value: detail.entryDate },
        { label: "Entry By", value: detail.entryBy },
        { label: "Invoice No", value: detail.invoiceNo },
        { label: "Invoice Date", value: detail.invoiceDate },
        { label: "Seller", value: detail.seller },
        { label: "Buyer", value: detail.buyer },
        { label: "TruckNo", value: detail.truckNo },
        { label: "No of Bags", value: String(detail.noOfBags) },
        { label: "Invoice Quantity", value: String(detail.invoiceQuantity) },
        { label: "Invoice Rateper MT", value: detail.invoiceRatePerMt.toLocaleString("en-IN") },
        { label: "Freight", value: String(detail.freight) },
        { label: "Invoice Amount", value: money(detail.invoiceAmount) },
        { label: "Deduction Amount", value: money(deductionAmount) },
        { label: "Amount To Pay", value: money(amountToPay) },
        { label: "Remarks", value: detail.remarks },
        { label: "Contract Quantity", value: String(detail.contractQuantity) },
        { label: "Remaining Supply Quantity", value: String(detail.remainingSupplyQuantity) },
      ]
    : [];

  return createPortal(
    <>
      <div className={`invoice-details-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`invoice-details-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-details-offcanvas-title"
      >
        <div className="invoice-details-offcanvas__header">
          <h2 id="invoice-details-offcanvas-title">Invoice Details</h2>
          <button type="button" className="invoice-details-offcanvas__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        {detail && (
          <div className="invoice-details-offcanvas__body">
            <div className="invoice-details-offcanvas__table-wrapper">
              <table className="invoice-details-offcanvas__table">
                <tbody>
                  {fields.map((field) => (
                    <tr key={field.label}>
                      <td className="invoice-details-offcanvas__label">{field.label}</td>
                      <td>{field.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="invoice-details-offcanvas__subheading">Deductions</h3>
            <div className="invoice-details-offcanvas__table-wrapper">
              <table className="invoice-details-offcanvas__table invoice-details-offcanvas__table--deductions">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Remarks</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.deductions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="invoice-details-offcanvas__empty">
                        No deductions recorded.
                      </td>
                    </tr>
                  ) : (
                    detail.deductions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.sNo}</td>
                        <td>{item.date}</td>
                        <td>{item.remarks}</td>
                        <td>{money(item.amount)}</td>
                      </tr>
                    ))
                  )}
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

export default InvoiceDetailsOffcanvas;
