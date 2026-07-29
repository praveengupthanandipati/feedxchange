import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2, FiMail, FiDownload } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import { useGetPromoterProfileByIdQuery } from "../../../../store/promotersApi";
import { mapPromoterProfileDetail, toRecipientOptions } from "./promoterDetail.data";
import type { DocumentRow, RegionRow } from "./promoterDetail.data";
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
  const navigate = useNavigate();
  const [shareProfileOpen, setShareProfileOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const {
    data: rawProfile,
    isFetching,
    isError,
  } = useGetPromoterProfileByIdQuery(id ?? "", { skip: !id });

  const profile = useMemo(() => (rawProfile ? mapPromoterProfileDetail(rawProfile) : null), [rawProfile]);
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  const handleShareProfile = (_payload: ShareModalPayload) => undefined;
  const handleSendMessage = (_payload: ShareModalPayload) => undefined;

  const regionColumns: TableColumn<RegionRow>[] = [
    { key: "stateName", header: "State" },
    { key: "districtName", header: "District" },
    { key: "cityName", header: "City" },
  ];

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

  if (isFetching) {
    return (
      <div className="business-owner-detail">
        <Link to="/promoters" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Promoters
        </Link>
        <div className="business-owner-detail__card">
          <p>Loading promoter profile…</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
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
            <h1>{profile.promoterName}</h1>
            <span className={`promoters__status promoters__status--${profile.status.toLowerCase()}`}>
              {profile.status}
            </span>
          </div>
          <div className="business-owner-detail__header-actions">
            <button
              type="button"
              className="promoters-btn promoters-btn--outline"
              onClick={() => navigate(`/promoters/profile?id=${id}`)}
            >
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
                    <a href={`tel:${profile.mobileNumber}`} className="promoters__link">
                      {profile.mobileNumber}
                    </a>
                  }
                />
                <DetailField
                  label="Email"
                  value={
                    <a href={`mailto:${profile.emailId}`} className="promoters__link">
                      {profile.emailId}
                    </a>
                  }
                />
                <DetailField label="Complete Address" value={profile.completeAddress} />
                <DetailField label="Company Name" value={profile.companyName} />
                <DetailField label="Designation" value={profile.designation} />
              </div>
            </section>

            <section className="business-owner-detail__section">
              <h2 className="business-owner-detail__section-title">Regions of Operation</h2>
              <Table
                columns={regionColumns}
                data={profile.regions}
                rowKey={(row) => row.id}
                emptyMessage="No regions on file."
              />
            </section>

            <section className="business-owner-detail__section">
              <h2 className="business-owner-detail__section-title">Commission &amp; Payment Details:</h2>
              <div className="business-owner-detail__grid">
                <DetailField label="Commission Structure" value={profile.commissionStructure} />
                <DetailField label="Commission Rate/Value" value={profile.commissionRateValue} />
                <DetailField label="Payment Frequency" value={profile.paymentFrequency} />
                <DetailField label="Total Referrals" value={profile.totalReferrals} />
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
        fixedRecipientLabel={profile.promoterName}
        messagePlaceholder="Enter your message"
        confirmLabel="Send Message"
      />
    </div>
  );
};

export default Promoterview;
