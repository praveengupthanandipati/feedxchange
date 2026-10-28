import { useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  CircleCheckBigIcon,
  CirclePauseIcon,
  CirclePlayIcon,
  MailIcon,
  PhoneIcon,
  TriangleAlertIcon,
} from "../../../shared/components/icon";
import type { Subscription, UserPreferences } from "../../../core/store/notificationPreferencesApi";
import type { ChannelCode } from "../../../core/store/notificationsApi";
import { apiErrorMessage } from "../../../core/store/sellerInvoiceApi";
import PauseDialog from "./PauseDialog";
import SubscriptionEditor from "./SubscriptionEditor";
import { pauseLabel, sameSubscriptions } from "./preferenceUtils";
import "./Preferences.scss";

interface UserPreferencesPanelProps {
  prefs: UserPreferences;
  /** Shown above the editor, e.g. "You are editing Priya's preferences". */
  banner?: string;
  onSave: (subscriptions: Subscription[]) => Promise<unknown>;
  onPause: (resumeOn: string | null, reason: string) => Promise<unknown>;
  onResume: () => Promise<unknown>;
  busy?: boolean;
}

/** One system user's notification preferences: used for "My notifications" and for an administrator editing someone else's. */
const UserPreferencesPanel = ({ prefs, banner, onSave, onPause, onResume, busy = false }: UserPreferencesPanelProps) => {
  const [value, setValue] = useState<Subscription[]>(prefs.subscriptions);
  const [pausing, setPausing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { setValue(prefs.subscriptions); setError(""); }, [prefs]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const unavailable = useMemo(() => {
    const map: Partial<Record<ChannelCode, string>> = {};
    if (!prefs.email) map.EMAIL = "Add an email address to your profile to use Email";
    if (!prefs.mobile) { map.SMS = "Add a mobile number to your profile to use SMS"; map.WHATSAPP = "Add a mobile number to your profile to use WhatsApp"; }
    return map;
  }, [prefs]);

  const dirty = !sameSubscriptions(value, prefs.subscriptions);
  const total = value.filter((s) => s.channels.length > 0).length;

  const run = async (action: () => Promise<unknown>, done: string, fallback: string) => {
    setError("");
    try { await action(); setToast(done); return true; } catch (e) { setError(apiErrorMessage(e, fallback)); return false; }
  };

  return (
    <div className="pref-panel">
      {toast && <div className="pref-toast pref-toast--ok" role="status"><CircleCheckBigIcon aria-hidden /> {toast}</div>}

      <section className="pref-person-card">
        <span className="pref-avatar pref-avatar--large" aria-hidden>{prefs.userName.slice(0, 1).toUpperCase()}</span>
        <div>
          <h2>{prefs.userName}</h2>
          <p>{prefs.profileName ?? "FeedXchange"}</p>
          <div className="pref-drawer__reach">
            <span className={prefs.email ? "" : "is-missing"}><MailIcon aria-hidden /> {prefs.email ?? "No email"}</span>
            <span className={prefs.mobile ? "" : "is-missing"}><PhoneIcon aria-hidden /> {prefs.mobile ?? "No mobile"}</span>
          </div>
        </div>
        <div className="pref-person-card__actions">
          {prefs.isPaused ? (
            <button type="button" className="pref-btn" disabled={busy} onClick={() => void run(onResume, "Notifications resumed.", "Could not resume.")}><CirclePlayIcon aria-hidden /> Resume</button>
          ) : (
            <button type="button" className="pref-btn" disabled={busy} onClick={() => { setError(""); setPausing(true); }}><CirclePauseIcon aria-hidden /> Pause</button>
          )}
        </div>
      </section>

      {banner && <p className="pref-hint pref-hint--strong">{banner}</p>}

      {prefs.isPaused && (
        <div className="pref-banner pref-banner--paused" role="status">
          <CirclePauseIcon aria-hidden />
          <div>
            <strong>{pauseLabel(prefs.resumeOn)}</strong>
            <span>{prefs.pauseReason ?? "Only events that are always sent reach this person."}</span>
          </div>
        </div>
      )}

      <SubscriptionEditor events={prefs.events} channels={prefs.channels} value={value} onChange={setValue} unavailable={unavailable} />

      <div className="pref-savebar">
        <span>{total === 0 ? "Not subscribed to anything" : `Subscribed to ${total} ${total === 1 ? "event" : "events"}`}</span>
        {error && <p className="pref-error" role="alert"><TriangleAlertIcon aria-hidden /> {error}</p>}
        <div>
          <button type="button" className="pref-btn" disabled={!dirty || busy} onClick={() => setValue(prefs.subscriptions)}>Discard</button>
          <button type="button" className="pref-btn pref-btn--primary" disabled={!dirty || busy} onClick={() => void run(() => onSave(value), "Preferences saved.", "Could not save.")}>
            <CheckIcon aria-hidden /> {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <PauseDialog
        open={pausing}
        subject={prefs.userName}
        busy={busy}
        error={error}
        onClose={() => setPausing(false)}
        onConfirm={async (resumeOn, reason) => { if (await run(() => onPause(resumeOn, reason), "Notifications paused.", "Could not pause.")) setPausing(false); }}
      />
    </div>
  );
};

export default UserPreferencesPanel;
