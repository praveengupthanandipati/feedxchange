import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import {
  useGetTruckDetailsByIdQuery,
  useAddTruckDetailsMutation,
  useUpdateTruckDetailsMutation,
} from "../../../../store/trucksApi";
import { useGetTransporterProfileSummaryQuery } from "../../../../store/transportersApi";
import {
  truckTypeOptions,
  makeOptions,
  capacityUnitOptions,
  fuelTypeOptions,
  ownershipTypeOptions,
  REGISTRATION_NUMBER_REGEX,
  MIN_MANUFACTURE_YEAR,
  normalizeRegistrationNumber,
} from "./truckNew.data";
import "../../../contracts/NewContract.scss";

const CURRENT_YEAR = new Date().getFullYear();

interface FormErrors {
  transporterProfileId?: string;
  truckNumber?: string;
  registrationNumber?: string;
  truckType?: string;
  make?: string;
  model?: string;
  manufactureYear?: string;
  capacity?: string;
  capacityUnit?: string;
  fuelType?: string;
  ownershipType?: string;
}

const TruckNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);

  const { data: editingTruck } = useGetTruckDetailsByIdQuery(editId ?? "", { skip: !editId });
  const [addTruckDetails] = useAddTruckDetailsMutation();
  const [updateTruckDetails] = useUpdateTruckDetailsMutation();

  const { data: transporters } = useGetTransporterProfileSummaryQuery();
  const transporterOptions = useMemo(
    () =>
      (transporters ?? []).map((transporter) => ({
        value: String(transporter.profileId),
        label: transporter.legalName,
      })),
    [transporters],
  );

  const [transporterProfileId, setTransporterProfileId] = useState("");
  const [truckNumber, setTruckNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [truckType, setTruckType] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [capacity, setCapacity] = useState("");
  const [capacityUnit, setCapacityUnit] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [ownershipType, setOwnershipType] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingTruck) return;
    setTransporterProfileId(String(editingTruck.profileId));
    setTruckNumber(editingTruck.truckNumber);
    setRegistrationNumber(editingTruck.registrationNumber);
    setTruckType(editingTruck.truckType);
    setMake(editingTruck.make);
    setModel(editingTruck.model);
    setManufactureYear(String(editingTruck.manufactureYear));
    setCapacity(String(editingTruck.capacity));
    setCapacityUnit(editingTruck.capacityUnit);
    setFuelType(editingTruck.fuelType);
    setOwnershipType(editingTruck.ownershipType);
  }, [editingTruck]);

  const handleSave = async () => {
    const trimmedTruckNumber = truckNumber.trim();
    const trimmedModel = model.trim();
    const normalizedRegistrationNumber = normalizeRegistrationNumber(registrationNumber);

    const nextErrors: FormErrors = {};

    if (!transporterProfileId) nextErrors.transporterProfileId = "Transporter is required.";

    if (!trimmedTruckNumber) nextErrors.truckNumber = "Truck Number is required.";
    else if (trimmedTruckNumber.length < 2) nextErrors.truckNumber = "Truck Number must be at least 2 characters.";

    if (!registrationNumber.trim()) nextErrors.registrationNumber = "Registration Number is required.";
    else if (!REGISTRATION_NUMBER_REGEX.test(normalizedRegistrationNumber))
      nextErrors.registrationNumber = "Enter a valid registration number (e.g. AP09TC1234).";

    if (!truckType) nextErrors.truckType = "Truck Type is required.";

    if (!make) nextErrors.make = "Make is required.";

    if (!trimmedModel) nextErrors.model = "Model is required.";

    if (!manufactureYear) nextErrors.manufactureYear = "Year of Manufacture is required.";
    else if (Number(manufactureYear) < MIN_MANUFACTURE_YEAR || Number(manufactureYear) > CURRENT_YEAR + 1)
      nextErrors.manufactureYear = `Enter a valid year (${MIN_MANUFACTURE_YEAR}-${CURRENT_YEAR + 1}).`;

    if (!capacity) nextErrors.capacity = "Capacity is required.";
    else if (Number(capacity) <= 0) nextErrors.capacity = "Enter a valid capacity.";

    if (!capacityUnit) nextErrors.capacityUnit = "Capacity Unit is required.";

    if (!fuelType) nextErrors.fuelType = "Fuel Type is required.";

    if (!ownershipType) nextErrors.ownershipType = "Ownership Type is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const truckDetails = {
      profileId: Number(transporterProfileId),
      truckNumber: trimmedTruckNumber,
      registrationNumber: normalizedRegistrationNumber,
      truckType,
      make,
      model: trimmedModel,
      manufactureYear: Number(manufactureYear),
      capacity: Number(capacity),
      capacityUnit,
      fuelType,
      ownershipType,
      actionPerformedBy: Number(localStorage.getItem("userId")) || 0,
    };

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (isEditMode && editingTruck) {
        await updateTruckDetails({ truckId: editingTruck.truckId, updateTruckDetails: truckDetails }).unwrap();
      } else {
        await addTruckDetails(truckDetails).unwrap();
      }
      navigate("/truck-management/transporters/truck-master");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save truck.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-contract">
      <div className="new-contract__topbar">
        <h1>{isEditMode ? "Edit Truck" : "New Truck"}</h1>
        <Link to="/truck-management/transporters/truck-master" className="new-contract__back">
          <FiArrowLeft aria-hidden /> Trucks List
        </Link>
      </div>

      {submitError && (
        <p className="new-contract__error" role="alert">
          {submitError}
        </p>
      )}

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">1. Truck Identification</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Transporter <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={transporterOptions}
              value={transporterProfileId}
              onChange={setTransporterProfileId}
              placeholder="Select Transporter"
              ariaLabel="Transporter"
            />
            {errors.transporterProfileId && (
              <p className="form-field__error">{errors.transporterProfileId}</p>
            )}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="truckNumber">
              Truck Number <span className="form-field__required">*</span>
            </label>
            <input
              id="truckNumber"
              type="text"
              className="form-field__control"
              placeholder="Enter Truck Number"
              value={truckNumber}
              onChange={(event) => setTruckNumber(event.target.value)}
            />
            {errors.truckNumber && <p className="form-field__error">{errors.truckNumber}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="registrationNumber">
              Registration Number <span className="form-field__required">*</span>
            </label>
            <input
              id="registrationNumber"
              type="text"
              className="form-field__control"
              placeholder="e.g. AP09 TC 1234"
              value={registrationNumber}
              onChange={(event) => setRegistrationNumber(event.target.value.toUpperCase())}
            />
            {errors.registrationNumber && <p className="form-field__error">{errors.registrationNumber}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Truck Type <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={truckTypeOptions}
              value={truckType}
              onChange={setTruckType}
              placeholder="Select Truck Type"
              ariaLabel="Truck Type"
            />
            {errors.truckType && <p className="form-field__error">{errors.truckType}</p>}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. Vehicle Specifications</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Make <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={makeOptions}
              value={make}
              onChange={setMake}
              placeholder="Select Make"
              ariaLabel="Make"
              allowCustom
            />
            {errors.make && <p className="form-field__error">{errors.make}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="model">
              Model <span className="form-field__required">*</span>
            </label>
            <input
              id="model"
              type="text"
              className="form-field__control"
              placeholder="Enter Model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
            {errors.model && <p className="form-field__error">{errors.model}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="manufactureYear">
              Year of Manufacture <span className="form-field__required">*</span>
            </label>
            <input
              id="manufactureYear"
              type="number"
              min={MIN_MANUFACTURE_YEAR}
              max={CURRENT_YEAR + 1}
              className="form-field__control"
              placeholder="Enter Year"
              value={manufactureYear}
              onChange={(event) => setManufactureYear(event.target.value)}
            />
            {errors.manufactureYear && <p className="form-field__error">{errors.manufactureYear}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="capacity">
              Capacity <span className="form-field__required">*</span>
            </label>
            <input
              id="capacity"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Capacity"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
            {errors.capacity && <p className="form-field__error">{errors.capacity}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Capacity Unit <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={capacityUnitOptions}
              value={capacityUnit}
              onChange={setCapacityUnit}
              placeholder="Select Capacity Unit"
              ariaLabel="Capacity Unit"
            />
            {errors.capacityUnit && <p className="form-field__error">{errors.capacityUnit}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Fuel Type <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={fuelTypeOptions}
              value={fuelType}
              onChange={setFuelType}
              placeholder="Select Fuel Type"
              ariaLabel="Fuel Type"
            />
            {errors.fuelType && <p className="form-field__error">{errors.fuelType}</p>}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Ownership</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Ownership Type <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={ownershipTypeOptions}
              value={ownershipType}
              onChange={setOwnershipType}
              placeholder="Select Ownership Type"
              ariaLabel="Ownership Type"
            />
            {errors.ownershipType && <p className="form-field__error">{errors.ownershipType}</p>}
          </div>
        </div>
      </section>

      <div className="new-contract__actions">
        <Link to="/truck-management/transporters/truck-master" className="new-contract__cancel">
          Cancel
        </Link>
        <button type="button" className="new-contract__submit" onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving…" : isEditMode ? "Save Changes" : "Save Truck"}
        </button>
      </div>
    </div>
  );
};

export default TruckNew;
