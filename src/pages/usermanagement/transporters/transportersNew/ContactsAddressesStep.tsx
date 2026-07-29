import ContactsAddresses from "./ContactsAddresses";
import { useTransporterWizard } from "./TransporterWizardContext";
import { useRequireTransporterProfile } from "./useRequireTransporterProfile";
import { useSaveContactsAddressesStep } from "./useSaveContactsAddressesStep";

const ContactsAddressesStep = () => {
  const { draft, updateDraft } = useTransporterWizard();
  const unlocked = useRequireTransporterProfile();
  const { submitting, submitError, handleSaveAndContinue } = useSaveContactsAddressesStep(
    "/transporters/documents",
  );

  if (!unlocked) return null;

  return (
    <>
      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. Contacts &amp; Addresses</h2>
        <ContactsAddresses
          addressLine1={draft.billingAddressLine1}
          onAddressLine1Change={(value) => updateDraft({ billingAddressLine1: value })}
          addressLine2={draft.billingAddressLine2}
          onAddressLine2Change={(value) => updateDraft({ billingAddressLine2: value })}
          landmark={draft.landmark}
          onLandmarkChange={(value) => updateDraft({ landmark: value })}
          pincode={draft.billingPincode}
          onPincodeChange={(value) => updateDraft({ billingPincode: value })}
          city={draft.billingCity}
          onCityChange={(value) => updateDraft({ billingCity: value })}
          district={draft.billingDistrict}
          onDistrictChange={(value) => updateDraft({ billingDistrict: value })}
          state={draft.billingState}
          onStateChange={(value) => updateDraft({ billingState: value })}
          email={draft.billingEmail}
          onEmailChange={(value) => updateDraft({ billingEmail: value })}
          websiteUrl={draft.websiteUrl}
          onWebsiteUrlChange={(value) => updateDraft({ websiteUrl: value })}
          googleMapLocation={draft.billingGoogleMapLocation}
          onGoogleMapLocationChange={(value) => updateDraft({ billingGoogleMapLocation: value })}
          primaryFullName={draft.primaryFullName}
          onPrimaryFullNameChange={(value) => updateDraft({ primaryFullName: value })}
          primaryMobileNumber={draft.primaryMobileNumber}
          onPrimaryMobileNumberChange={(value) => updateDraft({ primaryMobileNumber: value })}
          primaryAlternativeContact={draft.primaryAlternativeContact}
          onPrimaryAlternativeContactChange={(value) => updateDraft({ primaryAlternativeContact: value })}
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
