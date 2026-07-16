import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import AccordionSection from "./AccordionSection";
import BrokerageChargesCard from "./BrokerageChargesCard";
import CapacityRequirementsCard from "./CapacityRequirementsCard";
import AdditionalContactsSection from "./AdditionalContactsSection";
import AdditionalAddressSection from "./AdditionalAddressSection";
import BankDetailsSection from "./BankDetailsSection";
import DocumentsSection from "./DocumentsSection";
import ProfileSettingsSection from "./ProfileSettingsSection";
import {
  lineOfBusinessOptions,
  typeOfBusinessByLine,
  subTypeByType,
  groupOptions,
  collectionAreaOptions,
  areaOptions,
  establishmentYearOptions,
  cityOptions,
  districtOptions,
  stateOptions,
} from "./newBusiness.data";
import "../../../contracts/NewContract.scss";
import "./Newbusiness.scss";

const TRACKED_FIELD_COUNT = 14;

type SectionId = "profile" | "contact" | "bank" | "documents" | "settings";

const Newbusiness = () => {
  const [openSection, setOpenSection] = useState<SectionId | null>("profile");
  const toggleSection = (section: SectionId) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const [businessLegalName, setBusinessLegalName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [establishmentYear, setEstablishmentYear] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [lineOfBusiness, setLineOfBusiness] = useState("");
  const [typeOfBusiness, setTypeOfBusiness] = useState("");
  const [subTypeOfBusiness, setSubTypeOfBusiness] = useState("");
  const [group, setGroup] = useState("");
  const [collectionArea, setCollectionArea] = useState("");
  const [area, setArea] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralName, setReferralName] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");

  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [billingPincode, setBillingPincode] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingDistrict, setBillingDistrict] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [billingGoogleMapLocation, setBillingGoogleMapLocation] = useState("");

  const [primaryFullName, setPrimaryFullName] = useState("");
  const [primaryMobileNumber, setPrimaryMobileNumber] = useState("");
  const [primaryAlternativeContact, setPrimaryAlternativeContact] = useState("");

  const typeOfBusinessOptions = lineOfBusiness ? typeOfBusinessByLine[lineOfBusiness] ?? [] : [];
  const subTypeOfBusinessOptions = typeOfBusiness ? subTypeByType[typeOfBusiness] ?? [] : [];

  const handleLineOfBusinessChange = (value: string) => {
    setLineOfBusiness(value);
    setTypeOfBusiness("");
    setSubTypeOfBusiness("");
  };

  const handleTypeOfBusinessChange = (value: string) => {
    setTypeOfBusiness(value);
    setSubTypeOfBusiness("");
  };

  const profileCompletion = useMemo(() => {
    const values = [
      businessLegalName,
      tradingName,
      establishmentYear,
      panNumber,
      gstNumber,
      lineOfBusiness,
      typeOfBusiness,
      subTypeOfBusiness,
      group,
      collectionArea,
      area,
      referralCode,
      referralName,
      aboutBusiness,
    ];
    const filled = values.filter((value) => value.trim().length > 0).length;
    return Math.round((filled / TRACKED_FIELD_COUNT) * 100);
  }, [
    businessLegalName,
    tradingName,
    establishmentYear,
    panNumber,
    gstNumber,
    lineOfBusiness,
    typeOfBusiness,
    subTypeOfBusiness,
    group,
    collectionArea,
    area,
    referralCode,
    referralName,
    aboutBusiness,
  ]);

  return (
    <div className="new-business">
      <div className="new-business__topbar">
        <div className="new-business__topbar-left">
          <h1>New Business</h1>
          <span className="new-business__completion">
            Profile Completion: <strong>{profileCompletion}%</strong>
          </span>
        </div>
        <Link to="/business-owners" className="new-business__back">
          <FiArrowLeft aria-hidden /> Business Users
        </Link>
      </div>

      <AccordionSection
        title="1. Business Profile"
        isOpen={openSection === "profile"}
        onToggle={() => toggleSection("profile")}
      >
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="businessLegalName">
              Business Legal Name <span className="form-field__required">*</span>
            </label>
            <input
              id="businessLegalName"
              type="text"
              className="form-field__control"
              placeholder="Name as per PAN/GST"
              value={businessLegalName}
              onChange={(event) => setBusinessLegalName(event.target.value)}
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
              value={tradingName}
              onChange={(event) => setTradingName(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Establishment Year</span>
            <SearchableSelect
              options={establishmentYearOptions}
              value={establishmentYear}
              onChange={setEstablishmentYear}
              ariaLabel="Establishment Year"
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
              value={panNumber}
              onChange={(event) => setPanNumber(event.target.value)}
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
              value={gstNumber}
              onChange={(event) => setGstNumber(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Line of Business</span>
            <SearchableSelect
              options={lineOfBusinessOptions}
              value={lineOfBusiness}
              onChange={handleLineOfBusinessChange}
              ariaLabel="Line of Business"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Type of Business</span>
            <SearchableSelect
              options={typeOfBusinessOptions}
              value={typeOfBusiness}
              onChange={handleTypeOfBusinessChange}
              placeholder={lineOfBusiness ? "Select..." : "Select Line of Business first"}
              ariaLabel="Type of Business"
              disabled={!lineOfBusiness}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Sub Type of Business</span>
            <SearchableSelect
              options={subTypeOfBusinessOptions}
              value={subTypeOfBusiness}
              onChange={setSubTypeOfBusiness}
              placeholder={typeOfBusiness ? "Select..." : "Select Type of Business first"}
              ariaLabel="Sub Type of Business"
              disabled={!typeOfBusiness}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Group</span>
            <SearchableSelect
              options={groupOptions}
              value={group}
              onChange={setGroup}
              placeholder="Select or type..."
              ariaLabel="Group"
              allowCustom
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Collection Area</span>
            <SearchableSelect
              options={collectionAreaOptions}
              value={collectionArea}
              onChange={setCollectionArea}
              placeholder="Select or type..."
              ariaLabel="Collection Area"
              allowCustom
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Area</span>
            <SearchableSelect
              options={areaOptions}
              value={area}
              onChange={setArea}
              placeholder="Select or type..."
              ariaLabel="Area"
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
              placeholder="Enter Referred By"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="referralName">
              Referral Name
            </label>
            <input
              id="referralName"
              type="text"
              className="form-field__control"
              placeholder="Enter Referral Name"
              value={referralName}
              onChange={(event) => setReferralName(event.target.value)}
            />
          </div>

          <div className="form-field new-contract__grid--full mb-3">
            <label className="form-field__label" htmlFor="aboutBusiness">
              About Business
            </label>
            <textarea
              id="aboutBusiness"
              className="form-field__control"
              placeholder="Describe Your Business"
              value={aboutBusiness}
              onChange={(event) => setAboutBusiness(event.target.value)}
            />
          </div>
        </div>

        <div className="new-contract__conditions">
          <BrokerageChargesCard />
          <CapacityRequirementsCard />
        </div>
      </AccordionSection>

      <AccordionSection
        title="2. Contact & Address"
        isOpen={openSection === "contact"}
        onToggle={() => toggleSection("contact")}
      >
        <div className="contact-address__subsections">
          <div className="new-contract__condition-card">
            <h3>Billing Communication Details</h3>
            <div className="new-contract__grid">
              <div className="form-field">
                <label className="form-field__label">
                  Billing Address Line 01 <span className="form-field__required">*</span>
                </label>
                <input
                  type="text"
                  className="form-field__control"
                  placeholder="Billing Address Line 01"
                  value={billingAddressLine1}
                  onChange={(event) => setBillingAddressLine1(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Billing Address Line 02</label>
                <input
                  type="text"
                  className="form-field__control"
                  placeholder="Billing Address Line 02"
                  value={billingAddressLine2}
                  onChange={(event) => setBillingAddressLine2(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Landmark</label>
                <input
                  type="text"
                  className="form-field__control"
                  placeholder="Landmark"
                  value={landmark}
                  onChange={(event) => setLandmark(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">
                  Pincode <span className="form-field__required">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-field__control"
                  placeholder="Enter Valid Pincode"
                  value={billingPincode}
                  onChange={(event) => setBillingPincode(event.target.value)}
                />
              </div>

              <div className="form-field">
                <span className="form-field__label">
                  City <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={cityOptions}
                  value={billingCity}
                  onChange={setBillingCity}
                  ariaLabel="City"
                />
              </div>
              <div className="form-field">
                <span className="form-field__label">
                  District <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={districtOptions}
                  value={billingDistrict}
                  onChange={setBillingDistrict}
                  ariaLabel="District"
                />
              </div>
              <div className="form-field">
                <span className="form-field__label">
                  State <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={stateOptions}
                  value={billingState}
                  onChange={setBillingState}
                  ariaLabel="State"
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Email ID</label>
                <input
                  type="email"
                  className="form-field__control"
                  placeholder="Enter Valid Email"
                  value={billingEmail}
                  onChange={(event) => setBillingEmail(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">Website URL</label>
                <input
                  type="url"
                  className="form-field__control"
                  placeholder="Valid Website URL"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Google Map Location</label>
                <input
                  type="text"
                  className="form-field__control"
                  placeholder="Google Map Location"
                  value={billingGoogleMapLocation}
                  onChange={(event) => setBillingGoogleMapLocation(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="new-contract__condition-card">
            <h3>Primary Contact Numbers</h3>
            <div className="new-contract__grid">
              <div className="form-field">
                <label className="form-field__label">
                  Full Name <span className="form-field__required">*</span>
                </label>
                <input
                  type="text"
                  className="form-field__control"
                  placeholder="Full Name"
                  value={primaryFullName}
                  onChange={(event) => setPrimaryFullName(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">
                  Mobile Number <span className="form-field__required">*</span>
                </label>
                <input
                  type="tel"
                  className="form-field__control"
                  placeholder="Enter 10-digit Mobile Number"
                  value={primaryMobileNumber}
                  onChange={(event) => setPrimaryMobileNumber(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Alternative Contact Number</label>
                <input
                  type="tel"
                  className="form-field__control"
                  placeholder="Phone Number Optional"
                  value={primaryAlternativeContact}
                  onChange={(event) => setPrimaryAlternativeContact(event.target.value)}
                />
              </div>
            </div>
          </div>

          <AdditionalContactsSection />
          <AdditionalAddressSection />
        </div>
      </AccordionSection>

      <AccordionSection
        title="3. Bank Details"
        isOpen={openSection === "bank"}
        onToggle={() => toggleSection("bank")}
      >
        <BankDetailsSection />
      </AccordionSection>

      <AccordionSection
        title="4. Documents"
        isOpen={openSection === "documents"}
        onToggle={() => toggleSection("documents")}
      >
        <DocumentsSection />
      </AccordionSection>

      <AccordionSection
        title="5. Profile Settings"
        isOpen={openSection === "settings"}
        onToggle={() => toggleSection("settings")}
      >
        <ProfileSettingsSection />
      </AccordionSection>

      <div className="new-contract__actions">
        <Link to="/business-owners" className="new-contract__cancel">
          Cancel
        </Link>
        <button type="button" className="new-contract__submit">
          Create Business
        </button>
      </div>
    </div>
  );
};

export default Newbusiness;
