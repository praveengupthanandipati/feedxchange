// Desktop notifications behind one small adapter, so the same app runs in a browser and inside Tauri.
//  - Browser: the Notifications API (needs a click-initiated permission request; works while the tab / browser is running).
//  - Tauri: the official notification plugin, called through Tauri's invoke bridge. The Rust side must register
//    `tauri-plugin-notification` and grant the `notification:default` capability (see docs/notifications-tauri.md).
// Notifications while the browser is fully closed need Web Push (VAPID + service worker) - added in a later phase.

type TauriInvoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

const tauriInvoke = (): TauriInvoke | null => {
  const w = window as unknown as { __TAURI_INTERNALS__?: { invoke?: TauriInvoke } };
  return w.__TAURI_INTERNALS__?.invoke ?? null;
};

export const isTauri = (): boolean => tauriInvoke() !== null;

export type DesktopPermission = "granted" | "denied" | "default" | "unsupported";

const PREF_KEY = "fx-desktop-notifications"; // "on" | "off"; a convenience only, the real permission lives in the browser / OS

export const getDesktopPreference = (): boolean => {
  try {
    return localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
};

const setDesktopPreference = (on: boolean) => {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* ignore: private mode */
  }
};

export const getDesktopPermission = async (): Promise<DesktopPermission> => {
  const invoke = tauriInvoke();
  if (invoke) {
    try {
      return (await invoke("plugin:notification|is_permission_granted")) ? "granted" : "default";
    } catch {
      return "unsupported";
    }
  }
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission as DesktopPermission;
};

/** Call from a click handler: browsers only show the permission prompt for a user gesture, and a denied choice is never re-asked. */
export const enableDesktopNotifications = async (): Promise<DesktopPermission> => {
  const invoke = tauriInvoke();
  let result: DesktopPermission;
  if (invoke) {
    try {
      const granted = (await invoke("plugin:notification|is_permission_granted")) as boolean;
      if (granted) result = "granted";
      else result = (await invoke("plugin:notification|request_permission")) === "granted" ? "granted" : "denied";
    } catch {
      result = "unsupported";
    }
  } else if (typeof Notification === "undefined") {
    result = "unsupported";
  } else if (Notification.permission === "default") {
    result = (await Notification.requestPermission()) as DesktopPermission;
  } else {
    result = Notification.permission as DesktopPermission;
  }
  setDesktopPreference(result === "granted");
  return result;
};

export const disableDesktopNotifications = () => setDesktopPreference(false);

/** Shows an OS notification when the user enabled them and permission is granted. Never throws. */
export const desktopNotify = async (title: string, body: string, onClick?: () => void): Promise<void> => {
  if (!getDesktopPreference()) return;
  try {
    const invoke = tauriInvoke();
    if (invoke) {
      await invoke("plugin:notification|notify", { options: { title, body } });
      return;
    }
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const n = new Notification(title, { body, tag: "feedxchange" });
    if (onClick) n.onclick = () => { window.focus(); onClick(); n.close(); };
  } catch {
    /* a failed OS notification must never break the app */
  }
};
