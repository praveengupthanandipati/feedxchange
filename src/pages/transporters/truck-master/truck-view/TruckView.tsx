import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { MOCK_TRUCKS } from "../trucks-list/trucks.mock";
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

  // TODO: replace with a real useGetTruckByIdQuery once the backend exposes one; see trucks.mock.ts.
  const truck = useMemo(() => MOCK_TRUCKS.find((row) => String(row.profileId) === id), [id]);

  if (!truck) {
    return (
      <div className="business-owner-detail">
        <Link to="/truck-management/transporters/truck-master" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Trucks List
        </Link>
        <div className="business-owner-detail__card">
          <p>No truck found for id "{id}".</p>
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
              onClick={() =>
                // TODO: point at the real edit route once the Truck edit page is built.
                navigate(`/truck-management/transporters/truck-master/edit/${truck.profileId}`)
              }
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
