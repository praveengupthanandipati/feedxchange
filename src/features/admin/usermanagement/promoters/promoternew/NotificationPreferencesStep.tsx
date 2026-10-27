import WizardPreferencesStep from "../../../notification-preferences/WizardPreferencesStep";
import { usePromoterWizard } from "./PromoterWizardContext";
import { useRequirePromoterProfile } from "./useRequirePromoterProfile";

const NotificationPreferencesStep = () => {
  const { profileId } = usePromoterWizard();
  const unlocked = useRequirePromoterProfile();

  if (!unlocked || !profileId) return null;

  return <WizardPreferencesStep profileId={profileId} stepNumber={4} finishTo="/admin/promoters" />;
};

export default NotificationPreferencesStep;
