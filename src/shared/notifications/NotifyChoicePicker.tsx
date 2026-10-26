import { useEffect } from "react";
import {
  useGetNotificationChannelsQuery,
  useGetNotificationEventsQuery,
  useGetNotificationTemplatesQuery,
} from "../../core/store/notificationsApi";
import type { ChannelCode, NotificationTemplate } from "../../core/store/notificationsApi";
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

interface PickerProps {
  eventCode: string;
  roles: NotifyRole[];
  value: NotifyChoices | null;
  onChange: (value: NotifyChoices) => void;
}

/**
 * Channel and template choices per recipient role, with no recipients involved yet - used on screens that notify before anyone is known
 * to the server (the contract form). It starts from the event's default channels and never overrides what the user already chose.
 */
const NotifyChoicePicker = ({ eventCode, roles, value, onChange }: PickerProps) => {
  const { data: channels = [] } = useGetNotificationChannelsQuery();
  const { data: events = [] } = useGetNotificationEventsQuery();
  const { data: templates = [] } = useGetNotificationTemplatesQuery({ eventCode });
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
    onChange({ ...value, channels: { ...value.channels, [role]: has ? value.channels[role].filter((c) => c !== ch) : [...(value.channels[role] ?? []), ch] } });
  };

  return (
    <div className="row g-3">
      {roles.map((role) => {
        const ticked = CHANNEL_ORDER.filter((ch) => value.channels[role.code]?.includes(ch));
        return (
          <div className="col-lg-6" key={role.code}>
            <div className="border rounded p-3 h-100">
              <div className="fw-semibold mb-2">{role.label}</div>
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
                {ticked.map((ch) => (
                  <TemplateSelect
                    key={ch} id={`fx-pick-${role.code}-${ch}`} role={role.code} channel={ch} templates={templates}
                    label={`${channels.find((c) => c.channelCode === ch)?.channelName} template`}
                    value={value.templates[templateKey(role.code, ch)]}
                    onChange={(id) => onChange({ ...value, templates: { ...value.templates, [templateKey(role.code, ch)]: id } })}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotifyChoicePicker;
