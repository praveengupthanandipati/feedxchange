import WizardPreferencesStep from "../../../notification-preferences/WizardPreferencesStep";
import { useTransporterWizard } from "./TransporterWizardContext";
import { useRequireTransporterProfile } from "./useRequireTransporterProfile";

const NotificationPreferencesStep = () => {
  const { profileId } = useTransporterWizard();
  const unlocked = useRequireTransporterProfile();

  if (!unlocked || !profileId) return null;

  return <WizardPreferencesStep profileId={profileId} stepNumber={6} finishTo="/admin/transporters" />;
};

export default NotificationPreferencesStep;
