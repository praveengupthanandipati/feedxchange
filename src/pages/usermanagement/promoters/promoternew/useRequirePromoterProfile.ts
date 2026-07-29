import { useRequireWizardStep } from "../../../../components/wizard/useRequireWizardStep";
import { usePromoterWizard } from "./PromoterWizardContext";

// Guards steps after "Promoter Profile" — they don't make sense until that
// step has been saved, so bounce back to it if someone lands here directly.
export const useRequirePromoterProfile = () => {
  const { profileId } = usePromoterWizard();
  return useRequireWizardStep(Boolean(profileId), "/promoters/profile");
};
