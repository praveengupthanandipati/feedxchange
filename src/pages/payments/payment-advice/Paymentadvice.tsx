import { useEffect, useMemo, useRef, useState } from "react";
import { FiAlertCircle, FiCheck, FiCheckCircle, FiCreditCard, FiDollarSign, FiEdit, FiFileText, FiMinusCircle, FiTrash2, FiX, FiZap } from "react-icons/fi";
import type { IconType } from "react-icons";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import {
  useApplyAllocationMutation,
  useDeleteReceiptMutation,
  useGetAdvanceContractsQuery,
  useGetInvoicesToClearQuery,
  useGetPaymentBuyersQuery,
  useGetPaymentSellersQuery,
  useGetReceiptsQuery,
  useSaveReceiptMutation,
  useUpdateReceiptMutation,
  type InvoiceToClear,
  type Receipt,
  type SaveReceiptPayload,
} from "../../../store/paymentAdviceApi";
import { apiErrorMessage } from "../../../store/sellerInvoiceApi";
import {
  createEmptyPaymentForm,
  formFromReceipt,
  invoiceBalance,
  modeFields,
  money,
  paymentModeLabels,
  paymentModes,
  planAdvance,
  receiptUnallocated,
  round2,
  shortDate,
  toApiMode,
  validatePaymentForm,
  type PaymentFieldKey,
  type PaymentFormErrors,
  type PaymentFormValues,
  type PaymentKind,
  type PaymentMode,
} from "./paymentAdvice.data";
import "./Paymentadvice.scss";

const modeIcons: Record<PaymentMode, IconType> = {
  online: FiCreditCard,
  cheque: FiFileText,
  cash: FiDollarSign,
  none: FiMinusCircle,
};

const dash = (value: string | null | undefined) => value || "-";
const num = (value: string) => {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};
const NO_RECEIPTS: Receipt[] = [];
const NO_INVOICES: InvoiceToClear[] = [];

