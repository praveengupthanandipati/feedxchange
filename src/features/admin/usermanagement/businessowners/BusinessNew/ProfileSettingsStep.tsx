import { usePermission } from "../../../../../core/auth/AuthContext";
import ProfileSettingsSection from "./ProfileSettingsSection";
import { useRequireBusinessProfile } from "./useRequireBusinessProfile";
import { useSaveBusinessProfileStep } from "./useSaveBusinessProfileStep";

const ProfileSettingsStep = () => {
  const unlocked = useRequireBusinessProfile();
  // Notification Preferences follows only for users allowed to see it; otherwise this is the last step.
  const hasPreferencesStep = usePermission("notification-preferences.view");
  const { submitting, submitError, handleSaveAndContinue } = useSaveBusinessProfileStep(
    hasPreferencesStep ? "/admin/business-owners/notification-preferences" : "/admin/business-owners",
  );

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">5. Profile Settings</h2>
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
          {submitting ? "Saving…" : hasPreferencesStep ? "Save & Continue" : "Finish"}
        </button>
      </div>
    </>
  );
};

export default ProfileSettingsStep;
