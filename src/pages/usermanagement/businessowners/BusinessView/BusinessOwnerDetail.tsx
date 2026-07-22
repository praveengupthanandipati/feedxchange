import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2 } from "react-icons/fi";
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

const BusinessOwnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const owner = businessOwners.find((row) => row.id === id);
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
      </div>

      <section className="business-owner-detail__card">
        <h2 className="business-owner-detail__card-title">Overview</h2>
        <OverviewTab profile={profile} />
      </section>

      <section className="business-owner-detail__card">
        <h2 className="business-owner-detail__card-title">Contacts</h2>
        <ContactsTab profile={profile} />
      </section>

      <section className="business-owner-detail__card">
        <h2 className="business-owner-detail__card-title">Bank Details &amp; Docs</h2>
        <BankDetailsTab profile={profile} />
      </section>

      <section className="business-owner-detail__card">
        <h2 className="business-owner-detail__card-title">Linked Business</h2>
        <LinkedBusinessTab ownerId={owner.id} />
      </section>

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
