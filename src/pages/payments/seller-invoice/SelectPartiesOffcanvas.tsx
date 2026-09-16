import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiFileText, FiPlus, FiX } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import {
  buyerPartyOptions,
  contractLookupRows,
  contractNetRate,
  sellerPartyOptions,
  GST_PERCENT,
  type ContractLookupRow,
} from "./sellerInvoice.data";
import "./SelectPartiesOffcanvas.scss";

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

interface SelectPartiesOffcanvasProps {
  open: boolean;
  onClose: () => void;
  onSelect: (contract: ContractLookupRow) => void;
}

const SelectPartiesOffcanvas = ({ open, onClose, onSelect }: SelectPartiesOffcanvasProps) => {
  const [seller, setSeller] = useState("");
  const [buyer, setBuyer] = useState("");
  const [results, setResults] = useState<ContractLookupRow[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setSeller("");
    setBuyer("");
    setResults(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handleGetContracts = () => {
    setResults(
      contractLookupRows.filter(
        (row) => (!seller || row.seller === seller) && (!buyer || row.buyer === buyer),
      ),
    );
  };

  const handleAdd = (row: ContractLookupRow) => {
    onSelect(row);
    onClose();
  };

  return createPortal(
    <>
      <div className={`select-parties-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`select-parties-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-parties-offcanvas-title"
      >
        <div className="select-parties-offcanvas__header">
          <h2 id="select-parties-offcanvas-title">
            <FiFileText aria-hidden /> Select Parties
          </h2>
          <button type="button" className="select-parties-offcanvas__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="select-parties-offcanvas__body">
          <div className="select-parties-offcanvas__filters">
            <div className="select-parties-offcanvas__field">
              <span className="select-parties-offcanvas__label">Select Seller</span>
              <SearchableSelect
                options={sellerPartyOptions}
                value={seller}
                onChange={setSeller}
                placeholder="Select Seller"
                ariaLabel="Select Seller"
                clearable
              />
            </div>
            <div className="select-parties-offcanvas__field">
              <span className="select-parties-offcanvas__label">Select Buyer</span>
              <SearchableSelect
                options={buyerPartyOptions}
                value={buyer}
                onChange={setBuyer}
                placeholder="Select Buyer"
                ariaLabel="Select Buyer"
                clearable
              />
            </div>
          </div>

          <button type="button" className="select-parties-offcanvas__get-btn" onClick={handleGetContracts}>
            Get Contracts
          </button>

          <div className="select-parties-offcanvas__table-wrapper">
            <table className="select-parties-offcanvas__table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Contract Date</th>
                  <th>Contract #</th>
                  <th>Actions</th>
                  <th>Buyer Name</th>
                  <th>Seller Name</th>
                  <th>Product Name</th>
                  <th>Total MTs</th>
                  <th>Pending Qty</th>
                  <th>Rate MT</th>
                  <th>GST %</th>
                  <th>Net Rate MT</th>
                </tr>
              </thead>
              <tbody>
                {results === null ? (
                  <tr>
                    <td colSpan={12} className="select-parties-offcanvas__empty">
                      Select a seller and/or buyer, then click "Get Contracts" to search.
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="select-parties-offcanvas__empty">
                      No contracts match the selected parties.
                    </td>
                  </tr>
                ) : (
                  results.map((row, index) => (
                    <tr key={row.contractNumber}>
                      <td>{index + 1}</td>
                      <td>{row.contractDate}</td>
                      <td className="select-parties-offcanvas__contract-no">{row.contractNumber}</td>
                      <td>
                        <button
                          type="button"
                          className="select-parties-offcanvas__add-btn"
                          onClick={() => handleAdd(row)}
                        >
                          <FiPlus aria-hidden /> Add
                        </button>
                      </td>
                      <td>
                        <div className="select-parties-offcanvas__party-cell">
                          <span className="select-parties-offcanvas__party-name">{row.buyer}</span>
                          <InfoTooltip text={row.buyer} />
                        </div>
                      </td>
                      <td>
                        <div className="select-parties-offcanvas__party-cell">
                          <span className="select-parties-offcanvas__party-name">{row.seller}</span>
                          <InfoTooltip text={row.seller} />
                        </div>
                      </td>
                      <td>{row.commodity}</td>
                      <td>{row.qty}</td>
                      <td>{row.balanceQty}</td>
                      <td>{money(row.rate)}</td>
                      <td>{GST_PERCENT}%</td>
                      <td>{money(contractNetRate(row.rate))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default SelectPartiesOffcanvas;
