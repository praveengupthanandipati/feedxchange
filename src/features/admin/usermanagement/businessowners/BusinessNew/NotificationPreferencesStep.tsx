import WizardPreferencesStep from "../../../notification-preferences/WizardPreferencesStep";
import { SHOW_PROFILE_SETTINGS } from "../../profileSettingsVisibility";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { useRequireBusinessProfile } from "./useRequireBusinessProfile";

const NotificationPreferencesStep = () => {
  const { profileId } = useBusinessOwnerWizard();
  const unlocked = useRequireBusinessProfile();

  if (!unlocked || !profileId) return null;

  return <WizardPreferencesStep profileId={profileId} stepNumber={SHOW_PROFILE_SETTINGS ? 6 : 5} finishTo="/admin/business-owners" />;
};

export default NotificationPreferencesStep;
