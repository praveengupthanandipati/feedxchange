import type { ChannelCode, NotificationEvent } from "../../core/store/notificationsApi";

/**
 * What the user chose about a notification BEFORE it is sent: which channels per recipient role, and which template per role and channel
 * (no entry = the default template). The contract screen collects this up front; the Notify panel starts from it.
 */
export interface NotifyChoices {
  channels: Record<string, ChannelCode[]>;
  templates: Record<string, number | null>;
}

export interface NotifyRole {
  code: string;
  label: string;
}

export const CHANNEL_ORDER: ChannelCode[] = ["EMAIL", "WHATSAPP", "SMS", "APP"];

export const templateKey = (role: string, channel: ChannelCode) => `${role}|${channel}`;

/** Default channels for each role from the event's rules (e.g. Contract Created: buyer and seller get Email + WhatsApp). */
export const defaultChoices = (event: NotificationEvent | undefined, roles: NotifyRole[]): NotifyChoices => ({
  channels: Object.fromEntries(
    roles.map((r) => [
      r.code,
      CHANNEL_ORDER.filter((ch) => event?.rules.some((rule) => rule.recipientRole === r.code && rule.channelCode === ch && rule.isDefaultOn)),
    ]),
  ),
  templates: {},
});
