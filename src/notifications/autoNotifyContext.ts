import { createContext, useContext } from "react";
import type { NotifyItem } from "./notifyItem";
import type { ResolveNotificationResult } from "../store/notificationPreferencesApi";

export interface AutoNotifyContextValue {
  /** Hand over an event whose recipients the server resolved from preferences. The screen can carry on: this outlives it. */
  enqueue: (item: NotifyItem, result: ResolveNotificationResult) => void;
}

export const AutoNotifyContext = createContext<AutoNotifyContextValue | null>(null);

/** The automatic-notification queue, or null when the provider is not mounted (callers then fall back to the Notify dialog). */
export const useAutoNotify = (): AutoNotifyContextValue | null => useContext(AutoNotifyContext);
