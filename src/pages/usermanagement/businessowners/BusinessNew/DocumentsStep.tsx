import DocumentsSection from "./DocumentsSection";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { useRequireBusinessProfile } from "./useRequireBusinessProfile";
import { useSaveDocumentsStep } from "./useSaveDocumentsStep";

const DocumentsStep = () => {
  const { draft, updateDraft } = useBusinessOwnerWizard();
  const unlocked = useRequireBusinessProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveDocumentsStep(
    "/business-owners/bank-details",
  );

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Documents</h2>
        <DocumentsSection
          entries={draft.documents}
          onEntriesChange={(entries) => updateDraft({ documents: entries })}
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

export default DocumentsStep;
