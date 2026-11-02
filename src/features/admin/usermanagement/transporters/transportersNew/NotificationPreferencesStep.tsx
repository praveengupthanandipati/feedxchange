import WizardPreferencesStep from "../../../notification-preferences/WizardPreferencesStep";
import { SHOW_PROFILE_SETTINGS } from "../../profileSettingsVisibility";
import { useTransporterWizard } from "./TransporterWizardContext";
import { useRequireTransporterProfile } from "./useRequireTransporterProfile";

const NotificationPreferencesStep = () => {
  const { profileId } = useTransporterWizard();
  const unlocked = useRequireTransporterProfile();

  if (!unlocked || !profileId) return null;

  return <WizardPreferencesStep profileId={profileId} stepNumber={SHOW_PROFILE_SETTINGS ? 6 : 5} finishTo="/admin/transporters" />;
};

export default NotificationPreferencesStep;
