import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  MailIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  SearchIcon,
  SmartphoneIcon,
  XIcon,
} from "../../../shared/components/icon";
import DatePickerInput from "../../../shared/components/dropdown/DatePickerInput";
import SearchableSelect from "../../../shared/components/dropdown/SearchableSelect";
import {
  useGetHistoryBuyersQuery,
  useGetHistoryContractsQuery,
  useGetHistorySellersQuery,
  useGetNotificationHistoryQuery,
} from "../../../core/store/notificationsApi";
import type { ChannelCode } from "../../../core/store/notificationsApi";
import { apiErrorMessage } from "../../../core/store/sellerInvoiceApi";
import { formatApiDateTime } from "../../../shared/utils/apiDateTime";
import DeliveryDetailModal from "./DeliveryDetailModal";
import StatusPill from "./StatusPill";
import "./NotificationsCenter.scss";

const PAGE_SIZE = 20;

const CHANNELS: { value: string; label: string }[] = [
  { value: "", label: "All channels" }, { value: "EMAIL", label: "Email" }, { value: "WHATSAPP", label: "WhatsApp" }, { value: "SMS", label: "SMS" }, { value: "APP", label: "In-app" },
];
const STATUSES = ["", "Queued", "Submitted", "Delivered", "Read", "Failed", "RetryScheduled"];
const CHANNEL_ICON: Record<ChannelCode, typeof MailIcon> = { EMAIL: MailIcon, WHATSAPP: MessageCircleIcon, SMS: SmartphoneIcon, APP: BellIcon };
const CHANNEL_LABEL: Record<ChannelCode, string> = { EMAIL: "Email", WHATSAPP: "WhatsApp", SMS: "SMS", APP: "In-app" };

interface Filters {
  sellerId: string;
  buyerId: string;
  contractId: string;
  channelCode: string;
  status: string;
  from: string;
  to: string;
}

const EMPTY: Filters = { sellerId: "", buyerId: "", contractId: "", channelCode: "", status: "", from: "", to: "" };

/**
 * What was sent, found by contract, or by the seller and buyer who trade together. Nothing is loaded until one of those is chosen, so the
 * screen never pulls every message there is.
 */
