import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import AccordionSection from "./AccordionSection";
import BusinessProfile, {
  nextBrokerageRowId,
  nextCapacityRowId,
  type BrokerageRow,
  type CapacityRow,
} from "./BusinessProfile";
import ContactsAddresses, {
  nextContactId,
  nextAddressId,
  type ContactEntry,
  type AddressEntry,
} from "./ContactsAddresses";
import BankDetailsSection, { nextBankEntryId, type BankEntry } from "./BankDetailsSection";
import DocumentsSection, { nextDocumentId, type DocumentEntry } from "./DocumentsSection";
import ProfileSettingsSection from "./ProfileSettingsSection";
import {
  useAddBusinessProfileMutation,
  useUpdateBusinessProfileMutation,
  useGetBusinessProfileByIdQuery,
} from "../../../store/businessProfilesApi";
import "../../contracts/NewContract.scss";
import "./Newbusiness.scss";

const TRACKED_FIELD_COUNT = 13;

function getErrorMessage(err: unknown, isEditMode: boolean): string {
  // Full error (status, server message) is logged for debugging; the user only sees the plain fallback.
  console.error(`Failed to ${isEditMode ? "update" : "create"} business profile:`, err);
  return `Failed to ${isEditMode ? "update" : "create"} business profile.`;
}

type SectionId = "profile" | "contact" | "bank" | "documents" | "settings";

