export const productTypeOptions = [
  { value: "Maize DDGS", label: "Maize DDGS" },
  { value: "Rice DDGS", label: "Rice DDGS" },
  { value: "Soya DOC", label: "Soya DOC" },
  { value: "DORB", label: "DORB" },
];

export const MIN_LATITUDE = -90;
export const MAX_LATITUDE = 90;
export const MIN_LONGITUDE = -180;
export const MAX_LONGITUDE = 180;

export interface NewTruckTripPayload {
  truckId: number;
  driverId: number;
  businessProfileId: number;
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
