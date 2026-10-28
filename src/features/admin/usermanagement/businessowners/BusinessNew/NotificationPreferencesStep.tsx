import WizardPreferencesStep from "../../../notification-preferences/WizardPreferencesStep";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { useRequireBusinessProfile } from "./useRequireBusinessProfile";

const NotificationPreferencesStep = () => {
  const { profileId } = useBusinessOwnerWizard();
  const unlocked = useRequireBusinessProfile();

  if (!unlocked || !profileId) return null;

  return <WizardPreferencesStep profileId={profileId} stepNumber={6} finishTo="/admin/business-owners" />;
};

export default NotificationPreferencesStep;
