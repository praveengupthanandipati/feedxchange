import { useGetConversionsQuery } from "../../../../core/store/paymentAdviceApi";
import { money, shortDate } from "./paymentAdvice.data";

interface AdvanceConversionsPanelProps {
  sellerId?: number;
  buyerId?: number;
}

/** Tracking of advances converted to regular payments: which advance, how much, the regular payment it became and how much of that was allocated. */
const AdvanceConversionsPanel = ({ sellerId, buyerId }: AdvanceConversionsPanelProps) => {
  const { data = [] } = useGetConversionsQuery({ sellerId, buyerId });
  if (data.length === 0) return null;
  const cell: React.CSSProperties = { padding: "6px 10px", textAlign: "left", whiteSpace: "nowrap", fontSize: "var(--fx-text-sm)" };
  const num: React.CSSProperties = { ...cell, textAlign: "right" };
  return (
    <section className="payment-advice-card" aria-labelledby="pa-conversions-title">
      <h2 id="pa-conversions-title" className="payment-advice-card__title">
        Advances converted to regular payments
      </h2>
      <div className="pa-table-wrap">
        <table className="pa-table">
          <thead>
            <tr>
              <th style={cell}>Converted on</th>
              <th style={cell}>Advance</th>
              <th style={cell}>Contract</th>
              <th style={num}>Amount</th>
              <th style={cell}>Became regular payment</th>
              <th style={num}>Allocated from it</th>
              <th style={cell}>Status</th>
              <th style={cell}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.conversionId} style={c.status === "Reversed" ? { opacity: 0.55 } : undefined}>
                <td style={cell}>{shortDate(c.convertedOn)}</td>
                <td style={cell}>{c.fromReceiptNumber}</td>
                <td style={cell}>{c.contractNumber ?? "—"}</td>
                <td style={{ ...num, fontWeight: 600 }}>{money(c.amount)}</td>
                <td style={cell}>{c.toReceiptNumber}</td>
                <td style={num}>{money(c.toAllocatedAmount)}</td>
                <td style={cell}>{c.status === "Reversed" ? "Reversed (back to advance)" : "Active"}</td>
                <td style={{ ...cell, whiteSpace: "normal" }}>{c.remarks || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdvanceConversionsPanel;
