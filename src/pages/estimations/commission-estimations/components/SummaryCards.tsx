import { formatNumber } from "../commissionEstimation.utils";

interface SummaryCardsProps {
  totalQty: number;
  averageCommission: number;
  amount: number;
}

const SummaryCards = ({ totalQty, averageCommission, amount }: SummaryCardsProps) => (
  <section className="commission-estimations__overview" aria-labelledby="commission-estimations-overview-title">
    <h2 id="commission-estimations-overview-title">Summary of Quantity &amp; Commission</h2>
    <dl className="commission-estimations__stats">
      <div className="commission-estimations__stat">
        <dt>Total Qty</dt>
        <dd>{formatNumber(totalQty)} MT</dd>
      </div>
      <div className="commission-estimations__stat">
        <dt>Average Commission</dt>
        <dd>{formatNumber(averageCommission)}</dd>
      </div>
      <div className="commission-estimations__stat">
        <dt>Amount</dt>
        <dd>{formatNumber(amount)}</dd>
      </div>
    </dl>
  </section>
);

export default SummaryCards;
