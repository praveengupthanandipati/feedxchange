import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, CirclePauseIcon, CirclePlayIcon, MailIcon, PhoneIcon, TriangleAlertIcon, XIcon } from "../../../shared/components/icon";
import {
  usePauseContactMutation,
  useResumeContactMutation,
  useSaveContactPreferencesMutation,
} from "../../../core/store/notificationPreferencesApi";
import type { ContactPreferences, ProfilePreferences, Subscription } from "../../../core/store/notificationPreferencesApi";
import type { ChannelCode } from "../../../core/store/notificationsApi";
import { apiErrorMessage } from "../../../core/store/sellerInvoiceApi";
import PauseDialog from "./PauseDialog";
import SubscriptionEditor from "./SubscriptionEditor";
import { pauseLabel, sameSubscriptions } from "./preferenceUtils";

interface ContactEditorDrawerProps {
  profile: ProfilePreferences;
  contact: ContactPreferences | null;
  canManage: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}

/** Slide-over for one contact: what they hear about and on which channels, plus pause and resume. */
const ContactEditorDrawer = ({ profile, contact, canManage, onClose, onSaved }: ContactEditorDrawerProps) => {
  const [value, setValue] = useState<Subscription[]>([]);
  const [error, setError] = useState("");
  const [pausing, setPausing] = useState(false);
  const [save, { isLoading: saving }] = useSaveContactPreferencesMutation();
  const [pause, { isLoading: pauseBusy }] = usePauseContactMutation();
  const [resume, { isLoading: resumeBusy }] = useResumeContactMutation();

  useEffect(() => {
    setValue(contact?.subscriptions ?? []);
    setError("");
  }, [contact]);

  useEffect(() => {
    if (!contact) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pausing && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [contact, pausing, onClose]);

  const unavailable = useMemo(() => {
    const map: Partial<Record<ChannelCode, string>> = { APP: "Contacts have no app login. System users manage their own in-app notifications." };
    if (!contact?.email) map.EMAIL = "Add an email address to use Email";
    if (!contact?.mobile) { map.SMS = "Add a mobile number to use SMS"; map.WHATSAPP = "Add a mobile number to use WhatsApp"; }
    return map;
  }, [contact]);

  if (!contact) return null;
  const dirty = !sameSubscriptions(value, contact.subscriptions);
  const total = value.filter((s) => s.channels.length > 0).length;

  const submit = async () => {
    setError("");
    try {
      await save({ contactId: contact.contactId, profileId: profile.profileId, subscriptions: value }).unwrap();
      onSaved(`Preferences saved for ${contact.contactName}.`);
      onClose();
    } catch (e) {
      setError(apiErrorMessage(e, "The preferences could not be saved."));
    }
  };

  return (
    <>
      {createPortal(
    <div className="pref-drawer__backdrop" onMouseDown={onClose}>
      <aside className="pref-drawer" role="dialog" aria-modal="true" aria-label={`Notification preferences of ${contact.contactName}`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="pref-drawer__header">
          <div className="pref-avatar" aria-hidden>{contact.contactName.slice(0, 1).toUpperCase()}</div>
          <div className="pref-drawer__who">
            <h2>{contact.contactName}</h2>
            <p>{[contact.designation, profile.profileName].filter(Boolean).join(" · ")}</p>
            <div className="pref-drawer__reach">
              <span className={contact.email ? "" : "is-missing"}><MailIcon aria-hidden /> {contact.email ?? "No email"}</span>
              <span className={contact.mobile ? "" : "is-missing"}><PhoneIcon aria-hidden /> {contact.mobile ?? "No mobile"}</span>
            </div>
          </div>
          <button type="button" className="pref-modal__close" onClick={onClose} aria-label="Close"><XIcon aria-hidden /></button>
        </header>

        {contact.isPaused && (
          <div className="pref-banner pref-banner--paused" role="status">
            <CirclePauseIcon aria-hidden />
            <div>
              <strong>{pauseLabel(contact.resumeOn)}</strong>
              <span>{contact.pauseReason ?? "Nothing is sent to this contact except events that are always sent."}</span>
            </div>
            {canManage && (
              <button type="button" className="pref-btn pref-btn--small" disabled={resumeBusy} onClick={async () => {
                try { await resume({ contactId: contact.contactId, profileId: profile.profileId }).unwrap(); onSaved(`${contact.contactName} will be notified again.`); }
                catch (e) { setError(apiErrorMessage(e, "Could not resume.")); }
              }}>
                <CirclePlayIcon aria-hidden /> Resume
              </button>
            )}
          </div>
        )}

        <div className="pref-drawer__body">
          <SubscriptionEditor events={profile.events} channels={profile.channels} value={value} onChange={setValue} unavailable={unavailable} readOnly={!canManage} />
        </div>

        <footer className="pref-drawer__footer">
          {error && <p className="pref-error" role="alert"><TriangleAlertIcon aria-hidden /> {error}</p>}
          <div className="pref-drawer__summary">{total === 0 ? "Not subscribed to anything" : `Subscribed to ${total} ${total === 1 ? "event" : "events"}`}</div>
          <div className="pref-drawer__buttons">
            {canManage && !contact.isPaused && (
              <button type="button" className="pref-btn pref-btn--quiet" onClick={() => setPausing(true)}><CirclePauseIcon aria-hidden /> Pause</button>
            )}
            <button type="button" className="pref-btn" onClick={onClose}>{canManage ? "Cancel" : "Close"}</button>
            {canManage && (
              <button type="button" className="pref-btn pref-btn--primary" disabled={!dirty || saving} onClick={() => void submit()}>
                <CheckIcon aria-hidden /> {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        </footer>
      </aside>
    </div>,
    document.body,
      )}

      <PauseDialog
        open={pausing}
        subject={contact.contactName}
        busy={pauseBusy}
        error={error}
        onClose={() => setPausing(false)}
        onConfirm={async (resumeOn, reason) => {
          try {
            await pause({ contactId: contact.contactId, profileId: profile.profileId, resumeOn, reason }).unwrap();
            setPausing(false);
            onSaved(`${contact.contactName} is paused.`);
          } catch (e) {
            setError(apiErrorMessage(e, "Could not pause."));
          }
        }}
      />
    </>
  );
};

export default ContactEditorDrawer;
