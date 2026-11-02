import DocumentsSection from "./DocumentsSection";
import { SHOW_PROFILE_SETTINGS } from "../../profileSettingsVisibility";
import { usePermission } from "../../../../../core/auth/AuthContext";
import { usePromoterWizard } from "./PromoterWizardContext";
import { useRequirePromoterProfile } from "./useRequirePromoterProfile";
import { useSaveDocumentsStep } from "./useSaveDocumentsStep";

const DocumentsStep = () => {
  const { draft, updateDraft } = usePromoterWizard();
  const unlocked = useRequirePromoterProfile();
  // Profile Settings is hidden for now (profileSettingsVisibility.ts): go on to Notification Preferences, or finish.
  const hasPreferencesStep = usePermission("notification-preferences.view");
  const { submitting, submitError, handleSaveAndContinue } = useSaveDocumentsStep(
    SHOW_PROFILE_SETTINGS
      ? "/admin/promoters/profile-settings"
      : hasPreferencesStep
        ? "/admin/promoters/notification-preferences"
        : "/admin/promoters",
  );

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. Documents</h2>
        <DocumentsSection
          entries={draft.documents}
          onEntriesChange={(entries) => updateDraft({ documents: entries })}
        />
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
          {submitting ? "Saving…" : SHOW_PROFILE_SETTINGS || hasPreferencesStep ? "Save & Continue" : "Finish"}
        </button>
      </div>
    </>
  );
};

export default DocumentsStep;
