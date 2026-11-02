import WizardPreferencesStep from "../../../notification-preferences/WizardPreferencesStep";
import { SHOW_PROFILE_SETTINGS } from "../../profileSettingsVisibility";
import { usePromoterWizard } from "./PromoterWizardContext";
import { useRequirePromoterProfile } from "./useRequirePromoterProfile";

const NotificationPreferencesStep = () => {
  const { profileId } = usePromoterWizard();
  const unlocked = useRequirePromoterProfile();

  if (!unlocked || !profileId) return null;

  return <WizardPreferencesStep profileId={profileId} stepNumber={SHOW_PROFILE_SETTINGS ? 4 : 3} finishTo="/admin/promoters" />;
};

export default NotificationPreferencesStep;
