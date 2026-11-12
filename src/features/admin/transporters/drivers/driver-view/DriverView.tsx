import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PenLineIcon, SendIcon } from "../../../../../shared/components/icon";
import { useGetDriverByIdQuery } from "../../../../../core/store/driversApi";
import "../../../usermanagement/businessowners/BusinessView/BusinessOwnerDetail.scss";
import "../drivers-list/Drivers.scss";

import Can from "../../../../../core/auth/Can";
import SendMessageModal from "../../../../../shared/notifications/SendMessageModal";
import { licenseIssuedDateOf, realLicenseNumber } from "../drivers-list/drivers.columns";

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

function formatDisplayDate(value: string | null | undefined): string {
  // An empty date (null, or the API's 0001-01-01) is shown as empty, not as 01-01-1970.
  if (!value || value.startsWith("0001")) return "";
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

  const { data: driver, isLoading, isError, error: loadError } = useGetDriverByIdQuery(id ?? "", { skip: !id });
  // A real 404 means there is no such driver; any other failure is a load error.
  const loadFailed = isError && !(loadError && "status" in loadError && loadError.status === 404);

  if (!driver) {
    return (
      <div className="business-owner-detail">
        <Link to="/admin/truck-management/transporters/driver-master" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Drivers List
        </Link>
        <div className="business-owner-detail__card">
          <p>
            {isLoading
              ? "Loading driver…"
              : loadFailed
                ? "Could not load this driver. Please try again."
                : `No driver found for id "${id}".`}
          </p>
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
              <DetailField label="Experience" value={driver.experienceYears != null ? `${driver.experienceYears} yrs` : ""} />
              <DetailField label="Status" value={driver.status} />
              <DetailField label="Address" value={driver.address} />
            </div>
          </section>

          <section className="business-owner-detail__section">
            <h2 className="business-owner-detail__section-title">License Details</h2>
            <div className="business-owner-detail__grid">
              <DetailField label="License Type" value={driver.licenseType} />
              <DetailField label="License Number" value={realLicenseNumber(driver.licenseNumber)} />
              {/* Only with a licence on file: a driver added from Add Instant Truck has a default date here. */}
              <DetailField label="License Issued Date" value={licenseIssuedDateOf(driver)} />
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
