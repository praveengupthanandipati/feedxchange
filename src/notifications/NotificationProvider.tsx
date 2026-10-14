import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import type { HubConnection } from "@microsoft/signalr";
import { API_URL } from "../api/api";
import { getFreshAccessToken } from "../api/tokenRefresh";
import { useAuth } from "../auth/AuthContext";
import { notificationsApi } from "../store/notificationsApi";
import type { InboxItem } from "../store/notificationsApi";
import { desktopNotify, getDesktopPreference } from "./desktopNotify";
import { subscribeWebPush } from "./webPush";
import "./Notifications.scss";

interface LiveToast {
  id: number;
  title: string;
  body: string;
}

interface NotificationContextValue {
  /** True while the live SignalR connection is up. The inbox still works when it is not (it is loaded from the API). */
  connected: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({ connected: false });
export const useNotificationConnection = () => useContext(NotificationContext);

const TOAST_MS = 6000;

/**
 * Keeps one SignalR connection per signed-in session and turns pushes into: a refreshed bell / inbox, an in-app toast and, when the
 * user enabled it, an OS notification. SignalR is only a live nudge - every notification is also in the database, so after a
 * reconnect (or on load) the inbox is simply re-read.
 */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, userId } = useAuth();
  const dispatch = useDispatch();
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const nextId = useRef(1);
  const connectionRef = useRef<HubConnection | null>(null);

  const refreshInbox = useCallback(() => {
    dispatch(notificationsApi.util.invalidateTags(["Inbox", "UnreadCount"]));
  }, [dispatch]);

  const pushToast = useCallback((title: string, body: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-3), { id, title, body }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notifications`, {
        // Called for every (re)connect, so a token refreshed in the meantime is used.
        accessTokenFactory: async () => (await getFreshAccessToken()) ?? "",
        // The token travels as a header / query string, not a cookie. Sending credentials would also make the browser reject the API's
        // wildcard CORS answer, which blocks the connection.
        withCredentials: false,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();
    connectionRef.current = connection;

    connection.on("notification", (payload: { item: InboxItem; unreadCount: number }) => {
      refreshInbox();
      pushToast(payload.item.title, payload.item.body);
      if (document.hidden) void desktopNotify(payload.item.title, payload.item.body);
    });
    connection.on("deliveryStatus", () => {
      dispatch(notificationsApi.util.invalidateTags(["History"]));
    });
    connection.onreconnecting(() => setConnected(false));
    connection.onreconnected(() => {
      setConnected(true);
      refreshInbox(); // catch up on anything missed while offline
    });
    connection.onclose(() => setConnected(false));

    let cancelled = false;
    connection
      .start()
      .then(() => {
        if (cancelled) return;
        setConnected(true);
        refreshInbox();
        // The user opted in earlier: make sure this browser is registered for pushes under the current user.
        if (getDesktopPreference()) void subscribeWebPush().catch(() => undefined);
      })
      .catch(() => {
        /* offline or API without the hub: the bell still works from the REST inbox */
      });

    return () => {
      cancelled = true;
      connectionRef.current = null;
      if (connection.state !== HubConnectionState.Disconnected) void connection.stop();
      setConnected(false);
    };
    // A different user id means a different person signed in: reconnect with their token.
  }, [isAuthenticated, userId, dispatch, refreshInbox, pushToast]);

  const value = useMemo(() => ({ connected }), [connected]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fx-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="fx-toast" role="status">
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
