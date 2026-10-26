import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BellOffIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckBigIcon,
  CirclePauseIcon,
  CirclePlayIcon,
  ClockIcon,
  CopyIcon,
  InfoIcon,
  PenIcon,
  TriangleAlertIcon,
  XIcon,
  ZapIcon,
} from "../../../shared/components/icon";
import { usePermission } from "../../../core/auth/AuthContext";
import {
  useCopyPreferencesMutation,
  useGetPreferenceAuditQuery,
  useGetProfilePreferencesQuery,
  usePauseContactMutation,
  useResumeContactMutation,
  useUpdateProfileModeMutation,
  useUpdateProfileSettingsMutation,
} from "../../../core/store/notificationPreferencesApi";
import type { ContactPreferences, NoSubscriberRule } from "../../../core/store/notificationPreferencesApi";
import { apiErrorMessage } from "../../../core/store/sellerInvoiceApi";
import ContactEditorDrawer from "./ContactEditorDrawer";
import PauseDialog from "./PauseDialog";
import { ACTION_LABELS, CHANNEL_META, CHANNEL_ORDER, formatDateTime, pauseLabel } from "./preferenceUtils";
import "./Preferences.scss";

const HOLD_OPTIONS = [
  { value: 0, label: "Send immediately" },
  { value: 5, label: "Wait 5 seconds" },
  { value: 8, label: "Wait 8 seconds" },
  { value: 15, label: "Wait 15 seconds" },
  { value: 30, label: "Wait 30 seconds" },
];

interface ProfilePreferencesPanelProps {
  profileId: number;
  /** Hide the profile name heading when the page around it already shows it. */
  compact?: boolean;
}

