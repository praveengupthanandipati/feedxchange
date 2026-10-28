import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { ContactEntry, AddressEntry } from "./ContactsAddresses";
import type { BankEntry } from "./BankDetailsSection";
import type { DocumentEntry } from "./DocumentsSection";

export interface TransporterDraft {
  legalName: string;
  tradingName: string;
  establishmentYear: string;
  panNumber: string;
  gstNumber: string;
  transporterLineId: string;
  typeOfTransporter: string;
  group: string;
  referralCode: string;
  aboutTransporter: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  landmark: string;
  billingPincode: string;
  billingCity: string;
  billingDistrict: string;
  billingState: string;
  billingEmail: string;
  websiteUrl: string;
  billingGoogleMapLocation: string;
  primaryFullName: string;
  primaryMobileNumber: string;
  primaryAlternativeContact: string;
  contacts: ContactEntry[];
  addresses: AddressEntry[];
  bankAccounts: BankEntry[];
  primaryBankId: string | null;
  documents: DocumentEntry[];
  // Identity of the billing/primary address once it's been saved via
  // CreateProfileAddress — present when editing an existing profile, or once
  // this session's first address save returns. Drives whether the next save
  // calls UpdateProfileAddress or bundles it into a create.
  billingAddressMeta: { addressId: number; createdBy: number; createdOn: string } | null;
}

const emptyDraft = (): TransporterDraft => ({
  legalName: "",
  tradingName: "",
  establishmentYear: "",
  panNumber: "",
  gstNumber: "",
  transporterLineId: "",
  typeOfTransporter: "",
  group: "",
  referralCode: "",
  aboutTransporter: "",
  billingAddressLine1: "",
  billingAddressLine2: "",
  landmark: "",
  billingPincode: "",
  billingCity: "",
  billingDistrict: "",
  billingState: "",
  billingEmail: "",
  websiteUrl: "",
  billingGoogleMapLocation: "",
  primaryFullName: "",
  primaryMobileNumber: "",
  primaryAlternativeContact: "",
  contacts: [],
  addresses: [],
  bankAccounts: [],
  primaryBankId: null,
  documents: [],
  billingAddressMeta: null,
});

interface TransporterWizardContextValue {
  draft: TransporterDraft;
  updateDraft: (patch: Partial<TransporterDraft>) => void;
  // Set once the Transporter Profile step has saved and the backend hands
  // back the created record's id. Steps after it stay locked, and every
  // later save uses this id to update that same record.
  profileId: number | null;
  setProfileId: (id: number | null) => void;
}

const TransporterWizardContext = createContext<TransporterWizardContextValue | null>(null);

export const TransporterWizardProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<TransporterDraft>(emptyDraft);
  const [profileId, setProfileId] = useState<number | null>(null);

  const updateDraft = (patch: Partial<TransporterDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <TransporterWizardContext.Provider value={{ draft, updateDraft, profileId, setProfileId }}>
      {children}
    </TransporterWizardContext.Provider>
  );
};

export const useTransporterWizard = () => {
  const ctx = useContext(TransporterWizardContext);
  if (!ctx) {
    throw new Error("useTransporterWizard must be used within a TransporterWizardProvider");
  }
  return ctx;
};
