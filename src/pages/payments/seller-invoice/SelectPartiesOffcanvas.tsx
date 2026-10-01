import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiFileText, FiPlus, FiX } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import {
  useGetInvoiceBuyersQuery,
  useGetInvoiceSellersQuery,
  useLazyGetInvoiceContractsQuery,
  type InvoiceContract,
} from "../../../store/sellerInvoiceApi";
import "./SelectPartiesOffcanvas.scss";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

interface SelectPartiesOffcanvasProps {
  open: boolean;
  onClose: () => void;
  onSelect: (contract: InvoiceContract) => void;
}

const SelectPartiesOffcanvas = ({ open, onClose, onSelect }: SelectPartiesOffcanvasProps) => {
  const [seller, setSeller] = useState("");
  const [buyer, setBuyer] = useState("");
  const [results, setResults] = useState<InvoiceContract[] | null>(null);
  const [failed, setFailed] = useState(false);

  // parties come from the contracts that can be invoiced (the caller's own contracts for business users)
  const { data: sellers = [] } = useGetInvoiceSellersQuery(undefined, { skip: !open, refetchOnMountOrArgChange: true });
  const { data: buyers = [] } = useGetInvoiceBuyersQuery(undefined, { skip: !open, refetchOnMountOrArgChange: true });
  const sellerPartyOptions = sellers.map((p) => ({ value: String(p.id), label: p.name }));
  const buyerPartyOptions = buyers.map((p) => ({ value: String(p.id), label: p.name }));
  const [searchContracts, { isFetching }] = useLazyGetInvoiceContractsQuery();

  useEffect(() => {
    if (!open) return;
    setSeller("");
    setBuyer("");
    setResults(null);
    setFailed(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handleGetContracts = async () => {
    setFailed(false);
    try {
      setResults(await searchContracts({ sellerId: seller ? Number(seller) : undefined, buyerId: buyer ? Number(buyer) : undefined }, false).unwrap());
    } catch {
      setResults(null);
      setFailed(true);
    }
  };

  const handleAdd = (row: InvoiceContract) => {
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

          <button type="button" className="select-parties-offcanvas__get-btn" onClick={() => void handleGetContracts()} disabled={isFetching}>
            {isFetching ? "Searching…" : "Get Contracts"}
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
                {failed ? (
                  <tr>
                    <td colSpan={12} className="select-parties-offcanvas__empty">
                      Could not load contracts. Try again.
                    </td>
                  </tr>
                ) : results === null ? (
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
                      <td>{formatDate(row.contractDate)}</td>
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
                          <span className="select-parties-offcanvas__party-name">{row.buyerName}</span>
                          <InfoTooltip text={row.buyerName} />
                        </div>
                      </td>
                      <td>
                        <div className="select-parties-offcanvas__party-cell">
                          <span className="select-parties-offcanvas__party-name">{row.sellerName}</span>
                          <InfoTooltip text={row.sellerName} />
                        </div>
                      </td>
                      <td>{row.productName}</td>
                      <td>{row.totalQtyMT}</td>
                      <td>{row.pendingQtyMT}</td>
                      <td>{money(row.ratePerMT)}</td>
                      <td>{row.gstPercent}%</td>
                      <td>{money(row.netRatePerMT)}</td>
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
