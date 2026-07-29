import WizardLayout from "../../../../components/wizard/WizardLayout";
import { TransporterWizardProvider, useTransporterWizard } from "./TransporterWizardContext";
import "../../../contracts/NewContract.scss";
import "../../businessowners/BusinessNew/Newbusiness.scss";
import "./Newtransporter.scss";

const STEPS = [
  { path: "/transporters/profile", label: "Transporter Profile" },
  { path: "/transporters/contacts", label: "Contacts & Addresses" },
  { path: "/transporters/documents", label: "Documents" },
  { path: "/transporters/bank-details", label: "Bank Details" },
  { path: "/transporters/profile-settings", label: "Profile Settings" },
];

const TransporterWizardLayoutInner = () => {
  const { profileId } = useTransporterWizard();

  return (
    <WizardLayout
      title="New Transporter"
      backTo="/transporters"
      backLabel="Transporters"
      steps={STEPS}
      unlocked={Boolean(profileId)}
      lockedMessage="Complete Transporter Profile first"
    />
  );
};

const TransporterWizardLayout = () => (
  <TransporterWizardProvider>
    <TransporterWizardLayoutInner />
  </TransporterWizardProvider>
);

export default TransporterWizardLayout;
