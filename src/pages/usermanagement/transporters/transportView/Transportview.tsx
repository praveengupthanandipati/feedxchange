import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2, FiUser, FiClipboard, FiCreditCard } from "react-icons/fi";
import type { IconType } from "react-icons";
import { transporters } from "../transportersList/transporters.data";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import { getTransporterProfile, toRecipientOptions } from "./transporterDetail.data";
import OverviewTab from "./OverviewTab";
import ContactsTab from "./ContactsTab";
import BankDetailsTab from "./BankDetailsTab";
import "../transportersList/Transporters.scss";
import "../../businessowners/BusinessList/Businessowners.scss";
import "../../businessowners/BusinessView/BusinessOwnerDetail.scss";

type TabId = "overview" | "contacts" | "bank";

const TABS: { id: TabId; label: string; icon: IconType }[] = [
  { id: "overview", label: "Overview", icon: FiUser },
  { id: "contacts", label: "Contacts", icon: FiClipboard },
  { id: "bank", label: "Bank Details & Documents", icon: FiCreditCard },
];

const Transportview = () => {
  const { id } = useParams<{ id: string }>();
  const transporter = transporters.find((row) => row.id === id);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [shareProfileOpen, setShareProfileOpen] = useState(false);

  const profile = useMemo(
    () => (transporter ? getTransporterProfile(transporter) : null),
    [transporter],
  );
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  const handleShareProfile = (_payload: ShareModalPayload) => undefined;

  if (!transporter || !profile) {
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
            <h1>{transporter.companyName}</h1>
            <span
              className={`transporters__status transporters__status--${transporter.status.toLowerCase()}`}
            >
              {transporter.status}
            </span>
          </div>
          <div className="business-owner-detail__header-actions">
            <button type="button" className="transporters-btn transporters-btn--outline">
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

        <nav className="business-owner-detail__tabs" aria-label="Transporter sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`business-owner-detail__tab ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id}
            >
              <tab.icon aria-hidden />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="business-owner-detail__main">
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
