import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import type { EstimationContract } from "../commissionEstimation.data";
import { formatNumber } from "../commissionEstimation.utils";

interface InvoiceListProps {
  contract: EstimationContract;
  selectedIds: string[];
  onToggle: (invoiceId: string) => void;
}

/** Invoices raised against a contract, stacked for the phone and tablet cards. */
const InvoiceList = ({ contract, selectedIds, onToggle }: InvoiceListProps) => {
  if (contract.invoices.length === 0) {
    return <p className="commission-estimations__invoice-empty">No invoices raised against this contract yet.</p>;
  }

  return (
    <ul className="commission-estimations__invoice-list" aria-label={`Invoices for contract ${contract.contractNo}`}>
      {contract.invoices.map((invoice, index) => (
        <li key={invoice.id}>
          <label className="commission-estimations__invoice-item">
            <input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => onToggle(invoice.id)} />
            <span className="commission-estimations__invoice-main">
              <strong>
                {index + 1}. {invoice.invoiceNo}
              </strong>
              <span>{formatDisplayDate(invoice.invoiceDate)} · {invoice.truckNumber}</span>
            </span>
            <span className="commission-estimations__invoice-figures">
              <strong>{formatNumber(invoice.amount)}</strong>
              <span>{invoice.qty} MT</span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
};

export default InvoiceList;
