import type { ReactNode } from "react";
import {
  FiBriefcase,
  FiFileText,
  FiPhone,
  FiMail,
  FiSliders,
  FiEdit3,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { profileData } from "./profile.data";
import "./Profile.scss";

interface FieldProps {
  label: string;
  value: ReactNode;
}

const Field = ({ label, value }: FieldProps) => (
  <div className="profile-field">
    <span className="profile-field__label">{label}</span>
    <span className="profile-field__value">{value}</span>
  </div>
);

const StatusBadge = ({ active, onLabel = "Enabled", offLabel = "Disabled" }: { active: boolean; onLabel?: string; offLabel?: string }) => (
  <span className={`profile-badge ${active ? "profile-badge--on" : "profile-badge--off"}`}>
    {active ? onLabel : offLabel}
  </span>
);

interface ProfileCardProps {
  accent: "navy" | "orange" | "info" | "success" | "danger";
  icon: IconType;
  title: string;
  children: ReactNode;
}

const ProfileCard = ({ accent, icon: Icon, title, children }: ProfileCardProps) => (
  <section className={`profile-card profile-card--${accent}`}>
    <div className="profile-card__header">
      <span className="profile-card__icon">
        <Icon aria-hidden />
      </span>
      <h3 className="profile-card__title">{title}</h3>
    </div>
    <div className="profile-card__fields">{children}</div>
  </section>
);

const Profile = () => {
  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h2>Seller/Buyer Profile</h2>
        <p>{profileData.seller}</p>
      </div>

      <div className="profile-grid">
        <ProfileCard accent="navy" icon={FiBriefcase} title="Business Details">
          <Field label="Seller" value={profileData.seller} />
          <Field label="Seller City" value={profileData.sellerCity} />
          <Field label="Group" value={profileData.group} />
          <Field label="Area" value={profileData.area} />
          <Field label="Collection Area" value={profileData.collectionArea} />
          <Field label="Referred by" value={profileData.referredBy} />
          <Field label="Business Type" value={profileData.businessType} />
          <Field label="Products" value={profileData.products} />
          <Field label="Production Capacity (per month)" value={profileData.productionCapacityPerMonth} />
          <Field label="Prefered Courier" value={profileData.preferedCourier} />
        </ProfileCard>

        <ProfileCard accent="orange" icon={FiFileText} title="Tax & Registration">
          <Field label="TIN Number" value={profileData.tinNumber} />
          <Field label="PAN Number" value={profileData.panNumber} />
          <Field label="CST Number" value={profileData.cstNumber} />
          <Field label="VAT Number" value={profileData.vatNumber} />
          <Field label="GST Prov ID" value={profileData.gstProvId} />
          <Field label="GST ID" value={profileData.gstId} />
          <Field label="HSN Codes" value={profileData.hsnCodes} />
        </ProfileCard>

        <ProfileCard accent="info" icon={FiPhone} title="Contact Information">
          <Field
            label="Mobile"
            value={<a href={`tel:${profileData.mobile}`}>{profileData.mobile}</a>}
          />
          <Field
            label="Alternative Contact Number"
            value={<a href={`tel:${profileData.alternativeContactNumber}`}>{profileData.alternativeContactNumber}</a>}
          />
          <Field
            label="Email"
            value={
              <a href={`mailto:${profileData.email}`}>
                <FiMail aria-hidden /> {profileData.email}
              </a>
            }
          />
        </ProfileCard>

        <ProfileCard accent="success" icon={FiSliders} title="Preferences & Settings">
          <Field label="Brokerage Rate" value={`${profileData.brokerageRate}%`} />
          <Field label="Auto SMS For Contract" value={<StatusBadge active={profileData.autoSmsForContract} />} />
          <Field label="Auto SMS For Payment" value={<StatusBadge active={profileData.autoSmsForPayment} />} />
          <Field label="Payment Done Entry" value={<StatusBadge active={profileData.paymentDoneEntry} onLabel="Yes" offLabel="No" />} />
          <Field label="Contract Entry" value={<StatusBadge active={profileData.contractEntry} onLabel="Yes" offLabel="No" />} />
        </ProfileCard>

        <ProfileCard accent="danger" icon={FiEdit3} title="Notes & Remarks">
          <Field label="Remarks" value={profileData.remarks} />
          <Field label="Notes" value={profileData.notes} />
        </ProfileCard>
      </div>
    </div>
  );
};

export default Profile;
