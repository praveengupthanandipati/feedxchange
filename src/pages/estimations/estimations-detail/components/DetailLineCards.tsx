import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import { formatInr, lineCommission } from "../estimationDetail.utils";
import ActionTypeBadge from "./ActionTypeBadge";
import type { DetailLinesProps } from "./DetailLinesTable";

/** Phones and tablets: one card per contract instead of the wide table. */
const DetailLineCards = ({ rows, emptyMessage }: DetailLinesProps) => (
  <ul className="estimation-detail__cards">
    {rows.length === 0 && <li className="estimation-detail__cards-empty">{emptyMessage}</li>}
    {rows.map((row) => (
      <li key={row.id} className="estimation-detail__card">
        <div className="estimation-detail__card-top">
          <strong>
            {row.sNo}. {row.contractNo}
          </strong>
          <ActionTypeBadge type={row.actionType} />
        </div>
        <dl>
          <div className="estimation-detail__card-full">
            <dt>Buyer / Seller Name</dt>
            <dd>{row.partyName}</dd>
          </div>
          <div>
            <dt>Contract Date</dt>
            <dd>{formatDisplayDate(row.contractDate)}</dd>
          </div>
          <div>
            <dt>Commodity</dt>
            <dd>{row.commodity}</dd>
          </div>
          <div>
            <dt>No. of MT</dt>
            <dd>{row.quantityMt}</dd>
          </div>
          <div>
            <dt>Commission Per MT</dt>
            <dd>{formatInr(row.commissionPerMt)}</dd>
          </div>
          <div className="estimation-detail__card-full estimation-detail__card-total">
            <dt>Total Commission</dt>
            <dd>{formatInr(lineCommission(row))}</dd>
          </div>
        </dl>
      </li>
    ))}
  </ul>
);

export default DetailLineCards;