const Paymentadvice = () => {
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [partyError, setPartyError] = useState(false);

  // ---- 1. the payment form
  const [values, setValues] = useState<PaymentFormValues>(() => createEmptyPaymentForm());
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const [rowPendingDelete, setRowPendingDelete] = useState<Receipt | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  // ---- 3. the allocation being prepared
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [alloc, setAlloc] = useState<Record<number, string>>({});
  const [adjustAdvance, setAdjustAdvance] = useState(true);
  const [applyTried, setApplyTried] = useState(false);

  const formRef = useRef<HTMLElement>(null);

  // ---- data from the API
  const seller = sellerId ? Number(sellerId) : 0;
  const buyer = buyerId ? Number(buyerId) : 0;
  const hasPair = seller > 0 && buyer > 0;
  const pairArgs = { sellerId: seller, buyerId: buyer };

  const { data: sellers = [] } = useGetPaymentSellersQuery();
  const { data: buyers = [] } = useGetPaymentBuyersQuery(seller || undefined);
  const { data: contracts = [] } = useGetAdvanceContractsQuery(pairArgs, { skip: !hasPair });
  const { data: openReceiptsData = NO_RECEIPTS, isFetching: receiptsLoading } = useGetReceiptsQuery(pairArgs, { skip: !hasPair });
  const { data: invoicesData = NO_INVOICES, isFetching: invoicesLoading } = useGetInvoicesToClearQuery(pairArgs, { skip: !hasPair });
  const [saveReceipt, { isLoading: saving }] = useSaveReceiptMutation();
  const [updateReceipt, { isLoading: updating }] = useUpdateReceiptMutation();
  const [deleteReceipt] = useDeleteReceiptMutation();
  const [applyAllocation, { isLoading: applying }] = useApplyAllocationMutation();

  const sellerOptions = useMemo(() => sellers.map((p) => ({ value: String(p.id), label: p.name })), [sellers]);
  const buyerOptions = useMemo(() => buyers.map((p) => ({ value: String(p.id), label: p.name })), [buyers]);

  // start on the first seller and its first buyer, like the page used to
  useEffect(() => {
    if (!sellerId && sellers.length > 0) setSellerId(String(sellers[0].id));
  }, [sellers, sellerId]);
  useEffect(() => {
    if (buyers.length === 0) return;
    if (!buyerId || !buyers.some((b) => String(b.id) === buyerId)) setBuyerId(String(buyers[0].id));
  }, [buyers, buyerId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.error ? 6000 : 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // a different seller / buyer starts a fresh allocation
  useEffect(() => {
    setAlloc({});
    setExcluded(new Set());
    setApplyTried(false);
  }, [sellerId, buyerId]);

  /** Receipts that still have money to allocate (a fully allocated receipt is not listed by the API). */
  const openReceipts = useMemo(() => [...openReceiptsData].sort((a, b) => a.receiptDate.localeCompare(b.receiptDate) || a.receiptId - b.receiptId), [openReceiptsData]);
  const regularReceipts = openReceipts.filter((r) => r.kind === "Regular");
  const advanceReceipts = openReceipts.filter((r) => r.kind === "Advance");
  const regularPool = round2(regularReceipts.filter((r) => !excluded.has(r.receiptId)).reduce((sum, r) => sum + receiptUnallocated(r), 0));
  const advancePool = round2(advanceReceipts.reduce((sum, r) => sum + receiptUnallocated(r), 0));

  const openInvoices = useMemo(
    () => invoicesData.filter((i) => invoiceBalance(i) > 0.004).sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate) || a.invoiceNumber.localeCompare(b.invoiceNumber)),
    [invoicesData],
  );

  /** Advance goes into every invoice at its contract's advance %, oldest invoice first. */
  const advancePlan = useMemo(() => (adjustAdvance ? planAdvance(openInvoices, openReceipts) : {}), [adjustAdvance, openInvoices, openReceipts]);
  const advanceFor = (invoice: InvoiceToClear) => advancePlan[invoice.invoiceId]?.amount ?? 0;
  /** What is left on an invoice for a cash allocation, after the advance adjustment. */
  const dueAfterAdvance = (invoice: InvoiceToClear) => round2(invoiceBalance(invoice) - advanceFor(invoice));

  const allocTotal = round2(openInvoices.reduce((sum, i) => sum + num(alloc[i.invoiceId] ?? ""), 0));
  const advanceTotal = round2(openInvoices.reduce((sum, i) => sum + advanceFor(i), 0));
  const poolLeft = round2(regularPool - allocTotal);

  const rowError = (invoice: InvoiceToClear): string | undefined => {
    const value = num(alloc[invoice.invoiceId] ?? "");
    if (value < 0) return "Cannot be negative.";
    if (value > dueAfterAdvance(invoice) + 0.004) return `At most ${money(dueAfterAdvance(invoice))}.`;
    return undefined;
  };
  const anyRowError = openInvoices.some((i) => rowError(i));
  const overPool = allocTotal > regularPool + 0.004;
  const nothingToApply = allocTotal <= 0 && advanceTotal <= 0;

  // ---------------------------------------------------------------------------------------------- 1. payment form
  const resetForm = (mode: PaymentMode = values.mode) => {
    setValues(createEmptyPaymentForm(mode));
    setErrors({});
    setEditingId(null);
  };

  const handleModeChange = (mode: PaymentMode) => {
    setValues((prev) => ({ ...prev, mode, reference: "", bankName: "" }));
    setErrors({});
  };

  const handleKindChange = (kind: PaymentKind) => {
    setValues((prev) => ({ ...prev, kind, contractId: "", towards: kind === "advance" && !prev.towards ? "Advance" : prev.towards }));
    setErrors({});
  };

  const handleFieldChange = (key: PaymentFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: key === "amount" ? value.replace(/[^0-9.]/g, "") : value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _cleared, ...rest } = prev;
      return rest;
    });
  };

  const handleSave = async () => {
    const nextErrors = validatePaymentForm(values);
    const missingParty = !hasPair;
    setErrors(nextErrors);
    setPartyError(missingParty);
    if (missingParty || Object.keys(nextErrors).length > 0) return;

    const shown = new Set(modeFields[values.mode].map((field) => field.key));
    const payload: SaveReceiptPayload = {
      sellerId: seller,
      buyerId: buyer,
      kind: values.kind === "advance" ? "Advance" : "Regular",
      contractId: values.kind === "advance" ? Number(values.contractId) : null,
      receiptDate: values.date,
      paymentMode: toApiMode(values.mode),
      reference: shown.has("reference") ? values.reference.trim() : undefined,
      bankName: shown.has("bankName") ? values.bankName.trim() : undefined,
      amount: Number(values.amount),
      towards: values.towards.trim() || undefined,
      remarks: values.remarks.trim() || undefined,
    };

    try {
      if (editingId) await updateReceipt({ ...payload, receiptId: editingId }).unwrap();
      else await saveReceipt(payload).unwrap();
      setToast({ text: editingId ? "Payment updated." : `${payload.kind === "Advance" ? "Advance" : "Payment"} saved. It is now in the unallocated receipts.` });
      resetForm();
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The payment could not be saved."), error: true });
    }
  };

  const handleEdit = (row: Receipt) => {
    setSellerId(String(row.sellerId));
    setBuyerId(String(row.buyerId));
    setPartyError(false);
    setEditingId(row.receiptId);
    setErrors({});
    setValues(formFromReceipt(row));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleConfirmDelete = async () => {
    if (!rowPendingDelete) return;
    const target = rowPendingDelete;
    setRowPendingDelete(null);
    try {
      await deleteReceipt(target.receiptId).unwrap();
      if (editingId === target.receiptId) resetForm();
      setToast({ text: "Payment deleted." });
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The payment could not be deleted."), error: true });
    }
  };

  // ---------------------------------------------------------------------------------------------- 3. allocation
  const toggleReceipt = (id: number) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** Fill the invoices oldest first from the selected receipts, after the advance adjustment. */
  const handleAutoAllocate = () => {
    let left = regularPool;
    const next: Record<number, string> = {};
    openInvoices.forEach((invoice) => {
      const use = Math.min(left, dueAfterAdvance(invoice));
      if (use > 0.004) next[invoice.invoiceId] = String(round2(use));
      left = round2(left - Math.max(use, 0));
    });
    setAlloc(next);
    setApplyTried(false);
  };

  const handleApply = async () => {
    setApplyTried(true);
    if (anyRowError || overPool || nothingToApply) return;
    try {
      const result = await applyAllocation({
        sellerId: seller,
        buyerId: buyer,
        adjustAdvance,
        receiptIds: regularReceipts.filter((r) => !excluded.has(r.receiptId)).map((r) => r.receiptId),
        allocations: openInvoices.filter((i) => num(alloc[i.invoiceId] ?? "") > 0).map((i) => ({ invoiceId: i.invoiceId, amount: num(alloc[i.invoiceId]) })),
      }).unwrap();
      const cleared = result.invoices.filter((i) => i.status === "Paid").length;
      setToast({
        text: `Allocated ${money(result.cashAllocated)} from receipts${result.advanceAdjusted > 0 ? ` and adjusted ${money(result.advanceAdjusted)} of advance` : ""}${cleared ? `. ${cleared} invoice${cleared === 1 ? "" : "s"} cleared` : ""}.`,
      });
      setAlloc({});
      setApplyTried(false);
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The allocation could not be applied."), error: true });
    }
  };

  const fields = modeFields[values.mode];
  const selectedTerms = contracts.find((c) => String(c.contractId) === values.contractId);
  const prompt = hasPair ? "" : "Select a seller and buyer.";

  return (
    <div className="payment-advice-page">
      {toast && (
        <div className={`payment-advice-page__toast${toast.error ? " payment-advice-page__toast--error" : ""}`} role={toast.error ? "alert" : "status"}>
          {toast.error ? <FiAlertCircle aria-hidden /> : <FiCheckCircle aria-hidden />}
          {toast.text}
        </div>
      )}

      {/* ===================================================== 1. Payment Advice (enter the payment) */}
      <section className="payment-advice-card" ref={formRef} aria-labelledby="payment-advice-title">
        <h1 id="payment-advice-title" className="payment-advice-card__title">
          Payment Advice
        </h1>

        <div className="payment-advice-parties">
          <div className="payment-advice-field">
            <label>Seller</label>
            <SearchableSelect
              options={sellerOptions}
              value={sellerId}
              onChange={(value) => {
                setSellerId(value);
                setBuyerId("");
                setPartyError(false);
              }}
              placeholder="Select Seller"
              ariaLabel="Select Seller"
            />
          </div>
          <div className="payment-advice-field">
            <label>Buyer</label>
            <SearchableSelect
              options={buyerOptions}
              value={buyerId}
              onChange={(value) => {
                setBuyerId(value);
                setPartyError(false);
              }}
              placeholder="Select Buyer"
              ariaLabel="Select Buyer"
            />
          </div>
        </div>
        {partyError && (
          <p className="payment-advice-card__error" role="alert">
            Select both a seller and a buyer.
          </p>
        )}

        <div className="pa-choices">
          <fieldset className="payment-advice-mode">
            <legend className="payment-advice-mode__legend">Payment Type</legend>
            <div className="payment-advice-mode__options">
              {(["regular", "advance"] as PaymentKind[]).map((kind) => (
                <label className="payment-advice-mode__option" key={kind} title={kind === "advance" ? "An advance paid against one contract; it is adjusted into that contract's invoices by its advance %" : undefined}>
                  <input type="radio" name="payment-advice-kind" value={kind} checked={values.kind === kind} onChange={() => handleKindChange(kind)} />
                  <span className="payment-advice-mode__pill">{kind === "regular" ? "Payment" : "Advance"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="payment-advice-mode">
            <legend className="payment-advice-mode__legend">Select Mode</legend>
            <div className="payment-advice-mode__options">
              {paymentModes.map((mode) => {
                const Icon = modeIcons[mode];
                return (
                  <label className="payment-advice-mode__option" key={mode}>
                    <input type="radio" name="payment-advice-mode" value={mode} checked={values.mode === mode} onChange={() => handleModeChange(mode)} />
                    <span className="payment-advice-mode__pill">
                      <Icon aria-hidden />
                      {paymentModeLabels[mode]}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {values.kind === "advance" && (
          <div className="pa-advance-row">
            <div className="payment-advice-field">
              <label htmlFor="payment-advice-contract">Contract</label>
              <SearchableSelect
                options={contracts.map((c) => ({ value: String(c.contractId), label: `${c.contractNumber} · ${c.productName}` }))}
                value={values.contractId}
                onChange={(value) => handleFieldChange("contractId", value)}
                placeholder={contracts.length ? "Select Contract" : "No contracts for these parties"}
                ariaLabel="Contract the advance is for"
              />
              {errors.contractId && <span className="payment-advice-field__error">{errors.contractId}</span>}
            </div>
            <div className="pa-advice-note">
              {selectedTerms ? (
                <>
                  <strong>{selectedTerms.advancePercent}% advance</strong>
                  <span>
                    {selectedTerms.immediateAdvancePercent}% immediate + {selectedTerms.balanceAdvancePercent}% balance. The same {selectedTerms.advancePercent}% of every invoice on this contract is adjusted from this advance.
                  </span>
                </>
              ) : (
                <span>Choose the contract to see its advance terms.</span>
              )}
            </div>
          </div>
        )}

        <div className="payment-advice-fields">
          {fields.map((field) => {
            const id = `payment-advice-${field.key}`;
            const error = errors[field.key];
            return (
              <div className="payment-advice-field" key={field.key}>
                <label htmlFor={id}>{field.label}</label>
                <input
                  id={id}
                  type={field.type}
                  inputMode={field.inputMode}
                  className={error ? "has-error" : ""}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
                {error && (
                  <span className="payment-advice-field__error" id={`${id}-error`}>
                    {error}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="payment-advice-actions">
          <button type="button" className="payment-advice-actions__cancel" onClick={() => resetForm()}>
            <FiX aria-hidden /> Cancel
          </button>
          <button type="button" className="payment-advice-actions__save" onClick={handleSave} disabled={saving || updating}>
            <FiCheck aria-hidden /> {editingId ? "Update Payment" : "Save Payments"}
          </button>
        </div>
      </section>

      {/* ===================================================== 2. Unallocated receipts */}
      <section className="payment-advice-card" aria-labelledby="pa-receipts-title">
        <div className="pa-head">
          <h2 id="pa-receipts-title" className="payment-advice-card__title pa-head__title">
            Unallocated Receipts
          </h2>
          <div className="pa-chips">
            <span className="pa-chip">Payments <strong>{money(round2(regularReceipts.reduce((s, r) => s + receiptUnallocated(r), 0)))}</strong></span>
            <span className="pa-chip pa-chip--advance">Advance <strong>{money(advancePool)}</strong></span>
          </div>
        </div>

        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th className="pa-col-check" aria-label="Use for allocation" />
                <th>Receipt</th>
                <th>Date</th>
                <th>Type</th>
                <th>Mode / Reference</th>
                <th>Towards</th>
                <th className="pa-num">Amount</th>
                <th className="pa-num">Allocated</th>
                <th className="pa-num">Unallocated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {openReceipts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="pa-empty">
                    {prompt || (receiptsLoading ? "Loading receipts…" : "No unallocated receipts for these parties. Enter a payment above.")}
                  </td>
                </tr>
              ) : (
                openReceipts.map((r) => (
                  <tr key={r.receiptId} className={r.kind === "Regular" && excluded.has(r.receiptId) ? "is-muted" : ""}>
                    <td className="pa-col-check">
                      {r.kind === "Regular" ? (
                        <input type="checkbox" checked={!excluded.has(r.receiptId)} onChange={() => toggleReceipt(r.receiptId)} aria-label={`Use receipt ${r.receiptNumber} for allocation`} title="Use this receipt for the allocation below" />
                      ) : (
                        <FiZap className="pa-auto" aria-label="Adjusted automatically" title="Advance: adjusted automatically by the contract's advance %" />
                      )}
                    </td>
                    <td>{r.receiptNumber}</td>
                    <td>{shortDate(r.receiptDate)}</td>
                    <td>
                      <span className={`pa-tag pa-tag--${r.kind === "Advance" ? "advance" : "regular"}`}>{r.kind === "Advance" ? `Advance · ${r.contractNumber ?? ""}` : "Payment"}</span>
                    </td>
                    <td>
                      {paymentModeLabels[r.paymentMode.toLowerCase() as PaymentMode]}
                      {r.reference ? ` · ${r.reference}` : ""}
                      {r.bankName ? <small className="pa-sub">{r.bankName}</small> : null}
                    </td>
                    <td>{dash(r.towards)}</td>
                    <td className="pa-num">{money(r.amount)}</td>
                    <td className="pa-num">{money(r.allocatedAmount)}</td>
                    <td className="pa-num pa-strong">{money(r.unallocatedAmount)}</td>
                    <td>
                      <div className="payment-advice-table__actions">
                        <button
                          type="button"
                          className="payment-advice-table__icon-btn payment-advice-table__icon-btn--edit"
                          onClick={() => handleEdit(r)}
                          aria-label="Edit payment"
                          title="Edit"
                        >
                          <FiEdit aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="payment-advice-table__icon-btn payment-advice-table__icon-btn--delete"
                          onClick={() => setRowPendingDelete(r)}
                          disabled={!r.canDelete}
                          aria-label="Delete payment"
                          title={!r.canDelete ? "Part of this receipt is already allocated" : "Delete"}
                        >
                          <FiTrash2 aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================== 3. Uncleared invoices: allocate */}
      <section className="payment-advice-card" aria-labelledby="pa-invoices-title">
        <div className="pa-head">
          <h2 id="pa-invoices-title" className="payment-advice-card__title pa-head__title">
            Uncleared Invoices
          </h2>
          <label className="pa-switch">
            <input type="checkbox" checked={adjustAdvance} onChange={(event) => setAdjustAdvance(event.target.checked)} />
            Adjust advance by the contract's advance %
          </label>
        </div>

        <div className="pa-pool" role="status">
          <div><span>Selected receipts</span><strong>{money(regularPool)}</strong></div>
          <div><span>Allocating now</span><strong>{money(allocTotal)}</strong></div>
          <div className={poolLeft < -0.004 ? "is-bad" : ""}><span>Left in receipts</span><strong>{money(poolLeft)}</strong></div>
          <div><span>Advance adjusted</span><strong>{money(advanceTotal)}</strong></div>
          <div className="pa-pool__buttons">
            <button type="button" className="pa-btn" onClick={handleAutoAllocate} disabled={openInvoices.length === 0 || regularPool <= 0}>
              <FiZap aria-hidden /> Auto-allocate
            </button>
            <button type="button" className="pa-btn pa-btn--ghost" onClick={() => setAlloc({})} disabled={allocTotal <= 0}>
              Clear
            </button>
          </div>
        </div>

        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Invoice</th>
                <th>Date</th>
                <th className="pa-num">Invoice Amount</th>
                <th className="pa-num">Already Paid</th>
                <th className="pa-num">Advance Adjusted</th>
                <th className="pa-num">Balance</th>
                <th className="pa-num">Advance Now</th>
                <th className="pa-alloc-col">Allocate Now</th>
                <th className="pa-num">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {openInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="pa-empty">
                    {prompt || (invoicesLoading ? "Loading invoices…" : "No uncleared invoices for these parties.")}
                  </td>
                </tr>
              ) : (
                openInvoices.map((invoice) => {
                  const plan = advancePlan[invoice.invoiceId];
                  const error = rowError(invoice);
                  const cash = Math.max(num(alloc[invoice.invoiceId] ?? ""), 0);
                  return (
                    <tr key={invoice.invoiceId}>
                      <td>
                        {invoice.contractNumber}
                        <small className="pa-sub">{invoice.productName}</small>
                      </td>
                      <td>{invoice.invoiceNumber}</td>
                      <td>{shortDate(invoice.invoiceDate)}</td>
                      <td className="pa-num">{money(invoice.payableAmount)}</td>
                      <td className="pa-num">{money(invoice.paidAmount)}</td>
                      <td className="pa-num">{money(invoice.advanceAdjusted)}</td>
                      <td className="pa-num pa-strong">{money(invoiceBalance(invoice))}</td>
                      <td className="pa-num">
                        {plan && plan.percent > 0 ? (
                          <>
                            <span className="pa-strong">{money(plan.amount)}</span>
                            <small className={`pa-sub${plan.short ? " pa-sub--warn" : ""}`}>
                              {plan.percent}% of invoice{plan.short ? " · advance short" : ""}
                            </small>
                          </>
                        ) : (
                          <span className="pa-muted">–</span>
                        )}
                      </td>
                      <td className="pa-alloc-col">
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`pa-input${(applyTried || alloc[invoice.invoiceId]) && error ? " has-error" : ""}`}
                          aria-label={`Allocate to invoice ${invoice.invoiceNumber}`}
                          placeholder="0"
                          value={alloc[invoice.invoiceId] ?? ""}
                          onChange={(event) => setAlloc((prev) => ({ ...prev, [invoice.invoiceId]: event.target.value.replace(/[^0-9.]/g, "") }))}
                        />
                        {error && (applyTried || alloc[invoice.invoiceId]) && <small className="pa-error">{error}</small>}
                      </td>
                      <td className="pa-num pa-strong">{money(round2(Math.max(dueAfterAdvance(invoice) - cash, 0)))}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {openInvoices.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3}>Total</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + i.payableAmount, 0)))}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + i.paidAmount, 0)))}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + i.advanceAdjusted, 0)))}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + invoiceBalance(i), 0)))}</td>
                  <td className="pa-num">{money(advanceTotal)}</td>
                  <td className="pa-alloc-col pa-num">{money(allocTotal)}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + Math.max(dueAfterAdvance(i) - Math.max(num(alloc[i.invoiceId] ?? ""), 0), 0), 0)))}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {applyTried && overPool && (
          <p className="payment-advice-card__error" role="alert">
            You are allocating {money(allocTotal)} but the selected receipts only have {money(regularPool)}. Tick more receipts above or reduce the amounts.
          </p>
        )}
        {applyTried && nothingToApply && (
          <p className="payment-advice-card__error" role="alert">
            Enter an amount against at least one invoice, or use Auto-allocate.
          </p>
        )}

        <div className="payment-advice-actions">
          <button type="button" className="payment-advice-actions__cancel" onClick={() => setAlloc({})}>
            <FiX aria-hidden /> Reset
          </button>
          <button type="button" className="payment-advice-actions__save" onClick={handleApply} disabled={openInvoices.length === 0 || applying}>
            <FiCheck aria-hidden /> {applying ? "Applying…" : "Apply Allocation"}
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Delete this payment?"
        message="This will remove the payment entry. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default Paymentadvice;
