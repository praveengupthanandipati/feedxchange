import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2 } from "react-icons/fi";
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

const Transportview = () => {
  const { id } = useParams<{ id: string }>();
  const transporter = transporters.find((row) => row.id === id);
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
        <h2 className="business-owner-detail__card-title">Bank Details &amp; Documents</h2>
        <BankDetailsTab profile={profile} />
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

export default Transportview;
