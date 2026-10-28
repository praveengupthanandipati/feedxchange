import { useEffect } from "react";
import { useGetDeliveryDetailQuery } from "../../../core/store/notificationsApi";
import type { DeliveryStatus } from "../../../core/store/notificationsApi";
import { formatApiDateTime } from "../../../shared/utils/apiDateTime";
import StatusPill from "./StatusPill";
import "../../../shared/notifications/Notifications.scss";

/** One sent message exactly as it was rendered, with its facts and every delivery attempt. */
const DeliveryDetailModal = ({ id, onClose }: { id: number; onClose: () => void }) => {
  const { data, isLoading } = useGetDeliveryDetailQuery(id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fx-modal__backdrop" onClick={onClose}>
      <div className="fx-modal__box fx-modal__box--medium" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Sent message">
        <div className="fx-modal__header">
          <h2>Sent message</h2>
          <button type="button" className="fx-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="fx-modal__body">
          {isLoading || !data ? <p className="text-secondary">Loading…</p> : (
            <>
              <dl className="fx-detail__facts">
                <div><dt>Message</dt><dd>{data.eventName}</dd></div>
                <div><dt>Recipient</dt><dd>{data.recipientName ?? data.recipientRole}{data.recipientRole && data.recipientName ? <small>{data.recipientRole}</small> : null}</dd></div>
                <div><dt>Channel</dt><dd>{data.channelCode}{data.address ? <small>{data.address}</small> : null}</dd></div>
                <div><dt>Status</dt><dd><StatusPill status={data.status} />{data.failureReason ? <small className="text-danger">{data.failureReason}</small> : null}</dd></div>
                <div><dt>Created</dt><dd>{formatApiDateTime(data.createdAt)}</dd></div>
                {data.deliveredAt && <div><dt>Delivered</dt><dd>{formatApiDateTime(data.deliveredAt)}</dd></div>}
              </dl>

              <h3 className="fx-detail__title">Message</h3>
              {data.subject && <p className="fx-detail__subject"><strong>Subject:</strong> {data.subject}</p>}
              <pre className="fx-detail__body">{data.body ?? "(content was not stored)"}</pre>

              <h3 className="fx-detail__title">Delivery attempts</h3>
              {data.attempts.length === 0 ? <p className="text-secondary small">No attempts yet.</p> : (
                <ol className="fx-detail__attempts">
                  {data.attempts.map((a) => (
                    <li key={a.attemptNumber}>
                      <span className="fx-detail__num">{a.attemptNumber}</span>
                      <div>
                        <strong>{a.providerName ?? "Provider"}</strong> <StatusPill status={a.attemptStatus as DeliveryStatus} />
                        <small>{formatApiDateTime(a.requestedAt)}</small>
                        {(a.errorMessage || a.providerMessageId) && <small className={a.errorMessage ? "text-danger" : ""}>{a.errorMessage ?? a.providerMessageId}</small>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
        <div className="fx-modal__footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailModal;
