import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiSend } from "react-icons/fi";
import { MOCK_DRIVERS } from "../drivers-list/drivers.mock";
import "../../../usermanagement/businessowners/BusinessView/BusinessOwnerDetail.scss";
import "../drivers-list/Drivers.scss";

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
  const [message, setMessage] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // TODO: replace with a real useGetDriverByIdQuery once the backend exposes one; see drivers.mock.ts.
  const driver = useMemo(() => MOCK_DRIVERS.find((row) => String(row.driverId) === id), [id]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const resetMessage = () => setMessage("");
    el.addEventListener("hidden.bs.modal", resetMessage);
    return () => el.removeEventListener("hidden.bs.modal", resetMessage);
  }, []);

  const handleSendMessage = () => {
    // TODO: call the real send-message endpoint once the backend exposes one.
  };

  if (!driver) {
    return (
      <div className="business-owner-detail">
        <Link to="/truck-management/transporters/driver-master" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Drivers List
        </Link>
        <div className="business-owner-detail__card">
          <p>No driver found for id "{id}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/truck-management/transporters/driver-master" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Drivers List
      </Link>

      <div className="business-owner-detail__card">
        <div className="business-owner-detail__header">
          <div>
            <h1>{driver.driverName}</h1>
            <span className="drivers__bloodgroup">{driver.bloodGroup}</span>
          </div>
          <div className="business-owner-detail__header-actions">
            <button
              type="button"
              className="drivers-btn drivers-btn--outline"
              onClick={() =>
                // TODO: point at the real edit route once the Driver edit page is built.
                navigate(`/truck-management/transporters/driver-master/edit/${driver.driverId}`)
              }
            >
              <FiEdit3 aria-hidden /> Edit
            </button>
            <button
              type="button"
              className="drivers-btn drivers-btn--primary"
              data-bs-toggle="modal"
              data-bs-target="#sendMessageModal"
            >
              <FiSend aria-hidden /> Send Message
            </button>
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
              <DetailField label="State" value={driver.stateName} />
              <DetailField label="Transporter" value={driver.transporterName} />
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

      <div
        className="modal fade"
        id="sendMessageModal"
        tabIndex={-1}
        aria-labelledby="sendMessageModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="sendMessageModalLabel">
                Send Message to {driver.driverName}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Send To</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${driver.driverName} (${driver.mobileNumber})`}
                  disabled
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="sendMessageText">
                  Message
                </label>
                <textarea
                  id="sendMessageText"
                  className="form-control"
                  rows={4}
                  placeholder="Type your message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                disabled={!message.trim()}
                onClick={handleSendMessage}
              >
                <FiSend aria-hidden /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverView;
