import { useEffect, useMemo, useRef, useState } from "react";
import { BellIcon, CheckIcon, MailIcon, MessageCircleIcon, SearchIcon, SmartphoneIcon } from "../components/icon";
import {
  useGetNotificationChannelsQuery,
  useGetNotificationEventsQuery,
  useGetNotificationRecipientsQuery,
  useGetNotificationTemplatesQuery,
  usePreviewNotificationMutation,
  useSendNotificationMutation,
} from "../../core/store/notificationsApi";
import type {
  ChannelCode,
  ComposeNotificationRequest,
  NotificationPreviewResult,
  RecipientCandidate,
  SendNotificationResult,
} from "../../core/store/notificationsApi";
import { TemplateSelect } from "./NotifyChoicePicker";
import { CHANNEL_ORDER, templateKey } from "./notifyChoices";
import type { NotifyChoices } from "./notifyChoices";
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
  /** Information sharing from a profile page (no contract). */
  profileId?: number;
  /** Information sharing: BANK_DETAILS, SELLER_ADDRESS, BUYER_ADDRESS, CONTRACT_INFO, PENDING_INVOICES, CONTACT_DETAILS or GREETING. */
  informationType?: string;
  /** Extra values for the template (manual text events only; business events are filled in by the server). */
  data?: Record<string, string>;
  /** Show the free-text box. Defaults to true for OPEN_TEXT_SHARED. */
  allowOpenText?: boolean;
  /** Called after a successful send. */
  onSent?: (result: SendNotificationResult) => void;
  /** Called when the user chooses not to notify. */
  onSkip?: () => void;
  /** Called by the Done button on the confirmation shown after sending (a dialog passes its close). */
  onDone?: () => void;
  sendLabel?: string;
  /** Channels and templates already chosen on the screen (per role); the panel starts from them. */
  choices?: NotifyChoices | null;
  /**
   * What the saved notification preferences propose, per recipient ("Type:Id" -> channels). When given, the panel starts from exactly this
   * (people not listed start unticked), tags each person as from preferences or added by the user, offers "Reset to preferences", and the
   * send is recorded as AutoOverridden.
   */
  initialPicks?: Record<string, ChannelCode[]>;
}


type ChannelPick = Partial<Record<ChannelCode, boolean>>;

const keyOf = (c: Pick<RecipientCandidate, "recipientType" | "recipientRefId">) => `${c.recipientType}:${c.recipientRefId}`;

/** Why a channel cannot be used for this recipient (null = fine). The server checks again; this only saves a round trip. */
const unavailableReason = (c: RecipientCandidate, channel: ChannelCode): string | null => {
  if (channel === "EMAIL" && !c.email) return "No email address";
  if ((channel === "SMS" || channel === "WHATSAPP") && !c.mobile) return "No mobile number";
  if (channel === "APP" && !c.hasAppLogin) return "No app login";
  return null;
};

const CHANNEL_ICON = { EMAIL: MailIcon, WHATSAPP: MessageCircleIcon, SMS: SmartphoneIcon, APP: BellIcon } as const;
const CHANNEL_SHORT: Record<ChannelCode, string> = { EMAIL: "Email", WHATSAPP: "WhatsApp", SMS: "SMS", APP: "In-app" };
const roleLabel = (role: string) => (role === "SELECTED" ? "Added by you" : role.charAt(0) + role.slice(1).toLowerCase());

/**
 * The "who do you want to tell, and how?" panel used on every screen that triggers a notification. The user ticks channels per
 * recipient (defaults come from the event rules), picks a template per channel (e.g. which email template), previews the exact
 * messages and sends - or skips. The server resolves addresses, data and templates; this panel only sends selections.
 */
