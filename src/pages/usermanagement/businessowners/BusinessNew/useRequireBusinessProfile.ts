import { useRequireWizardStep } from "../../../../components/wizard/useRequireWizardStep";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";

// Guards steps after "Business Profile" — they don't make sense until that
// step has been saved, so bounce back to it if someone lands here directly.
export const useRequireBusinessProfile = () => {
  const { profileId } = useBusinessOwnerWizard();
  return useRequireWizardStep(Boolean(profileId), "/business-owners/profile");
};
