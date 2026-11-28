import { useEffect, useMemo, useState } from "react";
import { useProfileCities, withCity } from "../../../../shared/hooks/useProfileCities";
import { CircleAlertIcon, CircleCheckBigIcon, RotateCcwIcon, SearchIcon } from "../../../../shared/components/icon";
import { Badge, Input, Select } from "../../../../shared/components/ui";
import DatePickerInput from "../../../../shared/components/dropdown/DatePickerInput";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { DATE_PRESETS, presetRange } from "../dateRanges";
import { groupPartLabel } from "../payment-advice/paymentAdvice.data";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";
import {
  useCancelRefundMutation,
  useGetRefundBuyersQuery,
  useSearchReceiptsQuery,
  useSearchRefundsQuery,
  useGetRefundSellersQuery,
  useSaveRefundMutation,
  type Receipt,
  type ReceiptMode,
  type Refund,
} from "../../../../core/store/paymentAdviceApi";
import LookupLoadError from "../../../../shared/components/feedback/LookupLoadError";
// the dashboards' table toolbar (bd-toolbar) styles
import "../../business-dashboard/BusinessDashboard.scss";
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

const ALL = "__all";

/**
 * Credit balance refund: pick a seller and buyer. Add Refunds (mode "add") shows the unallocated money on their receipts to refund all of
 * it or a part; View Refunds (mode "view") lists the refunds already made, where one can be cancelled.
 */