const NotificationHistoryPanel = () => {
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<number | null>(null);

  const sellerNum = Number(draft.sellerId) || undefined;
  const buyerNum = Number(draft.buyerId) || undefined;
  const { data: sellers = [], isError: sellersFailed, error: sellersError } = useGetHistorySellersQuery(buyerNum);
  const { data: buyers = [], isError: buyersFailed } = useGetHistoryBuyersQuery(sellerNum);
  const { data: contracts = [], isError: contractsFailed } = useGetHistoryContractsQuery({ sellerId: sellerNum, buyerId: buyerNum });
  const lookupFailed = sellersFailed || buyersFailed || contractsFailed;

  const sellerOptions = useMemo(() => sellers.map((p) => ({ value: String(p.id), label: p.name })), [sellers]);
  const buyerOptions = useMemo(() => buyers.map((p) => ({ value: String(p.id), label: p.name })), [buyers]);
  const contractOptions = useMemo(
    () => contracts.map((c) => ({ value: String(c.contractId), label: `${c.contractNumber}${c.productName ? ` · ${c.productName}` : ""}${!sellerNum && !buyerNum && c.sellerName ? ` · ${c.sellerName} → ${c.buyerName ?? ""}` : ""}` })),
    [contracts, sellerNum, buyerNum],
  );

  const canSearch = !!(draft.contractId || draft.sellerId || draft.buyerId);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setDraft((prev) => ({ ...prev, [key]: value }));

  const contractNumber = applied?.contractId ? contracts.find((c) => String(c.contractId) === applied.contractId)?.contractNumber : undefined;
  const { data, isFetching, isError, error } = useGetNotificationHistoryQuery(
    applied
      ? {
          contractId: Number(applied.contractId) || undefined, sellerId: Number(applied.sellerId) || undefined, buyerId: Number(applied.buyerId) || undefined,
          channelCode: applied.channelCode, status: applied.status, from: applied.from, to: applied.to, page, pageSize: PAGE_SIZE,
        }
      : { page: 1 },
    { skip: !applied, refetchOnMountOrArgChange: true },
  );

  const search = () => {
    if (!canSearch) return;
    setApplied(draft);
    setPage(1);
  };

  const reset = () => {
    setDraft(EMPTY);
    setApplied(null);
    setPage(1);
  };

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = data?.items ?? [];

  return (
    <div className="nc-panel">
      <form className="nc-filters" onSubmit={(e) => { e.preventDefault(); search(); }} aria-label="Find notifications">
        <div className="nc-filters__grid">
          <div className="nc-field">
            <label>Seller</label>
            <SearchableSelect options={sellerOptions} value={draft.sellerId} onChange={(v) => setDraft((p) => ({ ...p, sellerId: v, contractId: "" }))} placeholder="Any seller" ariaLabel="Seller" clearable />
          </div>
          <div className="nc-field">
            <label>Buyer</label>
            <SearchableSelect options={buyerOptions} value={draft.buyerId} onChange={(v) => setDraft((p) => ({ ...p, buyerId: v, contractId: "" }))} placeholder="Any buyer" ariaLabel="Buyer" clearable />
          </div>
          <div className="nc-field">
            <label>Contract</label>
            <SearchableSelect options={contractOptions} value={draft.contractId} onChange={(v) => set("contractId", v)} placeholder="Any contract" ariaLabel="Contract" clearable />
          </div>
          <div className="nc-field nc-field--narrow">
            <label htmlFor="nc-channel">Channel</label>
            <select id="nc-channel" value={draft.channelCode} onChange={(e) => set("channelCode", e.target.value)}>
              {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="nc-field nc-field--narrow">
            <label htmlFor="nc-status">Status</label>
            <select id="nc-status" value={draft.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === "RetryScheduled" ? "Retrying" : s || "Any status"}</option>)}
            </select>
          </div>
          <div className="nc-field nc-field--dates">
            <label>Sent between</label>
            <div>
              <DatePickerInput value={draft.from} onChange={(v) => set("from", v)} ariaLabel="From date" clearable />
              <span aria-hidden>to</span>
              <DatePickerInput value={draft.to} onChange={(v) => set("to", v)} ariaLabel="To date" clearable />
            </div>
          </div>
        </div>
        {lookupFailed && (
          <p className="nc-error nc-error--inline" role="alert">
            <XIcon aria-hidden /> {apiErrorMessage(sellersError, "The seller, buyer and contract lists could not be loaded. Check that the API is up to date and that you have the notification history permission.")}
          </p>
        )}
        <div className="nc-filters__actions">
          <p>{canSearch ? "Ready to search." : "Choose a contract, or a seller and buyer, to see what was sent."}</p>
          <button type="button" className="nc-btn" onClick={reset}><RefreshCwIcon aria-hidden /> Reset</button>
          <button type="submit" className="nc-btn nc-btn--primary" disabled={!canSearch}><SearchIcon aria-hidden /> Search</button>
        </div>
      </form>

      {!applied && (
        <div className="nc-empty">
          <span aria-hidden><SearchIcon /></span>
          <h3>Find what was sent</h3>
          <p>Pick a seller and buyer, or a single contract. Only the matching messages are loaded.</p>
        </div>
      )}

      {applied && (
        <section className="nc-results" aria-live="polite">
          <header className="nc-results__head">
            <strong>{isFetching && !data ? "Searching…" : `${total} ${total === 1 ? "message" : "messages"}`}</strong>
            {contractNumber && <Link to={`/admin/contracts/${encodeURIComponent(contractNumber)}/notifications`} className="nc-link">Open contract {contractNumber} to resend</Link>}
          </header>

          {isError && <p className="nc-error" role="alert"><XIcon aria-hidden /> {apiErrorMessage(error, "Could not load the notifications.")}</p>}

          {!isError && !isFetching && items.length === 0 && <div className="nc-none">Nothing was sent for these filters.</div>}

          {items.length > 0 && (
            <div className="nc-table-wrap">
              <table className="nc-table">
                <thead>
                  <tr><th>Sent</th><th>Contract</th><th>Message</th><th>Recipient</th><th>Channel</th><th>Status</th><th><span className="nc-sr">View</span></th></tr>
                </thead>
                <tbody>
                  {items.map((d) => {
                    const Icon = CHANNEL_ICON[d.channelCode] ?? MailIcon;
                    return (
                      <tr key={d.deliveryId}>
                        <td className="nc-nowrap">{formatApiDateTime(d.createdAt)}</td>
                        <td>
                          {d.contractNumber ? <strong>{d.contractNumber}</strong> : <span className="nc-muted">—</span>}
                          {(d.sellerName || d.buyerName) && <small>{d.sellerName ?? "?"} → {d.buyerName ?? "?"}</small>}
                        </td>
                        <td>
                          {d.eventName}
                          {d.isResend && <span className="nc-tag" title={`Resend of #${d.parentDeliveryId}`}>Resend</span>}
                          {d.isLegacy && <span className="nc-tag nc-tag--muted">Legacy</span>}
                        </td>
                        <td>{d.recipientName ?? d.recipientRole}{d.recipientRole && d.recipientName ? <small>{d.recipientRole}</small> : null}</td>
                        <td><span className="nc-channel"><Icon aria-hidden /> {CHANNEL_LABEL[d.channelCode] ?? d.channelCode}</span>{d.address && <small>{d.address}</small>}</td>
                        <td>
                          <StatusPill status={d.status} />
                          {d.failureReason && <small className="nc-danger">{d.failureReason}</small>}
                        </td>
                        <td><button type="button" className="nc-icon-btn" onClick={() => setViewId(d.deliveryId)} aria-label={`View message to ${d.recipientName ?? d.recipientRole}`} title="View message"><EyeIcon aria-hidden /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {total > PAGE_SIZE && (
            <footer className="nc-pager">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
              <div>
                <button type="button" className="nc-icon-btn" disabled={page <= 1 || isFetching} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeftIcon aria-hidden /></button>
                <span>{page} / {pages}</span>
                <button type="button" className="nc-icon-btn" disabled={page >= pages || isFetching} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRightIcon aria-hidden /></button>
              </div>
            </footer>
          )}
        </section>
      )}

      {viewId !== null && <DeliveryDetailModal id={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default NotificationHistoryPanel;
