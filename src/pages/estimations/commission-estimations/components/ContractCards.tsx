import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import { contractCommission, formatNumber, isTicked } from "../commissionEstimation.utils";
import CommissionInput from "./CommissionInput";
import type { ContractListProps } from "./ContractsTable";
import ExpandButton from "./ExpandButton";
import InvoiceList from "./InvoiceList";

/** Phones and tablets: one card per contract instead of the wide table. */
const ContractCards = ({ rows, selection, expandedIds, emptyMessage, onToggleContract, onToggleExpanded, onToggleInvoice, onCommissionChange }: ContractListProps) => (
  <ul className="commission-estimations__cards">
    {rows.length === 0 && <li className="commission-estimations__cards-empty">{emptyMessage}</li>}
    {rows.map((row) => {
      const ticked = isTicked(selection, row.id);
      const expanded = expandedIds.includes(row.id);
      return (
        <li key={row.id} className={`commission-estimations__card ${ticked ? "is-selected" : ""}`}>
          <div className="commission-estimations__card-top">
            <label>
              <input type="checkbox" checked={ticked} onChange={() => onToggleContract(row.id)} />
              <strong>Contract {row.contractNo}</strong>
            </label>
            <span>{formatDisplayDate(row.contractDate)}</span>
          </div>
          <dl>
            <div className="commission-estimations__card-full">
              <dt>Party Name</dt>
              <dd>{row.partyName}</dd>
            </div>
            <div>
              <dt>Action Type</dt>
              <dd>
                <span className={`commission-estimations__action commission-estimations__action--${row.actionType.toLowerCase()}`}>{row.actionType}</span>
              </dd>
            </div>
            <div>
              <dt>Commodity</dt>
              <dd>{row.commodity}</dd>
            </div>
            <div>
              <dt>Contract Rate</dt>
              <dd>{formatNumber(row.contractRate)}</dd>
            </div>
            <div>
              <dt>No of MT</dt>
              <dd>{row.quantityMt}</dd>
            </div>
            <div>
              <dt>Commission / MT</dt>
              <dd>
                <CommissionInput value={row.commissionPerMt} contractNo={row.contractNo} onChange={(value) => onCommissionChange(row.id, value)} />
              </dd>
            </div>
            <div>
              <dt>Total Commission</dt>
              <dd className="commission-estimations__card-total">{formatNumber(contractCommission(row))}</dd>
            </div>
          </dl>
          <div className="commission-estimations__card-invoices">
            <div className="commission-estimations__card-invoices-toggle">
              <ExpandButton expanded={expanded} contractNo={row.contractNo} onToggle={() => onToggleExpanded(row.id)} />
              <span>
                {row.invoices.length} invoice{row.invoices.length === 1 ? "" : "s"}
              </span>
            </div>
            {expanded && <InvoiceList contract={row} selectedIds={selection[row.id] ?? []} onToggle={(invoiceId) => onToggleInvoice(row.id, invoiceId)} />}
          </div>
        </li>
      );
    })}
  </ul>
);

export default ContractCards;
