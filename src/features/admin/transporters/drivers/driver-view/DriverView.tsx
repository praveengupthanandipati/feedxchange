import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PenLineIcon, SendIcon } from "../../../../../shared/components/icon";
import { useGetDriverByIdQuery } from "../../../../../core/store/driversApi";
import "../../../usermanagement/businessowners/BusinessView/BusinessOwnerDetail.scss";
import "../drivers-list/Drivers.scss";

import Can from "../../../../../core/auth/Can";
import SendMessageModal from "../../../../../shared/notifications/SendMessageModal";

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

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

const DriverView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageOpen, setMessageOpen] = useState(false);

  const { data: driver, isLoading } = useGetDriverByIdQuery(id ?? "", { skip: !id });

  if (!driver) {
    return (
      <div className="business-owner-detail">
        <Link to="/admin/truck-management/transporters/driver-master" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Drivers List
        </Link>
        <div className="business-owner-detail__card">
          <p>{isLoading ? "Loading driver…" : `No driver found for id "${id}".`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/admin/truck-management/transporters/driver-master" className="business-owner-detail__back">
        <ArrowLeftIcon aria-hidden /> Back to Drivers List
      </Link>

      <div className="business-owner-detail__card">
        <div className="business-owner-detail__header">
          <div>
            <h1>{driver.driverName}</h1>
            <span className="drivers__bloodgroup">{driver.bloodGroup}</span>
          </div>
          <div className="business-owner-detail__header-actions">
            <Can any={["drivers-master.manage"]}>
              <button
                type="button"
                className="drivers-btn drivers-btn--outline"
                onClick={() =>
                  navigate(`/admin/truck-management/transporters/driver-master/new?id=${driver.driverId}`)
                }
              >
                <PenLineIcon aria-hidden /> Edit
              </button>
            </Can>
            <Can any={["notifications.send"]}>
              <button type="button" className="drivers-btn drivers-btn--primary" onClick={() => setMessageOpen(true)}>
                <SendIcon aria-hidden /> Send Message
              </button>
            </Can>
          </div>
        </div>

        <div className="business-owner-detail__main">
          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Personal Details</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Driver Name" value={driver.driverName} />
              <DetailField
                label="Mobile Number"
                value={
                  <a href={`tel:${driver.mobileNumber}`} className="drivers__link">
                    {driver.mobileNumber}
                  </a>
                }
              />
              <DetailField label="Date of Birth" value={formatDisplayDate(driver.dateOfBirth)} />
              <DetailField label="Blood Group" value={driver.bloodGroup} />
              <DetailField label="Experience" value={`${driver.experienceYears} yrs`} />
              <DetailField label="Status" value={driver.status} />
              <DetailField label="Address" value={driver.address} />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">License Details</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="License Type" value={driver.licenseType} />
              <DetailField label="License Number" value={driver.licenseNumber} />
              <DetailField label="License Issued Date" value={formatDisplayDate(driver.licenseIssuedDate)} />
              <DetailField label="License Expiry Date" value={formatDisplayDate(driver.licenseExpiryDate)} />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Emergency Contact</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Emergency Contact Name" value={driver.emergencyContactName} />
              <DetailField
                label="Emergency Contact Number"
                value={
                  <a href={`tel:${driver.emergencyContactNumber}`} className="drivers__link">
                    {driver.emergencyContactNumber}
                  </a>
                }
              />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">Identity Documents</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="Aadhar Number" value={driver.aadharNumber} />
              <DetailField label="PAN Number" value={driver.panNumber} />
            </div>
          </section>
        </div>
      </div>

      <SendMessageModal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        driverId={driver.driverId}
        title={`Send message to ${driver.driverName}`}
      />
    </div>
  );
};

export default DriverView;
