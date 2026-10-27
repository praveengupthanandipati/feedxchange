import { type IconComponent, BellIcon, MailIcon, MessageCircleIcon, SmartphoneIcon } from "../../../shared/components/icon";
import type { ChannelCode } from "../../../core/store/notificationsApi";
import type { PreferenceChannel, PreferenceEvent, Subscription } from "../../../core/store/notificationPreferencesApi";

export const CHANNEL_ORDER: ChannelCode[] = ["EMAIL", "WHATSAPP", "SMS", "APP"];

export const CHANNEL_META: Record<ChannelCode, { label: string; icon: IconComponent }> = {
  EMAIL: { label: "Email", icon: MailIcon },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircleIcon },
  SMS: { label: "SMS", icon: SmartphoneIcon },
  APP: { label: "In-app", icon: BellIcon },
};

export interface EventGroup {
  id: string;
  label: string;
  hint: string;
  events: PreferenceEvent[];
}

const GROUPS: { id: string; label: string; hint: string; match: (code: string) => boolean }[] = [
  { id: "contracts", label: "Contracts", hint: "Created, updated, approved and status changes", match: (c) => c.startsWith("CONTRACT_") },
  { id: "operations", label: "Trucks and dispatch", hint: "Freight requests, transporter replies, loading", match: (c) => /^(DISPATCH_|TRANSPORTER_|TRUCK_|SUPPLIER_)/.test(c) },
  { id: "finance", label: "Payments and invoices", hint: "Invoices raised, changed or cancelled, payments recorded", match: (c) => c.startsWith("INVOICE_") || c.startsWith("PAYMENT_") },
];

/** Events in the order the screens show them: grouped by what they are about, anything unknown last. */
export function groupEvents(events: PreferenceEvent[]): EventGroup[] {
  const groups: EventGroup[] = GROUPS.map((g) => ({ id: g.id, label: g.label, hint: g.hint, events: events.filter((e) => g.match(e.eventCode)) }));
  const other = events.filter((e) => !GROUPS.some((g) => g.match(e.eventCode)));
  if (other.length > 0) groups.push({ id: "other", label: "Other", hint: "", events: other });
  return groups.filter((g) => g.events.length > 0);
}

export interface Preset {
  id: string;
  label: string;
  /** Which events the preset switches on (null = every event, [] = none). */
  groups: string[] | null;
}

export const PRESETS: Preset[] = [
  { id: "all", label: "Everything", groups: null },
  { id: "finance", label: "Finance only", groups: ["finance"] },
  { id: "operations", label: "Operations only", groups: ["operations"] },
  { id: "none", label: "Nothing", groups: [] },
];

/** The channels a person can actually be reached on, so a preset never picks one that cannot work. */
export function reachableChannels(channels: PreferenceChannel[], hasEmail: boolean, hasMobile: boolean, hasApp = false): ChannelCode[] {
  return CHANNEL_ORDER.filter((code) => {
    const channel = channels.find((c) => c.channelCode === code);
    if (!channel?.isEnabled) return false;
    if (code === "EMAIL") return hasEmail;
    if (code === "SMS" || code === "WHATSAPP") return hasMobile;
    return hasApp;
  });
}

/** Switches a preset on: its events get the given channels; mandatory events always keep at least one. */
export function applyPreset(preset: Preset, events: PreferenceEvent[], channels: ChannelCode[], fallback: ChannelCode[]): Subscription[] {
  const groups = groupEvents(events);
  return events
    .filter((e) => preset.groups === null || groups.some((g) => preset.groups!.includes(g.id) && g.events.some((x) => x.eventCode === e.eventCode)) || e.isMandatory)
    .map((e) => ({ eventCode: e.eventCode, channels: channels.length > 0 ? channels : (e.isMandatory ? fallback : []) }))
    .filter((s) => s.channels.length > 0);
}

export function channelsOf(subs: Subscription[], eventCode: string): ChannelCode[] {
  return subs.find((s) => s.eventCode === eventCode)?.channels ?? [];
}

export function setChannels(subs: Subscription[], eventCode: string, channels: ChannelCode[]): Subscription[] {
  const rest = subs.filter((s) => s.eventCode !== eventCode);
  return channels.length === 0 ? rest : [...rest, { eventCode, channels: CHANNEL_ORDER.filter((c) => channels.includes(c)) }];
}

export function sameSubscriptions(a: Subscription[], b: Subscription[]): boolean {
  const key = (s: Subscription[]) => JSON.stringify([...s].filter((x) => x.channels.length > 0).sort((p, q) => p.eventCode.localeCompare(q.eventCode)).map((x) => [x.eventCode, [...x.channels].sort()]));
  return key(a) === key(b);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.endsWith("Z") || /[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** "2 days" style hint for a pause that ends on its own. */
export function pauseLabel(resumeOn: string | null): string {
  return resumeOn ? `Paused until ${formatDateTime(resumeOn)}` : "Paused until resumed";
}

export function toIsoEnd(dateInput: string): string | null {
  if (!dateInput) return null;
  // the pause lifts at the start of the chosen day, local time
  const d = new Date(`${dateInput}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const ACTION_LABELS: Record<string, string> = {
  PreferencesSaved: "Preferences changed",
  Paused: "Paused",
  Resumed: "Resumed",
  ModeChanged: "Automation switched",
  SettingsChanged: "Settings changed",
  Copied: "Preferences copied",
};
