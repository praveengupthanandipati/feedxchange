import { FiSearch, FiX } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import { businessTypeOptions, stateOptions } from "./businessOwners.data";

interface BusinessOwnersFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  businessType: string;
  onBusinessTypeChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
  onClear: () => void;
}

const BusinessOwnersFilters = ({
  keyword,
  onKeywordChange,
  businessType,
  onBusinessTypeChange,
  state,
  onStateChange,
  onClear,
}: BusinessOwnersFiltersProps) => {
  return (
    <div className="business-owners-filters">
      <SearchableSelect
        options={businessTypeOptions}
        value={businessType}
        onChange={onBusinessTypeChange}
        ariaLabel="Filter by business type"
      />

      <SearchableSelect
        options={stateOptions}
        value={state}
        onChange={onStateChange}
        placeholder="Select State"
        ariaLabel="Filter by state"
      />

      <div className="business-owners-filters__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by Company, Location, Mobile"
        />
      </div>

      <button
        type="button"
        className="business-owners-filters__clear"
        onClick={onClear}
        title="Clear filters"
        aria-label="Clear filters"
      >
        <FiX aria-hidden />
      </button>
    </div>
  );
};

export default BusinessOwnersFilters;
