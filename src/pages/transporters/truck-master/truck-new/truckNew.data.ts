export const truckTypeOptions = [
  { value: "Open Body", label: "Open Body" },
  { value: "Container", label: "Container" },
  { value: "Trailer", label: "Trailer" },
  { value: "Tanker", label: "Tanker" },
  { value: "Flatbed", label: "Flatbed" },
];

export const makeOptions = [
  { value: "Tata", label: "Tata" },
  { value: "Ashok Leyland", label: "Ashok Leyland" },
  { value: "BharatBenz", label: "BharatBenz" },
  { value: "Eicher", label: "Eicher" },
  { value: "Mahindra", label: "Mahindra" },
  { value: "Volvo", label: "Volvo" },
];

export const capacityUnitOptions = [
  { value: "MT", label: "MT (Metric Ton)" },
  { value: "Tons", label: "Tons" },
  { value: "Kg", label: "Kg" },
  { value: "Litres", label: "Litres" },
];

export const fuelTypeOptions = [
  { value: "Diesel", label: "Diesel" },
  { value: "Petrol", label: "Petrol" },
  { value: "CNG", label: "CNG" },
  { value: "Electric", label: "Electric" },
];

export const ownershipTypeOptions = [
  { value: "Owned", label: "Owned" },
  { value: "Leased", label: "Leased" },
  { value: "Attached", label: "Attached" },
];

export const REGISTRATION_NUMBER_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
export const MIN_MANUFACTURE_YEAR = 1990;

export function normalizeRegistrationNumber(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export interface NewTruckPayload {
  truckNumber: string;
  registrationNumber: string;
  truckType: string;
  make: string;
  model: string;
  manufactureYear: number;
  capacity: number;
  capacityUnit: string;
  fuelType: string;
  ownershipType: string;
  actionPerformedBy: number;
}
