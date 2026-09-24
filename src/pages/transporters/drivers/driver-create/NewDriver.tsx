import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import {
  useGetDriverByIdQuery,
  useAddDriverMutation,
  useUpdateDriverMutation,
} from "../../../../store/driversApi";
import {
  bloodGroupOptions,
  buildDriverDetailsPayload,
  licenseTypeOptions,
  validateDriverForm,
  type DriverFormErrors,
} from "./driverNew.data";
import "../../../contracts/NewContract.scss";

function toDateInputValue(isoValue: string): string {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const NewDriver = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);

  const { data: editingDriver } = useGetDriverByIdQuery(editId ?? "", { skip: !editId });
  const [addDriver] = useAddDriverMutation();
  const [updateDriver] = useUpdateDriverMutation();

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

  const [errors, setErrors] = useState<DriverFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingDriver) return;
    setDriverName(editingDriver.driverName);
    setMobileNumber(editingDriver.mobileNumber);
    setDateOfBirth(toDateInputValue(editingDriver.dateOfBirth));
    setBloodGroup(editingDriver.bloodGroup);
    setExperienceYears(String(editingDriver.experienceYears));
    setAddress(editingDriver.address);
    setLicenseType(editingDriver.licenseType);
    setLicenseNumber(editingDriver.licenseNumber);
    setLicenseIssuedDate(toDateInputValue(editingDriver.licenseIssuedDate));
    setLicenseExpiryDate(toDateInputValue(editingDriver.licenseExpiryDate));
    setEmergencyContactName(editingDriver.emergencyContactName);
    setEmergencyContactNumber(editingDriver.emergencyContactNumber);
    setAadharNumber(editingDriver.aadharNumber);
    setPanNumber(editingDriver.panNumber);
  }, [editingDriver]);

  const handleSave = async () => {
    const values = {
      driverName,
      mobileNumber,
      dateOfBirth,
      bloodGroup,
      experienceYears,
      address,
      licenseType,
      licenseNumber,
      licenseIssuedDate,
      licenseExpiryDate,
      emergencyContactName,
      emergencyContactNumber,
      aadharNumber,
      panNumber,
    };

    const nextErrors = validateDriverForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const driverDetails = buildDriverDetailsPayload(values);

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (isEditMode && editingDriver) {
        await updateDriver({ driverId: editingDriver.driverId, updateDriver: driverDetails }).unwrap();
      } else {
        await addDriver(driverDetails).unwrap();
      }
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
        <h1>{isEditMode ? "Edit Driver" : "New Driver"}</h1>
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
          {submitting ? "Saving…" : isEditMode ? "Save Changes" : "Save Driver"}
        </button>
      </div>
    </div>
  );
};

export default NewDriver;
