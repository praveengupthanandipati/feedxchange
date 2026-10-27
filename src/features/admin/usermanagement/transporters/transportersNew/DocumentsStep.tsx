import DocumentsSection from "./DocumentsSection";
import { useTransporterWizard } from "./TransporterWizardContext";
import { useRequireTransporterProfile } from "./useRequireTransporterProfile";
import { useSaveDocumentsStep } from "./useSaveDocumentsStep";

const DocumentsStep = () => {
  const { draft, updateDraft } = useTransporterWizard();
  const unlocked = useRequireTransporterProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveDocumentsStep(
    "/admin/transporters/bank-details",
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
          {submitting ? "Saving…" : "Save & Continue"}
        </button>
      </div>
    </>
  );
};

export default DocumentsStep;
