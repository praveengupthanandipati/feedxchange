import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiFileText, FiX } from "react-icons/fi";
import { useGetInvoiceContractDetailsQuery } from "../../../store/sellerInvoiceApi";
import "./ContractDetailsOffcanvas.scss";

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
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

  const { data: contract = null, isFetching } = useGetInvoiceContractDetailsQuery(contractNumber.trim(), {
    skip: !open || !contractNumber.trim(),
    refetchOnMountOrArgChange: true,
  });

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
          {isFetching ? (
            <p className="contract-details-offcanvas__empty">Loading…</p>
          ) : !contract ? (
            <p className="contract-details-offcanvas__empty">No details found for this contract number.</p>
          ) : (
            <>
              <table className="contract-details-offcanvas__table">
                <tbody>
                  <tr>
                    <td>Contract Date</td>
                    <td>{formatDate(contract.contractDate)}</td>
                  </tr>
                  <tr>
                    <td>Contract Number</td>
                    <td>
                      <span className="contract-details-offcanvas__badge">{contract.contractNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{contract.statusName}</td>
                  </tr>
                  <tr>
                    <td>Buyer Name</td>
                    <td className="contract-details-offcanvas__accent">{contract.buyerName}</td>
                  </tr>
                  <tr>
                    <td>Seller Name</td>
                    <td className="contract-details-offcanvas__accent">{contract.sellerName}</td>
                  </tr>
                  <tr>
                    <td>Product Name</td>
                    <td className="contract-details-offcanvas__accent">{contract.productName}</td>
                  </tr>
                  <tr>
                    <td>Total Quantity</td>
                    <td>{contract.totalQtyMT} MTs</td>
                  </tr>
                  <tr>
                    <td>Invoiced / Pending</td>
                    <td>
                      {contract.invoicedQtyMT} / {contract.pendingQtyMT} MTs
                    </td>
                  </tr>
                  <tr>
                    <td>GST %</td>
                    <td>{contract.gstPercent}%</td>
                  </tr>
                  <tr>
                    <td>Rate per MT</td>
                    <td>{money(contract.ratePerMT)}</td>
                  </tr>
                  <tr>
                    <td>Net Rate per MT</td>
                    <td className="contract-details-offcanvas__success">{money(contract.netRatePerMT)}</td>
                  </tr>
                  <tr className="contract-details-offcanvas__total-row">
                    <td>Total Contract Value</td>
                    <td className="contract-details-offcanvas__success">{money(contract.totalContractValue)}</td>
                  </tr>
                </tbody>
              </table>

              <Link to="/reports/seller-invoice-reports" className="contract-details-offcanvas__invoices-btn">
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
