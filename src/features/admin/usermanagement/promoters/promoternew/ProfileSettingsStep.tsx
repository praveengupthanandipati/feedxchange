import ProfileSettingsSection from "./ProfileSettingsSection";
import { useRequirePromoterProfile } from "./useRequirePromoterProfile";
import { useSavePromoterProfileStep } from "./useSavePromoterProfileStep";

const ProfileSettingsStep = () => {
  const unlocked = useRequirePromoterProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSavePromoterProfileStep("/admin/promoters");

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Profile Settings</h2>
        <ProfileSettingsSection />
      </section>

      {submitError && (
        <p className="new-contract__error" role="alert" style={{ color: "var(--fx-red-49-fg)" }}>
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
