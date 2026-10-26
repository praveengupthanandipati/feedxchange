export interface TruckOption {
  truckId: number;
  truckNumber: string;
}

export interface DriverOption {
  driverId: number;
  driverName: string;
  mobileNumber: string;
}

export interface DriverTruckMappingFormValues {
  mappingId: number | null;
  truckId: number;
  driverId: number;
  assignedFrom: string;
  assignmentReason: string;
  isPrimary: boolean;
  actionPerformedBy: number;
}
