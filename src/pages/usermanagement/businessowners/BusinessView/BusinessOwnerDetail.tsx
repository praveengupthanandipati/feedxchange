import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2, FiUser, FiPhone, FiCreditCard, FiUsers } from "react-icons/fi";
import {
  useGetBusinessProfileByIdQuery,
  useGetAllBusinessLinesQuery,
  useGetBusinessTypesByLineQuery,
  useGetBusinessSubTypesQuery,
} from "../../../../store/businessProfilesApi";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import { mapBusinessProfileDetail, toRecipientOptions } from "./businessOwnerDetail.data";
import OverviewTab from "./OverviewTab";
import ContactsTab from "./ContactsTab";
import BankDetailsTab from "./BankDetailsTab";
import LinkedBusinessTab from "./LinkedBusinessTab";
import "../BusinessList/Businessowners.scss";
import "./BusinessOwnerDetail.scss";

const TABS = [
  { id: "overview", label: "Overview", icon: FiUser },
  { id: "contacts", label: "Contacts", icon: FiPhone },
  { id: "bank", label: "Bank Details & Docs", icon: FiCreditCard },
  { id: "linked", label: "Linked Business", icon: FiUsers },
] as const;

type TabId = (typeof TABS)[number]["id"];

const BusinessOwnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shareProfileOpen, setShareProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const {
    data: rawProfile,
    isFetching,
    isError,
  } = useGetBusinessProfileByIdQuery(id ?? "", { skip: !id });

  // businessProfileDetails.businessLineName/businessTypeName/
  // businessSubTypeName from GetBusinessProfileById aren't reliable — same as
  // the Edit wizard, resolve the display names by looking the ids up against
  // the cascading master-data endpoints instead of trusting those fields.
  const details = rawProfile?.businessProfileDetails;
  const businessLineId = details ? String(details.businessLineId) : "";
  const businessTypeId = details ? String(details.businessTypeId) : "";

  const { data: businessLines } = useGetAllBusinessLinesQuery();
  const { data: businessTypes } = useGetBusinessTypesByLineQuery(businessLineId, { skip: !businessLineId });
  const { data: businessSubTypes } = useGetBusinessSubTypesQuery(businessTypeId, { skip: !businessTypeId });

  const profile = useMemo(() => {
    if (!rawProfile) return null;
    const mapped = mapBusinessProfileDetail(rawProfile);
    const lineName = businessLines?.find((line) => line.businessLineId === details?.businessLineId)?.businessLineName;
    const typeName = businessTypes?.find((type) => type.businessTypeId === details?.businessTypeId)?.businessTypeName;
    const subTypeName = businessSubTypes?.find(
      (subType) => subType.businessSubTypeId === details?.businessSubTypeId,
    )?.businessSubTypeName;

    return {
      ...mapped,
      lineOfBusiness: lineName ?? mapped.lineOfBusiness,
      businessType: typeName ?? mapped.businessType,
      subTypeOfBusiness: subTypeName ?? mapped.subTypeOfBusiness,
    };
  }, [rawProfile, details, businessLines, businessTypes, businessSubTypes]);
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  const handleShareProfile = (_payload: ShareModalPayload) => undefined;

  if (isFetching) {
    return (
      <div className="business-owner-detail">
        <Link to="/business-owners" className="business-owner-detail__back">
          <FiArrowLeft aria-hidden /> Back to Business Owners
        </Link>
        <div className="business-owner-detail__card">
          <p>Loading business profile…</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
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
            <h1>{profile.businessLegalName}</h1>
            <span
              className={`business-owners__status business-owners__status--${profile.status.toLowerCase()}`}
            >
              {profile.status}
            </span>
          </div>
          <div className="business-owner-detail__header-actions">
            <button
              type="button"
              className="business-owners-btn business-owners-btn--outline"
              onClick={() => navigate(`/business-owners/profile?id=${profile.profileId}`)}
            >
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

        <nav className="business-owner-detail__tabs" role="tablist" aria-label="Business owner detail sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`business-owner-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`business-owner-tabpanel-${tab.id}`}
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
          id={`business-owner-tabpanel-${activeTab}`}
          aria-labelledby={`business-owner-tab-${activeTab}`}
        >
          {activeTab === "overview" && <OverviewTab profile={profile} />}
          {activeTab === "contacts" && <ContactsTab profile={profile} />}
          {activeTab === "bank" && <BankDetailsTab profile={profile} />}
          {activeTab === "linked" && <LinkedBusinessTab ownerId={String(profile.profileId)} />}
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
