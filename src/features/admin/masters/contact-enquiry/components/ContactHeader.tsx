import { EyeIcon, EyeOffIcon } from "../../../../../shared/components/icon";

interface ContactHeaderProps {
  filtersVisible: boolean;
  onToggleFilters: () => void;
}

const ContactHeader = ({ filtersVisible, onToggleFilters }: ContactHeaderProps) => (
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
        {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
    </div>
  </div>
);

export default ContactHeader;
