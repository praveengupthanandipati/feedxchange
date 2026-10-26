import type { NotifyChoices } from "./notifyChoices";

/** What a screen tells the module after a successful save: which event, and the record it is about. The server does the rest. */
export interface NotifyItem {
  eventCode: string;
  title: string;
  contractNumber?: string;
  contractId?: number;
  /** "DispatchSchedule" | "DispatchScheduleTransporter" | "ContractTruckDispatch" | "PaymentReceipt" | "ContractInvoice" */
  sourceEntityType?: string;
  sourceEntityId?: number;
  profileId?: number;
  informationType?: string;
  sendLabel?: string;
  choices?: NotifyChoices | null;
}
