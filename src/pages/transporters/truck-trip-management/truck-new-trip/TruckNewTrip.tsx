import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import { useGetBusinessProfileSummaryQuery } from "../../../../store/businessProfilesApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../../store/trucksApi";
import { useGetAllActiveDriversQuery } from "../../../../store/driversApi";
import { useGetProductsQuery } from "../../../../store/productsApi";
import {
  useGetTripByIdQuery,
  useAddTripMutation,
  useUpdateTripMutation,
} from "../../../../store/truckTripApi";
import { MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE } from "./truckNewTrip.data";
import "../../../contracts/NewContract.scss";

function toDateTimeInputValue(isoValue: string): string {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}T${hours}:${minutes}`;
}

interface FormErrors {
  truckId?: string;
  driverId?: string;
  businessProfileId?: string;
  fromAddress?: string;
  toAddress?: string;
  fromLatitude?: string;
  fromLongitude?: string;
  toLatitude?: string;
  toLongitude?: string;
  distanceInKM?: string;
  estimatedDuration?: string;
  productType?: string;
  weight?: string;
  startDate?: string;
  expectedEndDate?: string;
  freightAmount?: string;
}

function isValidLatitude(value: string): boolean {
  const num = Number(value);
  return Number.isFinite(num) && num >= MIN_LATITUDE && num <= MAX_LATITUDE;
}

function isValidLongitude(value: string): boolean {
  const num = Number(value);
  return Number.isFinite(num) && num >= MIN_LONGITUDE && num <= MAX_LONGITUDE;
}

const TruckNewTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);

  const { data: editingTrip } = useGetTripByIdQuery(editId ?? "", { skip: !editId });
  const [addTrip] = useAddTripMutation();
  const [updateTrip] = useUpdateTripMutation();

  const { data: trucks = [] } = useGetAllActiveTruckDetailsQuery();
  const truckOptions = trucks.map((truck) => ({
    value: String(truck.truckId),
    label: `${truck.truckNumber} (${truck.registrationNumber})`,
  }));

  const { data: drivers = [] } = useGetAllActiveDriversQuery();
  const driverOptions = drivers.map((driver) => ({
    value: String(driver.driverId),
    label: `${driver.driverName} — ${driver.mobileNumber}`,
  }));

  const { data: products = [] } = useGetProductsQuery();
  const productTypeOptions = Array.from(new Set(products.map((product) => product.name).filter(Boolean))).map(
    (name) => ({ value: name as string, label: name as string }),
  );

  const { data: businessProfiles = [] } = useGetBusinessProfileSummaryQuery();
  const businessProfileOptions = businessProfiles.map((profile) => ({
    value: String(profile.profileId),
    label: profile.tradingName || profile.legalName,
  }));

  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [businessProfileId, setBusinessProfileId] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromLatitude, setFromLatitude] = useState("");
  const [fromLongitude, setFromLongitude] = useState("");
  const [toLatitude, setToLatitude] = useState("");
  const [toLongitude, setToLongitude] = useState("");
  const [distanceInKM, setDistanceInKM] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [productType, setProductType] = useState("");
  const [weight, setWeight] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [freightAmount, setFreightAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingTrip) return;
    setTruckId(String(editingTrip.truckId));
    setDriverId(String(editingTrip.driverId));
    setBusinessProfileId(String(editingTrip.businessProfileId));
    setFromAddress(editingTrip.fromAddress);
    setToAddress(editingTrip.toAddress);
    setFromLatitude(String(editingTrip.fromLatitude));
    setFromLongitude(String(editingTrip.fromLongitude));
    setToLatitude(String(editingTrip.toLatitude));
    setToLongitude(String(editingTrip.toLongitude));
    setDistanceInKM(String(editingTrip.distanceInKM));
    setEstimatedDuration(String(editingTrip.estimatedDuration));
    setProductType(editingTrip.productType);
    setWeight(String(editingTrip.weight));
    setStartDate(toDateTimeInputValue(editingTrip.startDate));
    setExpectedEndDate(toDateTimeInputValue(editingTrip.expectedEndDate));
    setFreightAmount(String(editingTrip.freightAmount));
    setRemarks(editingTrip.remarks);
  }, [editingTrip]);

  const handleSave = async () => {
    const trimmedFromAddress = fromAddress.trim();
    const trimmedToAddress = toAddress.trim();

    const nextErrors: FormErrors = {};

    if (!truckId) nextErrors.truckId = "Truck is required.";
    if (!driverId) nextErrors.driverId = "Driver is required.";
    if (!businessProfileId) nextErrors.businessProfileId = "Business Profile is required.";

    if (!trimmedFromAddress) nextErrors.fromAddress = "From Address is required.";
    else if (trimmedFromAddress.length < 5) nextErrors.fromAddress = "Enter a more complete address.";

    if (!trimmedToAddress) nextErrors.toAddress = "To Address is required.";
    else if (trimmedToAddress.length < 5) nextErrors.toAddress = "Enter a more complete address.";

    if (!fromLatitude) nextErrors.fromLatitude = "From Latitude is required.";
    else if (!isValidLatitude(fromLatitude)) nextErrors.fromLatitude = "Enter a valid latitude (-90 to 90).";

    if (!fromLongitude) nextErrors.fromLongitude = "From Longitude is required.";
    else if (!isValidLongitude(fromLongitude))
      nextErrors.fromLongitude = "Enter a valid longitude (-180 to 180).";

    if (!toLatitude) nextErrors.toLatitude = "To Latitude is required.";
    else if (!isValidLatitude(toLatitude)) nextErrors.toLatitude = "Enter a valid latitude (-90 to 90).";

    if (!toLongitude) nextErrors.toLongitude = "To Longitude is required.";
    else if (!isValidLongitude(toLongitude)) nextErrors.toLongitude = "Enter a valid longitude (-180 to 180).";

    if (!distanceInKM) nextErrors.distanceInKM = "Distance is required.";
    else if (Number(distanceInKM) <= 0) nextErrors.distanceInKM = "Enter a valid distance.";

    if (!estimatedDuration) nextErrors.estimatedDuration = "Estimated Duration is required.";
    else if (Number(estimatedDuration) <= 0) nextErrors.estimatedDuration = "Enter a valid duration.";

    if (!productType) nextErrors.productType = "Product Type is required.";

    if (!weight) nextErrors.weight = "Weight is required.";
    else if (Number(weight) <= 0) nextErrors.weight = "Enter a valid weight.";

    if (!startDate) nextErrors.startDate = "Start Date & Time is required.";

    if (!expectedEndDate) nextErrors.expectedEndDate = "Expected End Date & Time is required.";
    else if (startDate && new Date(expectedEndDate).getTime() <= new Date(startDate).getTime())
      nextErrors.expectedEndDate = "Expected End must be after Start Date & Time.";

    if (!freightAmount) nextErrors.freightAmount = "Freight Amount is required.";
    else if (Number(freightAmount) <= 0) nextErrors.freightAmount = "Enter a valid freight amount.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const tripDetails = {
      truckId: Number(truckId),
      driverId: Number(driverId),
      businessProfileId: Number(businessProfileId),
      fromAddress: trimmedFromAddress,
      toAddress: trimmedToAddress,
      fromLatitude: Number(fromLatitude),
      fromLongitude: Number(fromLongitude),
      toLatitude: Number(toLatitude),
      toLongitude: Number(toLongitude),
      distanceInKM: Number(distanceInKM),
      estimatedDuration: Number(estimatedDuration),
      productType,
      weight: Number(weight),
      startDate: new Date(startDate).toISOString(),
      expectedEndDate: new Date(expectedEndDate).toISOString(),
      freightAmount: Number(freightAmount),
      remarks: remarks.trim(),
      actionPerformedBy: Number(localStorage.getItem("userId")) || 0,
    };

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (isEditMode && editingTrip) {
        await updateTrip({ tripId: editingTrip.tripId, updateTrip: tripDetails }).unwrap();
      } else {
        await addTrip(tripDetails).unwrap();
      }
      navigate("/truck-management/transporters/truck-trips");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save truck trip.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-contract">
      <div className="new-contract__topbar">
        <h1>{isEditMode ? "Edit Truck Trip" : "New Truck Trip"}</h1>
        <Link to="/truck-management/transporters/truck-trips" className="new-contract__back">
          <FiArrowLeft aria-hidden /> Truck Trips List
        </Link>
      </div>

      {submitError && (
        <p className="new-contract__error" role="alert">
          {submitError}
        </p>
      )}

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">1. Trip Assignment</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Truck <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={truckOptions}
              value={truckId}
              onChange={setTruckId}
              placeholder="Select Truck"
              ariaLabel="Truck"
            />
            {errors.truckId && <p className="form-field__error">{errors.truckId}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Driver <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={driverOptions}
              value={driverId}
              onChange={setDriverId}
              placeholder="Select Driver"
              ariaLabel="Driver"
            />
            {errors.driverId && <p className="form-field__error">{errors.driverId}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Business Profile <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={businessProfileOptions}
              value={businessProfileId}
              onChange={setBusinessProfileId}
              placeholder="Select Business Profile"
              ariaLabel="Business Profile"
            />
            {errors.businessProfileId && <p className="form-field__error">{errors.businessProfileId}</p>}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. Route Details</h2>
        <div className="new-contract__grid">
          <div className="form-field new-contract__grid--full">
            <label className="form-field__label" htmlFor="fromAddress">
              From Address <span className="form-field__required">*</span>
            </label>
            <textarea
              id="fromAddress"
              className="form-field__control"
              placeholder="Enter Pickup Address"
              value={fromAddress}
              onChange={(event) => setFromAddress(event.target.value)}
            />
            {errors.fromAddress && <p className="form-field__error">{errors.fromAddress}</p>}
          </div>

          <div className="form-field new-contract__grid--full">
            <label className="form-field__label" htmlFor="toAddress">
              To Address <span className="form-field__required">*</span>
            </label>
            <textarea
              id="toAddress"
              className="form-field__control"
              placeholder="Enter Drop Address"
              value={toAddress}
              onChange={(event) => setToAddress(event.target.value)}
            />
            {errors.toAddress && <p className="form-field__error">{errors.toAddress}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="fromLatitude">
              From Latitude <span className="form-field__required">*</span>
            </label>
            <input
              id="fromLatitude"
              type="number"
              step="any"
              min={MIN_LATITUDE}
              max={MAX_LATITUDE}
              className="form-field__control"
              placeholder="e.g. 16.7548"
              value={fromLatitude}
              onChange={(event) => setFromLatitude(event.target.value)}
            />
            {errors.fromLatitude && <p className="form-field__error">{errors.fromLatitude}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="fromLongitude">
              From Longitude <span className="form-field__required">*</span>
            </label>
            <input
              id="fromLongitude"
              type="number"
              step="any"
              min={MIN_LONGITUDE}
              max={MAX_LONGITUDE}
              className="form-field__control"
              placeholder="e.g. 81.6841"
              value={fromLongitude}
              onChange={(event) => setFromLongitude(event.target.value)}
            />
            {errors.fromLongitude && <p className="form-field__error">{errors.fromLongitude}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="toLatitude">
              To Latitude <span className="form-field__required">*</span>
            </label>
            <input
              id="toLatitude"
              type="number"
              step="any"
              min={MIN_LATITUDE}
              max={MAX_LATITUDE}
              className="form-field__control"
              placeholder="e.g. 16.0894"
              value={toLatitude}
              onChange={(event) => setToLatitude(event.target.value)}
            />
            {errors.toLatitude && <p className="form-field__error">{errors.toLatitude}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="toLongitude">
              To Longitude <span className="form-field__required">*</span>
            </label>
            <input
              id="toLongitude"
              type="number"
              step="any"
              min={MIN_LONGITUDE}
              max={MAX_LONGITUDE}
              className="form-field__control"
              placeholder="e.g. 80.1642"
              value={toLongitude}
              onChange={(event) => setToLongitude(event.target.value)}
            />
            {errors.toLongitude && <p className="form-field__error">{errors.toLongitude}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="distanceInKM">
              Distance (KM) <span className="form-field__required">*</span>
            </label>
            <input
              id="distanceInKM"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Distance"
              value={distanceInKM}
              onChange={(event) => setDistanceInKM(event.target.value)}
            />
            {errors.distanceInKM && <p className="form-field__error">{errors.distanceInKM}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="estimatedDuration">
              Estimated Duration (mins) <span className="form-field__required">*</span>
            </label>
            <input
              id="estimatedDuration"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Duration"
              value={estimatedDuration}
              onChange={(event) => setEstimatedDuration(event.target.value)}
            />
            {errors.estimatedDuration && <p className="form-field__error">{errors.estimatedDuration}</p>}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Shipment Details</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Product Type <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={productTypeOptions}
              value={productType}
              onChange={setProductType}
              placeholder="Select Product Type"
              ariaLabel="Product Type"
              allowCustom
            />
            {errors.productType && <p className="form-field__error">{errors.productType}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="weight">
              Weight (MT) <span className="form-field__required">*</span>
            </label>
            <input
              id="weight"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Weight"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
            {errors.weight && <p className="form-field__error">{errors.weight}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="freightAmount">
              Freight Amount (₹) <span className="form-field__required">*</span>
            </label>
            <input
              id="freightAmount"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Freight Amount"
              value={freightAmount}
              onChange={(event) => setFreightAmount(event.target.value)}
            />
            {errors.freightAmount && <p className="form-field__error">{errors.freightAmount}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="startDate">
              Start Date &amp; Time <span className="form-field__required">*</span>
            </label>
            <input
              id="startDate"
              type="datetime-local"
              className="form-field__control"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            {errors.startDate && <p className="form-field__error">{errors.startDate}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="expectedEndDate">
              Expected End Date &amp; Time <span className="form-field__required">*</span>
            </label>
            <input
              id="expectedEndDate"
              type="datetime-local"
              className="form-field__control"
              value={expectedEndDate}
              onChange={(event) => setExpectedEndDate(event.target.value)}
            />
            {errors.expectedEndDate && <p className="form-field__error">{errors.expectedEndDate}</p>}
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">4. Additional Notes</h2>
        <div className="new-contract__grid">
          <div className="form-field new-contract__grid--full">
            <label className="form-field__label" htmlFor="remarks">
              Remarks
            </label>
            <textarea
              id="remarks"
              className="form-field__control"
              placeholder="Enter any remarks (optional)"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="new-contract__actions">
        <Link to="/truck-management/transporters/truck-trips" className="new-contract__cancel">
          Cancel
        </Link>
        <button type="button" className="new-contract__submit" onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving…" : isEditMode ? "Save Changes" : "Save Trip"}
        </button>
      </div>
    </div>
  );
};

export default TruckNewTrip;
