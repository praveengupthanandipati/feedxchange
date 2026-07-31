import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import { groupOptions, establishmentYearOptions } from "./newTransporter.data";
import { useTransporterWizard } from "./TransporterWizardContext";
import {
  useGetTransporterProfileByIdQuery,
  useGetAllTransporterLinesQuery,
  useGetTransporterTypesByLineQuery,
} from "../../../../store/transportersApi";
import { useSaveTransporterProfileStep } from "./useSaveTransporterProfileStep";
import { hydrateDraftFromTransporterProfile } from "./transporterWizard.utils";

const TransporterProfileStep = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { draft, updateDraft, profileId, setProfileId } = useTransporterWizard();
  const { submitting, submitError, handleSaveAndContinue } = useSaveTransporterProfileStep(
    "/transporters/contacts",
  );

  const { data: transporterLines } = useGetAllTransporterLinesQuery();
  const transporterLineOptions = useMemo(
    () =>
      (transporterLines ?? []).map((line) => ({
        value: String(line.transporterLineId),
        label: line.transporterLineName,
      })),
    [transporterLines],
  );

  const { data: transporterTypes } = useGetTransporterTypesByLineQuery(draft.transporterLineId, {
    skip: !draft.transporterLineId,
  });
  const typeOfTransporterOptions = useMemo(
    () =>
      (transporterTypes ?? []).map((type) => ({
        value: String(type.transporterTypeId),
        label: type.transporterTypeName,
      })),
    [transporterTypes],
  );

  const handleTransporterLineIdChange = (value: string) => {
    updateDraft({ transporterLineId: value, typeOfTransporter: "" });
  };

  // Editing an existing transporter lands here with ?id=<profileId> — load
  // it once so every step below unlocks pre-filled instead of blank.
  const {
    data: existingProfile,
    isFetching: loadingExistingProfile,
    isError: existingProfileLoadError,
  } = useGetTransporterProfileByIdQuery(editId ?? "", { skip: !editId || Boolean(profileId) });

  useEffect(() => {
    if (existingProfile && !profileId && editId) {
      updateDraft(hydrateDraftFromTransporterProfile(existingProfile));
      setProfileId(Number(editId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProfile]);

  if (editId && !profileId && loadingExistingProfile) {
    return <div className="new-business__loading">Loading transporter profile…</div>;
  }

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">1. Transporter Profile</h2>
        {!editId && (
          <p className="new-business__step-hint">
            Transporter Profile is mandatory — save it to unlock Contacts &amp; Addresses, Documents,
            Bank Details and Profile Settings.
          </p>
        )}
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="legalName">
              Transporter Legal Name <span className="form-field__required">*</span>
            </label>
            <input
              id="legalName"
              type="text"
              className="form-field__control"
              placeholder="Name as per PAN / GST"
              value={draft.legalName}
              onChange={(event) => updateDraft({ legalName: event.target.value })}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Trading Name
              <InfoTooltip text="The name used for day-to-day trading, if different from the legal name." />
            </span>
            <input
              type="text"
              className="form-field__control"
              placeholder="Trading Name"
              value={draft.tradingName}
              onChange={(event) => updateDraft({ tradingName: event.target.value })}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Establishment Year</span>
            <SearchableSelect
              options={establishmentYearOptions}
              value={draft.establishmentYear}
              onChange={(value) => updateDraft({ establishmentYear: value })}
              placeholder="Select or type year"
              ariaLabel="Establishment Year"
              allowCustom
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="panNumber">
              PAN Number
            </label>
            <input
              id="panNumber"
              type="text"
              className="form-field__control"
              placeholder="PAN Number"
              value={draft.panNumber}
              onChange={(event) => updateDraft({ panNumber: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="gstNumber">
              GST Number
            </label>
            <input
              id="gstNumber"
              type="text"
              className="form-field__control"
              placeholder="GST Number"
              value={draft.gstNumber}
              onChange={(event) => updateDraft({ gstNumber: event.target.value })}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Line of Transporter</span>
            <SearchableSelect
              options={transporterLineOptions}
              value={draft.transporterLineId}
              onChange={handleTransporterLineIdChange}
              ariaLabel="Line of Transporter"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Type of Transporter</span>
            <SearchableSelect
              options={typeOfTransporterOptions}
              value={draft.typeOfTransporter}
              onChange={(value) => updateDraft({ typeOfTransporter: value })}
              placeholder={draft.transporterLineId ? "Select..." : "Select Line of Transporter first"}
              ariaLabel="Type of Transporter"
              disabled={!draft.transporterLineId}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Group</span>
            <SearchableSelect
              options={groupOptions}
              value={draft.group}
              onChange={(value) => updateDraft({ group: value })}
              placeholder="Select or type..."
              ariaLabel="Group"
              allowCustom
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="referralCode">
              Referral Code
            </label>
            <input
              id="referralCode"
              type="text"
              className="form-field__control"
              placeholder="Enter Referral Code"
              value={draft.referralCode}
              onChange={(event) => updateDraft({ referralCode: event.target.value })}
            />
          </div>

          <div className="form-field new-contract__grid--full mb-3">
            <label className="form-field__label" htmlFor="aboutTransporter">
              Write About transporter:
            </label>
            <textarea
              id="aboutTransporter"
              className="form-field__control"
              placeholder="Describe the Transporter here..."
              value={draft.aboutTransporter}
              onChange={(event) => updateDraft({ aboutTransporter: event.target.value })}
            />
          </div>
        </div>
      </section>

      {existingProfileLoadError && (
        <p className="new-contract__error" style={{ color: "#d92d20" }}>
          Failed to load transporter profile.
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

export default TransporterProfileStep;
