import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useGetBusinessProfileSummaryQuery } from "../../../store/businessProfilesApi";
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
  const { data, isLoading } = useGetBusinessProfileSummaryQuery();
  const owner = data?.find((row) => String(row.profileId) === id);

  return (
    <div className="business-owner-detail">
      <Link to="/business-owners" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Business Owners
      </Link>

      {isLoading ? (
        <div className="business-owner-detail__card">
          <p>Loading business owner…</p>
        </div>
      ) : !owner ? (
        <div className="business-owner-detail__card">
          <p>No business owner found for id "{id}".</p>
        </div>
      ) : (
        <div className="business-owner-detail__card">
          <div className="business-owner-detail__header">
            <h1>{owner.tradingName}</h1>
            <span
              className={`business-owners__status business-owners__status--${owner.status.toLowerCase()}`}
            >
              {owner.status}
            </span>
          </div>

          <div className="business-owner-detail__grid">
            <DetailField label="Legal Name" value={owner.legalName} />
            <DetailField label="Profile Type" value={owner.profileTypeName} />
            <DetailField label="State" value={owner.stateName} />
            <DetailField label="Location" value={owner.location} />
            <DetailField label="Business Type" value={owner.businessTypeName} />
            <DetailField label="Business Sub Type" value={owner.businessSubTypeName} />
            <DetailField label="Year of Establishment" value={owner.yearOfEstablishment} />
            <DetailField label="PAN Number" value={owner.panNumber} />
            <DetailField label="GST Number" value={owner.gstNumber} />
            <DetailField
              label="Email"
              value={
                <a href={`mailto:${owner.emailId}`} className="business-owners__link">
                  {owner.emailId}
                </a>
              }
            />
            <DetailField
              label="Mobile Number"
              value={
                <a href={`tel:${owner.mobileNumber}`} className="business-owners__link">
                  {owner.mobileNumber}
                </a>
              }
            />
            <DetailField
              label="Alternative Contact Number"
              value={
                owner.alternativeContactNumber && (
                  <a href={`tel:${owner.alternativeContactNumber}`} className="business-owners__link">
                    {owner.alternativeContactNumber}
                  </a>
                )
              }
            />
            <DetailField
              label="Website"
              value={
                owner.websiteUrl && (
                  <a
                    href={owner.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="business-owners__link"
                  >
                    {owner.websiteUrl}
                  </a>
                )
              }
            />
            <DetailField label="Buy Charge" value={owner.buyCharge} />
            <DetailField label="Sell Charge" value={owner.sellCharge} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOwnerDetail;