/** A business profile's notification preferences: the automation switch, its settings, and every contact's coverage. */
const ProfilePreferencesPanel = ({ profileId, compact = false }: ProfilePreferencesPanelProps) => {
  const canManage = usePermission("notification-preferences.manage");
  const canSwitchMode = usePermission("notification-automation.manage");
  const { data: profile, isLoading, isError, error } = useGetProfilePreferencesQuery(profileId, { refetchOnMountOrArgChange: true });
  const { data: audit = [] } = useGetPreferenceAuditQuery(profileId, { refetchOnMountOrArgChange: true });
  const [setMode, { isLoading: modeBusy }] = useUpdateProfileModeMutation();
  const [saveSettings, { isLoading: settingsBusy }] = useUpdateProfileSettingsMutation();
  const [pauseContact, { isLoading: pauseBusy }] = usePauseContactMutation();
  const [resumeContact] = useResumeContactMutation();
  const [copy, { isLoading: copyBusy }] = useCopyPreferencesMutation();

  const [editing, setEditing] = useState<ContactPreferences | null>(null);
  const [pausing, setPausing] = useState<ContactPreferences | "profile" | null>(null);
  const [copying, setCopying] = useState<ContactPreferences | null>(null);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [dialogError, setDialogError] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // keep the open drawer in step with the latest data
  const editingLive = useMemo(() => profile?.contacts.find((c) => c.contactId === editing?.contactId) ?? null, [profile, editing]);

  if (isLoading) return <div className="pref-state">Loading notification preferences…</div>;
  if (isError || !profile) return <div className="pref-state pref-state--error" role="alert">{apiErrorMessage(error, "Could not load the notification preferences.")}</div>;

  const auto = profile.dispatchMode === "Auto";
  const ok = (text: string) => setToast({ kind: "ok", text });
  const fail = (e: unknown, fallback: string) => setToast({ kind: "error", text: apiErrorMessage(e, fallback) });

  const changeMode = async () => {
    try {
      await setMode({ profileId, dispatchMode: auto ? "Manual" : "Auto" }).unwrap();
      ok(auto ? "Automatic notifications are off. People will choose recipients after each event, as before." : "Automatic notifications are on for this business.");
    } catch (e) { fail(e, "Could not change the mode."); }
  };

  const changeSettings = async (change: Partial<{ noSubscriberRule: NoSubscriberRule; holdSeconds: number; isPaused: boolean; pausedUntil: string | null }>) => {
    try {
      await saveSettings({
        profileId, noSubscriberRule: profile.noSubscriberRule, holdSeconds: profile.holdSeconds, isPaused: profile.isPaused, pausedUntil: profile.pausedUntil, ...change,
      }).unwrap();
      ok("Settings saved.");
      return true;
    } catch (e) {
      setDialogError(apiErrorMessage(e, "Could not save the settings."));
      fail(e, "Could not save the settings.");
      return false;
    }
  };

  const covered = (c: ContactPreferences) => c.subscriptions.filter((s) => s.channels.length > 0).length;
  const channelsUsed = (c: ContactPreferences) => CHANNEL_ORDER.filter((ch) => c.subscriptions.some((s) => s.channels.includes(ch)));
  const pausedCount = profile.contacts.filter((c) => c.isPaused).length;

  return (
    <div className="pref-panel">
      {toast && (
        <div className={`pref-toast pref-toast--${toast.kind}`} role="status">
          {toast.kind === "ok" ? <CircleCheckBigIcon aria-hidden /> : <TriangleAlertIcon aria-hidden />} {toast.text}
        </div>
      )}

      {!compact && (
        <div className="pref-panel__title">
          <h2>{profile.profileName}</h2>
          <p>Choose who is told about what, and how. Contacts only hear about events they are subscribed to.</p>
        </div>
      )}

      {/* ------------------------------------------------ automation */}
      <section className={`pref-auto ${auto ? "is-on" : ""}`} aria-label="Automatic notifications">
        <div className="pref-auto__icon" aria-hidden>{auto ? <ZapIcon /> : <BellOffIcon />}</div>
        <div className="pref-auto__text">
          <h3>Automatic notifications <span className={`pref-badge ${auto ? "pref-badge--on" : ""}`}>{auto ? "On" : "Off"}</span></h3>
          <p>
            {auto
              ? "When an event is saved, subscribed contacts are notified automatically. A short countdown lets the person saving it send now, customize or cancel."
              : "Nothing is sent automatically. After each event the person saving it chooses recipients and channels, exactly as before."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={auto}
          aria-label="Automatic notifications"
          className="pref-switch pref-switch--large"
          disabled={!canSwitchMode || modeBusy}
          title={canSwitchMode ? undefined : "Only FeedXchange administrators can switch automatic notifications on or off."}
          onClick={() => void changeMode()}
        >
          <span />
        </button>
      </section>

      {!canSwitchMode && !auto && (
        <p className="pref-hint"><InfoIcon aria-hidden /> Contacts' preferences can be prepared now. Ask a FeedXchange administrator to switch automatic notifications on when you are ready.</p>
      )}

      {/* ------------------------------------------------ settings */}
      <section className="pref-settings" aria-label="Settings">
        <div className="pref-field">
          <label htmlFor="pref-hold">Before sending</label>
          <select id="pref-hold" value={profile.holdSeconds} disabled={!canManage || settingsBusy} onChange={(e) => void changeSettings({ holdSeconds: Number(e.target.value) })}>
            {HOLD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            {!HOLD_OPTIONS.some((o) => o.value === profile.holdSeconds) && <option value={profile.holdSeconds}>Wait {profile.holdSeconds} seconds</option>}
          </select>
          <small>The countdown gives time to Customize or Cancel.</small>
        </div>
        <div className="pref-field">
          <label htmlFor="pref-nosub">If nobody is subscribed</label>
          <select id="pref-nosub" value={profile.noSubscriberRule} disabled={!canManage || settingsBusy} onChange={(e) => void changeSettings({ noSubscriberRule: e.target.value as NoSubscriberRule })}>
            <option value="SendNothing">Send nothing</option>
            <option value="UseRoleDefaults">Use the event's usual recipients</option>
          </select>
          <small>What happens for an event nobody chose to hear about.</small>
        </div>
        <div className="pref-field pref-field--action">
          <span className="pref-field__label">Everyone</span>
          {profile.isPaused ? (
            <button type="button" className="pref-btn" disabled={!canManage || settingsBusy} onClick={() => void changeSettings({ isPaused: false, pausedUntil: null })}>
              <CirclePlayIcon aria-hidden /> Resume all
            </button>
          ) : (
            <button type="button" className="pref-btn" disabled={!canManage || settingsBusy} onClick={() => { setDialogError(""); setPausing("profile"); }}>
              <CirclePauseIcon aria-hidden /> Pause all
            </button>
          )}
          <small>{profile.isPaused ? pauseLabel(profile.pausedUntil) : "Stop all notifications for this business for a while."}</small>
        </div>
      </section>

      {/* ------------------------------------------------ warnings */}
      {profile.warnings.length > 0 && (
        <section className="pref-warnings" aria-label="Gaps to fix">
          <button type="button" className="pref-warnings__head" onClick={() => setShowWarnings((v) => !v)} aria-expanded={showWarnings}>
            <TriangleAlertIcon aria-hidden />
            <strong>{profile.warnings.length} {profile.warnings.length === 1 ? "gap" : "gaps"} worth a look</strong>
            {showWarnings ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
          </button>
          {showWarnings && <ul>{profile.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
        </section>
      )}

      {/* ------------------------------------------------ contacts */}
      <section className="pref-contacts" aria-label="Contacts">
        <header className="pref-contacts__head">
          <h3>Contacts</h3>
          <span>{profile.contacts.length} {profile.contacts.length === 1 ? "contact" : "contacts"}{pausedCount > 0 ? ` · ${pausedCount} paused` : ""}</span>
        </header>

        {profile.contacts.length === 0 ? (
          <div className="pref-empty">
            <InfoIcon aria-hidden />
            <p>This business has no contacts yet. Add contacts to its profile, then choose what each one hears about.</p>
          </div>
        ) : (
          <div className="pref-table-wrap">
            <table className="pref-table">
              <thead>
                <tr><th>Contact</th><th>Hears about</th><th>Status</th><th><span className="pref-sr">Actions</span></th></tr>
              </thead>
              <tbody>
                {profile.contacts.map((c) => {
                  const n = covered(c);
                  return (
                    <tr key={c.contactId} className={c.isPaused ? "is-paused" : ""}>
                      <td>
                        <div className="pref-person">
                          <span className="pref-avatar" aria-hidden>{c.contactName.slice(0, 1).toUpperCase()}</span>
                          <div>
                            <strong>{c.contactName}</strong>
                            <small>{[c.designation, c.email, c.mobile].filter(Boolean).join(" · ") || "No contact details"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {n === 0 ? (
                          <span className="pref-none">Nothing yet</span>
                        ) : (
                          <div className="pref-coverage">
                            <div className="pref-meter" aria-hidden><span style={{ width: `${(n / Math.max(1, profile.events.length)) * 100}%` }} /></div>
                            <span>{n} of {profile.events.length} events</span>
                            <span className="pref-coverage__icons" aria-label={`Channels: ${channelsUsed(c).map((ch) => CHANNEL_META[ch].label).join(", ")}`}>
                              {channelsUsed(c).map((ch) => { const Icon = CHANNEL_META[ch].icon; return <Icon key={ch} title={CHANNEL_META[ch].label} />; })}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        {c.isPaused
                          ? <span className="pref-status pref-status--paused" title={c.pauseReason ?? undefined}><ClockIcon aria-hidden /> {pauseLabel(c.resumeOn)}</span>
                          : <span className="pref-status pref-status--active">Active</span>}
                      </td>
                      <td>
                        <div className="pref-actions">
                          <button type="button" className="pref-btn pref-btn--small" onClick={() => setEditing(c)}>
                            <PenIcon aria-hidden /> {canManage ? "Edit" : "View"}
                          </button>
                          {canManage && (
                            c.isPaused ? (
                              <button type="button" className="pref-icon-btn" aria-label={`Resume ${c.contactName}`} title="Resume" onClick={async () => {
                                try { await resumeContact({ contactId: c.contactId, profileId }).unwrap(); ok(`${c.contactName} will be notified again.`); } catch (e) { fail(e, "Could not resume."); }
                              }}><CirclePlayIcon aria-hidden /></button>
                            ) : (
                              <button type="button" className="pref-icon-btn" aria-label={`Pause ${c.contactName}`} title="Pause" onClick={() => { setDialogError(""); setPausing(c); }}><CirclePauseIcon aria-hidden /></button>
                            )
                          )}
                          {canManage && profile.contacts.length > 1 && n > 0 && (
                            <button type="button" className="pref-icon-btn" aria-label={`Copy ${c.contactName}'s choices to other contacts`} title="Copy to other contacts" onClick={() => { setCopying(c); setCopyTargets([]); }}><CopyIcon aria-hidden /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ------------------------------------------------ activity */}
      <section className="pref-activity" aria-label="Recent activity">
        <button type="button" className="pref-warnings__head pref-warnings__head--plain" onClick={() => setShowActivity((v) => !v)} aria-expanded={showActivity}>
          <ClockIcon aria-hidden /> <strong>Recent changes</strong> <span>{audit.length}</span>
          {showActivity ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
        </button>
        {showActivity && (
          audit.length === 0 ? <p className="pref-hint">Nothing has changed yet.</p> : (
            <ol className="pref-timeline">
              {audit.map((a) => (
                <li key={a.auditId}>
                  <strong>{ACTION_LABELS[a.action] ?? a.action}</strong>
                  {a.contactName && <span> · {a.contactName}</span>}
                  <small>{[a.changedByName ?? "System", formatDateTime(a.changedOn)].join(" · ")}</small>
                </li>
              ))}
            </ol>
          )
        )}
      </section>

      <ContactEditorDrawer
        profile={profile}
        contact={editingLive}
        canManage={canManage}
        onClose={() => setEditing(null)}
        onSaved={ok}
      />

      <PauseDialog
        open={pausing !== null}
        subject={pausing === "profile" ? profile.profileName : pausing?.contactName ?? ""}
        busy={pauseBusy || settingsBusy}
        error={dialogError}
        onClose={() => setPausing(null)}
        onConfirm={async (resumeOn, reason) => {
          if (pausing === "profile") {
            if (await changeSettings({ isPaused: true, pausedUntil: resumeOn })) setPausing(null);
          } else if (pausing) {
            try {
              await pauseContact({ contactId: pausing.contactId, profileId, resumeOn, reason }).unwrap();
              ok(`${pausing.contactName} is paused.`);
              setPausing(null);
            } catch (e) { setDialogError(apiErrorMessage(e, "Could not pause.")); }
          }
        }}
      />

      {copying && createPortal(
        <div className="pref-modal__backdrop" onMouseDown={() => setCopying(null)}>
          <div className="pref-modal" role="dialog" aria-modal="true" aria-labelledby="copy-title" onMouseDown={(e) => e.stopPropagation()}>
            <header className="pref-modal__header">
              <span className="pref-modal__icon" aria-hidden><CopyIcon /></span>
              <div>
                <h2 id="copy-title">Copy {copying.contactName}'s choices</h2>
                <p>The selected contacts get the same events and channels. Their current choices are replaced.</p>
              </div>
              <button type="button" className="pref-modal__close" onClick={() => setCopying(null)} aria-label="Close"><XIcon aria-hidden /></button>
            </header>
            <div className="pref-modal__body">
              <ul className="pref-checklist">
                {profile.contacts.filter((c) => c.contactId !== copying.contactId).map((c) => (
                  <li key={c.contactId}>
                    <label>
                      <input type="checkbox" checked={copyTargets.includes(c.contactId)} onChange={() => setCopyTargets((t) => t.includes(c.contactId) ? t.filter((x) => x !== c.contactId) : [...t, c.contactId])} />
                      <span><strong>{c.contactName}</strong><small>{c.designation ?? ""}</small></span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <footer className="pref-modal__footer">
              <button type="button" className="pref-btn" onClick={() => setCopying(null)}>Cancel</button>
              <button type="button" className="pref-btn pref-btn--primary" disabled={copyTargets.length === 0 || copyBusy} onClick={async () => {
                try {
                  await copy({ profileId, fromContactId: copying.contactId, toContactIds: copyTargets }).unwrap();
                  ok(`Copied to ${copyTargets.length} ${copyTargets.length === 1 ? "contact" : "contacts"}.`);
                  setCopying(null);
                } catch (e) { fail(e, "Could not copy."); }
              }}>{copyBusy ? "Copying…" : "Copy"}</button>
            </footer>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default ProfilePreferencesPanel;
