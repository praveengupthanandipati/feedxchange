import ProfileSettingsSection from "./ProfileSettingsSection";
import { useRequireBusinessProfile } from "./useRequireBusinessProfile";
import { useSaveBusinessProfileStep } from "./useSaveBusinessProfileStep";

const ProfileSettingsStep = () => {
  const unlocked = useRequireBusinessProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveBusinessProfileStep("/business-owners");

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
