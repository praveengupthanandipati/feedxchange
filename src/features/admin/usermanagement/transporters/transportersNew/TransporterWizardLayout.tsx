import { usePermission } from "../../../../../core/auth/AuthContext";
import WizardLayout from "../../../../../shared/components/wizard/WizardLayout";
import { TransporterWizardProvider, useTransporterWizard } from "./TransporterWizardContext";
import "../../../contracts/NewContract.scss";
import "../../businessowners/BusinessNew/Newbusiness.scss";
import "./Newtransporter.scss";

const STEPS = [
  { path: "/admin/transporters/profile", label: "Transporter Profile" },
  { path: "/admin/transporters/contacts", label: "Contacts & Addresses" },
  { path: "/admin/transporters/documents", label: "Documents" },
  { path: "/admin/transporters/bank-details", label: "Bank Details" },
  { path: "/admin/transporters/profile-settings", label: "Profile Settings" },
];
const PREFERENCES_STEP = { path: "/admin/transporters/notification-preferences", label: "Notification Preferences" };

const TransporterWizardLayoutInner = () => {
  const { profileId } = useTransporterWizard();
  // Same permission as the view screens' Notifications tab.
  const canSeeNotifications = usePermission("notification-preferences.view");

  return (
    <WizardLayout
      title="New Transporter"
      backTo="/admin/transporters"
      backLabel="Transporters"
      steps={canSeeNotifications ? [...STEPS, PREFERENCES_STEP] : STEPS}
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
