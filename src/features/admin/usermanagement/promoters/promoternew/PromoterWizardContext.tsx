import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { DocumentEntry } from "./DocumentsSection";
import type { RegionEntry } from "./RegionSection";
import { generatePromoterCode } from "./promoterNew.data";

export interface PromoterDraft {
  promoterCode: string;
  promoterName: string;
  companyName: string;
  tradingName: string;
  yearOfEstablishment: string;
  panNumber: string;
  gstNumber: string;
  mobileNumber: string;
  alternativeContactNumber: string;
  emailAddress: string;
  websiteUrl: string;
  designation: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pinCode: string;
  city: string;
  district: string;
  state: string;
  groupName: string;
  area: string;
  collectionArea: string;
  referredBy: string;
  aboutProfile: string;
  associatedProducts: string;
  regions: RegionEntry[];
  commissionStructure: string;
  commissionRateValue: string;
  paymentFrequency: string;
  termsAndConditions: string;
  remarks: string;
  documents: DocumentEntry[];
  // Identity of the primary address once it's been saved via
  // CreateProfileAddress — present when editing an existing profile, or once
  // this session's first address save returns. Drives whether the next save
  // calls UpdateProfileAddress or bundles it into a create.
  billingAddressMeta: { addressId: number; createdBy: number; createdOn: string } | null;
}

const emptyDraft = (): PromoterDraft => ({
  // Generated synchronously here (not in a post-mount effect) so the code
  // is already in state on the very first render — otherwise a fast submit
  // could fire before the effect-driven update commits, sending "" to
  // CreatePromoterProfile.
  promoterCode: generatePromoterCode(),
  promoterName: "",
  companyName: "",
  tradingName: "",
  yearOfEstablishment: "",
  panNumber: "",
  gstNumber: "",
  mobileNumber: "",
  alternativeContactNumber: "",
  emailAddress: "",
  websiteUrl: "",
  designation: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  pinCode: "",
  city: "",
  district: "",
  state: "",
  groupName: "",
  area: "",
  collectionArea: "",
  referredBy: "",
  aboutProfile: "",
  associatedProducts: "",
  regions: [],
  commissionStructure: "",
  commissionRateValue: "",
  paymentFrequency: "",
  termsAndConditions: "",
  remarks: "",
  documents: [],
  billingAddressMeta: null,
});

interface PromoterWizardContextValue {
  draft: PromoterDraft;
  updateDraft: (patch: Partial<PromoterDraft>) => void;
  // Set once the Promoter Profile step has saved and the backend hands back
  // the created record's id. Steps after it stay locked, and every later
  // save uses this id to update that same record.
  profileId: number | null;
  setProfileId: (id: number | null) => void;
}

const PromoterWizardContext = createContext<PromoterWizardContextValue | null>(null);

export const PromoterWizardProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<PromoterDraft>(emptyDraft);
  const [profileId, setProfileId] = useState<number | null>(null);

  const updateDraft = (patch: Partial<PromoterDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <PromoterWizardContext.Provider value={{ draft, updateDraft, profileId, setProfileId }}>
      {children}
    </PromoterWizardContext.Provider>
  );
};

export const usePromoterWizard = () => {
  const ctx = useContext(PromoterWizardContext);
  if (!ctx) {
    throw new Error("usePromoterWizard must be used within a PromoterWizardProvider");
  }
  return ctx;
};
