import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetNotificationChannelsQuery,
  useGetNotificationEventsQuery,
  useGetNotificationRecipientsQuery,
  useGetNotificationTemplatesQuery,
  usePreviewNotificationMutation,
  useSendNotificationMutation,
} from "../store/notificationsApi";
import type {
  ChannelCode,
  ComposeNotificationRequest,
  NotificationPreviewResult,
  RecipientCandidate,
  SendNotificationResult,
} from "../store/notificationsApi";
import "./Notifications.scss";

export interface NotifyPanelProps {
  /** What happened, e.g. "CONTRACT_CREATED", "TRUCK_ADDED", "OPEN_TEXT_SHARED". Decides the default channels and the templates offered. */
  eventCode: string;
  /** The contract the message is about (either one). Recipients are listed from it. */
  contractId?: number;
  contractNumber?: string;
  variantCode?: string;
  sourceEntityType?: string;
  sourceEntityId?: number;
  /** Extra values for the template (manual text events only; business events are filled in by the server). */
  data?: Record<string, string>;
  /** Show the free-text box. Defaults to true for OPEN_TEXT_SHARED. */
  allowOpenText?: boolean;
  /** Called after a successful send. */
  onSent?: (result: SendNotificationResult) => void;
  /** Called when the user chooses not to notify. */
  onSkip?: () => void;
  sendLabel?: string;
}

const CHANNEL_ORDER: ChannelCode[] = ["EMAIL", "WHATSAPP", "SMS", "APP"];

type ChannelPick = Partial<Record<ChannelCode, boolean>>;

const keyOf = (c: Pick<RecipientCandidate, "recipientType" | "recipientRefId">) => `${c.recipientType}:${c.recipientRefId}`;

/** Why a channel cannot be used for this recipient (null = fine). The server checks again; this only saves a round trip. */
const unavailableReason = (c: RecipientCandidate, channel: ChannelCode): string | null => {
  if (channel === "EMAIL" && !c.email) return "No email address";
  if ((channel === "SMS" || channel === "WHATSAPP") && !c.mobile) return "No mobile number";
  if (channel === "APP" && !c.hasAppLogin) return "No app login";
  return null;
};

/**
 * The "who do you want to tell, and how?" panel used on every screen that triggers a notification. The user ticks channels per
 * recipient (defaults come from the event rules), picks a template per channel (e.g. which email template), previews the exact
 * messages and sends - or skips. The server resolves addresses, data and templates; this panel only sends selections.
 */
