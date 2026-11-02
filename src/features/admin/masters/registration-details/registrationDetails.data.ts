export type RegistrationStatus = "Pending" | "Converted" | "Membership Taken" | "Not Interested" | "Follow Up Later" | "Rejected";

/** A sign-up from the website, followed up by the sales team. */
export interface Registration {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** yyyy-mm-dd */
  registrationDate: string;
  businessName: string;
  lineOfBusiness: string;
  /** "" when none was used. */
  referralCode: string;
  status: RegistrationStatus;
  reason: string;
}

/** What the Update Registration Status panel collects. */
export interface RegistrationUpdate {
  status: RegistrationStatus;
  reason: string;
}

export const REGISTRATION_STATUSES: RegistrationStatus[] = ["Pending", "Converted", "Membership Taken", "Not Interested", "Follow Up Later", "Rejected"];
export const STATUS_OPTIONS = REGISTRATION_STATUSES.map((status) => ({ value: status, label: status }));
