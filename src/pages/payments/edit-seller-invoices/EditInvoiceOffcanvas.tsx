import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import DatePickerInput from "../../../components/dropdown/DatePickerInput";
import { apiErrorMessage, useUpdateInvoiceMutation, type Invoice } from "../../../store/sellerInvoiceApi";
import "./EditInvoiceOffcanvas.scss";

interface DeductionDraft {
  key: string;
  date: string;
  amount: string;
  isTdsTcs: boolean;
  remarks: string;
}

interface FormState {
  invoiceDate: string;
  invoiceNumber: string;
  truckNumber: string;
  bags: string;
  invoiceQty: string;
  totalMts: string;
  totalMtsEdited: boolean;
  freight: string;
  /** Invoice amount and GST follow the calculated figures until the user types their own. */
  invoiceAmount: string;
  invoiceAmountEdited: boolean;
  gstAmount: string;
  gstEdited: boolean;
  roundOff: string;
  remarks: string;
  deductions: DeductionDraft[];
}

const num = (value: string) => {
  const n = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};
const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const money = (value: number) => `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const isoDate = (value: string) => value.slice(0, 10);
let draftSeq = 0;

function autoRoundOff(invoice: Invoice): number {
  const sum = invoice.invoiceAmount + invoice.gstAmount;
  return round2(Math.round(sum) - sum);
}

function fromInvoice(invoice: Invoice): FormState {
  // a stored figure that differs from quantity x rate (or from the GST % of the amount) was typed by someone, so it stays as it is
  const autoAmount = round2(invoice.invoiceQty * invoice.ratePerMT);
  const autoGst = round2((invoice.invoiceAmount * (invoice.gstPercent ?? 0)) / 100);
  return {
    invoiceDate: isoDate(invoice.invoiceDate),
    invoiceNumber: invoice.invoiceNumber,
    truckNumber: invoice.truckNumber ?? "",
    bags: invoice.numberOfBags == null ? "" : String(invoice.numberOfBags),
    invoiceQty: String(invoice.invoiceQty),
    totalMts: String(invoice.totalMTs),
    totalMtsEdited: invoice.totalMTs !== invoice.invoiceQty,
    freight: invoice.freightAmount ? String(invoice.freightAmount) : "",
    invoiceAmount: String(invoice.invoiceAmount),
    invoiceAmountEdited: Math.abs(invoice.invoiceAmount - autoAmount) > 0.005,
    gstAmount: String(invoice.gstAmount),
    gstEdited: Math.abs(invoice.gstAmount - autoGst) > 0.005,
    // a round-off that is just "to the nearest rupee" stays automatic, so it follows the new amount when the quantity is changed
    roundOff: invoice.roundOff === autoRoundOff(invoice) ? "" : String(invoice.roundOff),
    remarks: invoice.remarks ?? "",
    deductions: invoice.deductions.map((d) => ({ key: `d-${draftSeq++}`, date: isoDate(d.date), amount: String(d.amount), isTdsTcs: d.isTdsTcs, remarks: d.remarks ?? "" })),
  };
}

interface Props {
  /** The invoice being edited, or null when the panel is closed. Only uncleared invoices are ever passed in. */
  invoice: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}

const EditInvoiceOffcanvas = ({ invoice, onClose, onSaved }: Props) => {
  const open = invoice !== null;
  const [form, setForm] = useState<FormState | null>(null);
  const [draft, setDraft] = useState({ date: "", amount: "", isTdsTcs: false, remarks: "" });
  const [error, setError] = useState("");
  const [update, { isLoading }] = useUpdateInvoiceMutation();

  useEffect(() => {
    if (invoice) {
      setForm(fromInvoice(invoice));
      setDraft({ date: isoDate(invoice.invoiceDate), amount: "", isTdsTcs: false, remarks: "" });
      setError("");
    }
  }, [invoice]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  if (!invoice || !form) {
    return createPortal(<div className="edit-invoice-offcanvas__backdrop" />, document.body);
  }

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  // the same arithmetic as the server (quantity x rate, GST, round-off); the server's figures are final
  const qty = num(form.invoiceQty);
  const freight = num(form.freight);
  const autoAmount = round2(qty * invoice.ratePerMT + freight);
  const amount = form.invoiceAmountEdited ? round2(num(form.invoiceAmount)) : autoAmount;
  const autoGst = round2((amount * (invoice.gstPercent ?? 0)) / 100);
  const gst = form.gstEdited ? round2(num(form.gstAmount)) : autoGst;
  const suggested = round2(Math.round(amount + gst) - (amount + gst));
  const roundOff = form.roundOff.trim() === "" ? suggested : num(form.roundOff);
  const total = round2(amount + gst + roundOff);
  const deductionsTotal = form.deductions.reduce((sum, d) => sum + num(d.amount), 0);
  const payable = round2(total - deductionsTotal);

  const addDeduction = () => {
    if (!draft.amount.trim() || num(draft.amount) <= 0) return;
    set("deductions", [...form.deductions, { key: `d-${draftSeq++}`, ...draft }]);
    setDraft((d) => ({ ...d, amount: "", remarks: "", isTdsTcs: false }));
  };

  const save = async () => {
    setError("");
    if (!form.invoiceNumber.trim() || !form.truckNumber.trim() || !(qty > 0)) {
      setError("Invoice number, truck number and a quantity above zero are required.");
      return;
    }
    if (form.totalMts.trim() && num(form.totalMts) < qty) {
      setError("Total MTs cannot be less than the invoice quantity.");
      return;
    }
    try {
      const saved = await update({
        invoiceId: invoice.invoiceId,
        invoiceDate: form.invoiceDate,
        invoiceNumber: form.invoiceNumber.trim(),
        truckNumber: form.truckNumber.trim(),
        numberOfBags: form.bags.trim() ? Math.trunc(num(form.bags)) : null,
        invoiceQty: qty,
        totalMTs: form.totalMts.trim() ? num(form.totalMts) : null,
        freight: form.freight.trim() ? freight : null,
        invoiceAmount: form.invoiceAmountEdited ? num(form.invoiceAmount) : null,
        gstAmount: form.gstEdited ? num(form.gstAmount) : null,
        roundOff: form.roundOff.trim() ? num(form.roundOff) : null,
        remarks: form.remarks.trim() || undefined,
        deductions: form.deductions.map((d) => ({ date: d.date, amount: num(d.amount), isTdsTcs: d.isTdsTcs, remarks: d.remarks.trim() || undefined })),
      }).unwrap();
      onSaved(saved);
    } catch (e) {
      setError(apiErrorMessage(e, "The invoice could not be saved."));
    }
  };

  return createPortal(
    <>
      <div className={`edit-invoice-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div className={`edit-invoice-offcanvas ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="edit-invoice-title">
        <div className="edit-invoice-offcanvas__header">
          <h2 id="edit-invoice-title">Edit Invoice {invoice.invoiceNumber}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="edit-invoice-offcanvas__body">
          <p className="edit-invoice-offcanvas__contract">
            Contract <strong>{invoice.contractNumber}</strong> · {invoice.productName} · {invoice.sellerName} → {invoice.buyerName}
            <br />
            Rate {money(invoice.ratePerMT)} / MT · GST {invoice.gstPercent ?? 0}% · Status <strong>{invoice.status}</strong>
            {invoice.paidAmount > 0 && <> · Paid {money(invoice.paidAmount)}</>}
          </p>

          <div className="edit-invoice-offcanvas__grid">
            <label>
              <span>Invoice date</span>
              <DatePickerInput id="edit-invoice-date" value={form.invoiceDate} onChange={(v) => set("invoiceDate", v)} />
            </label>
            <label>
              <span>Invoice number</span>
              <input value={form.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
            </label>
            <label>
              <span>Truck number</span>
              <input value={form.truckNumber} onChange={(e) => set("truckNumber", e.target.value)} />
            </label>
            <label>
              <span>No. of bags</span>
              <input inputMode="numeric" value={form.bags} onChange={(e) => set("bags", e.target.value)} />
            </label>
            <label>
              <span>Invoice qty (MT)</span>
              <input
                inputMode="decimal"
                value={form.invoiceQty}
                onChange={(e) => {
                  set("invoiceQty", e.target.value);
                  if (!form.totalMtsEdited) set("totalMts", e.target.value);
                }}
              />
            </label>
            <label>
              <span>Total MTs loaded</span>
              <input
                inputMode="decimal"
                value={form.totalMts}
                onChange={(e) => {
                  set("totalMts", e.target.value);
                  set("totalMtsEdited", true);
                }}
              />
            </label>
            <label>
              <span>Freight</span>
              <input inputMode="decimal" value={form.freight} onChange={(e) => set("freight", e.target.value)} />
            </label>
            <label>
              <span>Invoice amount (₹)</span>
              <input
                inputMode="decimal"
                title="Calculated from the quantity and the contract rate; type an amount to use your own figure"
                value={form.invoiceAmountEdited ? form.invoiceAmount : autoAmount.toFixed(2)}
                onChange={(e) => {
                  set("invoiceAmount", e.target.value);
                  set("invoiceAmountEdited", e.target.value.trim() !== "");
                }}
              />
            </label>
            <label>
              <span>GST (₹)</span>
              <input
                inputMode="decimal"
                title={`Calculated as ${invoice.gstPercent ?? 0}% of the invoice amount; type an amount to use your own figure`}
                value={form.gstEdited ? form.gstAmount : autoGst.toFixed(2)}
                onChange={(e) => {
                  set("gstAmount", e.target.value);
                  set("gstEdited", e.target.value.trim() !== "");
                }}
              />
            </label>
            <label>
              <span>Round off</span>
              <input inputMode="decimal" placeholder={String(suggested)} value={form.roundOff} onChange={(e) => set("roundOff", e.target.value)} />
            </label>
            <label className="edit-invoice-offcanvas__wide">
              <span>Remarks</span>
              <input value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
            </label>
          </div>

          <dl className="edit-invoice-offcanvas__totals">
            <div><dt>Invoice amount</dt><dd>{money(amount)}</dd></div>
            <div><dt>GST</dt><dd>{money(gst)}</dd></div>
            <div><dt>Round off</dt><dd>{money(roundOff)}</dd></div>
            <div className="is-strong"><dt>Total</dt><dd>{money(total)}</dd></div>
            <div><dt>Freight</dt><dd>{money(freight)}</dd></div>
            <div><dt>Deductions</dt><dd>− {money(deductionsTotal)}</dd></div>
            <div className="is-strong"><dt>Payable</dt><dd>{money(payable)}</dd></div>
          </dl>

          <h3>Deductions</h3>
          {form.deductions.length > 0 && (
            <ul className="edit-invoice-offcanvas__deductions">
              {form.deductions.map((d) => (
                <li key={d.key}>
                  <span>{d.date}</span>
                  <span>{money(num(d.amount))}</span>
                  <span>{d.isTdsTcs ? "TDS/TCS" : ""}</span>
                  <span>{d.remarks || "—"}</span>
                  <button type="button" aria-label="Remove deduction" onClick={() => set("deductions", form.deductions.filter((x) => x.key !== d.key))}>
                    <FiTrash2 aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="edit-invoice-offcanvas__add-deduction">
            <DatePickerInput id="edit-deduction-date" value={draft.date} onChange={(v) => setDraft((d) => ({ ...d, date: v }))} />
            <input inputMode="decimal" placeholder="Amount" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} />
            <input placeholder="Remarks" value={draft.remarks} onChange={(e) => setDraft((d) => ({ ...d, remarks: e.target.value }))} />
            <label>
              <input type="checkbox" checked={draft.isTdsTcs} onChange={(e) => setDraft((d) => ({ ...d, isTdsTcs: e.target.checked }))} /> TDS/TCS
            </label>
            <button type="button" onClick={addDeduction}>
              <FiPlus aria-hidden /> Add
            </button>
          </div>

          {error && <p className="edit-invoice-offcanvas__error" role="alert">{error}</p>}
        </div>

        <div className="edit-invoice-offcanvas__footer">
          <button type="button" className="is-secondary" onClick={onClose} disabled={isLoading}>
            Close
          </button>
          <button type="button" onClick={() => void save()} disabled={isLoading}>
            {isLoading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default EditInvoiceOffcanvas;
