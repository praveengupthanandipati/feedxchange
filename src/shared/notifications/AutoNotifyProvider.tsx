import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  SendIcon,
  SlidersVerticalIcon,
  XIcon,
} from "../components/icon";
import { useDispatchNotificationMutation } from "../../core/store/notificationPreferencesApi";
import type { ResolveNotificationResult } from "../../core/store/notificationPreferencesApi";
import type { ChannelCode } from "../../core/store/notificationsApi";
import { apiErrorMessage } from "../../core/store/sellerInvoiceApi";
import NotifyModal from "./NotifyModal";
import { AutoNotifyContext } from "./autoNotifyContext";
import type { NotifyItem } from "./notifyItem";
import "./AutoNotify.scss";

type Phase = "countdown" | "sending" | "sent" | "empty" | "error";

interface AutoJob {
  id: string;
  item: NotifyItem;
  result: ResolveNotificationResult;
  phase: Phase;
  /** Epoch ms the notification goes out; null until the job is the one on screen. */
  deadline: number | null;
  customizing: boolean;
  message?: string;
}

/** A problem drawing the card must never take the whole screen down with it: the notification is simply not shown. */
class CardBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Automatic notification card failed to render", error, info.componentStack); }
  render() { return this.state.failed ? null : this.props.children; }
}

const CHANNEL_LABEL: Record<string, string> = { EMAIL: "Email", WHATSAPP: "WhatsApp", SMS: "SMS", APP: "App" };
const RESUME_MS = 3000;
const DISMISS_MS = 7000;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Notify the buyer that invoice X was amended" -> "Invoice X was amended": the card says what happened, not what to do. */
const describe = (title: string): string => {
  const text = title.replace(/^Notify\s+(about\s+|the\s+[\w\s/]+?\s+(that|about)\s+|(this|the)\s+)?/i, "").trim();
  return (text || title).replace(/^./, (c) => c.toUpperCase());
};

/** Recipients and channels as the Notify dialog keys them, so Customize starts from exactly what the preferences proposed. */
const picksFrom = (result: ResolveNotificationResult): Record<string, ChannelCode[]> =>
  Object.fromEntries(result.recipients.map((r) => [`${r.recipientType}:${r.recipientRefId}`, r.channels.filter((c) => c.ok).map((c) => c.channelCode)]));

/**
 * Automatic notifications. When an event is saved on a profile that uses preferences, the screen hands the event here and moves on.
 * A card then counts down (the profile's waiting time) and sends by itself; the user can Send now, Customize (the usual Notify
 * dialog, pre-filled) or Cancel. Because this lives above the screens, the countdown survives the screen closing or redirecting.
 */
