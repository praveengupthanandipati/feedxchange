import type { DriverOption, DriverTruckMapping, TruckOption } from "./driverTruckMapping.types";

// TODO: replace with a real driverTruckMappingApi (RTK Query) once the backend
// exposes GetAllDriverTruckMappings / GetAllTrucks / GetAllDrivers summary endpoints.

export const TRUCK_OPTIONS: TruckOption[] = [
  { truckId: 1, truckNumber: "TS27C5123" },
  { truckId: 2, truckNumber: "AP16TA9021" },
  { truckId: 3, truckNumber: "TS09FB3345" },
  { truckId: 4, truckNumber: "AP07TB6612" },
  { truckId: 5, truckNumber: "KA03AB5566" },
  { truckId: 6, truckNumber: "TS08GH7788" },
];

export const DRIVER_OPTIONS: DriverOption[] = [
  { driverId: 1, driverName: "Ramesh Kumar", mobileNumber: "+91 98765 43210" },
  { driverId: 2, driverName: "Mohd Aslam", mobileNumber: "+91 98480 12345" },
  { driverId: 3, driverName: "Naveen Reddy", mobileNumber: "+91 96630 12345" },
  { driverId: 4, driverName: "Suresh Babu", mobileNumber: "+91 94400 12345" },
  { driverId: 5, driverName: "Kiran Kumar", mobileNumber: "+91 99590 12345" },
];

export const MOCK_DRIVER_TRUCK_MAPPINGS: DriverTruckMapping[] = [
  {
    mappingId: 1,
    truckId: 1,
    truckNumber: "TS27C5123",
    driverId: 1,
    driverName: "Ramesh Kumar",
    driverPhone: "+91 98765 43210",
    assignedFrom: "2026-07-01T09:00:00.000Z",
    assignmentReason: "Primary driver assigned for regular route",
    isPrimary: true,
    actionPerformedBy: 1,
  },
  {
    mappingId: 2,
    truckId: 2,
    truckNumber: "AP16TA9021",
    driverId: 2,
    driverName: "Mohd Aslam",
    driverPhone: "+91 98480 12345",
    assignedFrom: "2026-06-18T09:00:00.000Z",
    assignmentReason: "Reassigned after previous driver's leave",
    isPrimary: true,
    actionPerformedBy: 1,
  },
  {
    mappingId: 3,
    truckId: 3,
    truckNumber: "TS09FB3345",
    driverId: 3,
    driverName: "Naveen Reddy",
    driverPhone: "+91 96630 12345",
    assignedFrom: "2026-05-22T09:00:00.000Z",
    assignmentReason: "New truck onboarding",
    isPrimary: false,
    actionPerformedBy: 1,
  },
  {
    mappingId: 4,
    truckId: 4,
    truckNumber: "AP07TB6612",
    driverId: 4,
    driverName: "Suresh Babu",
    driverPhone: "+91 94400 12345",
    assignedFrom: "2026-04-10T09:00:00.000Z",
    assignmentReason: "Standby driver for long-haul route",
    isPrimary: false,
    actionPerformedBy: 1,
  },
  {
    mappingId: 5,
    truckId: 5,
    truckNumber: "KA03AB5566",
    driverId: 5,
    driverName: "Kiran Kumar",
    driverPhone: "+91 99590 12345",
    assignedFrom: "2026-03-05T09:00:00.000Z",
    assignmentReason: "Primary driver assigned for regular route",
    isPrimary: true,
    actionPerformedBy: 1,
  },
  {
    mappingId: 6,
    truckId: 6,
    truckNumber: "TS08GH7788",
    driverId: 1,
    driverName: "Ramesh Kumar",
    driverPhone: "+91 98765 43210",
    assignedFrom: "2026-02-14T09:00:00.000Z",
    assignmentReason: "Secondary truck for peak season",
    isPrimary: false,
    actionPerformedBy: 1,
  },
];
