import { displayAmount, displayDate, EMPTY_VALUE } from "../viewEstimation.utils";
import EstimationActions from "./EstimationActions";
import type { EstimationListProps } from "./EstimationsTable";

/** Phones and tablets: one card per estimate instead of the wide table. */
const EstimationCards = ({ rows, emptyMessage, ...handlers }: EstimationListProps) => (
  <ul className="view-estimations__cards">
    {rows.length === 0 && <li className="view-estimations__cards-empty">{emptyMessage}</li>}
    {rows.map((row) => (
      <li key={row.id} className="view-estimations__card">
        <div className="view-estimations__card-top">
          <strong>
            {row.sNo}. {row.estimateNo}
          </strong>
          <span>{displayAmount(row.netAmount)}</span>
        </div>
        <dl>
          <div className="view-estimations__card-full">
            <dt>Party Name</dt>
            <dd>{row.partyName || EMPTY_VALUE}</dd>
          </div>
          <div>
            <dt>From Date</dt>
            <dd>{displayDate(row.fromDate)}</dd>
          </div>
          <div>
            <dt>To Date</dt>
            <dd>{displayDate(row.toDate)}</dd>
          </div>
          <div>
            <dt>Qty</dt>
            <dd>{row.qty} MT</dd>
          </div>
          <div>
            <dt>Net Amount</dt>
            <dd>{displayAmount(row.netAmount)}</dd>
          </div>
        </dl>
        <div className="view-estimations__card-actions">
          <EstimationActions estimation={row} {...handlers} />
        </div>
      </li>
    ))}
  </ul>
);

export default EstimationCards;
