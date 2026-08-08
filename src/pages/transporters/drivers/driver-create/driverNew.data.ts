export const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const licenseTypeOptions = [
  { value: "Light Motor Vehicle", label: "Light Motor Vehicle" },
  { value: "Heavy Vehicle", label: "Heavy Vehicle" },
  { value: "Heavy Passenger Vehicle", label: "Heavy Passenger Vehicle" },
  { value: "Heavy Goods Vehicle", label: "Heavy Goods Vehicle" },
];

export const MOBILE_NUMBER_REGEX = /^[6-9]\d{9}$/;
export const AADHAR_NUMBER_REGEX = /^\d{12}$/;
export const PAN_NUMBER_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const MIN_DRIVER_AGE = 18;

export function calculateAge(dateOfBirthIso: string): number {
  const dob = new Date(dateOfBirthIso);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}
