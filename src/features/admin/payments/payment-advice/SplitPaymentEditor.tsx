import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import { PlusIcon, Trash2Icon } from "../../../../shared/components/icon";
import type { AdvanceContract, PaymentPart } from "../../../../core/store/paymentAdviceApi";
import { money, newSplitRow, resolveSplit, type SplitBasis, type SplitRow, type SplitState } from "./paymentAdvice.data";

interface SplitPaymentEditorProps {
  contracts: AdvanceContract[];
  /** The whole payment (the Amount field). */
  total: number;
  value: SplitState;
  onChange: (value: SplitState) => void;
  /** Show the problems (after Save was pressed). */
  showErrors: boolean;
}

/** What has been done with an existing part: its receipt number and where its money went. */
const PartNote = ({ part }: { part: PaymentPart }) => {
  const r = part.receipt;
  const used = [
    r.allocatedAmount > 0 && `allocated ${money(r.allocatedAmount)} (${part.allocations.map((a) => `${a.invoiceNumber} ${money(a.amount)}`).join(", ")})`,
    r.convertedAmount > 0 && `converted ${money(r.convertedAmount)}`,
    r.refundedAmount > 0 && `refunded ${money(r.refundedAmount)}`,
  ].filter(Boolean);
  return (
    <small style={{ opacity: 0.75 }}>
      {r.receiptNumber}
      {used.length ? ` · ${used.join(" · ")}` : " · nothing allocated yet"}
    </small>
  );
};

const BASIS_LABEL: Record<SplitBasis, string> = { amount: "Amount (₹)", percent: "% of payment" };

/**
 * One payment that is an advance against several contracts and / or partly a regular payment: each contract (and the regular part) gets an
 * amount or a % of the payment, and the parts have to add up to the payment.
 */
