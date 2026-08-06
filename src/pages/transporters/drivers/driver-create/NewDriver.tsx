import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import {
  bloodGroupOptions,
  licenseTypeOptions,
  MOBILE_NUMBER_REGEX,
  AADHAR_NUMBER_REGEX,
  PAN_NUMBER_REGEX,
  MIN_DRIVER_AGE,
  calculateAge,
  type NewDriverPayload,
} from "./driverNew.data";
import "../../../contracts/NewContract.scss";

interface FormErrors {
  driverName?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  experienceYears?: string;
  address?: string;
  licenseType?: string;
  licenseNumber?: string;
  licenseIssuedDate?: string;
  licenseExpiryDate?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  aadharNumber?: string;
  panNumber?: string;
}

const NewDriver = () => {
  const navigate = useNavigate();

  const [driverName, setDriverName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [address, setAddress] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssuedDate, setLicenseIssuedDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmedName = driverName.trim();
    const trimmedAddress = address.trim();
    const trimmedLicenseNumber = licenseNumber.trim();
    const trimmedEmergencyName = emergencyContactName.trim();

    const nextErrors: FormErrors = {};

    if (!trimmedName) nextErrors.driverName = "Driver Name is required.";
    else if (trimmedName.length < 3) nextErrors.driverName = "Driver Name must be at least 3 characters.";

    if (!mobileNumber) nextErrors.mobileNumber = "Mobile Number is required.";
    else if (!MOBILE_NUMBER_REGEX.test(mobileNumber))
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";

    if (!dateOfBirth) nextErrors.dateOfBirth = "Date of Birth is required.";
    else if (calculateAge(dateOfBirth) < MIN_DRIVER_AGE)
      nextErrors.dateOfBirth = `Driver must be at least ${MIN_DRIVER_AGE} years old.`;

    if (!bloodGroup) nextErrors.bloodGroup = "Blood Group is required.";

    if (!experienceYears) nextErrors.experienceYears = "Experience is required.";
    else if (Number(experienceYears) < 0 || Number(experienceYears) > 50)
      nextErrors.experienceYears = "Enter a valid number of years (0-50).";

    if (!trimmedAddress) nextErrors.address = "Address is required.";

    if (!licenseType) nextErrors.licenseType = "License Type is required.";

    if (!trimmedLicenseNumber) nextErrors.licenseNumber = "License Number is required.";

    if (!licenseIssuedDate) nextErrors.licenseIssuedDate = "License Issued Date is required.";
    else if (new Date(licenseIssuedDate) > new Date())
      nextErrors.licenseIssuedDate = "License Issued Date cannot be in the future.";

    if (!licenseExpiryDate) nextErrors.licenseExpiryDate = "License Expiry Date is required.";
    else if (licenseIssuedDate && new Date(licenseExpiryDate) <= new Date(licenseIssuedDate))
      nextErrors.licenseExpiryDate = "License Expiry Date must be after the Issued Date.";

    if (!trimmedEmergencyName) nextErrors.emergencyContactName = "Emergency Contact Name is required.";

    if (!emergencyContactNumber) nextErrors.emergencyContactNumber = "Emergency Contact Number is required.";
    else if (!MOBILE_NUMBER_REGEX.test(emergencyContactNumber))
      nextErrors.emergencyContactNumber = "Enter a valid 10-digit mobile number.";

    if (!aadharNumber) nextErrors.aadharNumber = "Aadhar Number is required.";
    else if (!AADHAR_NUMBER_REGEX.test(aadharNumber))
      nextErrors.aadharNumber = "Enter a valid 12-digit Aadhar number.";

    if (!panNumber) nextErrors.panNumber = "PAN Number is required.";
    else if (!PAN_NUMBER_REGEX.test(panNumber))
      nextErrors.panNumber = "Enter a valid PAN number (e.g. ABCDE1234F).";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: NewDriverPayload = {
      driverName: trimmedName,
      mobileNumber,
      licenseNumber: trimmedLicenseNumber,
      licenseExpiryDate: new Date(licenseExpiryDate).toISOString(),
      dateOfBirth: new Date(dateOfBirth).toISOString(),
      address: trimmedAddress,
      licenseType,
      licenseIssuedDate: new Date(licenseIssuedDate).toISOString(),
      emergencyContactName: trimmedEmergencyName,
      emergencyContactNumber,
      bloodGroup,
      experienceYears: Number(experienceYears),
      aadharNumber,
      panNumber,
      actionPerformedBy: Number(localStorage.getItem("userId")) || 0,
    };

    setSubmitting(true);
    setSubmitError(null);

    try {
      // TODO: call the real createDriver mutation once the backend exposes one.
      await Promise.resolve(payload);
      navigate("/truck-management/transporters/driver-master");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save driver.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-contract">
      <div className="new-contract__topbar">
        <h1>New Driver</h1>
        <Link to="/truck-management/transporters/driver-master" className="new-contract__back">
          <FiArrowLeft aria-hidden /> Drivers List
        </Link>
      </div>

      {submitError && (
        <p className="new-contract__error" role="alert">
          {submitError}
        </p>
      )}

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">1. Personal Details</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="driverName">
              Driver Name <span className="form-field__required">*</span>
            </label>
            <input
              id="driverName"
              type="text"
              className="form-field__control"
              placeholder="Enter Driver Name"
              value={driverName}
              onChange={(event) => setDriverName(event.target.value)}
            />
            {errors.driverName && <p className="form-field__error">{errors.driverName}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="mobileNumber">
              Mobile Number <span className="form-field__required">*</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="form-field__control"
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10))}
            />
            {errors.mobileNumber && <p className="form-field__error">{errors.mobileNumber}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="dateOfBirth">
              Date of Birth <span className="form-field__required">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              className="form-field__control"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
            />
            {errors.dateOfBirth && <p className="form-field__error">{errors.dateOfBirth}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Blood Group <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={bloodGroupOptions}
              value={bloodGroup}
              onChange={setBloodGroup}
              placeholder="Select Blood Group"
              ariaLabel="Blood Group"
            />
            {errors.bloodGroup && <p className="form-field__error">{errors.bloodGroup}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="experienceYears">
              Experience (Years) <span className="form-field__required">*</span>
            </label>
            <input
              id="experienceYears"
              type="number"
              min="0"
              max="50"
              className="form-field__control"
              placeholder="Enter years of experience"
              value={experienceYears}
              onChange={(event) => setExperienceYears(event.target.value)}
            />
            {errors.experienceYears && <p className="form-field__error">{errors.experienceYears}</p>}
          </div>

          <div className="form-field new-contract__grid--full">
            <label className="form-field__label" htmlFor="address">
              Address <span className="form-field__required">*</span>
            </label>
            <textarea
              id="address"
              className="form-field__control"
              placeholder="Enter full address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            {errors.address && <p className="form-field__error">{errors.address}</p>}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. License Details</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              License Type <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={licenseTypeOptions}
              value={licenseType}
              onChange={setLicenseType}
              placeholder="Select License Type"
              ariaLabel="License Type"
            />
            {errors.licenseType && <p className="form-field__error">{errors.licenseType}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="licenseNumber">
              License Number <span className="form-field__required">*</span>
            </label>
            <input
              id="licenseNumber"
              type="text"
              className="form-field__control"
              placeholder="Enter License Number"
              value={licenseNumber}
              onChange={(event) => setLicenseNumber(event.target.value)}
            />
            {errors.licenseNumber && <p className="form-field__error">{errors.licenseNumber}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="licenseIssuedDate">
              License Issued Date <span className="form-field__required">*</span>
            </label>
            <input
              id="licenseIssuedDate"
              type="date"
              className="form-field__control"
              value={licenseIssuedDate}
              onChange={(event) => setLicenseIssuedDate(event.target.value)}
            />
            {errors.licenseIssuedDate && <p className="form-field__error">{errors.licenseIssuedDate}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="licenseExpiryDate">
              License Expiry Date <span className="form-field__required">*</span>
            </label>
            <input
              id="licenseExpiryDate"
              type="date"
              className="form-field__control"
              value={licenseExpiryDate}
              onChange={(event) => setLicenseExpiryDate(event.target.value)}
            />
            {errors.licenseExpiryDate && <p className="form-field__error">{errors.licenseExpiryDate}</p>}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Emergency Contact</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="emergencyContactName">
              Emergency Contact Name <span className="form-field__required">*</span>
            </label>
            <input
              id="emergencyContactName"
              type="text"
              className="form-field__control"
              placeholder="Enter Emergency Contact Name"
              value={emergencyContactName}
              onChange={(event) => setEmergencyContactName(event.target.value)}
            />
            {errors.emergencyContactName && (
              <p className="form-field__error">{errors.emergencyContactName}</p>
            )}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="emergencyContactNumber">
              Emergency Contact Number <span className="form-field__required">*</span>
            </label>
            <input
              id="emergencyContactNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="form-field__control"
              placeholder="10-digit mobile number"
              value={emergencyContactNumber}
              onChange={(event) =>
                setEmergencyContactNumber(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
            {errors.emergencyContactNumber && (
              <p className="form-field__error">{errors.emergencyContactNumber}</p>
            )}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">4. Identity Documents</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="aadharNumber">
              Aadhar Number <span className="form-field__required">*</span>
            </label>
            <input
              id="aadharNumber"
              type="text"
              inputMode="numeric"
              maxLength={12}
              className="form-field__control"
              placeholder="12-digit Aadhar number"
              value={aadharNumber}
              onChange={(event) => setAadharNumber(event.target.value.replace(/\D/g, "").slice(0, 12))}
            />
            {errors.aadharNumber && <p className="form-field__error">{errors.aadharNumber}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="panNumber">
              PAN Number <span className="form-field__required">*</span>
            </label>
            <input
              id="panNumber"
              type="text"
              maxLength={10}
              className="form-field__control"
              placeholder="ABCDE1234F"
              value={panNumber}
              onChange={(event) => setPanNumber(event.target.value.toUpperCase().slice(0, 10))}
            />
            {errors.panNumber && <p className="form-field__error">{errors.panNumber}</p>}
          </div>
        </div>
      </section>

      <div className="new-contract__actions">
        <Link to="/truck-management/transporters/driver-master" className="new-contract__cancel">
          Cancel
        </Link>
        <button type="button" className="new-contract__submit" onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving…" : "Save Driver"}
        </button>
      </div>
    </div>
  );
};

export default NewDriver;
