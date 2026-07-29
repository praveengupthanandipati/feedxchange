import { useRequireWizardStep } from "../../../../components/wizard/useRequireWizardStep";
import { useTransporterWizard } from "./TransporterWizardContext";

// Guards steps after "Transporter Profile" — they don't make sense until that
// step has been saved, so bounce back to it if someone lands here directly.
export const useRequireTransporterProfile = () => {
  const { profileId } = useTransporterWizard();
  return useRequireWizardStep(Boolean(profileId), "/transporters/profile");
};
