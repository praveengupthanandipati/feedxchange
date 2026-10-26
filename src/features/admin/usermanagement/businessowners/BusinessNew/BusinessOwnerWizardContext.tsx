import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { BrokerageRow, CapacityRow } from "./BusinessProfile";
import type { ContactEntry, AddressEntry } from "./ContactsAddresses";
import type { BankEntry } from "./BankDetailsSection";
import type { DocumentEntry } from "./DocumentsSection";

export interface BusinessOwnerDraft {
  legalName: string;
  tradingName: string;
  yearOfEstablishment: string;
  panNumber: string;
  gstNumber: string;
  businessLineId: string;
  businessTypeId: string;
  businessSubTypeId: string;
  collectionArea: string;
  area: string;
  referredBy: string;
  aboutProfile: string;
  emailId: string;
  websiteUrl: string;
  mobileNumber: string;
  alternativeContactNumber: string;
  buyBrokerageCharges: string;
  sellBrokerageCharges: string;
  brokerageRows: BrokerageRow[];
  capacityRows: CapacityRow[];
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingLandmark: string;
  billingPincode: string;
  billingCity: string;
  billingDistrict: string;
  billingStateName: string;
  billingGoogleLocationUrl: string;
  primaryContactPerson: string;
  contacts: ContactEntry[];
  addresses: AddressEntry[];
  bankAccounts: BankEntry[];
  primaryBankId: string | null;
  documents: DocumentEntry[];
  billingAddressMeta: { addressId: number; createdBy: number; createdOn: string } | null;
}

const emptyDraft = (): BusinessOwnerDraft => ({
  legalName: "",
  tradingName: "",
  yearOfEstablishment: "",
  panNumber: "",
  gstNumber: "",
  businessLineId: "",
  businessTypeId: "",
  businessSubTypeId: "",
  collectionArea: "",
  area: "",
  referredBy: "",
  aboutProfile: "",
  emailId: "",
  websiteUrl: "",
  mobileNumber: "",
  alternativeContactNumber: "",
  buyBrokerageCharges: "",
  sellBrokerageCharges: "",
  brokerageRows: [],
  capacityRows: [],
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingLandmark: "",
  billingPincode: "",
  billingCity: "",
  billingDistrict: "",
  billingStateName: "",
  billingGoogleLocationUrl: "",
  primaryContactPerson: "",
  contacts: [],
  addresses: [],
  bankAccounts: [],
  primaryBankId: null,
  documents: [],
  billingAddressMeta: null,
});

interface BusinessOwnerWizardContextValue {
  draft: BusinessOwnerDraft;
  updateDraft: (patch: Partial<BusinessOwnerDraft>) => void;
  // Set once the Business Profile step has saved and the backend hands back
  // the created record's id. Steps after it stay locked, and every later
  // save uses this id to update that same record.
  profileId: number | null;
  setProfileId: (id: number | null) => void;
}

const BusinessOwnerWizardContext = createContext<BusinessOwnerWizardContextValue | null>(null);

export const BusinessOwnerWizardProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<BusinessOwnerDraft>(emptyDraft);
  const [profileId, setProfileId] = useState<number | null>(null);

  const updateDraft = (patch: Partial<BusinessOwnerDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <BusinessOwnerWizardContext.Provider value={{ draft, updateDraft, profileId, setProfileId }}>
      {children}
    </BusinessOwnerWizardContext.Provider>
  );
};

export const useBusinessOwnerWizard = () => {
  const ctx = useContext(BusinessOwnerWizardContext);
  if (!ctx) {
    throw new Error("useBusinessOwnerWizard must be used within a BusinessOwnerWizardProvider");
  }
  return ctx;
};
