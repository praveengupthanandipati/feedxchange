import { useRequireWizardStep } from "../../../../../shared/components/wizard/useRequireWizardStep";
import { usePromoterWizard } from "./PromoterWizardContext";


export const useRequirePromoterProfile = () => {
  const { profileId } = usePromoterWizard();
  return useRequireWizardStep(Boolean(profileId), "/admin/promoters/profile");
};
