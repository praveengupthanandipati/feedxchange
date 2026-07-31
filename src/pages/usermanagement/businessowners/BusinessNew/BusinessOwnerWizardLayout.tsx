import WizardLayout from "../../../../components/wizard/WizardLayout";
import { BusinessOwnerWizardProvider, useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import "../../../contracts/NewContract.scss";
import "./Newbusiness.scss";

const STEPS = [
  { path: "/business-owners/profile", label: "Business Profile" },
  { path: "/business-owners/contacts", label: "Contacts & Addresses" },
  { path: "/business-owners/documents", label: "Documents" },
  { path: "/business-owners/bank-details", label: "Bank Details" },
  { path: "/business-owners/profile-settings", label: "Profile Settings" },
];

const BusinessOwnerWizardLayoutInner = () => {
  const { profileId } = useBusinessOwnerWizard();

  return (
    <WizardLayout
      title="New Business Owner"
      backTo="/business-owners"
      backLabel="Business Users"
      steps={STEPS}
      unlocked={Boolean(profileId)}
      lockedMessage="Complete Business Profile first"
    />
  );
};

const BusinessOwnerWizardLayout = () => (
  <BusinessOwnerWizardProvider>
    <BusinessOwnerWizardLayoutInner />
  </BusinessOwnerWizardProvider>
);

export default BusinessOwnerWizardLayout;
