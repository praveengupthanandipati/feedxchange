import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BellIcon,
  CreditCardIcon,
  PenLineIcon,
  PhoneIcon,
  Share2Icon,
  UserIcon,
  UsersIcon,
} from "../../../../../shared/components/icon";
import {
  useGetBusinessProfileByIdQuery,
  useGetAllBusinessLinesQuery,
  useGetBusinessTypesByLineQuery,
  useGetBusinessSubTypesQuery,
} from "../../../../../core/store/businessProfilesApi";
import { useGetProductsQuery } from "../../../../../core/store/productsApi";
import ShareModal from "../../../../../shared/components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../../shared/components/dialog/ShareModal";
import { mapBusinessProfileDetail, toRecipientOptions } from "./businessOwnerDetail.data";
import OverviewTab from "./OverviewTab";
import ContactsTab from "./ContactsTab";
import BankDetailsTab from "./BankDetailsTab";
import LinkedBusinessTab from "./LinkedBusinessTab";
import "../BusinessList/Businessowners.scss";
import "./BusinessOwnerDetail.scss";

import Can from "../../../../../core/auth/Can";
import { usePermission } from "../../../../../core/auth/AuthContext";
import ProfilePreferencesPanel from "../../../notification-preferences/ProfilePreferencesPanel";

const TABS = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "contacts", label: "Contacts", icon: PhoneIcon },
  { id: "bank", label: "Bank Details & Docs", icon: CreditCardIcon },
  { id: "linked", label: "Linked Business", icon: UsersIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

const BusinessOwnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const canSeeNotifications = usePermission("notification-preferences.view");
  const navigate = useNavigate();
  const [shareProfileOpen, setShareProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const {
    data: rawProfile,
    isFetching,
    isError,
  } = useGetBusinessProfileByIdQuery(id ?? "", { skip: !id });

  const details = rawProfile?.businessProfileDetails;
  const businessLineId = details ? String(details.businessLineId) : "";
  const businessTypeId = details ? String(details.businessTypeId) : "";

  const { data: businessLines } = useGetAllBusinessLinesQuery();
  const { data: businessTypes } = useGetBusinessTypesByLineQuery(businessLineId, { skip: !businessLineId });
  const { data: businessSubTypes } = useGetBusinessSubTypesQuery(businessTypeId, { skip: !businessTypeId });
  const { data: products } = useGetProductsQuery();

  const profile = useMemo(() => {
    if (!rawProfile) return null;
    const mapped = mapBusinessProfileDetail(rawProfile);
    const lineName = businessLines?.find((line) => line.businessLineId === details?.businessLineId)?.businessLineName;
    const typeName = businessTypes?.find((type) => type.businessTypeId === details?.businessTypeId)?.businessTypeName;
    const subTypeName = businessSubTypes?.find(
      (subType) => subType.businessSubTypeId === details?.businessSubTypeId,
    )?.businessSubTypeName;

    // productName can come back null from the backend join — fall back to
    // the live product list so the row still shows a name instead of blank.
    const productNameById = new Map((products ?? []).map((product) => [product.id, product.name ?? ""]));

    return {
      ...mapped,
      lineOfBusiness: lineName ?? mapped.lineOfBusiness,
      businessType: typeName ?? mapped.businessType,
      subTypeOfBusiness: subTypeName ?? mapped.subTypeOfBusiness,
      brokerageCharges: mapped.brokerageCharges.map((charge) => ({
        ...charge,
        product: charge.product || productNameById.get(charge.productId) || "",
      })),
      capacity: mapped.capacity.map((req) => ({
        ...req,
        product: req.product || productNameById.get(req.productId) || "",
      })),
    };
  }, [rawProfile, details, businessLines, businessTypes, businessSubTypes, products]);
  const recipientOptions = useMemo(() => (profile ? toRecipientOptions(profile) : []), [profile]);

  const handleShareProfile = (_payload: ShareModalPayload) => undefined;

  if (isFetching) {
    return (
      <div className="business-owner-detail">
        <Link to="/admin/business-owners" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Business Owners
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
        <Link to="/admin/business-owners" className="business-owner-detail__back">
          <ArrowLeftIcon aria-hidden /> Back to Business Owners
        </Link>
        <div className="business-owner-detail__card">
          <p>No business owner found for id "{id}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-owner-detail">
      <Link to="/admin/business-owners" className="business-owner-detail__back">
        <ArrowLeftIcon aria-hidden /> Back to Business Owners
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
            <Can any={["profiles.business.manage"]}>
              <button
                type="button"
                className="business-owners-btn business-owners-btn--outline"
                onClick={() => navigate(`/admin/business-owners/profile?id=${profile.profileId}`)}
              >
                <PenLineIcon aria-hidden /> Edit
              </button>
            </Can>
            <button
              type="button"
              className="business-owners-btn business-owners-btn--primary"
              onClick={() => setShareProfileOpen(true)}
            >
              <Share2Icon aria-hidden /> Share Profile
            </button>
          </div>
        </div>

        <nav className="business-owner-detail__tabs" role="tablist" aria-label="Business owner detail sections">
          {TABS.filter((tab) => tab.id !== "notifications" || canSeeNotifications).map((tab) => {
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
          {activeTab === "notifications" && canSeeNotifications && <ProfilePreferencesPanel profileId={profile.profileId} compact />}
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
