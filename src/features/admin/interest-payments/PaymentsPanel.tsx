import type { InvoicePayment } from "./create-interest/interestCalculation.data";
import { formatDate, formatInr } from "./interestCalc";
import "./PaymentsPanel.scss";

/** Payment breakdown shown under an invoice row (Create Interest, View Interest Detail, View popup). */
const PaymentsPanel = ({ payments }: { payments: InvoicePayment[] }) => {
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  return (
    <div className="payments-panel">
      <div className="payments-panel__header">
        <span className="payments-panel__title">Payment Details</span>
        <span className="payments-panel__meta">
          {payments.length} payment{payments.length === 1 ? "" : "s"} · <strong>{formatInr(total)}</strong>
        </span>
      </div>
      {payments.length === 0 ? (
        <p className="payments-panel__empty">No payments received yet.</p>
      ) : (
        <div className="payments-panel__scroll">
          <table className="payments-panel__table">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Date</th>
                <th scope="col">Payment Type</th>
                <th scope="col">Bank Name</th>
                <th scope="col">Cheque No</th>
                <th scope="col" className="is-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={`${payment.date}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{formatDate(payment.date)}</td>
                  <td>
                    <span className={`payments-panel__type payments-panel__type--${payment.paymentType.toLowerCase()}`}>
                      {payment.paymentType}
                    </span>
                  </td>
                  <td>{payment.bankName}</td>
                  <td>{payment.chequeNo || "—"}</td>
                  <td className="is-amount">{formatInr(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>Total Paid</td>
                <td className="is-amount">{formatInr(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPanel;
