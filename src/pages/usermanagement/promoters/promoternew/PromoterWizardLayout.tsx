import WizardLayout from "../../../../components/wizard/WizardLayout";
import { PromoterWizardProvider, usePromoterWizard } from "./PromoterWizardContext";
import "../../../contracts/NewContract.scss";
import "../../businessowners/BusinessNew/Newbusiness.scss";
import "./Promoternew.scss";

const STEPS = [
  { path: "/promoters/profile", label: "Promoter Profile" },
  { path: "/promoters/documents", label: "Documents" },
  { path: "/promoters/profile-settings", label: "Profile Settings" },
];

const PromoterWizardLayoutInner = () => {
  const { profileId } = usePromoterWizard();

  return (
    <WizardLayout
      title="New Promoter"
      backTo="/promoters"
      backLabel="Promoters"
      steps={STEPS}
      unlocked={Boolean(profileId)}
      lockedMessage="Complete Promoter Profile first"
    />
  );
};

const PromoterWizardLayout = () => (
  <PromoterWizardProvider>
    <PromoterWizardLayoutInner />
  </PromoterWizardProvider>
);

export default PromoterWizardLayout;
