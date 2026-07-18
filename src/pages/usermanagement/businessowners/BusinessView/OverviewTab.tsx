import { useState } from "react";
import type { ReactNode } from "react";
import { FiMail } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import type { BusinessOwnerProfile, BrokerageChargeRow, CapacityRow } from "./businessOwnerDetail.data";

interface OverviewTabProps {
  profile: BusinessOwnerProfile;
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

const brokerageColumns: TableColumn<BrokerageChargeRow>[] = [
  { key: "product", header: "Product Name" },
  { key: "buyCharge", header: "Buy Charges" },
  { key: "sellCharge", header: "Sell Charges" },
];

const capacityColumns: TableColumn<CapacityRow>[] = [
  { key: "product", header: "Product Name" },
  { key: "tpd", header: "TPD" },
  { key: "tpm", header: "TPM" },
];

const OverviewTab = ({ profile }: OverviewTabProps) => {
  const [messageOpen, setMessageOpen] = useState(false);

  const handleSendMessage = (_payload: ShareModalPayload) => undefined;

  return (
    <div className="business-owner-detail__tab-panel">
      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">Profile Details</h2>
          <button
            type="button"
            className="business-owners-btn business-owners-btn--outline"
            onClick={() => setMessageOpen(true)}
          >
            <FiMail aria-hidden /> Message
          </button>
        </div>
        <div className="business-owner-detail__grid">
          <DetailField label="Business Legal Name" value={profile.businessLegalName} />
          <DetailField label="Trading Name" value={profile.tradingName} />
          <DetailField label="Business Type" value={profile.businessType} />
          <DetailField
            label="Mobile"
            value={
              <a href={`tel:${profile.mobile}`} className="business-owners__link">
                {profile.mobile}
              </a>
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
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="business-owners__link">
                {profile.website}
              </a>
            }
          />
          <DetailField label="City" value={profile.city} />
          <DetailField label="State" value={profile.state} />
          <DetailField
            label="Location"
            value={
              <>
                {profile.location}
                <br />
                {profile.city} - {profile.pincode}
              </>
            }
          />
        </div>
      </section>

      <section className="business-owner-detail__section">
        <h2 className="business-owner-detail__section-title">Basic Information</h2>
        <div className="business-owner-detail__grid">
          <DetailField label="Business Owner Name" value={profile.tradingName} />
          <DetailField label="Year of Establishment" value={profile.yearOfEstablishment} />
          <DetailField label="Line of Business" value={profile.lineOfBusiness} />
          <DetailField label="Sub Type of Business" value={profile.subTypeOfBusiness} />
          <DetailField label="Group" value={profile.group} />
          <DetailField label="Collection Area" value={profile.collectionArea} />
          <DetailField label="Area" value={profile.area} />
          <DetailField label="PAN Number" value={profile.panNumber} />
          <DetailField label="GST Number" value={profile.gstNumber} />
        </div>

        <h3 className="business-owner-detail__subsection-title">Business Description</h3>
        <p className="business-owner-detail__description">
          {profile.businessDescription || "No business description available."}
        </p>
      </section>

      <section className="business-owner-detail__section">
        <h2 className="business-owner-detail__section-title">Product wise brokerage charges</h2>
        <Table
          columns={brokerageColumns}
          data={profile.brokerageCharges}
          rowKey={(row) => row.product}
          emptyMessage="No brokerage charges configured."
        />
      </section>

      <section className="business-owner-detail__section">
        <h2 className="business-owner-detail__section-title">Capacity and Monthly Requirements</h2>
        <Table
          columns={capacityColumns}
          data={profile.capacity}
          rowKey={(row) => row.product}
          emptyMessage="No capacity requirements configured."
        />
      </section>

      <ShareModal
        open={messageOpen}
        title="Send Message"
        onClose={() => setMessageOpen(false)}
        onSend={handleSendMessage}
        fixedRecipientLabel={profile.tradingName || profile.businessLegalName}
        messagePlaceholder="Enter your message"
        confirmLabel="Send Message"
      />
    </div>
  );
};

export default OverviewTab;
