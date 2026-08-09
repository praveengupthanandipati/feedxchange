import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiCheckCircle } from "react-icons/fi";
import { useGetTripByIdQuery, useCompleteTripMutation } from "../../../../store/truckTripApi";
import CompleteTripModal, { type CompleteTripValues } from "./CompleteTripModal";
import "../../../usermanagement/businessowners/BusinessView/BusinessOwnerDetail.scss";
import "../truck-trip-list/TruckTrip.scss";

interface DetailFieldProps {
  label: string;
  value: ReactNode;
}

const DetailField = ({ label, value }: DetailFieldProps) => (
  <div className="business-owner-detail-field">
    <span className="business-owner-detail-field__label">{label}</span>
    <p className="business-owner-detail-field__value">{value || "N/A"}</p>
  </div>
);

function formatDisplayDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}-${month}-${date.getFullYear()} ${hours}:${minutes} ${meridiem}`;
}

const TruckTripView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: trip, isLoading } = useGetTripByIdQuery(id ?? "", { skip: !id });
  const [completeTrip] = useCompleteTripMutation();

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const handleCompleteTrip = async (values: CompleteTripValues) => {
    if (!trip) return;

    const actionPerformedBy = Number(localStorage.getItem("userId")) || 0;

    setCompleting(true);
    setCompleteError(null);

    try {
      await completeTrip({
        tripId: trip.tripId,
        actualDistance: values.actualDistance,
        actualDuration: values.actualDuration,
        fuelConsumed: values.fuelConsumed,
        actionPerformedBy,
      }).unwrap();
      setCompleteModalOpen(false);
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : "Failed to complete trip.");
    } finally {
      setCompleting(false);
    }
  };

  if (!trip) {
    return (
      <div className="business-owner-detail">
        <Link to="/truck-management/transporters/truck-trips" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Truck Trips List
        </Link>
        <div className="business-owner-detail__card">
          <p>{isLoading ? "Loading truck trip…" : `No truck trip found for id "${id}".`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/truck-management/transporters/truck-trips" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Truck Trips List
      </Link>

      <div className="business-owner-detail__card">
        <div className="business-owner-detail__header">
          <div>
            <h1>Trip #{trip.tripId}</h1>
          </div>
          <div className="business-owner-detail__header-actions">
            {!trip.tripStatus?.toLowerCase().includes("complete") && (
              <button
                type="button"
                className="truck-trip-btn truck-trip-btn--primary"
                onClick={() => {
                  setCompleteError(null);
                  setCompleteModalOpen(true);
                }}
              >
                <FiCheckCircle aria-hidden /> Complete Trip
              </button>
            )}
            <button
              type="button"
              className="truck-trip-btn truck-trip-btn--outline"
              onClick={() => navigate(`/truck-management/transporters/truck-trips/new?id=${trip.tripId}`)}
            >
              <FiEdit3 aria-hidden /> Edit
            </button>
          </div>
        </div>

        <div className="business-owner-detail__main">
          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Trip Overview</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Truck Number" value={trip.truckNumber} />
              <DetailField label="Driver Name" value={trip.driverName} />
              <DetailField label="Business Profile" value={trip.businessProfileName} />
              <DetailField label="Status" value={trip.tripStatus} />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Route Details</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="From Address" value={trip.fromAddress} />
              <DetailField label="To Address" value={trip.toAddress} />
              <DetailField label="From Latitude" value={trip.fromLatitude} />
              <DetailField label="From Longitude" value={trip.fromLongitude} />
              <DetailField label="To Latitude" value={trip.toLatitude} />
              <DetailField label="To Longitude" value={trip.toLongitude} />
              <DetailField label="Distance" value={`${trip.distanceInKM} KM`} />
              <DetailField label="Estimated Duration" value={`${trip.estimatedDuration} mins`} />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Shipment Details</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Product Type" value={trip.productType} />
              <DetailField label="Weight" value={`${trip.weight} MT`} />
              <DetailField label="Freight Amount" value={`₹${trip.freightAmount.toLocaleString("en-IN")}`} />
              <DetailField label="Start Date & Time" value={formatDisplayDateTime(trip.startDate)} />
              <DetailField label="Expected End Date & Time" value={formatDisplayDateTime(trip.expectedEndDate)} />
            </div>
          </section>

          {trip.tripStatus?.toLowerCase().includes("complete") && (
            <section className="business-owner-detail__section">
              <h2 className="business-owner-detail__section-title">Completion Details</h2>
              <div className="business-owner-detail__grid">
                <DetailField label="Actual Distance" value={`${trip.actualDistance} KM`} />
                <DetailField label="Actual Duration" value={`${trip.actualDuration} mins`} />
                <DetailField label="Fuel Consumed" value={`${trip.fuelConsumed} L`} />
                <DetailField label="Actual End Date & Time" value={formatDisplayDateTime(trip.actualEndDate)} />
                <DetailField label="Trip Completed On" value={formatDisplayDateTime(trip.tripCompletedOn)} />
              </div>
            </section>
          )}

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Additional Notes</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Remarks" value={trip.remarks} />
            </div>
          </section>
        </div>
      </div>

      <CompleteTripModal
        open={completeModalOpen}
        tripNumber={trip.tripId}
        submitting={completing}
        error={completeError}
        onClose={() => setCompleteModalOpen(false)}
        onSave={handleCompleteTrip}
      />
    </div>
  );
};

export default TruckTripView;
