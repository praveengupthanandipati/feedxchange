import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2, FiUser, FiClipboard, FiCreditCard, FiLink } from "react-icons/fi";
import type { IconType } from "react-icons";
import { businessOwners } from "../BusinessList/businessOwners.data";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import { getBusinessOwnerProfile, toRecipientOptions } from "./businessOwnerDetail.data";
import OverviewTab from "./OverviewTab";
import ContactsTab from "./ContactsTab";
import BankDetailsTab from "./BankDetailsTab";
import LinkedBusinessTab from "./LinkedBusinessTab";
import "../BusinessList/Businessowners.scss";
import "./BusinessOwnerDetail.scss";

type TabId = "overview" | "contacts" | "bank" | "linked";

const TABS: { id: TabId; label: string; icon: IconType }[] = [
  { id: "overview", label: "Overview", icon: FiUser },
  { id: "contacts", label: "Contacts", icon: FiClipboard },
  { id: "bank", label: "Bank Details & Docs", icon: FiCreditCard },
  { id: "linked", label: "Linked Business", icon: FiLink },
];

const BusinessOwnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const owner = businessOwners.find((row) => row.id === id);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [shareProfileOpen, setShareProfileOpen] = useState(false);

  const profile = useMemo(() => (owner ? getBusinessOwnerProfile(owner) : null), [owner]);
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  const handleShareProfile = (_payload: ShareModalPayload) => undefined;

  if (!owner || !profile) {
    return (
      <div className="business-owner-detail">
        <Link to="/business-owners" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Business Owners
        </Link>
        <div className="business-owner-detail__card">
          <p>No business owner found for id "{id}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/business-owners" className="business-owner-detail__back">
        <FiArrowLeft aria-hidden /> Back to Business Owners
      </Link>

      <div className="business-owner-detail__card">
        <div className="business-owner-detail__header">
          <div>
            <h1>{owner.companyName}</h1>
            <span
              className={`business-owners__status business-owners__status--${owner.status.toLowerCase()}`}
            >
              {owner.status}
            </span>
          </div>
          <div className="business-owner-detail__header-actions">
            <button type="button" className="business-owners-btn business-owners-btn--outline">
              <FiEdit3 aria-hidden /> Edit
            </button>
            <button
              type="button"
              className="business-owners-btn business-owners-btn--primary"
              onClick={() => setShareProfileOpen(true)}
            >
              <FiShare2 aria-hidden /> Share Profile
            </button>
          </div>
        </div>

        <nav className="business-owner-detail__tabs" aria-label="Business owner sections">
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
          {activeTab === "linked" && <LinkedBusinessTab ownerId={owner.id} />}
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

export default BusinessOwnerDetail;
