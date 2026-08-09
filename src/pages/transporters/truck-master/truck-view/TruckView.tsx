import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { useGetTruckDetailsByIdQuery } from "../../../../store/trucksApi";
import "../../../usermanagement/businessowners/BusinessView/BusinessOwnerDetail.scss";
import "../trucks-list/Trucks.scss";

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

const TruckView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: truck, isLoading, error } = useGetTruckDetailsByIdQuery(id ?? "", { skip: !id });

  if (!truck) {
    const errorDetail =
      error && "status" in error
        ? `${error.status} ${typeof error.data === "string" ? error.data : JSON.stringify(error.data)}`
        : null;

    return (
      <div className="business-owner-detail">
        <Link to="/truck-management/transporters/truck-master" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Trucks List
        </Link>
        <div className="business-owner-detail__card">
          <p>
            {isLoading
              ? "Loading truck…"
              : errorDetail
                ? `Failed to load truck "${id}": ${errorDetail}`
                : `No truck found for id "${id}".`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/truck-management/transporters/truck-master" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Trucks List
      </Link>

      <div className="business-owner-detail__card">
        <div className="business-owner-detail__header">
          <div>
            <h1>{truck.truckNumber}</h1>
          </div>
          <div className="business-owner-detail__header-actions">
            <button
              type="button"
              className="trucks-btn trucks-btn--outline"
              onClick={() => navigate(`/truck-management/transporters/truck-master/new?id=${truck.truckId}`)}
            >
              <FiEdit3 aria-hidden /> Edit
            </button>
          </div>
        </div>

        <div className="business-owner-detail__main">
          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Truck Identification</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Truck Number" value={truck.truckNumber} />
              <DetailField label="Registration Number" value={truck.registrationNumber} />
              <DetailField label="Truck Type" value={truck.truckType} />
              <DetailField label="Transporter" value={truck.profileLegalName} />
              <DetailField label="Status" value={truck.status} />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Vehicle Specifications</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Make" value={truck.make} />
              <DetailField label="Model" value={truck.model} />
              <DetailField label="Year of Manufacture" value={truck.manufactureYear} />
              <DetailField label="Capacity" value={`${truck.capacity} ${truck.capacityUnit}`} />
              <DetailField label="Fuel Type" value={truck.fuelType} />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Ownership</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Ownership Type" value={truck.ownershipType} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TruckView;
