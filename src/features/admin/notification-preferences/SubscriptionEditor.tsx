import { useMemo } from "react";
import { LockIcon } from "../../../shared/components/icon";
import type { ChannelCode } from "../../../core/store/notificationsApi";
import type { PreferenceChannel, PreferenceEvent, Subscription } from "../../../core/store/notificationPreferencesApi";
import { CHANNEL_META, CHANNEL_ORDER, PRESETS, applyPreset, channelsOf, groupEvents, setChannels } from "./preferenceUtils";

interface SubscriptionEditorProps {
  events: PreferenceEvent[];
  channels: PreferenceChannel[];
  value: Subscription[];
  onChange: (next: Subscription[]) => void;
  /** Channels this person cannot be reached on, with the reason ("No email address"). They are shown but cannot be switched on. */
  unavailable?: Partial<Record<ChannelCode, string>>;
  readOnly?: boolean;
  /** Which preset buttons to offer. Defaults to all of them. */
  showPresets?: boolean;
}

/**
 * One person's "tell me about..." list: events grouped by topic, each with an on/off switch and a pill per channel. Presets fill the whole
 * list in one click using only the channels the person can actually be reached on. Always-sent events are locked on.
 */
const SubscriptionEditor = ({ events, channels, value, onChange, unavailable = {}, readOnly = false, showPresets = true }: SubscriptionEditorProps) => {
  const groups = useMemo(() => groupEvents(events), [events]);
  const platformOff = useMemo(() => new Set(channels.filter((c) => !c.isEnabled).map((c) => c.channelCode)), [channels]);

  const usable = (code: ChannelCode) => !readOnly && !unavailable[code] && !platformOff.has(code) && channels.some((c) => c.channelCode === code);
  const reachable = CHANNEL_ORDER.filter((c) => channels.some((x) => x.channelCode === c && x.isEnabled) && !unavailable[c]);
  const fallback: ChannelCode[] = reachable.length > 0 ? [reachable[0]] : [];

  const toggleEvent = (event: PreferenceEvent) => {
    const on = channelsOf(value, event.eventCode).length > 0;
    if (on && event.isMandatory) return;
    onChange(setChannels(value, event.eventCode, on ? [] : reachable.slice(0, 2).length > 0 ? reachable.slice(0, 2) : []));
  };

  const toggleChannel = (event: PreferenceEvent, code: ChannelCode) => {
    const current = channelsOf(value, event.eventCode);
    const has = current.includes(code);
    if (has && event.isMandatory && current.length === 1) return;   // an always-sent event keeps one channel
    onChange(setChannels(value, event.eventCode, has ? current.filter((c) => c !== code) : [...current, code]));
  };

  return (
    <div className="pref-editor">
      {showPresets && !readOnly && (
        <div className="pref-editor__presets" role="group" aria-label="Quick setup">
          <span>Quick setup</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="pref-chip"
              onClick={() => onChange(applyPreset(preset, events, reachable, fallback))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {groups.map((group) => {
        const onCount = group.events.filter((e) => channelsOf(value, e.eventCode).length > 0).length;
        return (
          <section key={group.id} className="pref-group" aria-label={group.label}>
            <header className="pref-group__header">
              <div>
                <h3>{group.label}</h3>
                {group.hint && <p>{group.hint}</p>}
              </div>
              <span className={`pref-group__count ${onCount > 0 ? "is-on" : ""}`}>{onCount} of {group.events.length} on</span>
            </header>

            <ul className="pref-group__rows">
              {group.events.map((event) => {
                const active = channelsOf(value, event.eventCode);
                const on = active.length > 0;
                return (
                  <li key={event.eventCode} className={`pref-row ${on ? "is-on" : ""}`}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`${event.eventName}${event.isMandatory ? " (always sent)" : ""}`}
                      className="pref-switch"
                      disabled={readOnly || (event.isMandatory && on)}
                      onClick={() => toggleEvent(event)}
                    >
                      <span />
                    </button>

                    <div className="pref-row__name">
                      <strong>{event.eventName}</strong>
                      {event.isMandatory && (
                        <span className="pref-lock" title="This notification is always sent. At least one channel stays on.">
                          <LockIcon aria-hidden /> Always sent
                        </span>
                      )}
                    </div>

                    <div className="pref-row__channels" role="group" aria-label={`Channels for ${event.eventName}`}>
                      {CHANNEL_ORDER.filter((code) => channels.some((c) => c.channelCode === code)).map((code) => {
                        const meta = CHANNEL_META[code];
                        const Icon = meta.icon;
                        const selected = active.includes(code);
                        const reason = unavailable[code] ?? (platformOff.has(code) ? "Switched off for everyone" : undefined);
                        const locked = event.isMandatory && selected && active.length === 1;
                        return (
                          <button
                            key={code}
                            type="button"
                            aria-pressed={selected}
                            className={`pref-pill ${selected ? "is-selected" : ""}`}
                            disabled={!usable(code) && !selected ? true : readOnly || locked}
                            title={reason ?? (locked ? "At least one channel must stay on" : `${selected ? "Stop" : "Send"} ${meta.label}`)}
                            onClick={() => toggleChannel(event, code)}
                          >
                            <Icon aria-hidden />
                            <span>{meta.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default SubscriptionEditor;
