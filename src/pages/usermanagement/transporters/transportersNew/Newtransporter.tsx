import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import AdditionalContactsSection from "./AdditionalContactsSection";
import AdditionalAddressSection from "./AdditionalAddressSection";
import BankDetailsSection from "./BankDetailsSection";
import DocumentsSection from "./DocumentsSection";
import ProfileSettingsSection from "./ProfileSettingsSection";
import {
  typeOfTransporterOptions,
  groupOptions,
  establishmentYearOptions,
  cityOptions,
  districtOptions,
  stateOptions,
} from "./newTransporter.data";
import "../../../contracts/NewContract.scss";
import "../../businessowners/BusinessNew/Newbusiness.scss";
import "./Newtransporter.scss";

const TRACKED_FIELD_COUNT = 9;

const Newtransporter = () => {
  const [transporterLegalName, setTransporterLegalName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [establishmentYear, setEstablishmentYear] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [typeOfTransporter, setTypeOfTransporter] = useState("");
  const [group, setGroup] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [aboutTransporter, setAboutTransporter] = useState("");

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

  const profileCompletion = useMemo(() => {
    const values = [
      transporterLegalName,
      tradingName,
      establishmentYear,
      panNumber,
      gstNumber,
      typeOfTransporter,
      group,
      referralCode,
      aboutTransporter,
    ];
    const filled = values.filter((value) => value.trim().length > 0).length;
    return Math.round((filled / TRACKED_FIELD_COUNT) * 100);
  }, [
    transporterLegalName,
    tradingName,
    establishmentYear,
    panNumber,
    gstNumber,
    typeOfTransporter,
    group,
    referralCode,
    aboutTransporter,
  ]);

  return (
    <div className="new-transporter">
      <div className="new-transporter__topbar">
        <div className="new-transporter__topbar-left">
          <h1>New Transporter</h1>
          <span className="new-transporter__completion">
            Profile Completion: <strong>{profileCompletion}%</strong>
          </span>
        </div>
        <Link to="/transporters" className="new-transporter__back">
          <FiArrowLeft aria-hidden /> Transporters
        </Link>
      </div>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Profile</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="transporterLegalName">
              Transporter Legal Name <span className="form-field__required">*</span>
            </label>
            <input
              id="transporterLegalName"
              type="text"
              className="form-field__control"
              placeholder="Name as per PAN / GST"
              value={transporterLegalName}
              onChange={(event) => setTransporterLegalName(event.target.value)}
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
            <span className="form-field__label">Type of Transporter</span>
            <SearchableSelect
              options={typeOfTransporterOptions}
              value={typeOfTransporter}
              onChange={setTypeOfTransporter}
              ariaLabel="Type of Transporter"
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
            <label className="form-field__label" htmlFor="referralCode">
              Referral Code
            </label>
            <input
              id="referralCode"
              type="text"
              className="form-field__control"
              placeholder="Enter Referral Code"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value)}
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
              value={aboutTransporter}
              onChange={(event) => setAboutTransporter(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Contact</h2>
        <div className="contact-address__subsections">
          <div className="new-contract__condition-card">
            <h3>Billing Communication Details</h3>
            <div className="new-contract__grid">
              <div className="form-field">
                <label className="form-field__label">
                  Address Line 01 <span className="form-field__required">*</span>
                </label>
                <input
                  type="text"
                  className="form-field__control"
                  placeholder="Address Line 01"
                  value={billingAddressLine1}
                  onChange={(event) => setBillingAddressLine1(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Address Line 02</label>
                <input
                  type="text"
                  className="form-field__control"
                  placeholder="Address Line 02"
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
                  placeholder="Select or type..."
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
                  placeholder="Valid Email"
                  value={billingEmail}
                  onChange={(event) => setBillingEmail(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">Website URL</label>
                <input
                  type="url"
                  className="form-field__control"
                  placeholder="Website URL"
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
                  placeholder="10-digit Mobile Number (Optional)"
                  value={primaryAlternativeContact}
                  onChange={(event) => setPrimaryAlternativeContact(event.target.value)}
                />
              </div>
            </div>
          </div>

        
          <AdditionalAddressSection />
            <AdditionalContactsSection />
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Bank Details</h2>
        <BankDetailsSection />
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Documents</h2>
        <DocumentsSection />
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Settings</h2>
        <ProfileSettingsSection />
      </section>

      <div className="new-contract__actions new-transporter__actions">
        <Link to="/transporters" className="new-contract__cancel">
          Cancel
        </Link>
        <button type="button" className="new-contract__submit">
          Create Transporter
        </button>
      </div>
    </div>
  );
};

export default Newtransporter;