const NotifyPanel = ({
  eventCode, contractId, contractNumber, variantCode, sourceEntityType, sourceEntityId, data, allowOpenText,
  onSent, onSkip, sendLabel = "Send",
}: NotifyPanelProps) => {
  const hasContract = contractId !== undefined || !!contractNumber;
  const { data: channels = [] } = useGetNotificationChannelsQuery();
  const { data: events = [] } = useGetNotificationEventsQuery();
  const { data: templates = [] } = useGetNotificationTemplatesQuery({ eventCode });
  const { data: loaded = [], isFetching: loadingRecipients } = useGetNotificationRecipientsQuery(
    { contractId, contractNumber }, { skip: !hasContract });
  const [preview, { isLoading: previewing }] = usePreviewNotificationMutation();
  const [send, { isLoading: sending }] = useSendNotificationMutation();

  const event = events.find((e) => e.eventCode === eventCode);
  const showText = allowOpenText ?? eventCode === "OPEN_TEXT_SHARED";
  const enabledChannels = useMemo(
    () => CHANNEL_ORDER.filter((code) => channels.find((c) => c.channelCode === code)?.isEnabled),
    [channels],
  );

  const [adhoc, setAdhoc] = useState<RecipientCandidate[]>([]);
  const [adhocForm, setAdhocForm] = useState({ name: "", email: "", mobile: "" });
  const candidates = useMemo(() => [...loaded, ...adhoc], [loaded, adhoc]);

  const [picks, setPicks] = useState<Record<string, ChannelPick>>({});
  const [templateByChannel, setTemplateByChannel] = useState<Partial<Record<ChannelCode, number | null>>>({});
  const [text, setText] = useState("");
  const [previewResult, setPreviewResult] = useState<NotificationPreviewResult | null>(null);
  const [sent, setSent] = useState<SendNotificationResult | null>(null);
  const [error, setError] = useState("");
  const idempotencyKey = useRef(crypto.randomUUID());

  // Pre-tick the event's default channels the first time each recipient appears (never overrides the user's later choices).
  const seeded = useRef(new Set<string>());
  useEffect(() => {
    if (!event) return;
    setPicks((prev) => {
      const next = { ...prev };
      for (const c of candidates) {
        const k = keyOf(c);
        if (seeded.current.has(k)) continue;
        seeded.current.add(k);
        const pick: ChannelPick = {};
        event.rules.filter((r) => r.recipientRole === c.role && r.isDefaultOn).forEach((r) => {
          if (!unavailableReason(c, r.channelCode)) pick[r.channelCode] = true;
        });
        next[k] = pick;
      }
      return next;
    });
  }, [candidates, event]);

  const usedChannels = useMemo(
    () => new Set(candidates.flatMap((c) => enabledChannels.filter((ch) => picks[keyOf(c)]?.[ch]))),
    [candidates, picks, enabledChannels],
  );

  const toggle = (c: RecipientCandidate, channel: ChannelCode) => {
    setPreviewResult(null);
    setPicks((prev) => ({ ...prev, [keyOf(c)]: { ...prev[keyOf(c)], [channel]: !prev[keyOf(c)]?.[channel] } }));
  };

  const addAdhoc = () => {
    const email = adhocForm.email.trim();
    const mobile = adhocForm.mobile.replace(/\s+/g, "");
    if (!email && !mobile) return;
    const next: RecipientCandidate = {
      recipientType: "Adhoc", recipientRefId: Date.now(), role: "SELECTED",
      displayName: adhocForm.name.trim() || email || mobile, organisation: null,
      email: email || null, mobile: mobile || null, hasAppLogin: false,
    };
    setAdhoc((prev) => [...prev, next]);
    setAdhocForm({ name: "", email: "", mobile: "" });
  };

  const buildRequest = (): ComposeNotificationRequest | null => {
    const recipients = candidates
      .map((c) => ({
        c,
        chosen: enabledChannels.filter((ch) => picks[keyOf(c)]?.[ch]),
      }))
      .filter((x) => x.chosen.length > 0)
      .map(({ c, chosen }) => ({
        recipientType: c.recipientType,
        recipientRefId: c.recipientType === "Adhoc" ? null : c.recipientRefId,
        role: c.role,
        displayName: c.displayName,
        email: c.recipientType === "Adhoc" ? c.email : null,
        mobile: c.recipientType === "Adhoc" ? c.mobile : null,
        channels: chosen.map((ch) => ({ channelCode: ch, templateId: templateByChannel[ch] ?? null })),
      }));
    if (recipients.length === 0) return null;
    return {
      eventCode, contractId, variantCode, sourceEntityType, sourceEntityId,
      openText: showText ? text : null, data: data ?? null, recipients,
      idempotencyKey: idempotencyKey.current,
    };
  };

  const errorText = (e: unknown): string => {
    const err = e as { data?: { message?: string; title?: string } | string };
    if (typeof err?.data === "string") return err.data;
    return err?.data?.message ?? err?.data?.title ?? "Something went wrong. Please try again.";
  };

  const canCompose = !showText || text.trim().length > 0;
  const request = buildRequest();

  const doPreview = async () => {
    setError("");
    if (!request) return setError("Choose at least one recipient and channel.");
    try {
      // The Idempotency key is only for send; a preview stores nothing.
      setPreviewResult(await preview({ ...request, idempotencyKey: null }).unwrap());
    } catch (e) {
      setError(errorText(e));
    }
  };

  const doSend = async () => {
    setError("");
    if (!request) return setError("Choose at least one recipient and channel.");
    try {
      const result = await send(request).unwrap();
      setSent(result);
      onSent?.(result);
    } catch (e) {
      setError(errorText(e));
    }
  };

  if (sent) {
    return (
      <div className="fx-notify">
        <div className="alert alert-success">
          {sent.duplicate ? "This notification was already sent." : "Notification queued. Delivery status will update here and in the notification history."}
        </div>
        <table className="table table-sm">
          <thead><tr><th>Recipient</th><th>Channel</th><th>Status</th></tr></thead>
          <tbody>
            {sent.deliveries.map((d) => (
              <tr key={d.deliveryId}><td>{d.displayName ?? d.recipientRole}</td><td>{d.channelCode}</td><td>{d.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="fx-notify">
      {showText && (
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="fx-notify-text">Message</label>
          <textarea
            id="fx-notify-text" className="form-control" rows={4} maxLength={4000} value={text}
            onChange={(e) => { setText(e.target.value); setPreviewResult(null); }}
            placeholder="Type the message to send"
          />
        </div>
      )}

      <div className="fw-semibold mb-1">Send to</div>
      {loadingRecipients ? (
        <p className="text-secondary small">Loading recipients…</p>
      ) : candidates.length === 0 ? (
        <p className="text-secondary small">No recipients found{event?.allowsAdhocRecipients ? " - add one below" : ""}.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle fx-notify__channels">
            <thead>
              <tr>
                <th>Recipient</th>
                {enabledChannels.map((ch) => <th key={ch}>{channels.find((c) => c.channelCode === ch)?.channelName ?? ch}</th>)}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={keyOf(c)}>
                  <td>
                    <div className="fw-semibold">{c.displayName}</div>
                    <div className="small text-secondary">
                      {c.role === "SELECTED" ? "Added by you" : c.role.charAt(0) + c.role.slice(1).toLowerCase()}
                      {c.organisation ? ` · ${c.organisation}` : ""}
                    </div>
                  </td>
                  {enabledChannels.map((ch) => {
                    const why = unavailableReason(c, ch);
                    return (
                      <td key={ch} title={why ?? undefined}>
                        <input
                          type="checkbox" className="form-check-input" disabled={!!why}
                          checked={!!picks[keyOf(c)]?.[ch] && !why}
                          onChange={() => toggle(c, ch)}
                          aria-label={`${c.displayName} by ${ch}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {event?.allowsAdhocRecipients && (
        <div className="row g-2 mb-3">
          <div className="col-md-3"><input className="form-control form-control-sm" placeholder="Name" value={adhocForm.name} onChange={(e) => setAdhocForm({ ...adhocForm, name: e.target.value })} /></div>
          <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Email" type="email" value={adhocForm.email} onChange={(e) => setAdhocForm({ ...adhocForm, email: e.target.value })} /></div>
          <div className="col-md-3"><input className="form-control form-control-sm" placeholder="Mobile" inputMode="tel" value={adhocForm.mobile} onChange={(e) => setAdhocForm({ ...adhocForm, mobile: e.target.value })} /></div>
          <div className="col-md-2"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={addAdhoc}>Add recipient</button></div>
        </div>
      )}

      {usedChannels.size > 0 && (
        <div className="fx-notify__templates">
          {enabledChannels.filter((ch) => usedChannels.has(ch)).map((ch) => {
            const options = templates.filter((t) => t.channelCode === ch);
            return (
              <div key={ch}>
                <label className="form-label small fw-semibold" htmlFor={`fx-tpl-${ch}`}>
                  {channels.find((c) => c.channelCode === ch)?.channelName} template
                </label>
                <select
                  id={`fx-tpl-${ch}`} className="form-select form-select-sm" value={templateByChannel[ch] ?? ""}
                  onChange={(e) => { setPreviewResult(null); setTemplateByChannel({ ...templateByChannel, [ch]: e.target.value ? Number(e.target.value) : null }); }}
                >
                  <option value="">Default{options.find((o) => o.isDefault) ? ` (${options.find((o) => o.isDefault)!.templateName})` : ""}</option>
                  {options.map((o) => <option key={o.templateId} value={o.templateId}>{o.templateName}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {previewResult && (
        <div className="mb-2">
          <div className="fw-semibold mb-1">Preview</div>
          {previewResult.messages.map((m, i) => (
            <div key={i} className={`fx-notify__preview ${m.problems.length ? "has-problems" : ""}`}>
              <div className="small"><strong>{m.displayName ?? m.recipientRole}</strong> · {m.channelCode}{m.address ? ` · ${m.address}` : ""}{m.templateName ? ` · ${m.templateName}` : ""}</div>
              {m.problems.map((p) => <div key={p} className="fx-notify__problem">⚠ {p}</div>)}
              {m.subject && <div className="small mt-1"><strong>Subject:</strong> {m.subject}</div>}
              {m.body && <pre>{m.body}</pre>}
            </div>
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="d-flex gap-2 justify-content-end">
        {onSkip && <button type="button" className="btn btn-outline-secondary" onClick={onSkip} disabled={sending}>Skip</button>}
        <button type="button" className="btn btn-outline-primary" onClick={() => void doPreview()} disabled={!request || !canCompose || previewing || sending}>
          {previewing ? "Rendering…" : "Preview"}
        </button>
        <button
          type="button" className="btn btn-primary"
          onClick={() => void doSend()}
          disabled={!request || !canCompose || sending || (previewResult !== null && !previewResult.canSend)}
        >
          {sending ? "Sending…" : sendLabel}
        </button>
      </div>
    </div>
  );
};

export default NotifyPanel;
