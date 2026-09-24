export type ScheduleTruckStatus = "Pending" | "Assigned" | "Cancelled";

export interface ScheduleTruckRow {
  id: string;
  status: ScheduleTruckStatus;
  autoApprove: boolean;
  scheduleDateTime: string;
  scheduleValue: number;
  transporterProfileIds: number[];
  fromAddressId: number;
  loadingAddress: string;
  toAddressId: number;
  deliveryAddress: string;
  remarks: string;
  qty: string;
  freight: string;
  trucksAssigned: number;
}

export const scheduleTruckRows: ScheduleTruckRow[] = [];
