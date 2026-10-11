import { FiSearch } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import { STATUS_OPTIONS } from "../productEnquiries.data";

interface EnquiriesFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

/** Filters apply as you type / pick, so there's no Apply button. */
const EnquiriesFilters = ({ search, status, onSearchChange, onStatusChange }: EnquiriesFiltersProps) => (
  <div id="product-enquiries-filters" className="product-enquiries__filters">
    <div className="product-enquiries__search">
      <FiSearch aria-hidden />
      <input
        type="search"
        autoComplete="off"
        placeholder="Search by Product Name, Company, City, Email, Phone"
        aria-label="Search by Product Name, Company, City, Email, Phone"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
    <SearchableSelect options={STATUS_OPTIONS} value={status} onChange={onStatusChange} placeholder="Select Status" ariaLabel="Select Status" clearable />
  </div>
);

export default EnquiriesFilters;
