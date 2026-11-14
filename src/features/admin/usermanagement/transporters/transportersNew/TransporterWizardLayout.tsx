import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePermission } from "../../../../../core/auth/AuthContext";
import WizardLayout from "../../../../../shared/components/wizard/WizardLayout";
import { isShownProfileStep } from "../../profileSettingsVisibility";
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
].filter(isShownProfileStep);
const PREFERENCES_STEP = { path: "/admin/transporters/notification-preferences", label: "Notification Preferences" };

const TransporterWizardLayoutInner = () => {
  // Opened for an existing profile (Edit: ?id=...) the heading says Update. Read once: the layout stays while the
  // steps change, and the later steps do not carry the id.
  const [searchParams] = useSearchParams();
  const [isEditing] = useState(() => Boolean(searchParams.get("id")));
  const { profileId } = useTransporterWizard();
  // Same permission as the view screens' Notifications tab.
  const canSeeNotifications = usePermission("notification-preferences.view");

  return (
    <WizardLayout
      title={isEditing ? "Update Transporter" : "New Transporter"}
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
