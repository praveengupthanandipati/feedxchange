import { useEffect, useState } from "react";
import { EyeIcon } from "../components/icon";
import {
  useGetNotificationChannelsQuery,
  useGetNotificationEventsQuery,
  useGetNotificationRecipientsQuery,
  useGetNotificationTemplatesQuery,
  usePreviewDraftNotificationMutation,
} from "../../core/store/notificationsApi";
import type { ChannelCode, ContractDraft, DraftPreviewResult, NotificationTemplate } from "../../core/store/notificationsApi";
import { getErrorMessage } from "../../core/api/getErrorMessage";
import { CHANNEL_ORDER, defaultChoices, templateKey } from "./notifyChoices";
import type { NotifyChoices, NotifyRole } from "./notifyChoices";
import "./Notifications.scss";

interface TemplateSelectProps {
  id: string;
  label: string;
  role: string;
  channel: ChannelCode;
  templates: NotificationTemplate[];
  value: number | null | undefined;
  onChange: (templateId: number | null) => void;
}

/** One "which template?" dropdown. Only templates meant for this role (or for any role) are offered. */
export const TemplateSelect = ({ id, label, role, channel, templates, value, onChange }: TemplateSelectProps) => {
  const options = templates.filter((t) => t.channelCode === channel && (t.recipientRole === null || t.recipientRole === role));
  const def = options.find((o) => o.isDefault);
  return (
    <div>
      <label className="form-label small fw-semibold mb-1" htmlFor={id}>{label}</label>
      <select id={id} className="form-select form-select-sm" value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Automatic{def ? ` (${def.templateName} or matching variant)` : ""}</option>
        {options.map((o) => <option key={o.templateId} value={o.templateId}>{o.templateName}</option>)}
      </select>
    </div>
  );
};

/** The business a role stands for on the form (the contract's seller / buyer). */
export interface NotifyParty {
  profileId: number | null;
  name?: string;
}

interface PartyContactsProps {
  eventCode: string;
  role: string;
  party: NotifyParty;
}

/** The party's contacts (name, mobile, email, app login), listed as soon as the business is picked - before the contract exists. */
const PartyContacts = ({ eventCode, role, party }: PartyContactsProps) => {
  const { data: contacts = [], isFetching, isError } = useGetNotificationRecipientsQuery(
    { profileId: party.profileId ?? undefined, eventCode, role },
    { skip: !party.profileId },
  );

  if (!party.profileId) return <p className="small text-secondary mb-2">Pick the {role.toLowerCase()} above to see who will be notified.</p>;
  if (isFetching) return <p className="small text-secondary mb-2">Loading contacts…</p>;
  if (isError) return <p className="small text-danger mb-2">The contacts could not be loaded.</p>;
  if (contacts.length === 0) return <p className="small text-warning mb-2">No contacts are saved for {party.name || "this business"}, so nobody can be notified. Add them in the business profile.</p>;

  return (
    <ul className="list-unstyled small mb-2" aria-label={`${role.toLowerCase()} contacts`}>
      {contacts.map((c) => (
        <li key={`${c.recipientType}:${c.recipientRefId}`} className="mb-1">
          <strong>{c.displayName}</strong>
          {c.hasAppLogin ? <span className="badge text-bg-light ms-1">App login</span> : null}
          <div className="text-secondary">{[c.mobile, c.email].filter(Boolean).join(" · ") || "No contact details"}</div>
        </li>
      ))}
    </ul>
  );
};

interface PickerProps {
  eventCode: string;
  roles: NotifyRole[];
  value: NotifyChoices | null;
  onChange: (value: NotifyChoices) => void;
  /** Per role: the business, so its contacts are shown (contract form). Without it the picker shows only channels and templates. */
  parties?: Record<string, NotifyParty>;
  /** The contract as entered so far: gives each template a preview (icon next to it) without the contract being saved. */
  draft?: ContractDraft;
}

/**
 * Channel and template choices per recipient role, with no recipients involved yet - used on screens that notify before anyone is known
 * to the server (the contract form). It starts from the event's default channels and never overrides what the user already chose.
 * One template per role and channel applies to every contact of that role; the preview shows it once per role, not per contact.
 */
