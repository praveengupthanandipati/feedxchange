import type { SummaryLine } from "../commissionEstimation.utils";
import { formatNumber } from "../commissionEstimation.utils";

interface EstimationSummaryProps {
  lines: SummaryLine[];
  note: string;
  difference: string;
  remarks: string;
  totalAmount: number;
  onDifferenceChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
}

/** Quantity and amount per commission rate, with the difference, remarks and final total beside it. */
const EstimationSummary = ({ lines, note, difference, remarks, totalAmount, onDifferenceChange, onRemarksChange }: EstimationSummaryProps) => (
  <section className="commission-estimations__summary" aria-labelledby="commission-estimations-summary-title">
    <div className="commission-estimations__summary-heading">
      <h2 id="commission-estimations-summary-title">Summary Of Quantity &amp; Commission</h2>
      <p>{note}</p>
    </div>

    <div className="commission-estimations__summary-body">
      <div className="commission-estimations__summary-scroll">
        <table className="commission-estimations__summary-table">
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
                <td colSpan={3} className="commission-estimations__summary-empty">
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

      <div className="commission-estimations__totals">
        <div className="commission-estimations__field">
          <label htmlFor="commission-estimations-difference">Difference</label>
          <input
            id="commission-estimations-difference"
            type="number"
            inputMode="decimal"
            className="commission-estimations__input"
            value={difference}
            onChange={(event) => onDifferenceChange(event.target.value)}
          />
        </div>
        <div className="commission-estimations__field">
          <label htmlFor="commission-estimations-total">Total Amount</label>
          <input
            id="commission-estimations-total"
            type="text"
            className="commission-estimations__input commission-estimations__input--readonly"
            value={formatNumber(totalAmount)}
            readOnly
          />
        </div>
        <div className="commission-estimations__field commission-estimations__field--wide">
          <label htmlFor="commission-estimations-remarks">Remarks</label>
          <input
            id="commission-estimations-remarks"
            type="text"
            className="commission-estimations__input"
            placeholder="Remarks"
            value={remarks}
            onChange={(event) => onRemarksChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  </section>
);

export default EstimationSummary;
