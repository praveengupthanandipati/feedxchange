export interface TruckTrip {
  tripId: number;
  truckId: number;
  truckNumber: string;
  driverId: number;
  driverName: string;
  businessProfileId: number;
  // TODO: not part of the raw trip payload yet — the backend resolves these
  // from the linked contract/business profile. Confirm field names once the
  // trip summary API is available.
  sellerName: string;
  buyerName: string;
  fromAddress: string;
  toAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  distanceInKM: number;
  estimatedDuration: number;
  productType: string;
  weight: number;
  startDate: string;
  expectedEndDate: string;
  freightAmount: number;
  remarks: string;
  actionPerformedBy: number;
}
