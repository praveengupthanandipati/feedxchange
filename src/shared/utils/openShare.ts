import type { ShareChannel } from "../components/dialog/ShareModal";

export interface ShareRecipient {
  phone?: string;
  email?: string;
}

const digits = (value?: string) => (value ?? "").replace(/\D/g, "");
/** WhatsApp wants the number with its country code; Indian 10-digit numbers get 91. */
const withCountryCode = (phone: string) => (phone.length === 10 ? `91${phone}` : phone);

/**
 * Sends a message through the user's own WhatsApp, SMS or email app, addressed to the recipients (for screens that
 * have no backend sending for this information). WhatsApp opens one chat: the recipient's when there is exactly one,
 * otherwise WhatsApp's own picker.
 */
export function openShare(channel: ShareChannel, recipients: ShareRecipient[], message: string, subject = "") {
  const phones = recipients.map((recipient) => digits(recipient.phone)).filter(Boolean);
  const emails = recipients.map((recipient) => (recipient.email ?? "").trim()).filter(Boolean);
  const text = encodeURIComponent(message);

  if (channel === "whatsapp") {
    const to = phones.length === 1 ? withCountryCode(phones[0]) : "";
    window.open(`https://wa.me/${to}?text=${text}`, "_blank", "noopener,noreferrer");
    return;
  }
  if (channel === "sms") {
    window.location.href = `sms:${phones.join(",")}?body=${text}`;
    return;
  }
  window.location.href = `mailto:${emails.join(",")}?subject=${encodeURIComponent(subject)}&body=${text}`;
}
