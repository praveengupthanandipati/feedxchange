import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BusinessProfile from "./BusinessProfile";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { useSaveBusinessProfileMainStep } from "./useSaveBusinessProfileMainStep";
import { hydrateDraftFromProfile } from "./businessOwnerWizard.utils";
import { useGetBusinessProfileByIdQuery } from "../../../../store/businessProfilesApi";

const BusinessProfileStep = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { draft, updateDraft, profileId, setProfileId } = useBusinessOwnerWizard();
  const { submitting, submitError, handleSaveAndContinue } = useSaveBusinessProfileMainStep(
    "/business-owners/contacts",
  );

  // Editing an existing business owner lands here with ?id=<profileId> — load
  // it once so every step below unlocks pre-filled instead of blank.
  const {
    data: existingProfile,
    isFetching: loadingExistingProfile,
    isError: existingProfileLoadError,
  } = useGetBusinessProfileByIdQuery(editId ?? "", { skip: !editId || Boolean(profileId) });

  useEffect(() => {
    if (existingProfile && !profileId && editId) {
      updateDraft(hydrateDraftFromProfile(existingProfile));
      setProfileId(Number(editId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProfile]);

  if (editId && !profileId && loadingExistingProfile) {
    return <div className="new-business__loading">Loading business profile…</div>;
  }

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">1. Business Profile</h2>
        {!editId && (
          <p className="new-business__step-hint">
            Business Profile is mandatory — save it to unlock Contacts &amp; Addresses, Documents, Bank
            Details and Profile Settings.
          </p>
        )}
        <BusinessProfile
          legalName={draft.legalName}
          onLegalNameChange={(value) => updateDraft({ legalName: value })}
          tradingName={draft.tradingName}
          onTradingNameChange={(value) => updateDraft({ tradingName: value })}
          yearOfEstablishment={draft.yearOfEstablishment}
          onYearOfEstablishmentChange={(value) => updateDraft({ yearOfEstablishment: value })}
          panNumber={draft.panNumber}
          onPanNumberChange={(value) => updateDraft({ panNumber: value })}
          gstNumber={draft.gstNumber}
          onGstNumberChange={(value) => updateDraft({ gstNumber: value })}
          businessLineId={draft.businessLineId}
          onBusinessLineIdChange={(value) => updateDraft({ businessLineId: value })}
          businessTypeId={draft.businessTypeId}
          onBusinessTypeIdChange={(value) => updateDraft({ businessTypeId: value })}
          businessSubTypeId={draft.businessSubTypeId}
          onBusinessSubTypeIdChange={(value) => updateDraft({ businessSubTypeId: value })}
          area={draft.area}
          onAreaChange={(value) => updateDraft({ area: value })}
          collectionArea={draft.collectionArea}
          onCollectionAreaChange={(value) => updateDraft({ collectionArea: value })}
          referredBy={draft.referredBy}
          onReferredByChange={(value) => updateDraft({ referredBy: value })}
          aboutProfile={draft.aboutProfile}
          onAboutProfileChange={(value) => updateDraft({ aboutProfile: value })}
          buyBrokerageCharges={draft.buyBrokerageCharges}
          onBuyBrokerageChargesChange={(value) => updateDraft({ buyBrokerageCharges: value })}
          sellBrokerageCharges={draft.sellBrokerageCharges}
          onSellBrokerageChargesChange={(value) => updateDraft({ sellBrokerageCharges: value })}
          brokerageRows={draft.brokerageRows}
          onBrokerageRowsChange={(rows) => updateDraft({ brokerageRows: rows })}
          capacityRows={draft.capacityRows}
          onCapacityRowsChange={(rows) => updateDraft({ capacityRows: rows })}
        />
      </section>

      {existingProfileLoadError && (
        <p className="new-contract__error" style={{ color: "#d92d20" }}>
          Failed to load business profile.
        </p>
      )}

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
          {submitting ? "Saving…" : profileId ? "Save & Continue" : "Save & Unlock Next Steps"}
        </button>
      </div>
    </>
  );
};

export default BusinessProfileStep;
