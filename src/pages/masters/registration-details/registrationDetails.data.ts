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

// TODO: replace with the registrations API once it is available.
export const initialRegistrations: Registration[] = [
  {
    id: "1",
    name: "jashuva KLNN",
    phone: "9014558456",
    email: "jashuva.katiki@gmail.com",
    registrationDate: "2026-03-30",
    businessName: "JLNN",
    lineOfBusiness: "Education",
    referralCode: "",
    status: "Membership Taken",
    reason: "",
  },
  {
    id: "2",
    name: "Mani Kiran Mithinti",
    phone: "8499083999",
    email: "mithinti.kiran@gmail.com",
    registrationDate: "2026-03-29",
    businessName: "SSRTS",
    lineOfBusiness: "Agriculture & Food Processing",
    referralCode: "",
    status: "Membership Taken",
    reason: "",
  },
  {
    id: "3",
    name: "Praveen Guptha",
    phone: "7995165789",
    email: "praveennandipati@gmail.com",
    registrationDate: "2026-03-29",
    businessName: "Elite Agro Foods",
    lineOfBusiness: "Retail",
    referralCode: "",
    status: "Membership Taken",
    reason: "",
  },
  {
    id: "4",
    name: "Raghavendra Rao",
    phone: "9705306737",
    email: "raju@gmail.com",
    registrationDate: "2026-03-25",
    businessName: "Raghavendra seeds pvt ltd",
    lineOfBusiness: "Manufacturing",
    referralCode: "FX2026",
    status: "Converted",
    reason: "",
  },
  {
    id: "5",
    name: "Mounica Kotapati",
    phone: "7337286280",
    email: "mounica.kotapati@yopmail.com",
    registrationDate: "2026-03-20",
    businessName: "SL International",
    lineOfBusiness: "Agriculture & Food Processing",
    referralCode: "",
    status: "Converted",
    reason: "",
  },
];
