# Desktop notifications in the Tauri app

The web app calls `src/notifications/desktopNotify.ts`. Inside Tauri it uses the official notification plugin through Tauri's invoke bridge,
so no npm package is needed on the web side. The Rust side needs three things:

1. Add the plugin: `cargo add tauri-plugin-notification` (in `src-tauri`).
2. Register it in `src-tauri/src/lib.rs`: `.plugin(tauri_plugin_notification::init())`.
3. Allow it in `src-tauri/capabilities/default.json`: add `"notification:default"` to `permissions`.

What works today
- App open (window or minimized to tray): live SignalR push, in-app toast, OS notification when "Desktop notifications" is ticked in the bell menu.
- To keep notifications coming when the window is closed, configure the app to start with Windows and minimize to the tray instead of quitting
  (Tauri tray icon + `tauri-plugin-autostart`). The SignalR connection lives as long as the process does.

Browser (not Tauri): Web Push
- In a normal browser the bell's "Desktop notifications" checkbox also registers a push subscription (service worker `public/sw.js`), so notifications arrive
  while no FeedXchange tab is open. Needs HTTPS (or localhost), the user's permission and VAPID keys on the server. Tauri's WebView has no push service, so the
  Tauri app uses the tray + SignalR approach above.

What does not work yet
- A fully quit app cannot receive anything: that needs OS-level push (WNS on Windows) or a background agent. Plan it later; until then the
  same notification also goes out by email/WhatsApp if the sender ticked those channels.
- Browser notifications while the browser is fully closed need Web Push (VAPID + service worker), a later phase.
