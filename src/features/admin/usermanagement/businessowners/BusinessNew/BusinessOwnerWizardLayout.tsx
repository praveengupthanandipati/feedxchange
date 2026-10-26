import WizardLayout from "../../../../../shared/components/wizard/WizardLayout";
import { BusinessOwnerWizardProvider, useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import "../../../contracts/NewContract.scss";
import "./Newbusiness.scss";

const STEPS = [
  { path: "/admin/business-owners/profile", label: "Business Profile" },
  { path: "/admin/business-owners/contacts", label: "Contacts & Addresses" },
  { path: "/admin/business-owners/documents", label: "Documents" },
  { path: "/admin/business-owners/bank-details", label: "Bank Details" },
  { path: "/admin/business-owners/profile-settings", label: "Profile Settings" },
];

const BusinessOwnerWizardLayoutInner = () => {
  const { profileId } = useBusinessOwnerWizard();

  return (
    <WizardLayout
      title="New Business Owner"
      backTo="/admin/business-owners"
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