export const AutoNotifyProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<AutoJob[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [expanded, setExpanded] = useState(false);
  const [dispatch] = useDispatchNotificationMutation();
  const sending = useRef(new Set<string>());

  const patch = useCallback((id: string, change: Partial<AutoJob>) => setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...change } : j))), []);
  const remove = useCallback((id: string) => setJobs((all) => all.filter((j) => j.id !== id)), []);

  const send = useCallback(async (job: AutoJob) => {
    if (sending.current.has(job.id)) return;
    sending.current.add(job.id);
    patch(job.id, { phase: "sending", customizing: false });
    try {
      const out = await dispatch({
        eventCode: job.item.eventCode, contractId: job.item.contractId, contractNumber: job.item.contractNumber,
        sourceEntityType: job.item.sourceEntityType, sourceEntityId: job.item.sourceEntityId, profileId: job.item.profileId,
        idempotencyKey: `auto-${job.id}`,
      }).unwrap();
      if (out.sent) {
        const people = new Set(out.deliveries.map((d) => d.displayName ?? d.recipientRole)).size;
        const skipped = out.suppressed.length;
        patch(job.id, { phase: "sent", message: `Notified ${plural(people, "person", "people")} on ${plural(out.deliveries.length, "message", "messages")}${skipped ? `. ${skipped} left out: ${[...new Set(out.suppressed.map((s) => s.reason))].join(", ")}` : ""}.` });
      } else {
        patch(job.id, { phase: "empty", message: out.message ?? "Nothing was sent." });
      }
    } catch (e) {
      patch(job.id, { phase: "error", message: apiErrorMessage(e, "The notification could not be sent.") });
    } finally {
      sending.current.delete(job.id);
    }
  }, [dispatch, patch]);

  const enqueue = useCallback((item: NotifyItem, result: ResolveNotificationResult) => {
    const id = crypto.randomUUID();
    // nobody is subscribed: say so at once instead of counting down to nothing
    const empty = result.recipients.length === 0;
    const job: AutoJob = {
      id, item, result, phase: empty ? "empty" : "countdown", deadline: null, customizing: false,
      message: empty ? "Nobody is subscribed to this notification, so nothing was sent. Choose who hears about it under Notification preferences." : undefined,
    };
    setJobs((all) => [...all, job]);
  }, []);

  const current = jobs[0];

  // The job on screen starts its countdown (or goes out at once when the profile waits 0 seconds).
  useEffect(() => {
    if (!current || current.phase !== "countdown" || current.deadline !== null) return;
    if (current.result.holdSeconds <= 0) { void send(current); return; }
    patch(current.id, { deadline: Date.now() + current.result.holdSeconds * 1000 });
  }, [current, patch, send]);

  // Ticks only while something is counting down.
  const counting = current?.phase === "countdown" && current.deadline !== null && !current.customizing;
  useEffect(() => {
    if (!counting) return;
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [counting]);

  useEffect(() => {
    if (counting && current && current.deadline !== null && now >= current.deadline) void send(current);
  }, [counting, current, now, send]);

  // Finished cards go away by themselves; errors stay until dismissed.
  useEffect(() => {
    if (!current || (current.phase !== "sent" && current.phase !== "empty")) return;
    const timer = setTimeout(() => remove(current.id), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [current, remove]);

  const value = useMemo(() => ({ enqueue }), [enqueue]);
  const customizing = current?.customizing ? current : null;
  const sentByCustomize = useRef(false);
  const skippedInCustomize = useRef(false);

  const secondsLeft = current?.deadline ? Math.max(0, Math.ceil((current.deadline - now) / 1000)) : 0;
  const holdMs = current ? Math.max(1, current.result.holdSeconds * 1000) : 1;
  const progress = current?.deadline ? Math.min(1, Math.max(0, (current.deadline - now) / holdMs)) : 1;

  const people = current ? current.result.recipients.length : 0;
  const channelNames = current ? [...new Set(current.result.recipients.flatMap((r) => r.channels.filter((c) => c.ok).map((c) => CHANNEL_LABEL[c.channelCode] ?? c.channelCode)))] : [];

  return (
    <AutoNotifyContext.Provider value={value}>
      {children}

      <CardBoundary key={current?.id ?? "none"}>
      {current && !customizing && (
        <div className={`auto-notify auto-notify--${current.phase}`} role="status" aria-live="polite">
          <div className="auto-notify__icon" aria-hidden>
            {current.phase === "error" ? <CircleAlertIcon /> : current.phase === "sent" ? <CheckIcon /> : current.phase === "sending" ? <SendIcon /> : <BellIcon />}
          </div>
          <div className="auto-notify__body">
            {current.phase === "countdown" && (
              <>
                <strong>Notifying {plural(people, "person", "people")} in {secondsLeft}s</strong>
                <span className="auto-notify__sub">{describe(current.item.title)} · {channelNames.join(", ")}</span>
              </>
            )}
            {current.phase === "sending" && <strong>Sending notifications…</strong>}
            {(current.phase === "sent" || current.phase === "empty" || current.phase === "error") && <strong>{current.message}</strong>}

            {current.phase === "countdown" && (
              <>
                <button type="button" className="auto-notify__more" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
                  {expanded ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />} Who gets it
                </button>
                {expanded && (
                  <ul className="auto-notify__list">
                    {current.result.recipients.map((r) => (
                      <li key={`${r.recipientType}:${r.recipientRefId}`}>
                        <span>{r.displayName}</span>
                        <span className="auto-notify__chips">
                          {r.channels.filter((c) => c.ok).map((c) => <em key={c.channelCode}>{CHANNEL_LABEL[c.channelCode] ?? c.channelCode}</em>)}
                        </span>
                      </li>
                    ))}
                    {current.result.suppressed.map((s, i) => (
                      <li key={`s${i}`} className="is-skipped"><span>{s.displayName}{s.channelCode ? ` · ${CHANNEL_LABEL[s.channelCode] ?? s.channelCode}` : ""}</span><span>{s.reason}</span></li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {jobs.length > 1 && <span className="auto-notify__sub">+{jobs.length - 1} more waiting</span>}
          </div>

          <div className="auto-notify__actions">
            {current.phase === "countdown" && (
              <>
                <button type="button" className="auto-notify__btn auto-notify__btn--primary" onClick={() => void send(current)}><SendIcon aria-hidden /> Send now</button>
                <button type="button" className="auto-notify__btn" onClick={() => patch(current.id, { customizing: true })}><SlidersVerticalIcon aria-hidden /> Customize</button>
                <button type="button" className="auto-notify__btn auto-notify__btn--quiet" onClick={() => remove(current.id)}>Cancel</button>
              </>
            )}
            {current.phase === "error" && (
              <>
                <button type="button" className="auto-notify__btn auto-notify__btn--primary" onClick={() => void send(current)}>Try again</button>
                <button type="button" className="auto-notify__btn auto-notify__btn--quiet" onClick={() => remove(current.id)}>Dismiss</button>
              </>
            )}
            {(current.phase === "sent" || current.phase === "empty") && (
              <button type="button" className="auto-notify__close" onClick={() => remove(current.id)} aria-label="Dismiss"><XIcon aria-hidden /></button>
            )}
          </div>

          {current.phase === "countdown" && <div className="auto-notify__bar" style={{ transform: `scaleX(${progress})` }} aria-hidden />}
        </div>
      )}

      {customizing && (
        <NotifyModal
          key={customizing.id}
          open
          title={customizing.item.title}
          eventCode={customizing.item.eventCode}
          contractNumber={customizing.item.contractNumber}
          contractId={customizing.item.contractId}
          sourceEntityType={customizing.item.sourceEntityType}
          sourceEntityId={customizing.item.sourceEntityId}
          profileId={customizing.item.profileId}
          informationType={customizing.item.informationType}
          sendLabel={customizing.item.sendLabel}
          initialPicks={picksFrom(customizing.result)}
          closeOnBackdrop={false}
          onSent={() => { sentByCustomize.current = true; }}
          onSkip={() => { skippedInCustomize.current = true; }}
          onClose={() => {
            const id = customizing.id;
            if (sentByCustomize.current || skippedInCustomize.current) {
              // sent by hand, or the person chose not to notify: nothing more to do automatically
              sentByCustomize.current = false;
              skippedInCustomize.current = false;
              remove(id);
            } else {
              // closed without choosing: the event carries on in Auto mode
              patch(id, { customizing: false, deadline: Date.now() + RESUME_MS });
            }
          }}
        />
      )}
      </CardBoundary>
    </AutoNotifyContext.Provider>
  );
};
