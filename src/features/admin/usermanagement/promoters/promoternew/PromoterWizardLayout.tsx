import { usePermission } from "../../../../../core/auth/AuthContext";
import WizardLayout from "../../../../../shared/components/wizard/WizardLayout";
import { PromoterWizardProvider, usePromoterWizard } from "./PromoterWizardContext";
import "../../../contracts/NewContract.scss";
import "../../businessowners/BusinessNew/Newbusiness.scss";
import "./Promoternew.scss";

const STEPS = [
  { path: "/admin/promoters/profile", label: "Promoter Profile" },
  { path: "/admin/promoters/documents", label: "Documents" },
  { path: "/admin/promoters/profile-settings", label: "Profile Settings" },
];
const PREFERENCES_STEP = { path: "/admin/promoters/notification-preferences", label: "Notification Preferences" };

const PromoterWizardLayoutInner = () => {
  const { profileId } = usePromoterWizard();
  // Same permission as the view screens' Notifications tab.
  const canSeeNotifications = usePermission("notification-preferences.view");

  return (
    <WizardLayout
      title="New Promoter"
      backTo="/admin/promoters"
      backLabel="Promoters"
      steps={canSeeNotifications ? [...STEPS, PREFERENCES_STEP] : STEPS}
      unlocked={Boolean(profileId)}
      lockedMessage="Complete Promoter Profile first"
    />
  );
};

const PromoterWizardLayout = () => (
  <PromoterWizardProvider>
    <PromoterWizardLayoutInner />
  </PromoterWizardProvider>
);

export default PromoterWizardLayout;
