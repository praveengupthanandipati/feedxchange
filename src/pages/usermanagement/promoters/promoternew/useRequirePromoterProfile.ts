import { useRequireWizardStep } from "../../../../components/wizard/useRequireWizardStep";
import { usePromoterWizard } from "./PromoterWizardContext";


export const useRequirePromoterProfile = () => {
  const { profileId } = usePromoterWizard();
  return useRequireWizardStep(Boolean(profileId), "/promoters/profile");
};