const NotifyChoicePicker = ({ eventCode, roles, value, onChange, parties, draft }: PickerProps) => {
  const { data: channels = [] } = useGetNotificationChannelsQuery();
  const { data: events = [] } = useGetNotificationEventsQuery();
  const { data: templates = [] } = useGetNotificationTemplatesQuery({ eventCode });
  const [previewDraft, { isLoading: previewing }] = usePreviewDraftNotificationMutation();
  const [previews, setPreviews] = useState<Record<string, DraftPreviewResult["messages"][number] | { error: string }>>({});
  const [openPreview, setOpenPreview] = useState<string | null>(null);
  const event = events.find((e) => e.eventCode === eventCode);
  const enabled = CHANNEL_ORDER.filter((c) => channels.find((x) => x.channelCode === c)?.isEnabled);

  useEffect(() => {
    if (value === null && event) onChange(defaultChoices(event, roles));
    // seed once, when the event rules arrive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, value]);

  if (!value) return <p className="text-secondary small mb-0">Loading notification options…</p>;

  const toggle = (role: string, ch: ChannelCode) => {
    const has = value.channels[role]?.includes(ch);
    setOpenPreview(null);
    onChange({ ...value, channels: { ...value.channels, [role]: has ? value.channels[role].filter((c) => c !== ch) : [...(value.channels[role] ?? []), ch] } });
  };

  const showPreview = async (role: string, ch: ChannelCode) => {
    const key = templateKey(role, ch);
    if (openPreview === key) return setOpenPreview(null);
    setOpenPreview(key);
    try {
      const result = await previewDraft({
        eventCode,
        items: [{ role, channelCode: ch, templateId: value.templates[key] ?? null }],
        draft: draft ?? {},
      }).unwrap();
      setPreviews((prev) => ({ ...prev, [key]: result.messages[0] ?? { error: "Nothing to preview." } }));
    } catch (e) {
      setPreviews((prev) => ({ ...prev, [key]: { error: getErrorMessage(e, "The preview could not be shown.") } }));
    }
  };

  return (
    <div className="row g-3">
      {roles.map((role) => {
        const ticked = CHANNEL_ORDER.filter((ch) => value.channels[role.code]?.includes(ch));
        const party = parties?.[role.code];
        return (
          <div className="col-lg-6" key={role.code}>
            <div className="border rounded p-3 h-100">
              <div className="fw-semibold mb-2">{role.label}{party?.name ? ` - ${party.name}` : ""}</div>
              {party && <PartyContacts eventCode={eventCode} role={role.code} party={party} />}
              <div className="d-flex flex-wrap gap-3 mb-2">
                {enabled.map((ch) => (
                  <label key={ch} className="d-flex align-items-center gap-1 mb-0">
                    <input type="checkbox" className="form-check-input mt-0" checked={ticked.includes(ch)} onChange={() => toggle(role.code, ch)} />
                    {channels.find((c) => c.channelCode === ch)?.channelName}
                  </label>
                ))}
              </div>
              {ticked.length === 0 && <div className="small text-secondary">Not notified.</div>}
              <div className="d-grid gap-2">
                {ticked.map((ch) => {
                  const key = templateKey(role.code, ch);
                  const preview = previews[key];
                  return (
                    <div key={ch}>
                      <div className="d-flex align-items-end gap-2">
                        <div className="flex-grow-1">
                          <TemplateSelect
                            id={`fx-pick-${role.code}-${ch}`} role={role.code} channel={ch} templates={templates}
                            label={`${channels.find((c) => c.channelCode === ch)?.channelName} template`}
                            value={value.templates[key]}
                            onChange={(id) => {
                              setPreviews((prev) => { const next = { ...prev }; delete next[key]; return next; });
                              setOpenPreview(null);
                              onChange({ ...value, templates: { ...value.templates, [key]: id } });
                            }}
                          />
                        </div>
                        {draft && (
                          <button
                            type="button" className="btn btn-outline-secondary btn-sm" onClick={() => void showPreview(role.code, ch)}
                            disabled={previewing && openPreview === key}
                            aria-label={`Preview the ${role.label.toLowerCase()} ${channels.find((c) => c.channelCode === ch)?.channelName} message`}
                            title="Preview this message with the contract as entered"
                          >
                            <EyeIcon aria-hidden />
                          </button>
                        )}
                      </div>
                      {openPreview === key && (
                        <div className="fx-notify__preview mt-2">
                          {!preview ? <div className="small text-secondary">Rendering…</div> : "error" in preview ? (
                            <div className="fx-notify__problem">⚠ {preview.error}</div>
                          ) : (
                            <>
                              <div className="small"><strong>{role.label}</strong> · {preview.channelCode}{preview.templateName ? ` · ${preview.templateName}` : ""}</div>
                              {preview.problems.map((p) => <div key={p} className="fx-notify__problem">⚠ {p}</div>)}
                              {preview.subject && <div className="small mt-1"><strong>Subject:</strong> {preview.subject}</div>}
                              {preview.body && <pre>{preview.body}</pre>}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotifyChoicePicker;
