import BankDetailsSection from "./BankDetailsSection";
import { useTransporterWizard } from "./TransporterWizardContext";
import { useRequireTransporterProfile } from "./useRequireTransporterProfile";
import { useSaveBankDetailsStep } from "./useSaveBankDetailsStep";

const BankDetailsStep = () => {
  const { draft, updateDraft } = useTransporterWizard();
  const unlocked = useRequireTransporterProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveBankDetailsStep(
    "/transporters/profile-settings",
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
          {submitting ? "Saving…" : "Save & Continue"}
        </button>
      </div>
    </>
  );
};

export default BankDetailsStep;
