import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2, FiMail, FiDownload } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import { promoters } from "../promoterslist/promoters.data";
import { getPromoterProfile, toRecipientOptions } from "./promoterDetail.data";
import type { DocumentRow } from "./promoterDetail.data";
import "../promoterslist/Promoters.scss";
import "../../businessowners/BusinessList/Businessowners.scss";
import "../../businessowners/BusinessView/BusinessOwnerDetail.scss";

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

const Promoterview = () => {
  const { id } = useParams<{ id: string }>();
  const promoter = promoters.find((row) => row.id === id);
  const [shareProfileOpen, setShareProfileOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const profile = useMemo(() => (promoter ? getPromoterProfile(promoter) : null), [promoter]);
  const recipientOptions = useMemo(() => (promoter ? toRecipientOptions(promoter) : []), [promoter]);

  const handleShareProfile = (_payload: ShareModalPayload) => undefined;
  const handleSendMessage = (_payload: ShareModalPayload) => undefined;

  const documentColumns: TableColumn<DocumentRow>[] = [
    { key: "sno", header: "S.No", width: "4rem" },
    { key: "documentName", header: "Name of Document" },
    { key: "registrationNumber", header: "Registration / License No" },
    { key: "issueAuthority", header: "Issue Authority" },
    { key: "issueDate", header: "Issue Date" },
    { key: "fileName", header: "File Name" },
    {
      key: "download",
      header: "Download",
      render: (row) => (
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(row.fileName)}`}
          download={row.fileName}
          className="promoters__link"
          aria-label={`Download ${row.fileName}`}
          title={`Download ${row.fileName}`}
        >
          <FiDownload aria-hidden /> Download
        </a>
      ),
    },
  ];

  if (!promoter || !profile) {
    return (
      <div className="business-owner-detail">
        <Link to="/promoters" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Promoters
        </Link>
        <div className="business-owner-detail__card">
          <p>No promoter found for id "{id}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/promoters" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Promoters
      </Link>

      <div className="business-owner-detail__card">
        <div className="business-owner-detail__header">
          <div>
            <h1>{promoter.promoterName}</h1>
            <span className={`promoters__status promoters__status--${promoter.status.toLowerCase()}`}>
              {promoter.status}
            </span>
          </div>
          <div className="business-owner-detail__header-actions">
            <button type="button" className="promoters-btn promoters-btn--outline">
              <FiEdit3 aria-hidden /> Edit
            </button>
            <button type="button" className="promoters-btn promoters-btn--primary" onClick={() => setShareProfileOpen(true)}>
              <FiShare2 aria-hidden /> Share Profile
            </button>
          </div>
        </div>

        <div className="business-owner-detail__main">
          <div className="business-owner-detail__tab-panel">
            <section className="business-owner-detail__section">
              <div className="business-owner-detail__section-header">
                <h2 className="business-owner-detail__section-title">Promoter Information</h2>
                <button
                  type="button"
                  className="promoters-btn promoters-btn--outline"
                  onClick={() => setMessageOpen(true)}
                >
                  <FiMail aria-hidden /> Message
                </button>
              </div>
              <div className="business-owner-detail__grid">
                <DetailField label="Promoter Code" value={profile.promoterCode} />
                <DetailField
                  label="Mobile"
                  value={
                    <a href={`tel:${promoter.phone}`} className="promoters__link">
                      {promoter.phone}
                    </a>
                  }
                />
                <DetailField
                  label="Email"
                  value={
                    <a href={`mailto:${promoter.email}`} className="promoters__link">
                      {promoter.email}
                    </a>
                  }
                />
                <DetailField label="Complete Address" value={profile.completeAddress} />
                <DetailField label="Company Name" value={profile.companyName} />
                <DetailField label="Designation" value={profile.designation} />
              </div>
            </section>

            <section className="business-owner-detail__section">
              <h2 className="business-owner-detail__section-title">Association/Region:</h2>
              <div className="business-owner-detail__grid">
                <DetailField label="Associated Products" value={profile.associatedProducts} />
                <DetailField label="Geographic Region of Operation" value={profile.region} />
              </div>
            </section>

            <section className="business-owner-detail__section">
              <h2 className="business-owner-detail__section-title">Commission &amp; Payment Details:</h2>
              <div className="business-owner-detail__grid">
                <DetailField label="Commission Structure" value={profile.commissionStructure} />
                <DetailField label="Commission Rate/Value" value={profile.commissionRateValue} />
                <DetailField label="Payment Frequency" value={profile.paymentFrequency} />
                <DetailField label="Remarks" value={profile.remarks} />
              </div>
            </section>

            <section className="business-owner-detail__section">
              <h2 className="business-owner-detail__section-title">Promoter Documents</h2>
              <Table
                columns={documentColumns}
                data={profile.documents}
                rowKey={(row) => row.id}
                emptyMessage="No documents on file."
              />
            </section>
          </div>
        </div>
      </div>

      <ShareModal
        open={shareProfileOpen}
        title="Share Profile"
        onClose={() => setShareProfileOpen(false)}
        onSend={handleShareProfile}
        recipientOptions={recipientOptions}
        messagePlaceholder="Enter a note to include with this profile"
        confirmLabel="Share Profile"
      />

      <ShareModal
        open={messageOpen}
        title="Send Message"
        onClose={() => setMessageOpen(false)}
        onSend={handleSendMessage}
        fixedRecipientLabel={promoter.promoterName}
        messagePlaceholder="Enter your message"
        confirmLabel="Send Message"
      />
    </div>
  );
};

export default Promoterview;
