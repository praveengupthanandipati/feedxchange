import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2, FiUser, FiPhone, FiCreditCard } from "react-icons/fi";
import { useGetTransporterProfileByIdQuery } from "../../../../store/transportersApi";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import { mapTransporterProfileDetail, toRecipientOptions } from "./transporterDetail.data";
import OverviewTab from "./OverviewTab";
import ContactsTab from "./ContactsTab";
import BankDetailsTab from "./BankDetailsTab";
import "../transportersList/Transporters.scss";
import "../../businessowners/BusinessList/Businessowners.scss";
import "../../businessowners/BusinessView/BusinessOwnerDetail.scss";

const TABS = [
  { id: "overview", label: "Overview", icon: FiUser },
  { id: "contacts", label: "Contacts", icon: FiPhone },
  { id: "bank", label: "Bank Details & Documents", icon: FiCreditCard },
] as const;

type TabId = (typeof TABS)[number]["id"];

const Transportview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shareProfileOpen, setShareProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const {
    data: rawProfile,
    isFetching,
    isError,
  } = useGetTransporterProfileByIdQuery(id ?? "", { skip: !id });

  const profile = useMemo(() => (rawProfile ? mapTransporterProfileDetail(rawProfile) : null), [rawProfile]);
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  const handleShareProfile = (_payload: ShareModalPayload) => undefined;

  if (isFetching) {
    return (
      <div className="business-owner-detail">
        <Link to="/transporters" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Transporters
        </Link>
        <div className="business-owner-detail__card">
          <p>Loading transporter profile…</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="business-owner-detail">
        <Link to="/transporters" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Transporters
        </Link>
        <div className="business-owner-detail__card">
          <p>No transporter found for id "{id}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/transporters" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Transporters
      </Link>

      <div className="business-owner-detail__card">
        <div className="business-owner-detail__header">
          <div>
            <h1>{profile.transporterLegalName}</h1>
            <span
              className={`transporters__status transporters__status--${profile.status.toLowerCase()}`}
            >
              {profile.status}
            </span>
          </div>
          <div className="business-owner-detail__header-actions">
            <button
              type="button"
              className="transporters-btn transporters-btn--outline"
              onClick={() => navigate(`/transporters/profile?id=${id}`)}
            >
              <FiEdit3 aria-hidden /> Edit
            </button>
            <button
              type="button"
              className="transporters-btn transporters-btn--primary"
              onClick={() => setShareProfileOpen(true)}
            >
              <FiShare2 aria-hidden /> Share Profile
            </button>
          </div>
        </div>

        <nav className="business-owner-detail__tabs" role="tablist" aria-label="Transporter detail sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`transporter-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`transporter-tabpanel-${tab.id}`}
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
          id={`transporter-tabpanel-${activeTab}`}
          aria-labelledby={`transporter-tab-${activeTab}`}
        >
          {activeTab === "overview" && <OverviewTab profile={profile} />}
          {activeTab === "contacts" && <ContactsTab profile={profile} />}
          {activeTab === "bank" && <BankDetailsTab profile={profile} />}
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
    </div>
  );
};

export default Transportview;