const Newbusiness = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [addBusinessProfile] = useAddBusinessProfileMutation();
  const [updateBusinessProfile] = useUpdateBusinessProfileMutation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<SectionId | null>("profile");
  const toggleSection = (section: SectionId) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const [legalName, setLegalName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [yearOfEstablishment, setYearOfEstablishment] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [businessLineId, setBusinessLineId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [businessSubTypeId, setBusinessSubTypeId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [collectionArea, setCollectionArea] = useState("");
  const [area, setArea] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [aboutProfile, setAboutProfile] = useState("");

  const [emailId, setEmailId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternativeContactNumber, setAlternativeContactNumber] = useState("");

  const [buyBrokerageCharges, setBuyBrokerageCharges] = useState("");
  const [sellBrokerageCharges, setSellBrokerageCharges] = useState("");
  const [brokerageRows, setBrokerageRows] = useState<BrokerageRow[]>([]);
  const [capacityRows, setCapacityRows] = useState<CapacityRow[]>([]);

  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [billingLandmark, setBillingLandmark] = useState("");
  const [billingPincode, setBillingPincode] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingDistrict, setBillingDistrict] = useState("");
  const [billingStateName, setBillingStateName] = useState("");
  const [billingGoogleLocationUrl, setBillingGoogleLocationUrl] = useState("");
  const [primaryContactPerson, setPrimaryContactPerson] = useState("");

  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankEntry[]>([]);
  const [primaryBankId, setPrimaryBankId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);

  const {
    data: profile,
    isFetching: profileLoading,
    isError: profileLoadError,
  } = useGetBusinessProfileByIdQuery(id ?? "", { skip: !id });

  useEffect(() => {
    if (profileLoadError) {
      setSubmitError("Failed to load business profile.");
    }
  }, [profileLoadError]);

  useEffect(() => {
    if (!profile) return;

    const asString = (value: unknown) => (value == null ? "" : String(value));
    const details = (profile.businessProfileDetails ?? {}) as Record<string, unknown>;

    setLegalName(asString(profile.legalName));
    setTradingName(asString(profile.tradingName));
    setYearOfEstablishment(asString(profile.yearOfEstablishment));
    setPanNumber(asString(profile.panNumber));
    setGstNumber(asString(profile.gstNumber));
    setGroupName(asString(profile.groupName));
    setCollectionArea(asString(profile.collectionArea));
    setArea(asString(profile.area));
    setReferredBy(asString(profile.referredBy));
    setAboutProfile(asString(profile.aboutProfile));
    setEmailId(asString(profile.emailId));
    setWebsiteUrl(asString(profile.websiteUrl));
    setMobileNumber(asString(profile.mobileNumber));
    setAlternativeContactNumber(asString(profile.alternativeContactNumber));
    setBusinessLineId(asString(details.businessLineId));
    setBusinessTypeId(asString(details.businessTypeId));
    setBusinessSubTypeId(asString(details.businessSubTypeId));
    setBuyBrokerageCharges(asString(details.buyBrokerageCharges));
    setSellBrokerageCharges(asString(details.sellBrokerageCharges));

    setBrokerageRows(
      Array.isArray(profile.buySellCharges)
        ? (profile.buySellCharges as Record<string, unknown>[]).map((charge) => ({
            id: nextBrokerageRowId(),
            productId: asString(charge.productId),
            buyCharge: asString(charge.buyCharge),
            sellCharge: asString(charge.sellCharge),
          }))
        : [],
    );

    setCapacityRows(
      Array.isArray(profile.capacityRequirements)
        ? (profile.capacityRequirements as Record<string, unknown>[]).map((req) => ({
            id: nextCapacityRowId(),
            productId: asString(req.productId),
            tonsPerDay: asString(req.tonsPerDay),
            tonsPerMonth: asString(req.tonsPerMonth),
          }))
        : [],
    );

    const addressList = Array.isArray(profile.addresses)
      ? (profile.addresses as Record<string, unknown>[])
      : [];
    const primaryAddress = addressList.find((address) => address.isPrimary) ?? addressList[0];

    setBillingAddressLine1(asString(primaryAddress?.addressLine1));
    setBillingAddressLine2(asString(primaryAddress?.addressLine2));
    setBillingLandmark(asString(primaryAddress?.landmark));
    setBillingPincode(asString(primaryAddress?.pincode));
    setBillingCity(asString(primaryAddress?.city));
    setBillingDistrict(asString(primaryAddress?.district));
    setBillingStateName(asString(primaryAddress?.stateName));
    setBillingGoogleLocationUrl(asString(primaryAddress?.googleLocationUrl));

    setAddresses(
      addressList
        .filter((address) => address !== primaryAddress)
        .map((address) => ({
          id: nextAddressId(),
          officeName: asString(address.officeName),
          addressLine1: asString(address.addressLine1),
          addressLine2: asString(address.addressLine2),
          pincode: asString(address.pincode),
          city: asString(address.city),
          district: asString(address.district),
          stateName: asString(address.stateName),
          googleLocationUrl: asString(address.googleLocationUrl),
        })),
    );

    const contactList = Array.isArray(profile.contacts)
      ? (profile.contacts as Record<string, unknown>[])
      : [];

    setPrimaryContactPerson(asString(contactList[0]?.contactPerson));

    setContacts(
      contactList.map((contact) => ({
        id: nextContactId(),
        contactType: asString(contact.contactType),
        contactPerson: asString(contact.contactPerson),
        designation: asString(contact.designation),
        mobileNumber: asString(contact.mobileNumber),
        alternativeContactNumber: asString(contact.alternativeContactNumber),
        emailId: asString(contact.emailId),
      })),
    );

    const bankAccountList = Array.isArray(profile.bankAccounts)
      ? (profile.bankAccounts as Record<string, unknown>[])
      : [];
    const bankRows = bankAccountList.map((account) => ({
      id: nextBankEntryId(),
      accountType: asString(account.accountType),
      accountHolderName: asString(account.accountHolderName),
      accountNumber: asString(account.accountNumber),
      ifscCode: asString(account.ifscCode),
      bankName: asString(account.bankName),
      branchName: asString(account.branchName),
      ifscError: "",
      isPrimaryAccount: Boolean(account.isPrimaryAccount),
    }));
    setBankAccounts(bankRows.map(({ isPrimaryAccount, ...row }) => row));
    const primaryBank = bankRows.find((row) => row.isPrimaryAccount);
    setPrimaryBankId(primaryBank ? primaryBank.id : (bankRows[0]?.id ?? null));

    setDocuments(
      Array.isArray(profile.documents)
        ? (profile.documents as Record<string, unknown>[]).map((document) => ({
            id: nextDocumentId(),
            documentTypeId: asString(document.documentTypeId),
            documentNumber: asString(document.documentNumber),
            issuingAuthority: asString(document.issuingAuthority),
            issuedDate: asString(document.issuedDate).slice(0, 10),
            fileName: asString(document.fileName),
            fileError: "",
          }))
        : [],
    );
  }, [profile]);

  const profileCompletion = useMemo(() => {
    const values = [
      legalName,
      tradingName,
      yearOfEstablishment,
      panNumber,
      gstNumber,
      businessLineId,
      businessTypeId,
      businessSubTypeId,
      groupName,
      collectionArea,
      area,
      referredBy,
      aboutProfile,
    ];
    const filled = values.filter((value) => value.trim().length > 0).length;
    return Math.round((filled / TRACKED_FIELD_COUNT) * 100);
  }, [
    legalName,
    tradingName,
    yearOfEstablishment,
    panNumber,
    gstNumber,
    businessLineId,
    businessTypeId,
    businessSubTypeId,
    groupName,
    collectionArea,
    area,
    referredBy,
    aboutProfile,
  ]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const toNumber = (value: string) => Number(value) || 0;

      const payload = {
        // TODO: no "Profile Type" field exists in the form yet — defaulting to 1 (Business).
        profileTypeId: 1,
        legalName,
        tradingName,
        yearOfEstablishment,
        panNumber,
        gstNumber,
        emailId,
        mobileNumber,
        alternativeContactNumber,
        websiteUrl,
        groupName,
        collectionArea,
        area,
        referredBy,
        aboutProfile,
        status: "Active",
        createdBy: currentUserId,
        businessProfileDetails: {
          businessLineId: toNumber(businessLineId),
          businessTypeId: toNumber(businessTypeId),
          businessSubTypeId: toNumber(businessSubTypeId),
          buyBrokerageCharges: toNumber(buyBrokerageCharges),
          sellBrokerageCharges: toNumber(sellBrokerageCharges),
        },
        addresses: [
          {
            officeName: tradingName || legalName,
            addressLine1: billingAddressLine1,
            addressLine2: billingAddressLine2,
            landmark: billingLandmark,
            pincode: billingPincode,
            city: billingCity,
            district: billingDistrict,
            stateName: billingStateName,
            googleLocationUrl: billingGoogleLocationUrl,
            isPrimary: true,
            isUnloadingLocation: false,
          },
          ...addresses.map((address) => ({
            officeName: address.officeName,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            landmark: "",
            pincode: address.pincode,
            city: address.city,
            district: address.district,
            stateName: address.stateName,
            googleLocationUrl: address.googleLocationUrl,
            isPrimary: false,
            isUnloadingLocation: false,
          })),
        ],
        contacts: contacts.map((contact) => ({
          contactType: contact.contactType,
          contactPerson: contact.contactPerson,
          designation: contact.designation,
          mobileNumber: contact.mobileNumber,
          alternativeContactNumber: contact.alternativeContactNumber,
          emailId: contact.emailId,
          isUnloadingContact: false,
        })),
        bankAccounts: bankAccounts.map((account) => ({
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          ifscCode: account.ifscCode,
          accountType: account.accountType,
          branchName: account.branchName,
          accountHolderName: account.accountHolderName,
          isPrimaryAccount: account.id === primaryBankId,
        })),
        documents: documents.map((document) => ({
          documentTypeId: toNumber(document.documentTypeId),
          documentNumber: document.documentNumber,
          fileName: document.fileName,
          issuingAuthority: document.issuingAuthority,
          issuedDate: document.issuedDate,
        })),
        capacityRequirements: capacityRows.map((row) => ({
          productId: toNumber(row.productId),
          tonsPerDay: toNumber(row.tonsPerDay),
          tonsPerMonth: toNumber(row.tonsPerMonth),
        })),
        buySellCharges: brokerageRows.map((row) => ({
          productId: toNumber(row.productId),
          buyCharge: toNumber(row.buyCharge),
          sellCharge: toNumber(row.sellCharge),
        })),
      };

      if (isEditMode && id) {
        await updateBusinessProfile({
          ...payload,
          profileId: Number(id),
          modifiedBy: currentUserId,
        }).unwrap();
      } else {
        await addBusinessProfile(payload).unwrap();
      }
      navigate("/business-owners");
    } catch (err) {
      setSubmitError(getErrorMessage(err, isEditMode));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-business">
      <div className="new-business__topbar">
        <div className="new-business__topbar-left">
          <h1>{isEditMode ? "Edit Business" : "New Business"}</h1>
          <span className="new-business__completion">
            Profile Completion: <strong>{profileCompletion}%</strong>
          </span>
        </div>
        <Link to="/business-owners" className="new-business__back">
          <FiArrowLeft aria-hidden /> Business Users
        </Link>
      </div>

      {isEditMode && profileLoading ? (
        <div className="new-business__loading">Loading business profile…</div>
      ) : (
        <>
          <AccordionSection
            title="1. Business Profile"
            isOpen={openSection === "profile"}
            onToggle={() => toggleSection("profile")}
          >
            <BusinessProfile
              legalName={legalName}
              onLegalNameChange={setLegalName}
              tradingName={tradingName}
              onTradingNameChange={setTradingName}
              yearOfEstablishment={yearOfEstablishment}
              onYearOfEstablishmentChange={setYearOfEstablishment}
              panNumber={panNumber}
              onPanNumberChange={setPanNumber}
              gstNumber={gstNumber}
              onGstNumberChange={setGstNumber}
              businessLineId={businessLineId}
              onBusinessLineIdChange={setBusinessLineId}
              businessTypeId={businessTypeId}
              onBusinessTypeIdChange={setBusinessTypeId}
              businessSubTypeId={businessSubTypeId}
              onBusinessSubTypeIdChange={setBusinessSubTypeId}
              groupName={groupName}
              onGroupNameChange={setGroupName}
              collectionArea={collectionArea}
              onCollectionAreaChange={setCollectionArea}
              area={area}
              onAreaChange={setArea}
              referredBy={referredBy}
              onReferredByChange={setReferredBy}
              aboutProfile={aboutProfile}
              onAboutProfileChange={setAboutProfile}
              buyBrokerageCharges={buyBrokerageCharges}
              onBuyBrokerageChargesChange={setBuyBrokerageCharges}
              sellBrokerageCharges={sellBrokerageCharges}
              onSellBrokerageChargesChange={setSellBrokerageCharges}
              brokerageRows={brokerageRows}
              onBrokerageRowsChange={setBrokerageRows}
              capacityRows={capacityRows}
              onCapacityRowsChange={setCapacityRows}
            />
          </AccordionSection>

          <AccordionSection
            title="2. Contact & Address"
            isOpen={openSection === "contact"}
            onToggle={() => toggleSection("contact")}
          >
            <ContactsAddresses
              emailId={emailId}
              onEmailIdChange={setEmailId}
              websiteUrl={websiteUrl}
              onWebsiteUrlChange={setWebsiteUrl}
              mobileNumber={mobileNumber}
              onMobileNumberChange={setMobileNumber}
              alternativeContactNumber={alternativeContactNumber}
              onAlternativeContactNumberChange={setAlternativeContactNumber}
              addressLine1={billingAddressLine1}
              onAddressLine1Change={setBillingAddressLine1}
              addressLine2={billingAddressLine2}
              onAddressLine2Change={setBillingAddressLine2}
              landmark={billingLandmark}
              onLandmarkChange={setBillingLandmark}
              pincode={billingPincode}
              onPincodeChange={setBillingPincode}
              city={billingCity}
              onCityChange={setBillingCity}
              district={billingDistrict}
              onDistrictChange={setBillingDistrict}
              stateName={billingStateName}
              onStateNameChange={setBillingStateName}
              googleLocationUrl={billingGoogleLocationUrl}
              onGoogleLocationUrlChange={setBillingGoogleLocationUrl}
              contactPerson={primaryContactPerson}
              onContactPersonChange={setPrimaryContactPerson}
              contacts={contacts}
              onContactsChange={setContacts}
              addresses={addresses}
              onAddressesChange={setAddresses}
            />
          </AccordionSection>

          <AccordionSection
            title="3. Bank Details"
            isOpen={openSection === "bank"}
            onToggle={() => toggleSection("bank")}
          >
            <BankDetailsSection
              entries={bankAccounts}
              onEntriesChange={setBankAccounts}
              primaryId={primaryBankId}
              onPrimaryIdChange={setPrimaryBankId}
            />
          </AccordionSection>

          <AccordionSection
            title="4. Documents"
            isOpen={openSection === "documents"}
            onToggle={() => toggleSection("documents")}
          >
            <DocumentsSection entries={documents} onEntriesChange={setDocuments} />
          </AccordionSection>

          <AccordionSection
            title="5. Profile Settings"
            isOpen={openSection === "settings"}
            onToggle={() => toggleSection("settings")}
          >
            <ProfileSettingsSection />
          </AccordionSection>

          {submitError && (
            <p className="new-contract__error" style={{ color: "#d92d20" }}>
              {submitError}
            </p>
          )}

          <div className="new-contract__actions">
            <Link to="/business-owners" className="new-contract__cancel">
              Cancel
            </Link>
            <button
              type="button"
              className="new-contract__submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? isEditMode
                  ? "Updating…"
                  : "Creating…"
                : isEditMode
                  ? "Update Business"
                  : "Create Business"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Newbusiness;