const Refunds = ({ mode: pageMode = "add" }: { mode?: "add" | "view" }) => {
  const isView = pageMode === "view";
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");

  /** Amount typed against each receipt, keyed by receipt id. */
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [refundDate, setRefundDate] = useState(todayInput());
  const [mode, setMode] = useState<ReceiptMode>("Online");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");

  // Add Refunds: the date filter comes first; seller and buyer are optional
  const [datePreset, setDatePreset] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const dateRange = datePreset === "custom" ? { from: customFrom || undefined, to: customTo || undefined } : presetRange(datePreset);

  const [cancelling, setCancelling] = useState<Refund | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [formError, setFormError] = useState("");
  // View Refunds: the table's own search and filters
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("all");
  const [historyMode, setHistoryMode] = useState("all");

  const sellerNum = Number(sellerId) || 0;
  const buyerNum = Number(buyerId) || 0;

  const { data: sellers = [], isError: sellersFailed } = useGetRefundSellersQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: buyers = [], isError: buyersFailed } = useGetRefundBuyersQuery(sellerNum || undefined, { refetchOnMountOrArgChange: true });
  const {
    data: receiptsData = [],
    isFetching: receiptsLoading,
    isError: receiptsFailed,
    error: receiptsError,
  } = useSearchReceiptsQuery(
    { sellerId: sellerNum || undefined, buyerId: buyerNum || undefined, from: dateRange.from, to: dateRange.to },
    { skip: isView, refetchOnMountOrArgChange: true },
  );
  // the receipts of one split payment stay together
  const receipts = useMemo(() => {
    const firstOfGroup = new Map<string, number>();
    receiptsData.forEach((r, i) => {
      if (r.paymentGroupId && !firstOfGroup.has(r.paymentGroupId)) firstOfGroup.set(r.paymentGroupId, i);
    });
    const position = (r: Receipt, i: number) => (r.paymentGroupId ? (firstOfGroup.get(r.paymentGroupId) ?? i) : i);
    return receiptsData.map((r, i) => ({ r, i })).sort((x, y) => position(x.r, x.i) - position(y.r, y.i) || x.i - y.i).map((x) => x.r);
  }, [receiptsData]);
  // under the last listed part of each split payment: what the payment was and how it was divided
  const groupSummaryKeys = useMemo(() => {
    const last = new Map<string, string>();
    receipts.forEach((r) => {
      if (r.paymentGroupId) last.set(r.paymentGroupId, String(r.receiptId));
    });
    return [...last.values()];
  }, [receipts]);
  const groupSummary = (row: Receipt) => (
    <div style={{ padding: "6px 12px", fontSize: "var(--fx-text-sm)", borderLeft: "4px solid var(--color-primary, #1e3a6e)" }}>
      <strong>One payment of {money(row.groupTotalAmount ?? row.amount)}</strong> on {formatDate(row.receiptDate)} ({row.paymentMode}
      {row.reference ? ` · ${row.reference}` : ""}) split into {row.groupPartCount} parts:{" "}
      {receipts
        .filter((x) => x.paymentGroupId === row.paymentGroupId)
        .map((x) => groupPartLabel(x, true))
        .join(" · ")}
    </div>
  );
  const { data: refunds = [] } = useSearchRefundsQuery(
    { sellerId: sellerNum || undefined, buyerId: buyerNum || undefined, from: dateRange.from, to: dateRange.to },
    { skip: !isView, refetchOnMountOrArgChange: true },
  );
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

  const { cityOf } = useProfileCities();
  const sellerOptions = useMemo(() => sellers.map((p) => ({ value: String(p.id), label: withCity(p.name, cityOf(p.id)) })), [sellers, cityOf]);
  const buyerOptions = useMemo(() => buyers.map((p) => ({ value: String(p.id), label: withCity(p.name, cityOf(p.id)) })), [buyers, cityOf]);
  const nameOf = (options: { value: string; label: string }[], id: number) => options.find((o) => o.value === String(id))?.label ?? `#${id}`;
  // printed under the PDF title of both tables
  const pairLabel = `Seller: ${sellerOptions.find((o) => o.value === sellerId)?.label ?? "-"} | Buyer: ${buyerOptions.find((o) => o.value === buyerId)?.label ?? "-"}`;

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
      // a refund belongs to one seller and buyer: receipts of different pairs are refunded one pair after the other
      const pairs = new Map<string, typeof lines>();
      lines.forEach((l) => {
        const key = `${l.receipt.sellerId}-${l.receipt.buyerId}`;
        pairs.set(key, [...(pairs.get(key) ?? []), l]);
      });
      for (const pairLines of pairs.values()) {
        await saveRefund({
          sellerId: pairLines[0].receipt.sellerId,
          buyerId: pairLines[0].receipt.buyerId,
          refundDate,
          paymentMode: mode,
          reference: reference.trim() || undefined,
          remarks: remarks.trim() || undefined,
          lines: pairLines.map((l) => ({ receiptId: l.receipt.receiptId, amount: l.amount })),
        }).unwrap();
      }
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
    {
      key: "receiptNumber",
      header: "Receipt #",
      render: (r) =>
        r.paymentGroupId ? (
          <span style={{ borderLeft: "4px solid var(--color-primary, #1e3a6e)", paddingLeft: 8 }} title={`Part of one payment of ${money(r.groupTotalAmount ?? r.amount)}`}>
            {r.receiptNumber}
          </span>
        ) : (
          r.receiptNumber
        ),
      exportValue: (r) => r.receiptNumber,
    },
    { key: "receiptDate", header: "Date", render: (r) => formatDate(r.receiptDate) },
    { key: "sellerId", header: "Seller", render: (r) => nameOf(sellerOptions, r.sellerId), exportValue: (r) => nameOf(sellerOptions, r.sellerId) },
    { key: "buyerId", header: "Buyer", render: (r) => nameOf(buyerOptions, r.buyerId), exportValue: (r) => nameOf(buyerOptions, r.buyerId) },
    {
      key: "kind",
      header: "Type",
      render: (r) => (
        <>
          {r.kind === "Advance" ? `Advance${r.contractNumber ? ` · ${r.contractNumber}` : ""}` : r.kind || "—"}
          {r.convertedFromReceiptNumber && <small style={{ display: "block", opacity: 0.7 }}>Converted from advance {r.convertedFromReceiptNumber}</small>}
        </>
      ),
      exportValue: (r) => r.kind || "",
    },
    // Contract, Mode, Reference, Towards, Remarks and Status are not shown here (only what a refund needs).
    { key: "bankName", header: "Bank", render: (r) => r.bankName || "—" },
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
      // what the user types in: not exported, and always shown
      exportable: false,
      hideable: false,
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

  // View Refunds: the dashboards' table (search, filters, sorting, paging)
  const historyRows = useMemo(() => {
    const needle = historySearch.trim().toLowerCase();
    return refunds.filter(
      (r) =>
        (historyStatus === "all" || r.status === historyStatus) &&
        (historyMode === "all" || r.paymentMode === historyMode) &&
        (!needle || [r.receiptNumber, r.contractNumber, r.reference, r.remarks].some((v) => v?.toLowerCase().includes(needle))),
    );
  }, [refunds, historySearch, historyStatus, historyMode]);

  const historyColumns: TableColumn<Refund>[] = [
    {
      key: "refundDate",
      header: "Refund Date",
      sortable: true,
      render: (r) => formatDate(r.refundDate),
      sortValue: (r) => r.refundDate,
      exportValue: (r) => formatDate(r.refundDate),
    },
    { key: "receiptNumber", header: "Receipt #", sortable: true, hideable: false },
    { key: "sellerId", header: "Seller", sortable: true, render: (r) => nameOf(sellerOptions, r.sellerId), sortValue: (r) => nameOf(sellerOptions, r.sellerId), exportValue: (r) => nameOf(sellerOptions, r.sellerId) },
    { key: "buyerId", header: "Buyer", sortable: true, render: (r) => nameOf(buyerOptions, r.buyerId), sortValue: (r) => nameOf(buyerOptions, r.buyerId), exportValue: (r) => nameOf(buyerOptions, r.buyerId) },
    { key: "contractNumber", header: "Contract #", sortable: true, render: (r) => r.contractNumber ?? "—", sortValue: (r) => r.contractNumber ?? "" },
    { key: "paymentMode", header: "Pay Type", sortable: true },
    { key: "reference", header: "Reference", sortable: true, render: (r) => r.reference ?? "—", sortValue: (r) => r.reference ?? "" },
    { key: "amount", header: "Amount", sortable: true, align: "right", render: (r) => money(r.amount), sortValue: (r) => r.amount },
    { key: "remarks", header: "Remarks", sortable: true, priority: "low", render: (r) => r.remarks ?? "—", sortValue: (r) => r.remarks ?? "" },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => <Badge tone={r.status === "Active" ? "success" : r.status === "Cancelled" ? "danger" : "neutral"}>{r.status}</Badge>,
      sortValue: (r) => r.status,
      exportValue: (r) => r.status,
    },
    {
      key: "actions",
      header: "Actions",
      hideable: false,
      exportable: false,
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
          <h1 id="refunds-title">{isView ? "View Refunds" : "Add Refunds"}</h1>
        </div>
        <LookupLoadError failed={sellersFailed || buyersFailed} className="refunds-filters__error" />

        <div
          className="refunds-selectors"
          style={{ alignItems: "end", gridTemplateColumns: datePreset === "custom" ? "minmax(9rem, 0.8fr) repeat(2, minmax(9rem, 0.7fr)) 1.4fr 1.4fr" : "minmax(9rem, 0.8fr) 1.4fr 1.4fr" }}
        >
          {(
            <>
              <div className="refunds-form__field">
                <label htmlFor="refund-date-filter">Date</label>
                <Select id="refund-date-filter" aria-label="Payment date" value={datePreset} onChange={(event) => setDatePreset(event.target.value)}>
                  {DATE_PRESETS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
              {datePreset === "custom" && (
                <>
                  <Input type="date" label="From" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} />
                  <Input type="date" label="To" value={customTo} min={customFrom || undefined} onChange={(event) => setCustomTo(event.target.value)} />
                </>
              )}
            </>
          )}
          <div className="refunds-form__field">
            <label>Seller</label>
            <SearchableSelect
              options={[{ value: ALL, label: "All sellers" }, ...sellerOptions]}
              value={!sellerId ? ALL : sellerId}
              onChange={(value) => {
                setSellerId(value === ALL ? "" : value);
                setBuyerId("");
              }}
              placeholder="All sellers"
              ariaLabel="Select Seller"
            />
          </div>
          <div className="refunds-form__field">
            <label>Buyer</label>
            <SearchableSelect
              options={[{ value: ALL, label: "All buyers" }, ...buyerOptions]}
              value={!buyerId ? ALL : buyerId}
              onChange={(value) => {
                setBuyerId(value === ALL ? "" : value);
              }}
              placeholder="All buyers"
              ariaLabel="Select Buyer"
            />
          </div>
        </div>

        {!isView && (
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
              exportName="Unallocated Amounts"
              exportSubtitle={pairLabel}
              columnToggle
              columns={receiptColumns}
              data={receipts}
              rowKey={(row) => String(row.receiptId)}
              expandedRowKeys={groupSummaryKeys}
              renderExpandedRow={groupSummary}
              emptyMessage={receiptsLoading ? "Loading…" : "There is no unallocated amount to refund for these filters."}
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
          </>
        )}

        {isView && (
          <>
            <h2 className="refunds-card__subtitle">Refunds made</h2>
            <Table
              toolbar={
                <div className="bd-toolbar">
                  <div className="bd-toolbar__filters">
                    <Input
                      icon={SearchIcon}
                      type="search"
                      placeholder="Receipt, contract, reference, remarks…"
                      aria-label="Search refunds"
                      value={historySearch}
                      onChange={(event) => setHistorySearch(event.target.value)}
                      fieldClassName="bd-toolbar__search"
                    />
                    <Select aria-label="Refund status" value={historyStatus} onChange={(event) => setHistoryStatus(event.target.value)}>
                      <option value="all">All statuses</option>
                      <option value="Active">Active</option>
                      <option value="Cancelled">Cancelled</option>
                    </Select>
                    <Select aria-label="Pay type" value={historyMode} onChange={(event) => setHistoryMode(event.target.value)}>
                      <option value="all">All pay types</option>
                      {MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              }
              exportName="Refunds Made"
              exportSubtitle={pairLabel}
              columns={historyColumns}
              data={historyRows}
              rowKey={(row) => String(row.refundId)}
              pageSize={10}
              variant="light"
              mobileCards
              columnToggle
              emptyMessage={refunds.length === 0 ? "No refunds for these filters." : "No refunds match these filters."}
              className="refunds-table"
            />
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
