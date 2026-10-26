import type { ReactNode } from "react";
import { FiMapPin, FiUser, FiCreditCard } from "react-icons/fi";
import type { IconType } from "react-icons";
import { addressDetails, contactDetails, bankDetails } from "./contactInfo.data";
import "./ContactInfo.scss";

const EMPTY = "—";

const orDash = (value: string) => (value.trim() ? value : EMPTY);

interface InfoCardProps {
  accent: "navy" | "success" | "info";
  icon: IconType;
  title: string;
  children: ReactNode;
}

const InfoCard = ({ accent, icon: Icon, title, children }: InfoCardProps) => (
  <section className={`contact-info-card contact-info-card--${accent}`}>
    <div className="contact-info-card__header">
      <span className="contact-info-card__icon">
        <Icon aria-hidden />
      </span>
      <h3 className="contact-info-card__title">{title}</h3>
    </div>
    <div className="contact-info-card__body">{children}</div>
  </section>
);

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="contact-info-row">
    <span className="contact-info-row__label">{label}</span>
    <span className="contact-info-row__value">{orDash(value)}</span>
  </div>
);

const ContactInfo = () => {
  const addressLine = [
    addressDetails.village,
    addressDetails.city,
    addressDetails.district,
    addressDetails.state,
    addressDetails.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="contact-info-grid">
      <InfoCard accent="navy" icon={FiMapPin} title="Address Details / Referred By">
        <p className="contact-info-address__city">{addressDetails.cityHeading}</p>
        <p className="contact-info-address__company">{addressDetails.companyName}</p>
        <p className="contact-info-address__line">{addressLine}</p>
        <div className="contact-info-address__meta">
          <InfoRow label="PH" value={addressDetails.phone} />
          <InfoRow label="TIN No" value={addressDetails.tinNo} />
          <InfoRow label="GST Prov ID" value={addressDetails.gstProvId} />
          <InfoRow label="GST ID" value={addressDetails.gstId} />
        </div>
      </InfoCard>

      <InfoCard accent="success" icon={FiUser} title="Contact Details">
        <InfoRow label="Contact Name" value={contactDetails.contactName} />
        <InfoRow label="Designation" value={contactDetails.designation} />
        <InfoRow label="Mobile" value={contactDetails.mobile} />
        <InfoRow label="Landline" value={contactDetails.landline} />
        <InfoRow label="Email" value={contactDetails.email} />
      </InfoCard>

      <InfoCard accent="info" icon={FiCreditCard} title="Bank Details">
        <InfoRow label="Bank Name" value={bankDetails.bankName} />
        <InfoRow label="Account Number" value={bankDetails.accountNumber} />
        <InfoRow label="IFSC Code" value={bankDetails.ifscCode} />
        <InfoRow label="Address" value={bankDetails.address} />
        <InfoRow label="Phone" value={bankDetails.phone} />
      </InfoCard>
    </div>
  );
};

export default ContactInfo;
