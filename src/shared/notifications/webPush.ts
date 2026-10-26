import { apiFetch } from "../../core/api/tokenRefresh";
import { isTauri } from "./desktopNotify";

// Desktop notifications while the browser has no FeedXchange tab open: the browser's push service wakes the service worker (public/sw.js),
// which shows the notification. This needs the user's permission, HTTPS (or localhost) and VAPID keys on the server. In a browser only:
// Tauri's WebView has no push service (see docs/notifications-tauri.md).

export const isWebPushSupported = (): boolean =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !isTauri();

const toUint8Array = (base64Url: string): Uint8Array<ArrayBuffer> => {
  const padded = base64Url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64Url.length / 4) * 4, "=");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

const toBase64Url = (buffer: ArrayBuffer | null): string => {
  if (!buffer) return "";
  let s = "";
  new Uint8Array(buffer).forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** The server's VAPID public key, or null when the server has push switched off (then the option is simply not offered). */
const fetchPublicKey = async (): Promise<string | null> => {
  const response = await apiFetch("/api/Notifications/push/public-key");
  if (!response.ok) return null;
  return ((await response.json()) as { publicKey?: string }).publicKey ?? null;
};

/** Whether the server can send pushes at all (so the UI knows whether to show the browser-closed option). */
export const isWebPushAvailable = async (): Promise<boolean> => isWebPushSupported() && (await fetchPublicKey()) !== null;

/**
 * Subscribes this browser (after notification permission was granted) and tells the server. Safe to call repeatedly: it reuses an existing
 * subscription and the server stores each browser once. Returns false when push is unsupported or not set up on the server.
 */
export const subscribeWebPush = async (): Promise<boolean> => {
  if (!isWebPushSupported() || Notification.permission !== "granted") return false;
  const publicKey = await fetchPublicKey();
  if (!publicKey) return false;

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toUint8Array(publicKey) }));

  const response = await apiFetch("/api/Notifications/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: toBase64Url(subscription.getKey("p256dh")),
      auth: toBase64Url(subscription.getKey("auth")),
      deviceLabel: navigator.userAgent.slice(0, 120),
    }),
  });
  return response.ok;
};

/** Stops desktop pushes for this browser: tells the server first (while the user is still signed in), then drops the browser subscription. */
export const unsubscribeWebPush = async (): Promise<void> => {
  if (!isWebPushSupported()) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    await apiFetch("/api/Notifications/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe();
  } catch {
    /* best effort: a failure here must never block signing out or toggling the checkbox */
  }
};
