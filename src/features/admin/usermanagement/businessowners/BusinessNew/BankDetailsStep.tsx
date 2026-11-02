import BankDetailsSection from "./BankDetailsSection";
import { SHOW_PROFILE_SETTINGS } from "../../profileSettingsVisibility";
import { usePermission } from "../../../../../core/auth/AuthContext";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { useRequireBusinessProfile } from "./useRequireBusinessProfile";
import { useSaveBankDetailsStep } from "./useSaveBankDetailsStep";

const BankDetailsStep = () => {
  const { draft, updateDraft } = useBusinessOwnerWizard();
  const unlocked = useRequireBusinessProfile();
  // Profile Settings is hidden for now (profileSettingsVisibility.ts): go on to Notification Preferences, or finish.
  const hasPreferencesStep = usePermission("notification-preferences.view");
  const { submitting, submitError, handleSaveAndContinue } = useSaveBankDetailsStep(
    SHOW_PROFILE_SETTINGS
      ? "/admin/business-owners/profile-settings"
      : hasPreferencesStep
        ? "/admin/business-owners/notification-preferences"
        : "/admin/business-owners",
  );

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">4. Bank Details</h2>
        <BankDetailsSection
          entries={draft.bankAccounts}
          onEntriesChange={(entries) => updateDraft({ bankAccounts: entries })}
          primaryId={draft.primaryBankId}
          onPrimaryIdChange={(id) => updateDraft({ primaryBankId: id })}
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

export default BankDetailsStep;
