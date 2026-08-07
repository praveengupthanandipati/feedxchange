export interface DriverTruckMapping {
  mappingId: number;
  truckId: number;
  truckNumber: string;
  driverId: number;
  driverName: string;
  driverPhone: string;
  assignedFrom: string;
  assignmentReason: string;
  isPrimary: boolean;
  actionPerformedBy: number;
}

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
