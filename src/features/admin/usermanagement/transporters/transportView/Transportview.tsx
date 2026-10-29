import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, BellIcon, CreditCardIcon, PenLineIcon, PhoneIcon, Share2Icon, UserIcon } from "../../../../../shared/components/icon";
import { useGetTransporterProfileByIdQuery } from "../../../../../core/store/transportersApi";
import ShareModal from "../../../../../shared/components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../../shared/components/dialog/ShareModal";
import { openShare } from "../../../../../shared/utils/openShare";
import { mapTransporterProfileDetail, toRecipientOptions } from "./transporterDetail.data";
import OverviewTab from "./OverviewTab";
import ContactsTab from "./ContactsTab";
import BankDetailsTab from "./BankDetailsTab";
import "../transportersList/Transporters.scss";
import "../../businessowners/BusinessList/Businessowners.scss";
import "../../businessowners/BusinessView/BusinessOwnerDetail.scss";

import Can from "../../../../../core/auth/Can";
import { usePermission } from "../../../../../core/auth/AuthContext";
import ProfilePreferencesPanel from "../../../notification-preferences/ProfilePreferencesPanel";

const TABS = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "contacts", label: "Contacts", icon: PhoneIcon },
  { id: "bank", label: "Bank Details & Documents", icon: CreditCardIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

const Transportview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canSeeNotifications = usePermission("notification-preferences.view");
  const [shareProfileOpen, setShareProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const {
    data: rawProfile,
    isFetching,
    isError,
  } = useGetTransporterProfileByIdQuery(id ?? "", { skip: !id });

  const profile = useMemo(() => (rawProfile ? mapTransporterProfileDetail(rawProfile) : null), [rawProfile]);
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  // Sends the profile's main details through the chosen app to the picked contacts.
  const handleShareProfile = ({ recipients, message, channel }: ShareModalPayload) => {
    if (!profile) return;
    const details = [
      ["Transporter", profile.transporterLegalName],
      ["Trading name", profile.tradingName],
      ["Owner", profile.transporterOwnerName],
      ["GST", profile.gstNumber],
      ["Mobile", profile.mobile],
      ["Email", profile.email],
      ["Website", profile.website],
      ["Location", [profile.city, profile.state].filter(Boolean).join(", ")],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`);
    const text = [message.trim(), ...details].filter(Boolean).join("\n");
    const people = profile.contacts.filter((contact) => recipients.includes(contact.id)).map((contact) => ({ phone: contact.phone, email: contact.email }));
    openShare(channel, people, text, `Transporter profile - ${profile.transporterLegalName}`);
  };

  if (isFetching) {
    return (
      <div className="business-owner-detail">
        <Link to="/admin/transporters" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Transporters
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
        <Link to="/admin/transporters" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Transporters
        </Link>
        <div className="business-owner-detail__card">
          <p>No transporter found for id "{id}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/admin/transporters" className="business-owner-detail__back">
        <ArrowLeftIcon aria-hidden /> Back to Transporters
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
            <Can any={["profiles.transporter.manage"]}>
              <button
                type="button"
                className="transporters-btn transporters-btn--outline"
                onClick={() => navigate(`/admin/transporters/profile?id=${id}`)}
              >
                <PenLineIcon aria-hidden /> Edit
              </button>
            </Can>
            <button
              type="button"
              className="transporters-btn transporters-btn--primary"
              onClick={() => setShareProfileOpen(true)}
            >
              <Share2Icon aria-hidden /> Share Profile
            </button>
          </div>
        </div>

        <nav className="business-owner-detail__tabs" role="tablist" aria-label="Transporter detail sections">
          {TABS.filter((tab) => tab.id !== "notifications" || canSeeNotifications).map((tab) => {
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
          {activeTab === "bank" && <BankDetailsTab profile={profile} profileId={Number(id)} />}
          {/* View only: preferences are changed in the edit wizard's Notification Preferences step. */}
          {activeTab === "notifications" && canSeeNotifications && <ProfilePreferencesPanel profileId={Number(id)} compact readOnly />}
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
