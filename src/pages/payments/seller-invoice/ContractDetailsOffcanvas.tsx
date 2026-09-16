import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiFileText, FiX } from "react-icons/fi";
import { contractLookupRows, contractNetRate, GST_PERCENT } from "./sellerInvoice.data";
import "./ContractDetailsOffcanvas.scss";

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

interface ContractDetailsOffcanvasProps {
  open: boolean;
  contractNumber: string;
  onClose: () => void;
}

const ContractDetailsOffcanvas = ({ open, contractNumber, onClose }: ContractDetailsOffcanvasProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const contract = contractLookupRows.find((row) => row.contractNumber === contractNumber) ?? null;
  const netRate = contract ? contractNetRate(contract.rate) : 0;
  const totalValue = contract ? contract.qty * netRate : 0;

  return createPortal(
    <>
      <div className={`contract-details-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`contract-details-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-details-offcanvas-title"
      >
        <div className="contract-details-offcanvas__header">
          <h2 id="contract-details-offcanvas-title">Contract Details</h2>
          <button type="button" className="contract-details-offcanvas__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="contract-details-offcanvas__body">
          {!contract ? (
            <p className="contract-details-offcanvas__empty">
              No details found for this contract number.
            </p>
          ) : (
            <>
              <table className="contract-details-offcanvas__table">
                <tbody>
                  <tr>
                    <td>Contract Date</td>
                    <td>{contract.contractDate}</td>
                  </tr>
                  <tr>
                    <td>Contract Number</td>
                    <td>
                      <span className="contract-details-offcanvas__badge">{contract.contractNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Buyer Name</td>
                    <td className="contract-details-offcanvas__accent">{contract.buyer}</td>
                  </tr>
                  <tr>
                    <td>Seller Name</td>
                    <td className="contract-details-offcanvas__accent">{contract.seller}</td>
                  </tr>
                  <tr>
                    <td>Product Name</td>
                    <td className="contract-details-offcanvas__accent">{contract.commodity}</td>
                  </tr>
                  <tr>
                    <td>Total Quantity</td>
                    <td>{contract.qty} MTs</td>
                  </tr>
                  <tr>
                    <td>GST %</td>
                    <td>{GST_PERCENT}%</td>
                  </tr>
                  <tr>
                    <td>Rate per MT</td>
                    <td>{money(contract.rate)}</td>
                  </tr>
                  <tr>
                    <td>Net Rate per MT</td>
                    <td className="contract-details-offcanvas__success">{money(netRate)}</td>
                  </tr>
                  <tr className="contract-details-offcanvas__total-row">
                    <td>Total Contract Value</td>
                    <td className="contract-details-offcanvas__success">{money(totalValue)}</td>
                  </tr>
                </tbody>
              </table>

              <Link
                to="/reports/seller-invoice-reports"
                className="contract-details-offcanvas__invoices-btn"
              >
                <FiFileText aria-hidden /> View All Invoices
              </Link>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ContractDetailsOffcanvas;