const NotifyPanel = ({
  eventCode, contractId, contractNumber, variantCode, sourceEntityType, sourceEntityId, profileId, informationType, data, allowOpenText,
  onSent, onSkip, onDone, sendLabel = "Send", choices, initialPicks,
}: NotifyPanelProps) => {
  const hasContract = contractId !== undefined || !!contractNumber || sourceEntityId !== undefined || profileId !== undefined;
  const { data: channels = [] } = useGetNotificationChannelsQuery();
  const { data: events = [] } = useGetNotificationEventsQuery();
  const { data: templates = [] } = useGetNotificationTemplatesQuery({ eventCode });
  const { data: loaded = [], isFetching: loadingRecipients } = useGetNotificationRecipientsQuery(
    { contractId, contractNumber, eventCode, sourceEntityType, sourceEntityId, profileId, informationType }, { skip: !hasContract });
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
  const [filter, setFilter] = useState("");
  // Template choice per role AND channel: a buyer and a seller have different templates for the same channel.
  const [templateByKey, setTemplateByKey] = useState<Record<string, number | null>>(choices?.templates ?? {});
  const [text, setText] = useState("");
  const [previewResult, setPreviewResult] = useState<NotificationPreviewResult | null>(null);
  const [sent, setSent] = useState<SendNotificationResult | null>(null);
  const [error, setError] = useState("");
  const idempotencyKey = useRef(crypto.randomUUID());

  // Pre-tick the event's default channels the first time each recipient appears (never overrides the user's later choices).
  const seeded = useRef(new Set<string>());
  useEffect(() => {
    if (!event) return;
    // Work out the new picks here, not inside the state updater: React may run an updater twice (strict mode), and the second run
    // would find the recipients already marked as seeded and add nothing.
    const additions: Record<string, ChannelPick> = {};
    for (const c of candidates) {
      const k = keyOf(c);
      if (seeded.current.has(k)) continue;
      seeded.current.add(k);
      const pick: ChannelPick = {};
      const chosen = choices?.channels[c.role];
      // The saved preferences win when they were given; then the screen's own choice; otherwise the event's default channels for this role.
      const wanted = initialPicks ? (initialPicks[k] ?? []) : (chosen ?? event.rules.filter((r) => r.recipientRole === c.role && r.isDefaultOn).map((r) => r.channelCode));
      wanted.forEach((ch) => {
        if (!unavailableReason(c, ch)) pick[ch] = true;
      });
      additions[k] = pick;
    }
    if (Object.keys(additions).length > 0) setPicks((prev) => ({ ...prev, ...additions }));
  }, [candidates, event, choices, initialPicks]);

  // Every (role, channel) that at least one recipient has ticked: each gets its own template choice.
  const usedPairs = useMemo(() => {
    const seen = new Set<string>();
    const pairs: [string, ChannelCode][] = [];
    for (const c of candidates) {
      for (const ch of enabledChannels) {
        const k = templateKey(c.role, ch);
        if (picks[keyOf(c)]?.[ch] && !seen.has(k)) { seen.add(k); pairs.push([c.role, ch]); }
      }
    }
    return pairs;
  }, [candidates, picks, enabledChannels]);

  const resetToPreferences = () => {
    if (!initialPicks) return;
    setPreviewResult(null);
    setPicks(Object.fromEntries(candidates.map((c) => [keyOf(c), Object.fromEntries((initialPicks[keyOf(c)] ?? []).filter((ch) => !unavailableReason(c, ch)).map((ch) => [ch, true]))])));
  };

  const needle = filter.trim().toLowerCase();
  const visible = useMemo(
    () => candidates.filter((c) => !needle || `${c.displayName} ${c.organisation ?? ""} ${c.role} ${c.email ?? ""} ${c.mobile ?? ""}`.toLowerCase().includes(needle)),
    [candidates, needle],
  );
  // people of one business and role sit together, so "all of the buyer's people" is one click
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; role: string; organisation: string | null; people: RecipientCandidate[] }>();
    for (const c of visible) {
      const key = `${c.role}|${c.organisation ?? ""}`;
      if (!map.has(key)) map.set(key, { key, role: c.role, organisation: c.organisation, people: [] });
      map.get(key)!.people.push(c);
    }
    return [...map.values()];
  }, [visible]);

  const toggleGroup = (people: RecipientCandidate[], channel: ChannelCode) => {
    const usable = people.filter((c) => !unavailableReason(c, channel));
    if (usable.length === 0) return;
    const allOn = usable.every((c) => picks[keyOf(c)]?.[channel]);
    setPreviewResult(null);
    setPicks((prev) => {
      const next = { ...prev };
      for (const c of usable) next[keyOf(c)] = { ...next[keyOf(c)], [channel]: !allOn };
      return next;
    });
  };

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
        channels: chosen.map((ch) => ({ channelCode: ch, templateId: templateByKey[templateKey(c.role, ch)] ?? null })),
      }));
    if (recipients.length === 0) return null;
    return {
      eventCode, contractId, contractNumber, profileId, variantCode, sourceEntityType, sourceEntityId,
      openText: showText ? text : null, data: informationType ? { ...(data ?? {}), InformationType: informationType } : (data ?? null), recipients,
      idempotencyKey: idempotencyKey.current,
      dispatchMode: initialPicks ? "AutoOverridden" : undefined,
    };
  };

  const errorText = (e: unknown): string => {
    const err = e as { data?: { message?: string; title?: string } | string };
    if (typeof err?.data === "string") return err.data;
    return err?.data?.message ?? err?.data?.title ?? "Something went wrong. Please try again.";
  };

  const peopleSelected = candidates.filter((c) => Object.values(picks[keyOf(c)] ?? {}).some(Boolean)).length;
  const messageCount = candidates.reduce((n, c) => n + enabledChannels.filter((ch) => picks[keyOf(c)]?.[ch] && !unavailableReason(c, ch)).length, 0);
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
    const people = new Set(sent.deliveries.map((d) => d.displayName ?? d.recipientRole)).size;
    return (
      <div className="fx-notify fx-notify--done">
        <div className="fx-done">
          <span className="fx-done__icon" aria-hidden><CheckIcon /></span>
          <div>
            <strong>{sent.duplicate ? "This notification was already sent" : `Notification queued for ${people} ${people === 1 ? "person" : "people"}`}</strong>
            <p>{sent.deliveries.length} {sent.deliveries.length === 1 ? "message" : "messages"} will go out shortly. Delivery status updates in the notification history.</p>
          </div>
        </div>

        <div className="fx-list" style={{ "--fx-n": 0 } as React.CSSProperties}>
          <div className="fx-list__cols fx-list__cols--three" aria-hidden>
            <span>Recipient</span><span>Channel</span><span>Status</span>
          </div>
          {sent.deliveries.map((d) => {
            const code = d.channelCode.toUpperCase() as ChannelCode;
            const Icon = CHANNEL_ICON[code] ?? MailIcon;
            const tone = /fail|bounce|reject/i.test(d.status) ? "bad" : /deliver|sent|read|submit/i.test(d.status) ? "ok" : "wait";
            return (
              <div key={d.deliveryId} className="fx-list__row fx-list__row--three">
                <div className="fx-list__who"><strong>{d.displayName ?? d.recipientRole}</strong><small>{roleLabel(d.recipientRole)}</small></div>
                <span className="fx-done__channel"><Icon aria-hidden /> {CHANNEL_SHORT[code] ?? d.channelCode}</span>
                <span className={`fx-status fx-status--${tone}`}>{d.status}</span>
              </div>
            );
          })}
        </div>

        {onDone && (
          <div className="fx-notify__actions">
            <button type="button" className="btn btn-primary" onClick={onDone}>Done</button>
          </div>
        )}
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

      <div className="fx-notify__head">
        <div>
          <div className="fw-semibold">Send to</div>
          <div className="fx-notify__count">
            {loadingRecipients ? "Loading…" : `${peopleSelected} of ${candidates.length} selected · ${messageCount} ${messageCount === 1 ? "message" : "messages"}`}
          </div>
        </div>
        <div className="fx-notify__tools">
          {candidates.length > 8 && (
            <label className="fx-notify__search">
              <SearchIcon aria-hidden />
              <input type="search" value={filter} placeholder="Search people" onChange={(e) => setFilter(e.target.value)} aria-label="Search people" />
            </label>
          )}
          {initialPicks && <button type="button" className="btn btn-link btn-sm p-0" onClick={resetToPreferences}>Reset to preferences</button>}
        </div>
      </div>

      {loadingRecipients ? (
        <p className="text-secondary small">Loading recipients…</p>
      ) : candidates.length === 0 ? (
        <p className="text-secondary small">No recipients found{event?.allowsAdhocRecipients ? " - add one below" : ""}.</p>
      ) : (
        <div className="fx-list" role="group" aria-label="Recipients" style={{ "--fx-n": enabledChannels.length } as React.CSSProperties}>
          <div className="fx-list__cols" aria-hidden>
            <span>Recipient</span>
            {enabledChannels.map((ch) => <span key={ch}>{CHANNEL_SHORT[ch] ?? ch}</span>)}
          </div>
          {groups.length === 0 && <p className="text-secondary small p-3 mb-0">No one matches “{filter}”.</p>}
          {groups.map((g) => (
            <section key={g.key} className="fx-list__group">
              <header className="fx-list__ghead">
                <span><strong>{roleLabel(g.role)}</strong>{g.organisation ? ` · ${g.organisation}` : ""} <em>{g.people.length}</em></span>
                <span className="fx-list__gall">
                  {enabledChannels.map((ch) => {
                    const usable = g.people.filter((c) => !unavailableReason(c, ch));
                    const all = usable.length > 0 && usable.every((c) => picks[keyOf(c)]?.[ch]);
                    return (
                      <button key={ch} type="button" className={`fx-list__all ${all ? "is-on" : ""}`} disabled={usable.length === 0}
                        onClick={() => toggleGroup(g.people, ch)} title={`${all ? "Clear" : "Select"} ${CHANNEL_SHORT[ch] ?? ch} for everyone below`}>
                        {all ? "Clear" : "All"}
                      </button>
                    );
                  })}
                </span>
              </header>
              {g.people.map((c) => (
                <div key={keyOf(c)} className="fx-list__row">
                  <div className="fx-list__who">
                    <strong>{c.displayName}</strong>
                    {initialPicks && (initialPicks[keyOf(c)]
                      ? <span className="fx-notify__tag fx-notify__tag--pref">From preferences</span>
                      : Object.values(picks[keyOf(c)] ?? {}).some(Boolean) && <span className="fx-notify__tag fx-notify__tag--added">Added by you</span>)}
                    <small>{[c.email, c.mobile].filter(Boolean).join(" · ") || "No contact details"}</small>
                  </div>
                  {enabledChannels.map((ch) => {
                    const why = unavailableReason(c, ch);
                    const Icon = CHANNEL_ICON[ch];
                    const on = !!picks[keyOf(c)]?.[ch] && !why;
                    return (
                      <label key={ch} className={`fx-chan ${on ? "is-on" : ""} ${why ? "is-off" : ""}`} title={why ?? `${CHANNEL_SHORT[ch] ?? ch}`}>
                        <input type="checkbox" disabled={!!why} checked={on} onChange={() => toggle(c, ch)} aria-label={`${c.displayName} by ${CHANNEL_SHORT[ch] ?? ch}`} />
                        <Icon aria-hidden />
                        <span>{CHANNEL_SHORT[ch] ?? ch}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </section>
          ))}
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

      {usedPairs.length > 0 && (
        <div className="fx-notify__templates">
          {usedPairs.map(([role, ch]) => (
            <TemplateSelect
              key={`${role}|${ch}`} id={`fx-tpl-${role}-${ch}`} role={role} channel={ch} templates={templates}
              label={`${role === "SELECTED" ? "" : role.charAt(0) + role.slice(1).toLowerCase() + " - "}${channels.find((c) => c.channelCode === ch)?.channelName} template`}
              value={templateByKey[templateKey(role, ch)]}
              onChange={(id) => { setPreviewResult(null); setTemplateByKey({ ...templateByKey, [templateKey(role, ch)]: id }); }}
            />
          ))}
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

      <div className="fx-notify__actions">
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
