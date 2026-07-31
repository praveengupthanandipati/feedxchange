import ProfileSettingsSection from "./ProfileSettingsSection";
import { useRequirePromoterProfile } from "./useRequirePromoterProfile";
import { useSavePromoterProfileStep } from "./useSavePromoterProfileStep";

const ProfileSettingsStep = () => {
  const unlocked = useRequirePromoterProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSavePromoterProfileStep("/promoters");

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Profile Settings</h2>
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
