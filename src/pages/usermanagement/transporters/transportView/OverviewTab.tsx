import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FiMail } from "react-icons/fi";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import type { TransporterProfile } from "./transporterDetail.data";
import {
  useGetAllTransporterLinesQuery,
  useGetTransporterTypesByLineQuery,
} from "../../../../store/transportersApi";

interface OverviewTabProps {
  profile: TransporterProfile;
}

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

const OverviewTab = ({ profile }: OverviewTabProps) => {
  const [messageOpen, setMessageOpen] = useState(false);
  const primaryAddress = profile.addresses[0];

  const handleSendMessage = (_payload: ShareModalPayload) => undefined;

  const { data: transporterLines } = useGetAllTransporterLinesQuery();
  const lineOfTransporter = useMemo(
    () =>
      transporterLines?.find((line) => String(line.transporterLineId) === profile.transporterLineId)
        ?.transporterLineName ?? "",
    [transporterLines, profile.transporterLineId],
  );

  const { data: transporterTypes } = useGetTransporterTypesByLineQuery(profile.transporterLineId, {
    skip: !profile.transporterLineId,
  });
  const typeOfTransporter = useMemo(
    () =>
      transporterTypes?.find((type) => String(type.transporterTypeId) === profile.transporterTypeId)
        ?.transporterTypeName ?? "",
    [transporterTypes, profile.transporterTypeId],
  );

  return (
    <div className="business-owner-detail__tab-panel">
      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">Profile Details</h2>
          <button
            type="button"
            className="transporters-btn transporters-btn--outline"
            onClick={() => setMessageOpen(true)}
          >
            <FiMail aria-hidden /> Message
          </button>
        </div>
        <div className="business-owner-detail__grid">
          <DetailField label="Trading Name" value={profile.tradingName} />
          <DetailField
            label="Mobile"
            value={
              <a href={`tel:${profile.mobile}`} className="business-owners__link">
                {profile.mobile}
              </a>
            }
          />
          <DetailField
            label="Alternative Contact"
            value={
              profile.alternativeContact ? (
                <a href={`tel:${profile.alternativeContact}`} className="business-owners__link">
                  {profile.alternativeContact}
                </a>
              ) : undefined
            }
          />
          <DetailField
            label="Email"
            value={
              <a href={`mailto:${profile.email}`} className="business-owners__link">
                {profile.email}
              </a>
            }
          />
          <DetailField
            label="Website"
            value={
              profile.website ? (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="business-owners__link">
                  {profile.website}
                </a>
              ) : undefined
            }
          />
          <DetailField label="City" value={profile.city} />
          <DetailField label="State" value={profile.state} />
          <DetailField
            label="Location"
            value={
              primaryAddress ? (
                <>
                  {profile.transporterLegalName}
                  <br />
                  {primaryAddress.address}, {primaryAddress.city}
                  <br />
                  {primaryAddress.state} - {primaryAddress.pincode}
                </>
              ) : undefined
            }
          />
        </div>
      </section>

      <section className="business-owner-detail__section">
        <h2 className="business-owner-detail__section-title">Basic Information</h2>
        <div className="business-owner-detail__grid">
          <DetailField label="Transporter Owner Name" value={profile.transporterOwnerName} />
          <DetailField label="Year of Establishment" value={profile.yearOfEstablishment} />
          <DetailField label="PAN Number" value={profile.panNumber} />
          <DetailField label="GST Number" value={profile.gstNumber} />
          <DetailField label="Line of Transporter" value={lineOfTransporter} />
          <DetailField label="Type of Transporter" value={typeOfTransporter} />
          <DetailField label="Group" value={profile.group} />
          <DetailField label="Referral By" value={profile.referralBy} />
          <DetailField label="Google Map Location" value={profile.googleMapLocation} />
        </div>

        <h3 className="business-owner-detail__subsection-title">Transporter Description</h3>
        <p className="business-owner-detail__description">
          {profile.transporterDescription || "No transporter description available."}
        </p>
      </section>

      <ShareModal
        open={messageOpen}
        title="Send Message"
        onClose={() => setMessageOpen(false)}
        onSend={handleSendMessage}
        fixedRecipientLabel={profile.tradingName || profile.transporterLegalName}
        messagePlaceholder="Enter your message"
        confirmLabel="Send Message"
      />
    </div>
  );
};

export default OverviewTab;
