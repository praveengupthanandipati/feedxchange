import DocumentsSection from "./DocumentsSection";
import { usePromoterWizard } from "./PromoterWizardContext";
import { useRequirePromoterProfile } from "./useRequirePromoterProfile";
import { useSaveDocumentsStep } from "./useSaveDocumentsStep";

const DocumentsStep = () => {
  const { draft, updateDraft } = usePromoterWizard();
  const unlocked = useRequirePromoterProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveDocumentsStep(
    "/promoters/profile-settings",
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
