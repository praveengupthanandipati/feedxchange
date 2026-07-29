import ContactsAddresses from "./ContactsAddresses";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { useRequireBusinessProfile } from "./useRequireBusinessProfile";
import { useSaveContactsAddressesStep } from "./useSaveContactsAddressesStep";

const ContactsAddressesStep = () => {
  const { draft, updateDraft } = useBusinessOwnerWizard();
  const unlocked = useRequireBusinessProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveContactsAddressesStep(
    "/business-owners/documents",
  );

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. Contacts &amp; Addresses</h2>
        <ContactsAddresses
          emailId={draft.emailId}
          onEmailIdChange={(value) => updateDraft({ emailId: value })}
          websiteUrl={draft.websiteUrl}
          onWebsiteUrlChange={(value) => updateDraft({ websiteUrl: value })}
          mobileNumber={draft.mobileNumber}
          onMobileNumberChange={(value) => updateDraft({ mobileNumber: value })}
          alternativeContactNumber={draft.alternativeContactNumber}
          onAlternativeContactNumberChange={(value) => updateDraft({ alternativeContactNumber: value })}
          addressLine1={draft.billingAddressLine1}
          onAddressLine1Change={(value) => updateDraft({ billingAddressLine1: value })}
          addressLine2={draft.billingAddressLine2}
          onAddressLine2Change={(value) => updateDraft({ billingAddressLine2: value })}
          landmark={draft.billingLandmark}
          onLandmarkChange={(value) => updateDraft({ billingLandmark: value })}
          pincode={draft.billingPincode}
          onPincodeChange={(value) => updateDraft({ billingPincode: value })}
          city={draft.billingCity}
          onCityChange={(value) => updateDraft({ billingCity: value })}
          district={draft.billingDistrict}
          onDistrictChange={(value) => updateDraft({ billingDistrict: value })}
          stateName={draft.billingStateName}
          onStateNameChange={(value) => updateDraft({ billingStateName: value })}
          googleLocationUrl={draft.billingGoogleLocationUrl}
          onGoogleLocationUrlChange={(value) => updateDraft({ billingGoogleLocationUrl: value })}
          contactPerson={draft.primaryContactPerson}
          onContactPersonChange={(value) => updateDraft({ primaryContactPerson: value })}
          contacts={draft.contacts}
          onContactsChange={(entries) => updateDraft({ contacts: entries })}
          addresses={draft.addresses}
          onAddressesChange={(entries) => updateDraft({ addresses: entries })}
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

export default ContactsAddressesStep;
