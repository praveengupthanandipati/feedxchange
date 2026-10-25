import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePermission } from "../../auth/AuthContext";
import {
  useGetNotificationHistoryQuery,
  useResendNotificationsMutation,
} from "../../store/notificationsApi";
import type { NotificationHistoryItem, ResendContentMode, ResendResult } from "../../store/notificationsApi";
import { formatApiDateTime } from "../../utils/apiDateTime";
import NotifyModal from "../../notifications/NotifyModal";
import StatusPill from "./StatusPill";
import DeliveryDetailModal from "./DeliveryDetailModal";
import "../../notifications/Notifications.scss";

const CHANNELS = [["", "All channels"], ["EMAIL", "Email"], ["WHATSAPP", "WhatsApp"], ["SMS", "SMS"], ["APP", "App"]];
const STATUSES = ["", "Queued", "Submitted", "Delivered", "Read", "Failed", "RetryScheduled"];
const PAGE_SIZE = 25;

/** A delivery can be resent once it is settled; ones still in flight, and legacy rows with no stored message, cannot. */
const resendable = (d: NotificationHistoryItem) =>
  !d.isLegacy && !["Pending", "Queued", "Processing", "RetryScheduled"].includes(d.status);

const errorText = (e: unknown): string => {
  const err = e as { data?: { message?: string } | string };
  return typeof err?.data === "string" ? err.data : (err?.data?.message ?? "Something went wrong. Please try again.");
};

/**
 * Everything sent against one contract: the original deliveries and every resend, with channel, status and time. Select past
 * messages and resend them; the originals stay untouched and each resend is a new, linked, audited delivery.
 */
