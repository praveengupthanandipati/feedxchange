import { formatNumber, type DetailTotals, type SummaryLine } from "../estimationDetail.utils";

interface DetailSummaryProps {
  lines: SummaryLine[];
  totals: DetailTotals;
  difference: string;
  onDifferenceChange: (value: string) => void;
}

/** Quantity and amount per commission rate, with the difference and totals beside it. */
const DetailSummary = ({ lines, totals, difference, onDifferenceChange }: DetailSummaryProps) => (
  <section className="estimation-detail__summary" aria-labelledby="estimation-detail-summary-title">
    <h2 id="estimation-detail-summary-title">Summary Of Quantity &amp; Commission</h2>

    <div className="estimation-detail__summary-body">
      <div className="estimation-detail__summary-scroll">
        <table className="estimation-detail__summary-table">
          <thead>
            <tr>
              <th scope="col">Qty</th>
              <th scope="col">Commission</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={3} className="estimation-detail__summary-empty">
                  No contracts to summarise.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.commission}>
                  <td>{formatNumber(line.qty)}</td>
                  <td>{formatNumber(line.commission)}</td>
                  <td>{formatNumber(line.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="estimation-detail__totals">
        <div className="estimation-detail__field">
          <label htmlFor="estimation-detail-difference">Difference</label>
          <input
            id="estimation-detail-difference"
            type="number"
            inputMode="decimal"
            className="estimation-detail__input"
            value={difference}
            onChange={(event) => onDifferenceChange(event.target.value)}
          />
        </div>
        <div className="estimation-detail__field">
          <label htmlFor="estimation-detail-total">Total Amount</label>
          <input id="estimation-detail-total" type="text" className="estimation-detail__input estimation-detail__input--readonly" value={formatNumber(totals.totalAmount)} readOnly />
        </div>
        <div className="estimation-detail__field">
          <label htmlFor="estimation-detail-mt">Total MT</label>
          <input id="estimation-detail-mt" type="text" className="estimation-detail__input estimation-detail__input--readonly" value={formatNumber(totals.totalMt)} readOnly />
        </div>
        <div className="estimation-detail__field">
          <label htmlFor="estimation-detail-commission">Total Commission</label>
          <input
            id="estimation-detail-commission"
            type="text"
            className="estimation-detail__input estimation-detail__input--readonly"
            value={formatNumber(totals.grossAmount)}
            readOnly
          />
        </div>
      </div>
    </div>
  </section>
);

export default DetailSummary;
