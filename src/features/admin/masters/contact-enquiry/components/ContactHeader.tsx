import { FiEye, FiEyeOff, FiUploadCloud } from "react-icons/fi";

interface ContactHeaderProps {
  filtersVisible: boolean;
  onToggleFilters: () => void;
  onExport: () => void;
  canExport: boolean;
}

const ContactHeader = ({ filtersVisible, onToggleFilters, onExport, canExport }: ContactHeaderProps) => (
  <div className="contact-enquiry__header">
    <h1>Contact Enquiry</h1>
    <div className="contact-enquiry__header-actions">
      <button
        type="button"
        className="contact-enquiry__btn contact-enquiry__btn--info"
        onClick={onToggleFilters}
        aria-expanded={filtersVisible}
        aria-controls="contact-enquiry-filters"
      >
        {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
      <button type="button" className="contact-enquiry__btn contact-enquiry__btn--warning" onClick={onExport} disabled={!canExport}>
        <FiUploadCloud aria-hidden /> Export
      </button>
    </div>
  </div>
);

export default ContactHeader;
