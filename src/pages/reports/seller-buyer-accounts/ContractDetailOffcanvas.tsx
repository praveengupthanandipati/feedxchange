import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { money, type ContractRow } from "./sellerBuyerAccounts.data";
import "./ContractDetailOffcanvas.scss";

interface ContractDetailOffcanvasProps {
  open: boolean;
  row: ContractRow | null;
  onClose: () => void;
}

const ContractDetailOffcanvas = ({ open, row, onClose }: ContractDetailOffcanvasProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const details = row
    ? [
        { label: "Details", seller: `Seller: ${row.sellerName}`, buyer: `Buyer: ${row.buyerName}` },
        { label: "Rate", seller: money(row.rate), buyer: money(row.rate) },
        { label: "Delivery Schedule", seller: row.deliverySchedule, buyer: row.deliverySchedule },
        { label: "Delivery At", seller: row.deliveryAt, buyer: row.deliveryAt },
        { label: "Quality", seller: row.quality, buyer: row.quality },
        { label: "Due Days", seller: String(row.dueDays), buyer: String(row.buyerDueDays) },
        { label: "Actual Qty", seller: String(row.qtyValue), buyer: String(row.qtyValue) },
        { label: "Remarks", seller: row.remarks, buyer: row.remarks },
      ]
    : [];

  return createPortal(
    <>
      <div className={`contract-detail-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`contract-detail-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-detail-offcanvas-title"
      >
        {row && (
          <>
            <div className="contract-detail-offcanvas__header">
              <h2 id="contract-detail-offcanvas-title">Contract Number: {row.contractNumber}</h2>
              <button type="button" className="contract-detail-offcanvas__close" onClick={onClose} aria-label="Close">
                <FiX aria-hidden />
              </button>
            </div>

            <div className="contract-detail-offcanvas__body">
              <div className="contract-detail-offcanvas__table-wrapper">
                <table className="contract-detail-offcanvas__table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Seller</th>
                      <th>Buyer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((item) => (
                      <tr key={item.label}>
                        <td className="contract-detail-offcanvas__label">{item.label}</td>
                        <td>{item.seller}</td>
                        <td>{item.buyer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
};

export default ContractDetailOffcanvas;
