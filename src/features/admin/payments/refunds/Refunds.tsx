import { useEffect, useMemo, useState } from "react";
import { CircleAlertIcon, CircleCheckBigIcon, RotateCcwIcon } from "../../../../shared/components/icon";
import DatePickerInput from "../../../../shared/components/dropdown/DatePickerInput";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";
import {
  useCancelRefundMutation,
  useGetRefundBuyersQuery,
  useGetRefundableReceiptsQuery,
  useGetRefundSellersQuery,
  useGetRefundsQuery,
  useSaveRefundMutation,
  type Receipt,
  type ReceiptMode,
  type Refund,
} from "../../../../core/store/paymentAdviceApi";
import "./Refunds.scss";

const MODES: ReceiptMode[] = ["Online", "Cheque", "Cash", "None"];

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function todayInput(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Credit balance refund: pick a seller and buyer, see the unallocated money on their receipts, and refund all of it or a part. */
const Refunds = () => {
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");

  /** Amount typed against each receipt, keyed by receipt id. */
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [refundDate, setRefundDate] = useState(todayInput());
  const [mode, setMode] = useState<ReceiptMode>("Online");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");

  const [cancelling, setCancelling] = useState<Refund | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [formError, setFormError] = useState("");

  const sellerNum = Number(sellerId) || 0;
  const buyerNum = Number(buyerId) || 0;
  const hasPair = sellerNum > 0 && buyerNum > 0;

  const { data: sellers = [] } = useGetRefundSellersQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: buyers = [] } = useGetRefundBuyersQuery(sellerNum || undefined, { refetchOnMountOrArgChange: true });
  const {
    data: receipts = [],
    isFetching: receiptsLoading,
    isError: receiptsFailed,
    error: receiptsError,
  } = useGetRefundableReceiptsQuery({ sellerId: sellerNum, buyerId: buyerNum }, { skip: !hasPair, refetchOnMountOrArgChange: true });
  const { data: refunds = [] } = useGetRefundsQuery({ sellerId: sellerNum, buyerId: buyerNum }, { skip: !hasPair, refetchOnMountOrArgChange: true });
  const [saveRefund, { isLoading: saving }] = useSaveRefundMutation();
  const [cancelRefund, { isLoading: cancelBusy }] = useCancelRefundMutation();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // a different seller / buyer starts a fresh form
  useEffect(() => {
    setAmounts({});
    setFormError("");
  }, [sellerId, buyerId]);

  const totalUnallocated = round2(receipts.reduce((sum, r) => sum + r.unallocatedAmount, 0));
  const refundTotal = round2(receipts.reduce((sum, r) => sum + (Number(amounts[r.receiptId]) || 0), 0));

  const sellerOptions = useMemo(() => sellers.map((p) => ({ value: String(p.id), label: p.name })), [sellers]);
  const buyerOptions = useMemo(() => buyers.map((p) => ({ value: String(p.id), label: p.name })), [buyers]);

  const setAmount = (receipt: Receipt, raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setAmounts((prev) => ({ ...prev, [receipt.receiptId]: cleaned }));
    setFormError("");
  };

  const handleSubmit = async () => {
    const lines = receipts
      .map((r) => ({ receipt: r, amount: round2(Number(amounts[r.receiptId]) || 0) }))
      .filter((l) => l.amount !== 0);
    if (lines.length === 0) return setFormError("Enter the amount to refund against at least one receipt.");
    const over = lines.find((l) => l.amount > l.receipt.unallocatedAmount + 0.004 || l.amount < 0);
    if (over) return setFormError(`Receipt ${over.receipt.receiptNumber}: enter an amount between 0 and ${money(over.receipt.unallocatedAmount)}.`);
    if (!refundDate) return setFormError("Select the refund date.");
    if ((mode === "Online" || mode === "Cheque") && !reference.trim()) {
      return setFormError(mode === "Online" ? "Enter the transaction ID." : "Enter the cheque / UTR number.");
    }

    try {
      await saveRefund({
        sellerId: sellerNum,
        buyerId: buyerNum,
        refundDate,
        paymentMode: mode,
        reference: reference.trim() || undefined,
        remarks: remarks.trim() || undefined,
        lines: lines.map((l) => ({ receiptId: l.receipt.receiptId, amount: l.amount })),
      }).unwrap();
      setToast({ kind: "ok", text: `${money(refundTotal)} refunded.` });
      setAmounts({});
      setReference("");
      setRemarks("");
      setFormError("");
    } catch (e) {
      setFormError(apiErrorMessage(e, "The refund could not be saved."));
    }
  };

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await cancelRefund(cancelling.refundId).unwrap();
      setToast({ kind: "ok", text: `Refund of ${money(cancelling.amount)} cancelled; the amount is unallocated again.` });
    } catch (e) {
      setToast({ kind: "error", text: apiErrorMessage(e, "The refund could not be cancelled.") });
    } finally {
      setCancelling(null);
    }
  };

  const receiptColumns: TableColumn<Receipt>[] = [
    { key: "receiptNumber", header: "Receipt #" },
    { key: "receiptDate", header: "Date", render: (r) => formatDate(r.receiptDate) },
    { key: "contractNumber", header: "Contract #", render: (r) => r.contractNumber ?? "—" },
    { key: "paymentMode", header: "Mode" },
    { key: "reference", header: "Reference", render: (r) => r.reference ?? "—" },
    { key: "amount", header: "Receipt Amount", align: "right", render: (r) => money(r.amount) },
    { key: "allocatedAmount", header: "Allocated", align: "right", render: (r) => money(r.allocatedAmount) },
    { key: "refundedAmount", header: "Refunded", align: "right", render: (r) => money(r.refundedAmount) },
    {
      key: "unallocatedAmount",
      header: "Unallocated",
      align: "right",
      render: (r) => <span className="refunds-table__amount">{money(r.unallocatedAmount)}</span>,
    },
    {
      key: "refundNow",
      header: "Refund Amount",
      render: (r) => (
        <div className="refunds-table__refund-input">
          <input
            type="text"
            inputMode="decimal"
            value={amounts[r.receiptId] ?? ""}
            placeholder="0.00"
            onChange={(e) => setAmount(r, e.target.value)}
            aria-label={`Refund amount for receipt ${r.receiptNumber}`}
          />
          <button type="button" onClick={() => setAmounts((prev) => ({ ...prev, [r.receiptId]: String(r.unallocatedAmount) }))}>
            Full
          </button>
        </div>
      ),
    },
  ];

  const historyColumns: TableColumn<Refund>[] = [
    { key: "refundDate", header: "Refund Date", render: (r) => formatDate(r.refundDate) },
    { key: "receiptNumber", header: "Receipt #" },
    { key: "contractNumber", header: "Contract #", render: (r) => r.contractNumber ?? "—" },
    { key: "paymentMode", header: "Mode" },
    { key: "reference", header: "Reference", render: (r) => r.reference ?? "—" },
    { key: "amount", header: "Amount", align: "right", render: (r) => money(r.amount) },
    { key: "remarks", header: "Remarks", render: (r) => r.remarks ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => <span className={`refunds-table__status refunds-table__status--${r.status.toLowerCase()}`}>{r.status}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) =>
        r.status === "Active" ? (
          <button type="button" className="refunds-table__link-btn" onClick={() => setCancelling(r)} aria-label={`Cancel refund of ${money(r.amount)}`}>
            <RotateCcwIcon aria-hidden /> Cancel
          </button>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="refunds-page">
      {toast && (
        <div className={`refunds-page__toast${toast.kind === "error" ? " refunds-page__toast--error" : ""}`} role="status">
          {toast.kind === "ok" ? <CircleCheckBigIcon aria-hidden /> : <CircleAlertIcon aria-hidden />}
          {toast.text}
        </div>
      )}

      <section className="refunds-card" aria-labelledby="refunds-title">
        <div className="refunds-card__header">
          <h1 id="refunds-title">Credit Balance Refund</h1>
        </div>

        <div className="refunds-selectors">
          <SearchableSelect
            options={sellerOptions}
            value={sellerId}
            onChange={(value) => {
              setSellerId(value);
              setBuyerId("");
            }}
            placeholder="Select Seller"
            ariaLabel="Select Seller"
          />
          <SearchableSelect
            options={buyerOptions}
            value={buyerId}
            onChange={(value) => {
              setBuyerId(value);
            }}
            placeholder="Select Buyer"
            ariaLabel="Select Buyer"
            disabled={!sellerNum}
          />
        </div>

        {!hasPair && <p className="refunds-card__notice">Select a seller and a buyer to see the unallocated amounts that can be refunded.</p>}

        {hasPair && (
          <>
            <dl className="refunds-summary">
              <div>
                <dt>Total unallocated:</dt>
                <dd>{money(totalUnallocated)}</dd>
              </div>
              <div>
                <dt>Refunding now:</dt>
                <dd>{money(refundTotal)}</dd>
              </div>
            </dl>

            {receiptsFailed && <p className="refunds-filters__error">{apiErrorMessage(receiptsError, "Could not load the receipts.")}</p>}

            <h2 className="refunds-card__subtitle">Unallocated amounts</h2>
            <Table
              columns={receiptColumns}
              data={receipts}
              rowKey={(row) => String(row.receiptId)}
              emptyMessage={receiptsLoading ? "Loading…" : "There is no unallocated amount to refund for this seller and buyer."}
              className="refunds-table"
            />

            {receipts.length > 0 && (
              <div className="refunds-form">
                <div className="refunds-form__field">
                  <label htmlFor="refund-date">Refund Date</label>
                  <DatePickerInput id="refund-date" value={refundDate} onChange={setRefundDate} />
                </div>
                <div className="refunds-form__field">
                  <label htmlFor="refund-mode">Pay Type</label>
                  <select id="refund-mode" value={mode} onChange={(e) => setMode(e.target.value as ReceiptMode)}>
                    {MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="refunds-form__field">
                  <label htmlFor="refund-ref">Ref Number</label>
                  <input id="refund-ref" type="text" value={reference} placeholder="Transaction ID / cheque / UTR" onChange={(e) => setReference(e.target.value)} />
                </div>
                <div className="refunds-form__field refunds-form__field--wide">
                  <label htmlFor="refund-remarks">Remarks</label>
                  <input id="refund-remarks" type="text" value={remarks} placeholder="Enter Remarks" onChange={(e) => setRemarks(e.target.value)} />
                </div>

                {formError && (
                  <p className="refunds-filters__error" role="alert">
                    {formError}
                  </p>
                )}

                <div className="refunds-form__buttons">
                  <button type="button" className="refunds-btn refunds-btn--primary" disabled={saving || refundTotal <= 0} onClick={() => void handleSubmit()}>
                    {saving ? "Refunding…" : `Refund (${money(refundTotal)})`}
                  </button>
                </div>
              </div>
            )}

            <h2 className="refunds-card__subtitle">Refunds made</h2>
            <Table columns={historyColumns} data={refunds} rowKey={(row) => String(row.refundId)} emptyMessage="No refunds yet." className="refunds-table" />
          </>
        )}
      </section>

      <ConfirmDialog
        open={cancelling !== null}
        title="Cancel this refund?"
        message={`The refund of ${cancelling ? money(cancelling.amount) : ""} against receipt ${cancelling?.receiptNumber ?? ""} is cancelled and the amount becomes unallocated again. Make sure the money was not actually paid out.`}
        confirmLabel={cancelBusy ? "Cancelling…" : "Cancel refund"}
        cancelLabel="Keep"
        confirmDisabled={cancelBusy}
        onConfirm={() => void confirmCancel()}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
};

export default Refunds;
