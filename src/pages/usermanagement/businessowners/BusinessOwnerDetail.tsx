import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { businessOwners } from "./businessOwners.data";
import "./Businessowners.scss";
import "./BusinessOwnerDetail.scss";

interface DetailFieldProps {
  label: string;
  value: ReactNode;
}

const DetailField = ({ label, value }: DetailFieldProps) => (
  <div className="business-owner-detail-field">
    <span className="business-owner-detail-field__label">{label}</span>
    <p className="business-owner-detail-field__value">{value || "—"}</p>
  </div>
);

const BusinessOwnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const owner = businessOwners.find((row) => row.id === id);

  return (
    <div className="business-owner-detail">
      <Link to="/business-owners" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Business Owners
      </Link>

      {!owner ? (
        <div className="business-owner-detail__card">
          <p>No business owner found for id "{id}".</p>
        </div>
      ) : (
        <div className="business-owner-detail__card">
          <div className="business-owner-detail__header">
            <h1>{owner.companyName}</h1>
            <span
              className={`business-owners__status business-owners__status--${owner.status.toLowerCase()}`}
            >
              {owner.status}
            </span>
          </div>

          <div className="business-owner-detail__grid">
            <DetailField label="Business Type" value={owner.businessType} />
            <DetailField label="Location" value={owner.location} />
            <DetailField
              label="Mobile Number"
              value={
                <a href={`tel:${owner.mobile}`} className="business-owners__link">
                  {owner.mobile}
                </a>
              }
            />
            <DetailField label="State" value={owner.state} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOwnerDetail;
