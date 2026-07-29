import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import {
  cityOptions,
  districtOptions,
  stateOptions,
  productOptions,
  commissionStructureOptions,
  paymentFrequencyOptions,
} from "./promoterNew.data";
import RegionSection from "./RegionSection";
import { fetchLocationFromPincode } from "../../../../utils/pincodeLookup";
import { usePromoterWizard } from "./PromoterWizardContext";
import { useGetPromoterProfileByIdQuery } from "../../../../store/promotersApi";
import { useSavePromoterProfileStep } from "./useSavePromoterProfileStep";
import { hydrateDraftFromPromoterProfile } from "./promoterWizard.utils";

const PromoterProfileStep = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { draft, updateDraft, profileId, setProfileId } = usePromoterWizard();
  const { submitting, submitError, handleSaveAndContinue } = useSavePromoterProfileStep(
    "/promoters/documents",
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Editing an existing promoter lands here with ?id=<profileId> — load it
  // once so the later steps unlock pre-filled instead of blank.
  const {
    data: existingProfile,
    isFetching: loadingExistingProfile,
    isError: existingProfileLoadError,
  } = useGetPromoterProfileByIdQuery(editId ?? "", { skip: !editId || Boolean(profileId) });

  useEffect(() => {
    if (existingProfile && !profileId && editId) {
      updateDraft(hydrateDraftFromPromoterProfile(existingProfile));
      setProfileId(Number(editId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProfile, editId]);

  if (editId && !profileId && loadingExistingProfile) {
    return <div className="new-business__loading">Loading promoter profile…</div>;
  }

  
  const handleSubmit = () => {
    if (!draft.promoterName.trim()) {
      setValidationError("Promoter Name is required.");
      return;
    }
    setValidationError(null);
    handleSaveAndContinue();
  };

  const handlePinCodeChange = (value: string) => {
    updateDraft({ pinCode: value });
    fetchLocationFromPincode(value).then((location) => {
      if (location) {
        updateDraft({ city: location.city, district: location.district, state: location.state });
      }
    });
  };

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">1. Basic Information</h2>
        {!editId && (
          <p className="new-business__step-hint">
            Promoter Profile is mandatory — save it to unlock Documents and Profile Settings.
          </p>
        )}
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Promoter Code
              <InfoTooltip text="Auto-generated unique code used to track this promoter's referrals." />
            </span>
            <input type="text" className="form-field__control" value={draft.promoterCode} readOnly />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="promoterName">
              Promoter Name <span className="form-field__required">*</span>
            </label>
            <input
              id="promoterName"
              type="text"
              className="form-field__control"
              placeholder="Promoter Name"
              value={draft.promoterName}
              onChange={(event) => updateDraft({ promoterName: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="companyName">
              Company Name (Optional)
            </label>
            <input
              id="companyName"
              type="text"
              className="form-field__control"
              placeholder="Company Name"
              value={draft.companyName}
              onChange={(event) => updateDraft({ companyName: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="mobileNumber">
              Mobile Number <span className="form-field__required">*</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              className="form-field__control"
              placeholder="Mobile Number"
              value={draft.mobileNumber}
              onChange={(event) => updateDraft({ mobileNumber: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="emailAddress">
              Email Address <span className="form-field__required">*</span>
            </label>
            <input
              id="emailAddress"
              type="email"
              className="form-field__control"
              placeholder="Email"
              value={draft.emailAddress}
              onChange={(event) => updateDraft({ emailAddress: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="designation">
              Designation (Optional)
            </label>
            <input
              id="designation"
              type="text"
              className="form-field__control"
              placeholder="Designation"
              value={draft.designation}
              onChange={(event) => updateDraft({ designation: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="addressLine1">
              Address Line 1 <span className="form-field__required">*</span>
            </label>
            <input
              id="addressLine1"
              type="text"
              className="form-field__control"
              placeholder="Address Line 1"
              value={draft.addressLine1}
              onChange={(event) => updateDraft({ addressLine1: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="addressLine2">
              Address Line 2 (Optional)
            </label>
            <input
              id="addressLine2"
              type="text"
              className="form-field__control"
              placeholder="Address Line 2"
              value={draft.addressLine2}
              onChange={(event) => updateDraft({ addressLine2: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="landmark">
              Landmark
            </label>
            <input
              id="landmark"
              type="text"
              className="form-field__control"
              placeholder="Landmark Ex: Near Bus Stop"
              value={draft.landmark}
              onChange={(event) => updateDraft({ landmark: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="pinCode">
              Pin Code <span className="form-field__required">*</span>
            </label>
            <input
              id="pinCode"
              type="text"
              inputMode="numeric"
              className="form-field__control"
              placeholder="Postal Code"
              value={draft.pinCode}
              onChange={(event) => handlePinCodeChange(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              City <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={cityOptions}
              value={draft.city}
              onChange={(value) => updateDraft({ city: value })}
              placeholder="City"
              ariaLabel="City"
              allowCustom
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              District <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={districtOptions}
              value={draft.district}
              onChange={(value) => updateDraft({ district: value })}
              placeholder="District"
              ariaLabel="District"
              allowCustom
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              State <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={stateOptions}
              value={draft.state}
              onChange={(value) => updateDraft({ state: value })}
              placeholder="State"
              ariaLabel="State"
              allowCustom
            />
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. Association/Region</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">Associated Products</span>
            <SearchableSelect
              options={productOptions}
              value={draft.associatedProducts}
              onChange={(value) => updateDraft({ associatedProducts: value })}
              placeholder="Products"
              ariaLabel="Associated Products"
              allowCustom
            />
          </div>
        </div>

        <RegionSection
          entries={draft.regions}
          onEntriesChange={(entries) => updateDraft({ regions: entries })}
        />
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Commission &amp; Payment Details</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">Commission Structure</span>
            <SearchableSelect
              options={commissionStructureOptions}
              value={draft.commissionStructure}
              onChange={(value) => updateDraft({ commissionStructure: value })}
              placeholder="Structure"
              ariaLabel="Commission Structure"
              allowCustom
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="commissionRateValue">
              Commission Rate/Value
            </label>
            <input
              id="commissionRateValue"
              type="text"
              className="form-field__control"
              placeholder="e.g. 5% or Rs. 1000"
              value={draft.commissionRateValue}
              onChange={(event) => updateDraft({ commissionRateValue: event.target.value })}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Payment Frequency</span>
            <SearchableSelect
              options={paymentFrequencyOptions}
              value={draft.paymentFrequency}
              onChange={(value) => updateDraft({ paymentFrequency: value })}
              placeholder="Frequency"
              ariaLabel="Payment Frequency"
              allowCustom
            />
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <div className="form-field">
          <label className="form-field__label" htmlFor="termsAndConditions">
            Write Terms &amp; Conditions
          </label>
          <textarea
            id="termsAndConditions"
            className="form-field__control"
            placeholder="Write Terms & Conditions"
            value={draft.termsAndConditions}
            onChange={(event) => updateDraft({ termsAndConditions: event.target.value })}
          />
        </div>
      </section>

      <section className="new-contract__section">
        <div className="form-field">
          <label className="form-field__label" htmlFor="remarks">
            Remarks
          </label>
          <textarea
            id="remarks"
            className="form-field__control"
            placeholder="Write Remarks"
            value={draft.remarks}
            onChange={(event) => updateDraft({ remarks: event.target.value })}
          />
        </div>
      </section>

      {existingProfileLoadError && (
        <p className="new-contract__error" style={{ color: "#d92d20" }}>
          Failed to load promoter profile.
        </p>
      )}

      {validationError && (
        <p className="new-contract__error" style={{ color: "#d92d20" }}>
          {validationError}
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
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Saving…" : profileId ? "Save & Continue" : "Save & Unlock Next Steps"}
        </button>
      </div>
    </>
  );
};

export default PromoterProfileStep;
