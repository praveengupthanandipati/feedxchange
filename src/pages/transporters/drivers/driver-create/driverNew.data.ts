import type { AddDriverPayload } from "../../../../store/driversApi";

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

export interface DriverFormValues {
  driverName: string;
  mobileNumber: string;
  dateOfBirth: string;
  bloodGroup: string;
  experienceYears: string;
  address: string;
  licenseType: string;
  licenseNumber: string;
  licenseIssuedDate: string;
  licenseExpiryDate: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  aadharNumber: string;
  panNumber: string;
}

export type DriverFormErrors = Partial<Record<keyof DriverFormValues, string>>;

export const emptyDriverForm: DriverFormValues = {
  driverName: "",
  mobileNumber: "",
  dateOfBirth: "",
  bloodGroup: "",
  experienceYears: "",
  address: "",
  licenseType: "",
  licenseNumber: "",
  licenseIssuedDate: "",
  licenseExpiryDate: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  aadharNumber: "",
  panNumber: "",
};

/** Shared by the Driver Master screen and the "Add New Driver" popup so both enforce the same rules. */
export function validateDriverForm(values: DriverFormValues): DriverFormErrors {
  const errors: DriverFormErrors = {};

  const trimmedName = values.driverName.trim();
  if (!trimmedName) errors.driverName = "Driver Name is required.";
  else if (trimmedName.length < 3) errors.driverName = "Driver Name must be at least 3 characters.";

  if (!values.mobileNumber) errors.mobileNumber = "Mobile Number is required.";
  else if (!MOBILE_NUMBER_REGEX.test(values.mobileNumber))
    errors.mobileNumber = "Enter a valid 10-digit mobile number.";

  if (!values.dateOfBirth) errors.dateOfBirth = "Date of Birth is required.";
  else if (calculateAge(values.dateOfBirth) < MIN_DRIVER_AGE)
    errors.dateOfBirth = `Driver must be at least ${MIN_DRIVER_AGE} years old.`;

  if (!values.bloodGroup) errors.bloodGroup = "Blood Group is required.";

  if (!values.experienceYears) errors.experienceYears = "Experience is required.";
  else if (Number(values.experienceYears) < 0 || Number(values.experienceYears) > 50)
    errors.experienceYears = "Enter a valid number of years (0-50).";

  if (!values.address.trim()) errors.address = "Address is required.";

  if (!values.licenseType) errors.licenseType = "License Type is required.";

  if (!values.licenseNumber.trim()) errors.licenseNumber = "License Number is required.";

  if (!values.licenseIssuedDate) errors.licenseIssuedDate = "License Issued Date is required.";
  else if (new Date(values.licenseIssuedDate) > new Date())
    errors.licenseIssuedDate = "License Issued Date cannot be in the future.";

  if (!values.licenseExpiryDate) errors.licenseExpiryDate = "License Expiry Date is required.";
  else if (values.licenseIssuedDate && new Date(values.licenseExpiryDate) <= new Date(values.licenseIssuedDate))
    errors.licenseExpiryDate = "License Expiry Date must be after the Issued Date.";

  if (!values.emergencyContactName.trim())
    errors.emergencyContactName = "Emergency Contact Name is required.";

  if (!values.emergencyContactNumber)
    errors.emergencyContactNumber = "Emergency Contact Number is required.";
  else if (!MOBILE_NUMBER_REGEX.test(values.emergencyContactNumber))
    errors.emergencyContactNumber = "Enter a valid 10-digit mobile number.";

  if (!values.aadharNumber) errors.aadharNumber = "Aadhar Number is required.";
  else if (!AADHAR_NUMBER_REGEX.test(values.aadharNumber))
    errors.aadharNumber = "Enter a valid 12-digit Aadhar number.";

  if (!values.panNumber) errors.panNumber = "PAN Number is required.";
  else if (!PAN_NUMBER_REGEX.test(values.panNumber))
    errors.panNumber = "Enter a valid PAN number (e.g. ABCDE1234F).";

  return errors;
}

/** Maps the form values onto the AddDriver/UpdateDriver request body. */
export function buildDriverDetailsPayload(values: DriverFormValues): AddDriverPayload {
  return {
    driverName: values.driverName.trim(),
    mobileNumber: values.mobileNumber,
    licenseNumber: values.licenseNumber.trim(),
    licenseExpiryDate: new Date(values.licenseExpiryDate).toISOString(),
    dateOfBirth: new Date(values.dateOfBirth).toISOString(),
    address: values.address.trim(),
    licenseType: values.licenseType,
    licenseIssuedDate: new Date(values.licenseIssuedDate).toISOString(),
    emergencyContactName: values.emergencyContactName.trim(),
    emergencyContactNumber: values.emergencyContactNumber,
    bloodGroup: values.bloodGroup,
    experienceYears: Number(values.experienceYears),
    aadharNumber: values.aadharNumber,
    panNumber: values.panNumber,
    actionPerformedBy: Number(localStorage.getItem("userId")) || 0,
  };
}
