export type InstantTruckStatus = "Assigned" | "Pending" | "Cancelled";

export interface InstantTruckRow {
  id: string;
  contractTruckId: number | null;
  status: InstantTruckStatus;
  /** Server-side values an edit must carry back unchanged, not overwrite. */
  dispatchStatusId: number;
  truckAssignmentTypeId: number;
  dispatchScheduleTransporterId: number;
  createdBy: number;
  createdOn: string;
  scheduleDateTime: string;
  scheduleValue: number;
  transporterProfileId: number;
  transporterName: string;
  truckId: number;
  truckNo: string;
  driverId: number;
  driverName: string;
  driverPhone: string;
  fromAddressId: number;
  loadingAddress: string;
  toAddressId: number;
  deliveryAddress: string;
  lrNumber: string;
  qty: string;
  freight: string;
  trackingUrl: string;
}