const SplitPaymentEditor = ({ contracts, total, value, onChange, showErrors }: SplitPaymentEditorProps) => {
  const resolved = resolveSplit(value, total);
  const setRow = (key: string, patch: Partial<SplitRow>) => onChange({ ...value, rows: value.rows.map((row) => (row.key === key ? { ...row, ...patch } : row)) });
  const contractOf = (id: string) => contracts.find((c) => String(c.contractId) === id);
  const hasAmount = total > 0;
  const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 };
  const label: React.CSSProperties = { fontSize: 12, opacity: 0.75, fontWeight: 600 };
  const control: React.CSSProperties = { height: "2.25rem", boxSizing: "border-box", width: "100%" };
  const gets: React.CSSProperties = { height: "2.25rem", display: "flex", alignItems: "center", justifyContent: "flex-end", fontWeight: 700 };
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(14rem, 2.2fr) minmax(9rem, 0.9fr) minmax(8rem, 0.8fr) minmax(8rem, 0.8fr) 2.25rem",
    gap: 12,
    alignItems: "start",
  };
  const header = (valueLabel: string, getsLabel: string) => (
    <div style={{ ...grid, alignItems: "end" }} aria-hidden>
      <span style={label}>Contract</span>
      <span style={label}>Given as</span>
      <span style={label}>{valueLabel}</span>
      <span style={{ ...label, textAlign: "right" }}>{getsLabel}</span>
      <span />
    </div>
  );

  return (
    <div className="pa-split" aria-label="Distribute this payment" style={{ display: "grid", gap: 10, margin: "8px 0 12px" }}>
      <div>
        <strong>Distribute this payment</strong>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          One payment can be an advance for several contracts, and part of it can be a regular payment. Give each part an amount or a % of the payment.
        </div>
      </div>

      {header("Amount / percent", "Gets")}
      {value.rows.map((r, index) => {
        const taken = new Set(value.rows.filter((x) => x.key !== r.key && x.contractId).map((x) => x.contractId));
        const contract = contractOf(r.contractId);
        const error = showErrors ? resolved.rowErrors[r.key] : undefined;
        return (
          <div key={r.key} style={grid}>
            <div style={field}>
              <SearchableSelect
                options={contracts.filter((c) => !taken.has(String(c.contractId))).map((c) => ({ value: String(c.contractId), label: `${c.contractNumber} · ${c.productName}` }))}
                value={r.contractId}
                onChange={(id) => setRow(r.key, { contractId: id })}
                placeholder={contracts.length ? "Select Contract" : "No contracts for these parties"}
                ariaLabel={`Contract ${index + 1} of the advance`}
              />
              {contract && (
                <small style={{ opacity: 0.7 }}>
                  Value {money(contract.totalContractValue)} · advance terms {contract.advancePercent}%
                </small>
              )}
              {r.part && <PartNote part={r.part} />}
            </div>
            <div style={field}>
              <select className="pa-input" style={control} aria-label="Amount or percent" value={r.basis} onChange={(event) => setRow(r.key, { basis: event.target.value as SplitBasis, value: "" })}>
                <option value="amount">{BASIS_LABEL.amount}</option>
                <option value="percent">{BASIS_LABEL.percent}</option>
              </select>
            </div>
            <div style={field}>
              <input
                type="text"
                inputMode="decimal"
                style={{ ...control, textAlign: "right" }}
                className={`pa-input${error ? " has-error" : ""}`}
                aria-label={`${r.basis === "percent" ? "Percent" : "Amount"} for contract ${index + 1}`}
                placeholder={value.rows.length === 1 && !value.regular.enabled ? "Whole payment" : "0"}
                value={r.value}
                onChange={(event) => setRow(r.key, { value: event.target.value.replace(/[^0-9.]/g, "") })}
              />
              {error && <small className="pa-error">{error}</small>}
            </div>
            <div style={field}>
              <strong style={gets}>{hasAmount ? money(resolved.rowAmounts[r.key] ?? 0) : "–"}</strong>
            </div>
            <button
              type="button"
              className="payment-advice-table__icon-btn payment-advice-table__icon-btn--delete"
              style={{ alignSelf: "start" }}
              aria-label={`Remove contract ${index + 1}`}
              title="Remove this contract"
              disabled={value.rows.length === 1 && !value.regular.enabled}
              onClick={() => onChange({ ...value, rows: value.rows.filter((x) => x.key !== r.key) })}
            >
              <Trash2Icon aria-hidden />
            </button>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="si-link-btn pa-btn pa-btn--ghost" onClick={() => onChange({ ...value, rows: [...value.rows, newSplitRow()] })}>
          <PlusIcon aria-hidden /> Add another contract
        </button>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={value.regular.enabled}
            onChange={(event) => onChange({ ...value, regular: { ...value.regular, enabled: event.target.checked } })}
          />
          Part of this payment is a regular payment (not tied to a contract)
        </label>
      </div>

      {value.regular.enabled && (
        <div style={grid}>
          <div style={field}>
            <strong style={{ height: "2.25rem", display: "flex", alignItems: "center" }}>Regular payment</strong>
            <small style={{ opacity: 0.7 }}>Not tied to a contract: allocated to any invoice later</small>
            {value.regular.part && <PartNote part={value.regular.part} />}
          </div>
          <div style={field}>
            <select
              className="pa-input"
              style={control}
              aria-label="Regular part given as"
              value={value.regular.basis}
              onChange={(event) => onChange({ ...value, regular: { ...value.regular, basis: event.target.value as SplitBasis | "rest", value: "" } })}
            >
              <option value="rest">Balance (what is left)</option>
              <option value="amount">{BASIS_LABEL.amount}</option>
              <option value="percent">{BASIS_LABEL.percent}</option>
            </select>
          </div>
          <div style={field}>
            <input
              type="text"
              inputMode="decimal"
              className="pa-input"
              style={{ ...control, textAlign: "right" }}
              aria-label="Regular part amount or percent"
              disabled={value.regular.basis === "rest"}
              placeholder={value.regular.basis === "rest" ? "Balance" : "0"}
              value={value.regular.value}
              onChange={(event) => onChange({ ...value, regular: { ...value.regular, value: event.target.value.replace(/[^0-9.]/g, "") } })}
            />
          </div>
          <div style={field}>
            <strong style={gets}>{hasAmount ? money(resolved.regularAmount) : "–"}</strong>
          </div>
          <span />
        </div>
      )}

      <div
        role="status"
        style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: "var(--fx-text-sm)", padding: "6px 10px", borderRadius: 6, background: "var(--color-surface-muted, rgba(0,0,0,0.04))" }}
      >
        <span>
          Payment <strong>{hasAmount ? money(total) : "enter the amount below"}</strong>
        </span>
        <span>
          Given to parts <strong>{money(resolved.allocated)}</strong>
        </span>
        <span style={{ color: Math.abs(resolved.left) > 0.02 ? "var(--color-danger, #b91c1c)" : undefined }}>
          Left <strong>{money(resolved.left)}</strong>
        </span>
      </div>
      {showErrors && resolved.problem && (
        <small className="pa-error" role="alert">
          {resolved.problem}
        </small>
      )}
    </div>
  );
};

export default SplitPaymentEditor;
