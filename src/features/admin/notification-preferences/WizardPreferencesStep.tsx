import { useNavigate } from "react-router-dom";
import ProfilePreferencesPanel from "./ProfilePreferencesPanel";

interface WizardPreferencesStepProps {
  profileId: number;
  /** Number shown in the section title, e.g. 6 for "6. Notification Preferences". */
  stepNumber: number;
  /** Where Finish goes: the profile list of the wizard this step ends. */
  finishTo: string;
}

// Last step of the profile wizards (business owner, transporter, promoter): the same panel as the
// view screens' Notifications tab. It loads and saves each change itself, so there is nothing to
// submit here; Finish just leaves the wizard.
const WizardPreferencesStep = ({ profileId, stepNumber, finishTo }: WizardPreferencesStepProps) => {
  const navigate = useNavigate();

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">{stepNumber}. Notification Preferences</h2>
        <ProfilePreferencesPanel profileId={profileId} compact />
      </section>

      <div className="new-contract__actions">
        <button type="button" className="new-contract__submit" onClick={() => navigate(finishTo)}>
          Finish
        </button>
      </div>
    </>
  );
};

export default WizardPreferencesStep;
