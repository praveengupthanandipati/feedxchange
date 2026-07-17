import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import DocumentsSection from "./DocumentsSection";
import ProfileSettingsSection from "./ProfileSettingsSection";
import {
  cityOptions,
  districtOptions,
  stateOptions,
  productOptions,
  regionOptions,
  commissionStructureOptions,
  paymentFrequencyOptions,
  generatePromoterCode,
} from "./promoterNew.data";
import "../../../contracts/NewContract.scss";
import "../../businessowners/BusinessNew/Newbusiness.scss";
import "./Promoternew.scss";

const Promoternew = () => {
  const [promoterCode] = useState(() => generatePromoterCode());
  const [promoterName, setPromoterName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [designation, setDesignation] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  const [associatedProducts, setAssociatedProducts] = useState("");
  const [region, setRegion] = useState("");

  const [commissionStructure, setCommissionStructure] = useState("");
  const [commissionRateValue, setCommissionRateValue] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");

  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [remarks, setRemarks] = useState("");

  return (
    <div className="new-promoter">
      <div className="new-promoter__topbar">
        <h1>New Promoter</h1>
        <Link to="/promoters" className="new-promoter__back">
          <FiArrowLeft aria-hidden /> Promoters
        </Link>
      </div>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Basic Information:</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Promoter Code
              <InfoTooltip text="Auto-generated unique code used to track this promoter's referrals." />
            </span>
            <input
              type="text"
              className="form-field__control"
              value={promoterCode}
              onChange={() => undefined}
            />
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
              value={promoterName}
              onChange={(event) => setPromoterName(event.target.value)}
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
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
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
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
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
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
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
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
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
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
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
              value={addressLine2}
              onChange={(event) => setAddressLine2(event.target.value)}
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
              value={landmark}
              onChange={(event) => setLandmark(event.target.value)}
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
              value={pinCode}
              onChange={(event) => setPinCode(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              City <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={cityOptions}
              value={city}
              onChange={setCity}
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
              value={district}
              onChange={setDistrict}
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
              value={state}
              onChange={setState}
              placeholder="State"
              ariaLabel="State"
              allowCustom
            />
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Association/Region</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">Associated Products</span>
            <SearchableSelect
              options={productOptions}
              value={associatedProducts}
              onChange={setAssociatedProducts}
              placeholder="Products"
              ariaLabel="Associated Products"
              allowCustom
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Geographic Region of Operation</span>
            <SearchableSelect
              options={regionOptions}
              value={region}
              onChange={setRegion}
              placeholder="Regions"
              ariaLabel="Geographic Region of Operation"
              allowCustom
            />
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">Commission &amp; Payment Details:</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">Commission Structure</span>
            <SearchableSelect
              options={commissionStructureOptions}
              value={commissionStructure}
              onChange={setCommissionStructure}
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
              value={commissionRateValue}
              onChange={(event) => setCommissionRateValue(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Payment Frequency</span>
            <SearchableSelect
              options={paymentFrequencyOptions}
              value={paymentFrequency}
              onChange={setPaymentFrequency}
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
            value={termsAndConditions}
            onChange={(event) => setTermsAndConditions(event.target.value)}
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
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
          />
        </div>
      </section>

      <section className="new-contract__section">
        <DocumentsSection />
      </section>

      <section className="new-contract__section">
        <ProfileSettingsSection />
      </section>

      <div className="new-contract__actions new-promoter__actions">
        <Link to="/promoters" className="new-contract__cancel">
          Cancel
        </Link>
        <button type="button" className="new-contract__submit">
          Create Promoter
        </button>
      </div>
    </div>
  );
};

export default Promoternew;