const ContractNotificationHistory = () => {
  const { id = "" } = useParams<{ id: string }>();
  const contractNumber = decodeURIComponent(id);
  const canResend = usePermission("notifications.resend");
  const canSend = usePermission("notifications.send");

  const [channelCode, setChannelCode] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isFetching, error } = useGetNotificationHistoryQuery({ contractNumber, channelCode, status, page, pageSize: PAGE_SIZE });
  const [resend, { isLoading: resending }] = useResendNotificationsMutation();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [viewId, setViewId] = useState<number | null>(null);
  const [resendOpen, setResendOpen] = useState(false);
  const [mode, setMode] = useState<ResendContentMode>("Original");
  const [reason, setReason] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendResult, setResendResult] = useState<ResendResult | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const idempotency = useRef(crypto.randomUUID());

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const byId = useMemo(() => new Map((data?.items ?? []).map((i) => [i.deliveryId, i])), [data]);

  const toggle = (itemId: number) =>
    setSelected((prev) => { const next = new Set(prev); if (next.has(itemId)) next.delete(itemId); else next.add(itemId); return next; });

  const selectable = items.filter(resendable);
  const allSelected = selectable.length > 0 && selectable.every((i) => selected.has(i.deliveryId));

  const openResend = () => {
    setResendError(""); setResendResult(null); setReason(""); setMode("Original");
    idempotency.current = crypto.randomUUID();
    setResendOpen(true);
  };

  const confirmResend = async () => {
    setResendError("");
    try {
      setResendResult(await resend({
        deliveryIds: [...selected], contentMode: mode, reason: reason.trim(), idempotencyKey: idempotency.current,
      }).unwrap());
      setSelected(new Set());
    } catch (e) {
      setResendError(errorText(e));
    }
  };

  return (
    <div className="container-fluid py-3">
      <Link to={`/contracts/${encodeURIComponent(contractNumber)}`} className="small">← Back to contract</Link>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-2">
        <h1 className="h4 mb-0">Notifications for contract {contractNumber}</h1>
        <div className="d-flex gap-2">
          {canSend && <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setComposeOpen(true)}>Send a message</button>}
          {canResend && (
            <button type="button" className="btn btn-primary btn-sm" disabled={selected.size === 0} onClick={openResend}>
              Resend selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <select className="form-select form-select-sm w-auto" value={channelCode} onChange={(e) => { setChannelCode(e.target.value); setPage(1); }} aria-label="Channel">
          {CHANNELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="form-select form-select-sm w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>

      {error ? (
        <div className="alert alert-danger">{errorText(error)}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                {canResend && (
                  <th style={{ width: "2rem" }}>
                    <input type="checkbox" className="form-check-input" aria-label="Select all" checked={allSelected}
                      onChange={() => setSelected(allSelected ? new Set() : new Set(selectable.map((i) => i.deliveryId)))} />
                  </th>
                )}
                <th>Message</th><th>Recipient</th><th>Channel</th><th>Status</th><th>Sent</th><th></th>
              </tr>
            </thead>
            <tbody>
              {isFetching && items.length === 0 && <tr><td colSpan={7} className="text-secondary">Loading…</td></tr>}
              {!isFetching && items.length === 0 && <tr><td colSpan={7} className="text-secondary">Nothing has been sent against this contract yet.</td></tr>}
              {items.map((d) => (
                <tr key={d.deliveryId}>
                  {canResend && (
                    <td>
                      <input type="checkbox" className="form-check-input" disabled={!resendable(d)} checked={selected.has(d.deliveryId)}
                        onChange={() => toggle(d.deliveryId)} aria-label={`Select ${d.eventName} to ${d.recipientName ?? d.recipientRole} by ${d.channelCode}`} />
                    </td>
                  )}
                  <td>
                    {d.eventName}
                    {d.isResend && <span className="badge text-bg-secondary ms-1" title={`Resend of #${d.parentDeliveryId}`}>Resend</span>}
                    {d.isLegacy && <span className="badge text-bg-light ms-1">Legacy</span>}
                    {d.resendCount > 0 && <span className="small text-secondary ms-1">resent {d.resendCount}×</span>}
                  </td>
                  <td>{d.recipientName ?? d.recipientRole}<div className="small text-secondary">{d.recipientRole}</div></td>
                  <td>{d.channelCode}<div className="small text-secondary">{d.address}</div></td>
                  <td>
                    <StatusPill status={d.status} />
                    {d.failureReason && <div className="small text-danger" style={{ maxWidth: "16rem" }}>{d.failureReason}</div>}
                  </td>
                  <td className="text-nowrap">{formatApiDateTime(d.createdAt)}</td>
                  <td><button type="button" className="btn btn-link btn-sm p-0" onClick={() => setViewId(d.deliveryId)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="small">Page {page} of {pages}</span>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      {viewId !== null && <DeliveryDetailModal id={viewId} onClose={() => setViewId(null)} />}

      <NotifyModal open={composeOpen} onClose={() => setComposeOpen(false)} title={`Send a message about ${contractNumber}`}
        eventCode="OPEN_TEXT_SHARED" contractNumber={contractNumber} />

      {resendOpen && (
        <div className="fx-modal__backdrop" onClick={() => !resending && setResendOpen(false)}>
          <div className="fx-modal__box fx-modal__box--narrow" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Resend notifications">
            <div className="fx-modal__header">
              <h2>Resend {selected.size} message{selected.size === 1 ? "" : "s"}</h2>
              <button type="button" className="fx-modal__close" onClick={() => setResendOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="fx-modal__body">
              {resendResult ? (
                <>
                  <div className="alert alert-success py-2">Resend queued. The originals are unchanged; each resend appears as a new row.</div>
                  <ul className="small ps-3">
                    {resendResult.items.map((r) => {
                      const o = byId.get(r.originalDeliveryId);
                      return <li key={r.originalDeliveryId}>{o ? `${o.recipientName ?? o.recipientRole} · ${o.channelCode}` : `#${r.originalDeliveryId}`}: {r.newDeliveryId ? "queued" : `skipped - ${r.skipped}`}</li>;
                    })}
                  </ul>
                </>
              ) : (
                <>
                  <ul className="small ps-3">
                    {[...selected].map((sid) => {
                      const o = byId.get(sid);
                      return <li key={sid}>{o ? `${o.eventName} → ${o.recipientName ?? o.recipientRole} by ${o.channelCode}` : `#${sid}`}</li>;
                    })}
                  </ul>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" id="mode-original" checked={mode === "Original"} onChange={() => setMode("Original")} />
                      <label className="form-check-label" htmlFor="mode-original"><strong>Resend original content</strong><br /><span className="small text-secondary">Exactly what was sent before.</span></label>
                    </div>
                    <div className="form-check mt-2">
                      <input className="form-check-input" type="radio" id="mode-current" checked={mode === "CurrentData"} onChange={() => setMode("CurrentData")} />
                      <label className="form-check-label" htmlFor="mode-current"><strong>Generate using current data</strong><br /><span className="small text-secondary">Re-created from today&apos;s data, for example the current freight or amount.</span></label>
                    </div>
                  </div>
                  <label className="form-label fw-semibold" htmlFor="resend-reason">Reason</label>
                  <textarea id="resend-reason" className="form-control" rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you resending? (kept for audit)" />
                  {resendError && <div className="alert alert-danger py-2 mt-3 mb-0">{resendError}</div>}
                </>
              )}
            </div>
            <div className="fx-modal__footer">
              {resendResult ? (
                <button type="button" className="btn btn-primary" onClick={() => setResendOpen(false)}>Done</button>
              ) : (
                <>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setResendOpen(false)} disabled={resending}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={() => void confirmResend()} disabled={resending || reason.trim().length < 3}>
                    {resending ? "Resending…" : "Resend"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractNotificationHistory;
