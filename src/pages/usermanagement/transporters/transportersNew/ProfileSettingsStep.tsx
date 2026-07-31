import ProfileSettingsSection from "./ProfileSettingsSection";
import { useRequireTransporterProfile } from "./useRequireTransporterProfile";
import { useSaveTransporterProfileStep } from "./useSaveTransporterProfileStep";

const ProfileSettingsStep = () => {
  const unlocked = useRequireTransporterProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveTransporterProfileStep("/transporters");

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">5. Profile Settings</h2>
        <ProfileSettingsSection />
      </section>

      {submitError && (
        <p className="new-contract__error" style={{ color: "#d92d20" }}>
          {submitError}
        </p>
      )}

      <div className="new-contract__actions">
        <button
          type="button"
          className="new-contract__submit"
          onClick={handleSaveAndContinue}
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Finish"}
        </button>
      </div>
    </>
  );
};

export default ProfileSettingsStep;
