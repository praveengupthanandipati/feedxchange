import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, BellIcon, DownloadIcon, MailIcon, PenLineIcon, Share2Icon, UserIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import ShareModal from "../../../../../shared/components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../../shared/components/dialog/ShareModal";
import { openShare } from "../../../../../shared/utils/openShare";
import { useGetPromoterProfileByIdQuery } from "../../../../../core/store/promotersApi";
import { mapPromoterProfileDetail, toRecipientOptions } from "./promoterDetail.data";
import type { DocumentRow, RegionRow } from "./promoterDetail.data";
import "../promoterslist/Promoters.scss";
import "../../businessowners/BusinessList/Businessowners.scss";
import "../../businessowners/BusinessView/BusinessOwnerDetail.scss";

import Can from "../../../../../core/auth/Can";
import { usePermission } from "../../../../../core/auth/AuthContext";
import ProfilePreferencesPanel from "../../../notification-preferences/ProfilePreferencesPanel";

const TABS = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const canSeeNotifications = usePermission("notification-preferences.view");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [shareProfileOpen, setShareProfileOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const {
    data: rawProfile,
    isFetching,
    isError,
  } = useGetPromoterProfileByIdQuery(id ?? "", { skip: !id });

  const profile = useMemo(() => (rawProfile ? mapPromoterProfileDetail(rawProfile) : null), [rawProfile]);
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  // Sends the profile's main details through the chosen app to the promoter (the only recipient offered).
  const handleShareProfile = ({ message, channel }: ShareModalPayload) => {
    if (!profile) return;
    const details = [
      ["Promoter", profile.promoterName],
      ["Promoter code", profile.promoterCode],
      ["Company", profile.companyName],
      ["Mobile", profile.mobileNumber],
      ["Email", profile.emailId],
      ["Address", profile.completeAddress],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`);
    const text = [message.trim(), ...details].filter(Boolean).join("\n");
    openShare(channel, [{ phone: profile.mobileNumber, email: profile.emailId }], text, `Promoter profile - ${profile.promoterName}`);
  };
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
      // The uploaded file itself (it used to download a text file holding only the file name). Opens in a new tab,
      // since the file is on the API server and a cross-origin "download" attribute is ignored.
      render: (row) =>
        row.fileUrl ? (
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={row.fileName}
            className="promoters__link"
            aria-label={`Download ${row.fileName}`}
            title={`Download ${row.fileName}`}
          >
            <DownloadIcon aria-hidden /> Download
          </a>
        ) : (
          "—"
        ),
    },
  ];

  if (isFetching) {
    return (
      <div className="business-owner-detail">
        <Link to="/admin/promoters" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Promoters
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
        <Link to="/admin/promoters" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Promoters
        </Link>
        <div className="business-owner-detail__card">
          <p>No promoter found for id "{id}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/admin/promoters" className="business-owner-detail__back">
        <ArrowLeftIcon aria-hidden /> Back to Promoters
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
            <Can any={["profiles.promoter.manage"]}>
              <button
                type="button"
                className="promoters-btn promoters-btn--outline"
                onClick={() => navigate(`/admin/promoters/profile?id=${id}`)}
              >
                <PenLineIcon aria-hidden /> Edit
              </button>
            </Can>
            <button type="button" className="promoters-btn promoters-btn--primary" onClick={() => setShareProfileOpen(true)}>
              <Share2Icon aria-hidden /> Share Profile
            </button>
          </div>
        </div>

        <nav className="business-owner-detail__tabs" role="tablist" aria-label="Promoter detail sections">
          {TABS.filter((tab) => tab.id !== "notifications" || canSeeNotifications).map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`promoter-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`promoter-tabpanel-${tab.id}`}
                className={`business-owner-detail__tab ${selected ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div
          className="business-owner-detail__main"
          role="tabpanel"
          id={`promoter-tabpanel-${activeTab}`}
          aria-labelledby={`promoter-tab-${activeTab}`}
        >
          {/* View only: preferences are changed in the edit wizard's Notification Preferences step. */}
          {activeTab === "notifications" && canSeeNotifications && <ProfilePreferencesPanel profileId={Number(id)} compact readOnly />}
          {activeTab === "overview" && (
          <div className="business-owner-detail__tab-panel">
            <section className="business-owner-detail__section">
              <div className="business-owner-detail__section-header">
                <h2 className="business-owner-detail__section-title">Promoter Information</h2>
                <button
                  type="button"
                  className="promoters-btn promoters-btn--outline"
                  onClick={() => setMessageOpen(true)}
                >
                  <MailIcon aria-hidden /> Message
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
          )}
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
