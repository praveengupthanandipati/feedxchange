import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { usePermission } from "../auth/AuthContext";
import NotifyModal from "./NotifyModal";
import type { NotifyChoices } from "./notifyChoices";

/** What a screen tells the module after a successful save: which event, and the record it is about. The server does the rest. */
export interface NotifyItem {
  eventCode: string;
  title: string;
  contractNumber?: string;
  contractId?: number;
  /** "DispatchSchedule" | "DispatchScheduleTransporter" | "ContractTruckDispatch" | "PaymentReceipt" */
  sourceEntityType?: string;
  sourceEntityId?: number;
  profileId?: number;
  informationType?: string;
  sendLabel?: string;
  choices?: NotifyChoices | null;
}

/**
 * Call `ask(item)` right after a screen saves something (a schedule, a truck, a payment...). If the user may send notifications a dialog
 * opens where they choose recipients, channels and templates; Send, Skip or closing it all continue. Pass several items (e.g. several
 * trucks) and the dialogs appear one after another. `onDone` runs when the last one is closed - use it for the redirect that used to
 * happen immediately. Users without the permission never see the dialog and `onDone` runs straight away.
 *
 * Render `element` somewhere in the screen's JSX.
 */
export const useNotifyPrompt = () => {
  const canNotify = usePermission("notifications.send");
  const [queue, setQueue] = useState<NotifyItem[]>([]);
  const onDone = useRef<(() => void) | undefined>(undefined);

  const ask = (items: NotifyItem | NotifyItem[], done?: () => void): boolean => {
    const list = (Array.isArray(items) ? items : [items]).filter((i) => i.sourceEntityId !== undefined || i.contractNumber || i.contractId || i.profileId);
    if (!canNotify || list.length === 0) {
      done?.();
      return false;
    }
    onDone.current = done;
    setQueue(list);
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

  return { ask, element, busy: queue.length > 0 };
};
