// FeedXchange service worker: desktop notifications while no FeedXchange tab is open (Web Push).
// It only shows a notification when no FeedXchange window is on screen; when one is, the in-app toast (SignalR) already tells the user.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "FeedXchange", body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (windows.some((w) => w.visibilityState === "visible" && w.focused)) return;
      await self.registration.showNotification(data.title || "FeedXchange", {
        body: data.body || "",
        icon: "/favicon.png",
        tag: data.inboxId ? `fx-${data.inboxId}` : "fx",
        data: { deepLink: data.deepLink || "/admin/notifications" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  let link = (event.notification.data && event.notification.data.deepLink) || "/admin/notifications";
  // links from the server may predate the /admin prefix
  if (link.startsWith("/") && !link.startsWith("//") && link !== "/admin" && !link.startsWith("/admin/")) link = "/admin" + link;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of windows) {
        if ("focus" in w) {
          await w.focus();
          if ("navigate" in w) {
            try { await w.navigate(link); } catch { /* cross-origin or not controlled: the window is focused anyway */ }
          }
          return;
        }
      }
      await self.clients.openWindow(link);
    })(),
  );
});
