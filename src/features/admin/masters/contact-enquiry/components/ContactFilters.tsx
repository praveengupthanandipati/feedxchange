import { SearchIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import { STATUS_OPTIONS } from "../contactEnquiry.data";

interface ContactFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

/** Filters apply as you type / pick, so there's no Apply button. */
const ContactFilters = ({ search, status, onSearchChange, onStatusChange }: ContactFiltersProps) => (
  <div id="contact-enquiry-filters" className="contact-enquiry__filters">
    <div className="contact-enquiry__search">
      <SearchIcon aria-hidden />
      <input
        type="search"
        autoComplete="off"
        placeholder="Search by Name, Email, Phone, Subject, Message"
        aria-label="Search by Name, Email, Phone, Subject, Message"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
    <SearchableSelect options={STATUS_OPTIONS} value={status} onChange={onStatusChange} placeholder="Select Status" ariaLabel="Select Status" clearable />
  </div>
);

export default ContactFilters;
