import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { usePermission } from "../../core/auth/AuthContext";
import { useResolveNotificationMutation } from "../../core/store/notificationPreferencesApi";
import NotifyModal from "./NotifyModal";
import { useAutoNotify } from "./autoNotifyContext";
import type { NotifyItem } from "./notifyItem";

export type { NotifyItem } from "./notifyItem";

/**
 * Call `ask(item)` right after a screen saves something (a schedule, a truck, a payment...). The server first checks the business
 * profiles involved:
 *  - profiles that use notification preferences (Auto): the screen carries on at once and a card counts down and sends by itself, with
 *    Send now / Customize / Cancel. Nobody needs the "notifications.send" permission for this.
 *  - everything else (the default): the Notify dialog opens exactly as before, where the user chooses recipients, channels and templates;
 *    Send, Skip or closing it all continue. Users without the permission never see the dialog.
 * Pass several items (e.g. several trucks) and they are handled one after another. `onDone` runs when the last dialog is closed
 * (or straight away when there was none) - use it for the redirect that used to happen immediately.
 *
 * Render `element` somewhere in the screen's JSX.
 */
export const useNotifyPrompt = () => {
  const canNotify = usePermission("notifications.send");
  const auto = useAutoNotify();
  const [resolve] = useResolveNotificationMutation();
  const [queue, setQueue] = useState<NotifyItem[]>([]);
  const [resolving, setResolving] = useState(false);
  const onDone = useRef<(() => void) | undefined>(undefined);

  const ask = (items: NotifyItem | NotifyItem[], done?: () => void): boolean => {
    const list = (Array.isArray(items) ? items : [items]).filter((i) => i.sourceEntityId !== undefined || i.contractNumber || i.contractId || i.profileId);
    if (list.length === 0) {
      done?.();
      return false;
    }
    onDone.current = done;
    setResolving(true);
    void (async () => {
      const manual: NotifyItem[] = [];
      for (const item of list) {
        try {
          const result = await resolve({
            eventCode: item.eventCode, contractId: item.contractId, contractNumber: item.contractNumber,
            sourceEntityType: item.sourceEntityType, sourceEntityId: item.sourceEntityId, profileId: item.profileId,
          }).unwrap();
          if (result.mode === "Auto" && auto) auto.enqueue(item, result);
          else manual.push(item);
        } catch {
          manual.push(item);   // if the check fails, fall back to asking the person, as before
        }
      }
      setResolving(false);
      if (!canNotify || manual.length === 0) {
        const cb = onDone.current;
        onDone.current = undefined;
        cb?.();
        return;
      }
      setQueue(manual);
    })();
    return true;
  };

  const close = () => {
    const rest = queue.slice(1);
    setQueue(rest);
    if (rest.length === 0) {
      const cb = onDone.current;
      onDone.current = undefined;
      cb?.();
    }
  };

  const current = queue[0];
  const element: ReactElement | null = current ? (
    <NotifyModal
      key={`${current.eventCode}-${current.sourceEntityType}-${current.sourceEntityId}-${queue.length}`}
      open
      title={queue.length > 1 ? `${current.title} (${queue.length} remaining)` : current.title}
      eventCode={current.eventCode}
      contractNumber={current.contractNumber}
      contractId={current.contractId}
      sourceEntityType={current.sourceEntityType}
      sourceEntityId={current.sourceEntityId}
      profileId={current.profileId}
      informationType={current.informationType}
      choices={current.choices}
      sendLabel={current.sendLabel}
      closeOnBackdrop={false}
      onClose={close}
    />
  ) : null;

  return { ask, element, busy: queue.length > 0 || resolving };
};
